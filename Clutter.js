import { Cluster } from 'puppeteer-cluster';
import { getHTMLfromPage, robotsTxtReader } from "./Spider.js";

const normalizeHost = (hostname) => hostname.replace(/^www\./, "");

export const multipleWebsite = async (urls) => {
    const result = {};
    const cluster = await Cluster.launch({
        concurrency: Cluster.CONCURRENCY_PAGE,
        maxConcurrency: 8,
        retryLimit: 2,
        monitor: true,
        timeout: 50000,
        puppeteerOptions: {
            headless: true
        }
    })
    await cluster.task(async({page, data}) => {
        try {
            const {currentURL, seedURL, restrictedPaths} = data;
            const newURLs = await getHTMLfromPage(currentURL.href, page);
            
            for (const url of newURLs) {
                if((url.href === seedURL.href) || restrictedPaths.some(path => (url.href).includes(path))) continue;
                
                if(normalizeHost(url.hostname) !== normalizeHost(currentURL.hostname)) {
                    const urlHost = `https://${normalizeHost(url.hostname)}`
                    if(!result[seedURL.hostname].has(urlHost))
                        result[seedURL.hostname].add(urlHost);   
                } else {
                    if(!result[seedURL.hostname].has(url.href)) {
                        result[seedURL.hostname].add(url.href);
                        cluster.queue({
                            currentURL: url,
                            seedURL: seedURL,
                            restrictedPaths: restrictedPaths
                    });
                    }
                }
                
                
            }
        }catch (err) {
            console.log(err);
        }
    })

    //Start
    for(const url of urls) {
        result[url.hostname] = new Set();
        const restrictedPaths = await robotsTxtReader(url);
        cluster.queue({
            currentURL: url,
            seedURL: url,
            restrictedPaths: restrictedPaths
        });
    }


    await cluster.idle();
    await cluster.close();
    
    return result;
}