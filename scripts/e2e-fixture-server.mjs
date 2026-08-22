import { createServer } from "node:http";

const port = Number(process.env.ZAIKO_E2E_PORT);
if (!Number.isInteger(port) || port < 1024 || port > 65535) {
  console.error("ZAIKO_E2E_PORT must be a valid dedicated port");
  process.exit(2);
}

const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>E2E fixture</title></head><body>
<main><h1>Inventory E2E fixture</h1><p id="location">Dashboard</p>
<nav aria-label="Primary"><a href="/dashboard" data-route="dashboard">Dashboard</a><a href="/items" data-route="items">Items</a></nav>
<button type="button" id="replace">Replace route</button><button type="button" id="push">Push route</button>
<button type="button" id="announce">Announce</button><div id="status" role="status" aria-live="polite"></div></main>
<script>
const locationLabel=document.querySelector('#location'); const status=document.querySelector('#status');
function render(){ const route=location.pathname.slice(1)||'dashboard'; locationLabel.textContent=route[0].toUpperCase()+route.slice(1); }
document.querySelectorAll('[data-route]').forEach((link)=>link.addEventListener('click',(event)=>{event.preventDefault(); history.pushState({},'',link.href); render();}));
document.querySelector('#push').addEventListener('click',()=>{history.pushState({},'', '/items?created=1'); render();});
document.querySelector('#replace').addEventListener('click',()=>{history.replaceState({},'', '/items?edited=1'); render();});
document.querySelector('#announce').addEventListener('click',()=>{status.textContent='Saved';});
addEventListener('popstate',render); render();
</script></body></html>`;
const server = createServer((request, response) => {
  response.writeHead(200, { "content-type": "text/html; charset=utf-8" });
  response.end(html);
});
server.listen(port, "127.0.0.1", () =>
  console.log(`fixture server ready on ${port}`),
);
const stop = () => {
  server.closeAllConnections?.();
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(0), 1000).unref();
};
process.once("SIGINT", stop);
process.once("SIGTERM", stop);
