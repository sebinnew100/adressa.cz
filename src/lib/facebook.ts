const GRAPH_API_VERSION = 'v19.0';

type FacebookPostResult = { ok: boolean; status?: number; body?: string; error?: string };

// Posts a newly-published article to the adressa.cz Facebook Page feed.
// Best-effort: failures are logged, never thrown, since this must not block
// the autopilot publish flow (same convention as submitToIndexNow). Returns
// a result object so callers that want to inspect the outcome (e.g. a manual
// verification check) can, without changing the fire-and-forget contract.
export async function postArticleToFacebook(
  article: { title: string; slug: string },
  messagePrefix?: string
): Promise<FacebookPostResult> {
  const pageId = process.env.FACEBOOK_PAGE_ID;
  const accessToken = process.env.FACEBOOK_PAGE_ACCESS_TOKEN;
  if (!pageId || !accessToken) return { ok: false, error: 'missing FACEBOOK_PAGE_ID or FACEBOOK_PAGE_ACCESS_TOKEN' };

  const url = `https://www.adressa.cz/clanky/${article.slug}`;
  const message = `${messagePrefix ?? ''}${article.title}\n\nČtěte více na adressa.cz:`;

  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${pageId}/feed`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, link: url, access_token: accessToken }),
      }
    );
    const body = await res.text();
    if (!res.ok) {
      console.error('Facebook post failed:', res.status, body);
    }
    return { ok: res.ok, status: res.status, body };
  } catch (err) {
    console.error('Facebook post failed:', err);
    return { ok: false, error: String(err) };
  }
}
