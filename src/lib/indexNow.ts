const INDEXNOW_KEY = '98de47ff01a6a637a539f8a288dae13d';
const HOST = 'www.adressa.cz';

// Submits URLs to the shared IndexNow endpoint, which fans out to every
// participating search engine (Bing, Seznam.cz, Yandex, Naver) so new/updated
// pages get picked up within minutes instead of waiting for the next crawl.
// Best-effort: failures are logged, never thrown, since this must not block
// the caller (publishing an article, activating a provider, etc).
export async function submitToIndexNow(urls: string[]): Promise<void> {
  if (urls.length === 0) return;

  try {
    await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({
        host: HOST,
        key: INDEXNOW_KEY,
        keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`,
        urlList: urls,
      }),
    });
  } catch (err) {
    console.error('IndexNow submission failed:', err);
  }
}
