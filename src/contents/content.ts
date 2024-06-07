window.addEventListener("load", async () => {
  
    // document.body.style.background = "pink"
    document.querySelectorAll('.b_ad').forEach(ad => {
        ad.innerHTML = '';
        ad.style.cssText += 'position:fixed; left: 10000000px;'
    });
    document.querySelectorAll('.Pc-word').forEach(ad => {
        ad.style.display = 'none';
    });
    // let ad_bilibili = await document.querySelectorAll('.ad-floor-exp');
    document.querySelectorAll('.ad-floor-exp').forEach(ad => {
        ad.style.display = 'none';
    });
})

var o = "bilibili-helper-host",
  c = "bilibili-helper-ext-content-script";
((t) => {
  if (t.location.href.indexOf("bilibili.com/s/video/") !== -1) return t.location.replace(t.location.href.replace("/s/", "/"));
  let i = document.head || document.documentElement,
    n = document.createElement("style");
  (n.textContent = `[class*="fullscreen"] #${o},[class*="webscreen-fix"] #${o} {z-index: 9!important;}`),
    i.appendChild(n);
  let e = document.createElement("script");
  (e.id = c), (e.type = "module");
  let { name: a, version: r, version_name: p } = chrome.runtime.getManifest();
  (e.dataset.internals = JSON.stringify({
    baseUrl: chrome.runtime.getURL("/").replace(/\/$/, ""),
    manifest: { name: a, version: r, version_name: p },
  })),
    (e.src =
      chrome.runtime.getURL("bilibili-helper-content-script.js") + `?v=${r}`),
    i.appendChild(e);
})(window);