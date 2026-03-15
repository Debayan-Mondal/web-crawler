

//Normalizing URL
export const normalizeURL = (url) => {
    if (url.endsWith("/")) {
        url = url.slice(0,-1);
    }
    const urlObj = new URL(url);
    return urlObj
}

//Getting HTML from each Page
export const getHTMLfromPage = async(url,page) => {
    try {
        const response = await page.goto(url, {
            waitUntil: "domcontentloaded",
            timeout: 30000
        });
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



//Extracting Forbidden Paths from Robots.txt
export const robotsTxtReader = async(seedURL) => {
    try {
        const restrictedPaths = [];
    const response = await fetch(`${seedURL.origin}/robots.txt`);
    if (!response.ok) return [];
    const rawText = await response.text();
    if (!rawText) return [];
    if(rawText) {
         const lines = rawText.split("\n");
         lines.forEach(line => {
            if(line.startsWith("Disallow:")) {
                restrictedPaths.push((line.split(": ")[1]).slice(0,-1));
            }
         })
    }
    return restrictedPaths;
    } catch {
        console.log("Error in Fetching robots.txt", err);
        return [];
    }

}

