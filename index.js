import { getHTMLfromPage, normalizeURL } from "./Spider.js"


const seeds = ["https://www.wagslane.dev"];
const normalizedSeeds = seeds.map(seed =>  normalizeURL(seed));
console.log(await getHTMLfromPage(normalizedSeeds[0].href));



