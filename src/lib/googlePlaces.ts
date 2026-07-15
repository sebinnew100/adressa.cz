export interface GooglePlaceResult {
  placeId: string;
  name: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  latitude: number | null;
  longitude: number | null;
}

// Searches Google Places (New) Text Search API for real businesses matching
// a query like "elektrikář Praha". Returns [] (not throws) on any failure so
// callers can treat this as best-effort, same convention as the Unsplash/
// IndexNow/Facebook helpers elsewhere in this codebase.
export async function searchGooglePlaces(query: string, maxResults = 15): Promise<GooglePlaceResult[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) return [];

  try {
    const res = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': [
          'places.id',
          'places.displayName',
          'places.formattedAddress',
          'places.internationalPhoneNumber',
          'places.websiteUri',
          'places.location',
        ].join(','),
      },
      body: JSON.stringify({
        textQuery: query,
        languageCode: 'cs',
        regionCode: 'CZ',
        maxResultCount: Math.min(maxResults, 20),
      }),
    });

    if (!res.ok) {
      console.error('Google Places search failed:', res.status, await res.text());
      return [];
    }

    const data = await res.json();
    const places = data.places ?? [];

    return places.map((p: {
      id: string;
      displayName?: { text?: string };
      formattedAddress?: string;
      internationalPhoneNumber?: string;
      websiteUri?: string;
      location?: { latitude?: number; longitude?: number };
    }) => ({
      placeId: p.id,
      name: p.displayName?.text ?? 'Neznámý poskytovatel',
      address: p.formattedAddress ?? null,
      phone: p.internationalPhoneNumber ?? null,
      website: p.websiteUri ?? null,
      latitude: p.location?.latitude ?? null,
      longitude: p.location?.longitude ?? null,
    }));
  } catch (err) {
    console.error('Google Places search threw:', err);
    return [];
  }
}
