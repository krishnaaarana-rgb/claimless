import puppeteer from 'puppeteer';

export async function scrapeWebsite(url: string): Promise<string | null> {
  let browser = null;
  try {
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    console.log('[website-scraper] Launching Puppeteer for:', fullUrl);

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });

    const page = await browser.newPage();

    // Set a reasonable viewport and user agent
    await page.setViewport({ width: 1280, height: 800 });
    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');

    // Navigate and wait for content to render
    await page.goto(fullUrl, {
      waitUntil: 'networkidle2',
      timeout: 15000
    });

    // Wait a bit more for any lazy-loaded content
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Extract text content from the page body
    const text = await page.evaluate(() => {
      // Remove scripts, styles, nav, footer
      const elementsToRemove = document.querySelectorAll('script, style, nav, footer, header, noscript, iframe');
      elementsToRemove.forEach(el => el.remove());

      // Get the remaining body text
      return document.body?.innerText || '';
    });

    await browser.close();
    browser = null;

    // Clean up the text
    const cleaned = text
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]+/g, ' ')
      .trim();

    // Truncate to 3000 chars
    const truncated = cleaned.slice(0, 3000);

    if (truncated.length < 50) {
      console.log('[website-scraper] Very short content:', truncated.length, 'chars. Content:', truncated.slice(0, 100));
      return truncated.length > 0 ? truncated : null;
    }

    console.log('[website-scraper] Extracted', truncated.length, 'chars from', fullUrl);
    return truncated;
  } catch (error) {
    console.error('[website-scraper] Puppeteer failed:', url, error instanceof Error ? error.message : error);

    // Fallback to basic fetch for non-JS sites or if Puppeteer fails
    try {
      return await scrapeWebsiteFallback(url);
    } catch {
      return null;
    }
  } finally {
    if (browser) {
      await browser.close().catch(() => {});
    }
  }
}

// Basic fetch fallback if Puppeteer fails
async function scrapeWebsiteFallback(url: string): Promise<string | null> {
  try {
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    console.log('[website-scraper] Falling back to basic fetch for:', fullUrl);

    const response = await fetch(fullUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ClaimlessBot/1.0)' },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) return null;

    const html = await response.text();
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&[a-z]+;/gi, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 3000);

    console.log('[website-scraper] Fallback extracted', text.length, 'chars');
    return text.length > 0 ? text : null;
  } catch {
    return null;
  }
}
