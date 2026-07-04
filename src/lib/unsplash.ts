const SERVICE_QUERIES: Record<string, string> = {
  elektrikar: 'electrician working',
  instalater: 'plumber repair',
  malir: 'house painter painting wall',
  tesar: 'carpenter woodworking',
  truhlar: 'furniture maker carpentry',
  zubar: 'dentist office',
  'stehovaci-firma': 'moving boxes house move',
  zahradnik: 'gardener gardening',
  uklid: 'cleaning service home',
  zednik: 'bricklayer construction worker',
  'it-technik': 'computer repair technician',
  ucetni: 'accountant office desk',
  pravnik: 'lawyer office documents',
  autoservis: 'car mechanic garage',
  fotograf: 'photographer camera',
  kadernik: 'hairdresser salon',
  lekar: 'doctor medical clinic',
  klempir: 'roofer metal work',
  'realitni-makler': 'real estate agent house',
  restaurace: 'restaurant kitchen chef',
  kavarna: 'cafe coffee shop interior',
  freelancer: 'freelancer laptop workspace',
  architekt: 'architect blueprint design',
  psycholog: 'therapy counseling office',
  trener: 'personal trainer gym',
  prekladatel: 'translation books language',
  grafik: 'graphic designer creative',
  ucitel: 'teacher classroom',
  jine: 'professional service work',
};

export function queryForService(serviceId: string | null): string {
  if (serviceId && SERVICE_QUERIES[serviceId]) return SERVICE_QUERIES[serviceId];
  return 'professional service craftsman';
}

interface UnsplashPhoto {
  imageUrl: string;
  credit: string;
  creditUrl: string;
  downloadLocation: string;
}

export async function findUnsplashPhoto(query: string): Promise<UnsplashPhoto | null> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) return null;

  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      { headers: { Authorization: `Client-ID ${accessKey}` } }
    );
    if (!res.ok) return null;

    const data = await res.json();
    const photo = data.results?.[0];
    if (!photo) return null;

    return {
      imageUrl: photo.urls.regular,
      credit: photo.user.name,
      creditUrl: `${photo.user.links.html}?utm_source=adressa_cz&utm_medium=referral`,
      downloadLocation: photo.links.download_location,
    };
  } catch {
    return null;
  }
}

export async function notifyUnsplashDownload(downloadLocation: string): Promise<void> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) return;
  try {
    await fetch(downloadLocation, { headers: { Authorization: `Client-ID ${accessKey}` } });
  } catch {
    // best-effort tracking ping, not critical to article creation
  }
}

export interface FetchedArticleImage {
  coverImagePath: string;
  coverImageCredit: string;
  coverImageCreditUrl: string;
}

export async function fetchArticleCoverImage(
  serviceId: string | null,
  uploadFn: (filename: string, imageBytes: Blob) => Promise<{ url: string }>
): Promise<FetchedArticleImage | null> {
  const photo = await findUnsplashPhoto(queryForService(serviceId));
  if (!photo) return null;

  const imageRes = await fetch(photo.imageUrl);
  if (!imageRes.ok) return null;
  const imageBlob = await imageRes.blob();

  const filename = `articles/unsplash-${Date.now()}-${Math.random().toString(36).slice(2)}.jpg`;
  const uploaded = await uploadFn(filename, imageBlob);

  await notifyUnsplashDownload(photo.downloadLocation);

  return {
    coverImagePath: uploaded.url,
    coverImageCredit: photo.credit,
    coverImageCreditUrl: photo.creditUrl,
  };
}
