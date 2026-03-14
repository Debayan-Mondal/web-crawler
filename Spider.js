import puppeteer from "puppeteer";

export const getHTMLfromPage = async(url,page) => {
    try {
        console.log(url);
        const response = await page.goto(url);
        const contentType = response.headers()['content-type'];
        if (!contentType.includes('text/html')) return [];
        await page.waitForSelector('a', { timeout: 2000 });
        const urls = await page.$$eval('a', links => links.map(link => link.href));
        const urlObjects = urls.map(url => normalizeURL(url));
        return urlObjects;
    } catch (err) {
        console.log("Error in getting HTML", err);
        return [];
    }
}


export const getHTMLfromWebsite = async(seedURL) => {
    const parrallelProccesses = 5;
    const browser = await puppeteer.launch({headless: true, args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ]});
    const urlLeft = [seedURL.href];
    const pathURL = new Set();
    const websiteURL = new Set();
    const urlVisited = new Set();
    while(urlLeft.length > 0) {
        let urls = urlLeft.splice(0, parrallelProccesses);
        urls = urls.filter(url=> !urlVisited.has(url));
        urls.forEach(url => {
            urlVisited.add(url);
        });
        const promises = urls.map(async(url) => {
            const page = await browser.newPage();
            const pageURL = await getHTMLfromPage(url, page);
            page.close();
            return pageURL;
        })
        const newURLs =new Set((await Promise.all(promises)).flat());
        // const newURLs = await getHTMLfromPage(url, page);
        newURLs.forEach(url => {
            if(url.hostname === seedURL.hostname) {
                pathURL.add(url.href);
                urlLeft.push(url.href);
            } else {
                websiteURL.add(`https://${url.hostname}`);
            }
        });
    }
    console.log("Crawling Completed");
    console.log("Internal Paths...");
    console.log(pathURL);
    console.log("External Websites...");
    console.log(websiteURL);
    return;
}

export const normalizeURL = (url) => {
    if (url.endsWith("/")) {
        url = url.slice(0,-1);
    }
    const urlObj = new URL(url);
    return urlObj
}