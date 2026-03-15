import { multipleWebsite } from "./Clutter.js";
import { normalizeURL } from "./Spider.js"

async function main() {
    const urlArray = ["https://www.wagslane.dev/"];
    const normalizedUrlArray = urlArray.map(url => normalizeURL(url));
    const result = await multipleWebsite(normalizedUrlArray);
    console.log("URLS EXTRACTED.....")
    console.log(result);
    process.exit(0);

}
main();



