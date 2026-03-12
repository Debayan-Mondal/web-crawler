import { getHTMLfromWebsite, normalizeURL } from "./Spider.js"

async function main() {
    const args = process.argv.slice(2);
    const seedURL = args[0];
    const urlObj = normalizeURL(seedURL);
    await getHTMLfromWebsite(urlObj);
    console.log("Done");
    process.exit(0);

}
main();



