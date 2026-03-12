import puppeteer from "puppeteer";


export const getURL = (html) => {
     
}
export const getHTMLfromPage = async(url) => {
    try {
        console.log(url);   
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url);
        await page.waitForSelector('a');
        const urls = await page.$$eval('a', links => links.map(link => link.href));
        console.log(urls);
        browser.close();
    } catch (err) {
        console.log(err);
    }
}

export const normalizeURL = (url) => {
    if (url.endsWith("/")) {
        url = url.slice(0,-1);
    }
    const urlObj = new URL(url);
    return urlObj
}