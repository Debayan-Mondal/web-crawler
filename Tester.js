import { getHTMLfromPage, normalizeURL } from "./Spider.js"

(() => {
    const url = "https://www.Wagslane.dev";
    const urlObj = normalizeURL(url);
    getHTMLfromPage(urlObj.href);

})()