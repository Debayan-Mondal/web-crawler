# 🕷️ Node.js Web Crawler

A concurrent, multi-site web crawler built with [Puppeteer Cluster](https://github.com/thomasdondorf/puppeteer-cluster). It crawls one or more seed URLs, maps all internal pages, collects external links, and respects `robots.txt` rules — all in parallel.

---

## Features

- **Concurrent crawling** via `puppeteer-cluster` with configurable worker count
- **Multi-site support** — crawl multiple seed URLs in one run
- **robots.txt compliance** — automatically fetches and respects `Disallow` rules
- **Internal vs external URL separation** — cleanly distinguishes pages within the site from outbound links
- **URL normalization** — strips `www.`, trailing slashes, and handles invalid URLs gracefully


---

## Project Structure

```
web-crawler/
├── index.js        # Entry point — define seed URLs here
├── Clutter.js      # Cluster orchestration and crawl logic
└── Spider.js       # Page scraping, URL normalization, robots.txt reader
```

---

## Installation

**Prerequisites:** Node.js 18+

```bash
git clone https://github.com/your-username/web-crawler.git
cd web-crawler
npm install
```

**Dependencies:**
```bash
npm install puppeteer puppeteer-cluster
```

---

## Usage

Edit the `urlArray` in `index.js` with your seed URLs:

```js
const urlArray = [
    "https://www.scrapethissite.com/",
    "https://www.wagslane.dev/"
];
```

Then run:

```bash
node index.js
```

### Example Output

```js
{
  'www.wagslane.dev': Set(60) {
    'https://www.wagslane.dev/posts/zen-of-proverbs',
    'https://www.wagslane.dev/posts/kanban-vs-scrum',
    'https://www.wagslane.dev/tags/golang',
    'https://github.com',
    'https://twitter.com',
    'https://go.dev',
    // ...
  },
  'www.scrapethissite.com': Set(12) {
    'https://www.scrapethissite.com/pages',
    'https://www.scrapethissite.com/lessons',
    // ...
  }
}
```

Internal paths and external hostnames are stored together per seed, keyed by the seed's hostname.

---



## How It Works

```
index.js
  └── multipleWebsite(urls)           [Clutter.js]
        ├── robotsTxtReader(url)       → fetch /robots.txt, extract Disallow paths
        ├── cluster.queue(seedURL)     → enqueue each seed
        └── cluster.task(...)
              ├── getHTMLfromPage()    → navigate, extract all <a> hrefs
              ├── normalizeURL()       → parse, strip trailing slash, filter invalid
              ├── internal URL?        → add to result, queue for crawling
              └── external URL?        → normalize hostname, add to result
```

### URL Classification

A URL is **internal** if its normalized hostname matches the seed's normalized hostname (i.e. `www.` is stripped before comparing). Everything else is **external** and stored as `https://hostname` only.

---

## Known Limitations

- **JavaScript-rendered content**: Pages that load links via AJAX (e.g. SPAs) may return fewer URLs, as only the initial DOM is scraped
- **Login-gated pages**: No authentication support — pages behind login walls are skipped
- **robots.txt scope**: Only `Disallow` rules for all user-agents are parsed; `Allow`, `Crawl-delay`, and per-agent rules are ignored

---

## License

MIT
