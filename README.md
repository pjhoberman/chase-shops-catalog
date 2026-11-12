# Chase Shops Catalog (unofficial)

A searchable, filterable catalog of items listed at The Shops at Chase, with a link to each product on Chase.

- `index.html` is the whole site (no build step).
- `catalog.json` is the data. The site reads it on load.
- `refresh-catalog.js` rebuilds `catalog.json` from your own signed-in Chase session.

## Updating

1. Sign in at shopping.chase.com in Chrome.
2. Paste `refresh-catalog.js` into the DevTools console and wait about 8 minutes.
3. Replace `catalog.json` in this repo with the downloaded file.

Product links open on Chase and may ask visitors to sign in.

This project is not affiliated with or endorsed by JPMorgan Chase. Product names, prices and photos belong to their owners.
