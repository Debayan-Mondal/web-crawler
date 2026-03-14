import { Cluster } from 'puppeteer-cluster';
import { getHTMLfromWebsite } from "./Spider.js";


export const multipleWebsite = async (urls) => {
    const result = [];
    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_BROWSER,
        maxConcurrency: 2,
        monitor: false,
        timeout: 10000000,
        puppeteerOptions: {
            headless: true
        }
    })
    await cluster.task(async({page, data: url}) => {
        const allURls = await getHTMLfromWebsite(url,page)
        result.push(...allURls);
    })
    urls.forEach(url => {
        cluster.queue(url);
    })
    await cluster.idle();
    await cluster.close();
    
    return result;
}