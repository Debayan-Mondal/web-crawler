import puppeteer from "puppeteer";


export const getHTMLfromPage = async(url) => {
    try {
        console.log(url);
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url);
        await page.waitForSelector('a', { timeout: 5000 });
        const urls = await page.$$eval('a', links => links.map(link => link.href));
        const urlObjects = urls.map(url => normalizeURL(url));
        browser.close();
        return urlObjects;
    } catch (err) {
        console.log("Error in getting HTML");
        return [];
    }
}

export const getHTMLfromWebsite = async(seedURL) => {
    const urlLeft = [seedURL.href];
    const pathURL = new Set();
    const websiteURL = new Set();
    const urlVisited = new Set();
    while(urlLeft.length > 0) {
        const url = urlLeft.pop();
        if(urlVisited.has(url)) {
            continue;
        }
        urlVisited.add(url);
        const newURLs = await getHTMLfromPage(url);
        newURLs.forEach(url => {
            if(url.hostname === seedURL.hostname) {
                pathURL.add(url.href);
            } else {
                websiteURL.add(url.href);
            }
        })
        urlLeft.push(...pathURL);
    }
    console.log("Crawling Completed");
    console.log(pathURL);
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