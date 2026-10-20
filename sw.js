const SHELL="cueillette-complet-v22", TILES="cueillette-tuiles";
const FILES=["./","index.html","manifest.webmanifest","icone2-180.png","icone2-192.png","icone2-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(SHELL).then(c=>c.addAll(FILES)));self.skipWaiting()});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(n=>n!==SHELL&&n.startsWith("cueillette-complet-")).map(n=>caches.delete(n)))).then(()=>self.clients.claim()))});
self.addEventListener("fetch",e=>{
  const u=new URL(e.request.url);
  if(e.request.method!=="GET")return;
  if(u.hostname==="data.geopf.fr"&&u.pathname.startsWith("/wmts")){
    e.respondWith(caches.open(TILES).then(async c=>{const hit=await c.match(e.request.url);if(hit)return hit;
      const r=await fetch(e.request.url,{mode:"cors"});if(r.ok)c.put(e.request.url,r.clone());return r}));return}
  if(/inaturalist/.test(u.hostname)&&!/api\.inaturalist/.test(u.hostname)){
    e.respondWith(caches.open("cueillette-photos").then(async c=>{const hit=await c.match(e.request.url);if(hit)return hit;const r=await fetch(e.request);c.put(e.request.url,r.clone());return r}));return}
  if(u.origin===location.origin){
    e.respondWith(fetch(e.request).then(r=>{if(r.ok){const cp=r.clone();caches.open(SHELL).then(c=>c.put(e.request,cp))}return r}).catch(()=>caches.match(e.request).then(r=>r||caches.match("index.html"))))}
});
