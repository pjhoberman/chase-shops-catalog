/*
  Refresh the catalog from your own Chase Shops session.

  1. Sign in and open https://shopping.chase.com/marketplace in Chrome.
  2. Open DevTools (F12) > Console, paste this whole file, press Enter.
     (Chrome may ask you to type "allow pasting" first.)
  3. Leave the tab alone for about 8 minutes. The tab title shows progress.
  4. When it finishes, catalog.json downloads. Upload it to the repo,
     replacing the old catalog.json.

  It only reads the product lists the page already loads for you.
  To test on one category first, set  window.CATALOG_ONLY = ['Outdoors']  before pasting;
  test mode returns the data in window.__catalogResult and does not download.
*/
(async () => {
  const ONLY = window.CATALOG_ONLY || null;
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const map = new Map();
  let cur = '';

  const record = j => {
    if (!j || !j.items) return;
    for (const it of j.items) {
      let m = map.get(it.productId);
      if (!m) {
        m = {
          id: it.productId, bid: it.brandId, b: it.brandName, n: it.name,
          p: it.price, dp: it.discountedPrice,
          img: ((it.images && it.images[0] && it.images[0].sourceSet && it.images[0].sourceSet[0]) || '')
                 .replace('https://maxsite.b-cdn.net/', ''),
          c1: cur, c2: it.category && it.category.name
        };
        map.set(it.productId, m);
      }
    }
  };

  if (!window.__catalogPatched) {
    window.__catalogPatched = true;
    const of = window.fetch;
    window.fetch = async function (...a) {
      const res = await of.apply(this, a);
      try {
        const u = String((a[0] && a[0].url) || a[0]);
        if (u.includes('/api/products')) res.clone().json().then(j => window.__catalogSink && window.__catalogSink(j));
      } catch (e) {}
      return res;
    };
    const oo = XMLHttpRequest.prototype.open, os = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.open = function (m, u) { this.__u = u; return oo.apply(this, arguments); };
    XMLHttpRequest.prototype.send = function () {
      this.addEventListener('load', () => {
        try { if (String(this.__u).includes('/api/products')) window.__catalogSink && window.__catalogSink(JSON.parse(this.responseText)); } catch (e) {}
      });
      return os.apply(this, arguments);
    };
  }
  window.__catalogSink = record;

  const catBtn = () => [...document.querySelectorAll('[role=button], button')].find(e => e.textContent.trim() === 'Category');
  const l1El = n => [...document.querySelectorAll('.navigation-links__item-link-title')].find(s => s.textContent.trim() === n);
  const TOP = ['Electronics', 'Fashion & Beauty', 'Jewelry & Watches', 'Home & Office',
               'Kitchen & Tabletop', 'Outdoors', 'Sports & Fitness', 'Travel'];
  const todo = ONLY ? TOP.filter(t => ONLY.includes(t)) : TOP;
  const title0 = document.title;

  for (const name of todo) {
    if (!l1El('Travel')) { catBtn().click(); await sleep(900); }
    cur = name;
    l1El(name).click();
    await sleep(3000);
    let stall = 0;
    const t0 = Date.now();
    while (Date.now() - t0 < 300000) {
      const b = [...document.querySelectorAll('button')].find(b => /see more/i.test(b.textContent));
      if (!b) { if (stall++ > 4) break; await sleep(700); continue; }
      stall = 0; b.click(); await sleep(600);
      document.title = name + ': ' + map.size + ' items';
    }
  }
  document.title = title0;
  window.__catalogSink = null;

  const items = [...map.values()];
  const out = { captured: new Date().toISOString().slice(0, 10), count: items.length, items };
  if (ONLY) { window.__catalogResult = out; console.log('Test mode:', items.length, 'items (no download)'); return; }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(out)], { type: 'application/json' }));
  a.download = 'catalog.json';
  document.body.appendChild(a); a.click(); a.remove();
  console.log('Done:', items.length, 'items. catalog.json downloaded.');
})();
