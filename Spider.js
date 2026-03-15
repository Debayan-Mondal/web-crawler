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
        console.log("Error in getting HTML");
        return [];
    }
}




export const getHTMLfromWebsite = async(seedURL, clusterPage) => {
    const restrictedPaths = [];
    const parrallelProccesses = 2;
    const browser = clusterPage.browser();
    const urlLeft = [seedURL.href];
    const pathURL = new Set();
    const websiteURL = new Set();
    const urlVisited = new Set();
    const response = await clusterPage.goto(`${seedURL.href}robots.txt`);
    const rawText = await response.text();
    if(rawText) {
         const lines = rawText.split("\n");
         lines.forEach(line => {
            if(line.startsWith("Disallow:")) {
                restrictedPaths.push((line.split(": ")[1]).slice(0,-1));
            }
         })
    }

    while(urlLeft.length > 0) {
        let urls = urlLeft.splice(0, parrallelProccesses);
        urls = urls.filter(url=> !urlVisited.has(url) && !restrictedPaths.some(path => url.includes(path)));
        urls.forEach(url => {
            urlVisited.add(url);
        });
        const promises = urls.map(async(url) => {
            const page = await browser.newPage();
            const pageURL = await getHTMLfromPage(url, page);
            page.close();
            return pageURL;
        })
        const newURLs = (await Promise.all(promises)).flat();
        newURLs.forEach(url => {
            if(url.href !== seedURL.href) {
                if(url.hostname === seedURL.hostname) {
                pathURL.add(url.href);
                urlLeft.push(url.href);
            } else {
                websiteURL.add(`https://${url.hostname}`);
            }
            }
            
        });
    }

    const result = [];
    result.push(...pathURL);
    result.push(...websiteURL);
    return result;
}

export const normalizeURL = (url) => {
    if (url.endsWith("/")) {
        url = url.slice(0,-1);
    }
    const urlObj = new URL(url);
    return urlObj
}

