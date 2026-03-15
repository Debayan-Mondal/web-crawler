import { Cluster } from 'puppeteer-cluster';
import { getHTMLfromPage, getHTMLfromWebsite } from "./Spider.js";

const normalizeHost = (hostname) => hostname.replace(/^www\./, "");

export const multipleWebsite = async (urls) => {
    const result = {};
    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_PAGE,
        maxConcurrency: 5,
        retryLimit: 2,
        monitor: false,
        timeout: 50000,
        puppeteerOptions: {
            headless: true
        }
    })
    await cluster.task(async({page, data}) => {
        try {
            const {currentURL, seedURL} = data
            const newURLs = await getHTMLfromPage(currentURL.href, page);
            
            for (const url of newURLs) {
                if((url.href === seedURL.href)) continue;
                
                if(normalizeHost(url.hostname) !== normalizeHost(currentURL.hostname)) {
                    const urlHost = `https://${normalizeHost(url.hostname)}`
                    if(!result[seedURL.hostname].has(urlHost))
                        result[seedURL.hostname].add(urlHost);   
                } else {
                    if(!result[seedURL.hostname].has(url.href)) {
                        result[seedURL.hostname].add(url.href);
                        cluster.queue({
                            currentURL: url,
                            seedURL: seedURL
                    });
                    }
                }
                
                
            }
        }catch (err) {
            console.log(err);
        }
    })



    //Startup code
    urls.forEach(url => {
        result[url.hostname] = new Set();
        cluster.queue({
            currentURL: url,
            seedURL: url
        });
    })

    await cluster.idle();
    await cluster.close();
    
    return result;
}