import { crawlPage, getHTML } from './crawl';

async function main() {
    const args = process.argv.slice(2);
    if (args.length < 1) {
        console.error('Please provide a URL to crawl.');
        process.exit(1);
    }

    if (args.length > 1) {
        console.error('Please provide only one URL to crawl.');
        process.exit(1);
    }

    const baseURL = args[0];
    console.log(`Crawling the URL: ${baseURL}`);
    const pages = await crawlPage(baseURL, baseURL, {});
    prettyPrint(baseURL, pages);
    process.exit(0);
}

await main();

function prettyPrint(baseURL: string, pages: Record<string, number>) {
    console.log(`=============================`);
    console.log(`     REPORT for ${baseURL}`);
    console.log(`=============================`);
    for (const [url, count] of Object.entries(pages).sort((a, b) => b[1] - a[1])) {
        console.log(`Found ${count} internal links to ${url}`);
    }
    console.log(`=============================`);
    console.log(`     END REPORT`);
    console.log(`=============================`);
}
