import { JSDOM } from 'jsdom';

export function normalizeURL(url: string): string {
    const urlObject = new URL(url);
    const { host, pathname } = urlObject;
    const normalizedPathname = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
    return `${host}${normalizedPathname}`;
}

export function getURLsFromHTML(html: string, baseURL: string): string[] {
    const dom = new JSDOM(html);
    const document = dom.window.document;
    const links = document.querySelectorAll('a[href]');
    const urls: string[] = [];
    const base = new URL(baseURL);
    links.forEach((link) => {
        const href = link.getAttribute('href');
        if (href) {
            try {
                const url = new URL(href, base);
                if (url.origin === base.origin) {
                    urls.push(url.href);
                }
            } catch (error) {
                console.error(`Invalid URL: ${href}`, error);
            }
        }
    });
    return urls;
}

export async function getHTML(url: string): Promise<string> {
    let response;
    try {
        response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
        }
        if (!response.headers.get('content-type')?.includes('text/html')) {
            throw new Error(`Did not receive text/html from: ${url}`);
        }
    } catch (error) {
        console.error(`Error fetching ${url}:`, error);
        throw error;
    }

    const html = await response.text();
    if (!html) {
        throw new Error(`Empty response from ${url}`);
    }
    if (html.length > 1000000) {
        throw new Error(`Response from ${url} is too large`);
    }

    return html;
}

export async function crawlPage(
    baseURL: string,
    currentURL: string,
    pages: Record<string, number> = {}
): Promise<Record<string, number>> {
    const normalizedCurrentURL = normalizeURL(currentURL);
    const normalizedBaseURL = normalizeURL(baseURL);

    if (normalizedCurrentURL !== normalizedBaseURL && !normalizedCurrentURL.startsWith(normalizedBaseURL)) {
        console.log(`Skipping ${currentURL} as it is not within the base URL ${baseURL}`);
        return pages;
    }
    if (pages[normalizedCurrentURL]) {
        console.log(`Already crawled ${currentURL}, skipping to avoid loops.`);
        pages[normalizedCurrentURL]++;
        return pages;
    }

    console.log(`Crawling ${currentURL}...`);
    pages[normalizedCurrentURL] = 1;

    try {
        console.log(`Fetching HTML from ${currentURL}...`);
        const html = await getHTML(currentURL);
        console.log(`Fetched HTML from ${currentURL}`);
        console.log(`Extracting URLs from ${currentURL}...`);
        const urls = getURLsFromHTML(html, baseURL);
        console.log(`Found ${urls.length} URLs in ${currentURL}`);

        console.log(`Crawling found URLs...`);
        for (const url of urls) {
            if (!pages[url]) {
                await crawlPage(baseURL, url, pages);
            }
        }
    } catch (error) {
        console.error(`Error crawling ${currentURL}:`, error);
    }

    return pages;
}
