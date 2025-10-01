
async function loadI18n(){
  const resp = await fetch("../assets/i18n/i18n.min.json").catch(()=>fetch("assets/i18n/i18n.min.json"));
  const all = await resp.json();
  window.__I18N_ALL__ = all;
  return all;
}
function getLangFromPath(){
  const m = location.pathname.match(/^\/([a-z]{2})\//); return (m?m[1]:"it");
}
function applyUI(lang){
  const ui = window.__I18N_ALL__[lang].ui;
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-i18n]").forEach(el=>{
    const path = el.dataset.i18n.split(".");
    let v = ui; path.forEach(k=> v = (v||{})[k]);
    if(typeof v === "string") el.textContent = v;
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach(el=>{
    const path = el.dataset.i18nPlaceholder.split(".");
    let v = ui; path.forEach(k=> v = (v||{})[k]);
    if(typeof v === "string") el.setAttribute("placeholder", v);
  });
}
function renderDestinations(lang, cat, mountId){
  const dests = window.__I18N_ALL__[lang].content.dest;
  const list = document.getElementById(mountId);
  list.innerHTML = "";
  const items = Object.entries(dests).filter(([k,v])=>v.category===cat).slice(0,10);
  items.forEach(([title,data])=>{
    const card = document.createElement("div");
    card.className="card";
    const img = document.createElement("img"); img.src=data.image; img.alt=title;
    const lab = document.createElement("div"); lab.className="title"; lab.textContent=title;
    const btn = document.createElement("button"); btn.setAttribute("aria-label","Open"); btn.addEventListener("click", ()=> openModal(lang, title, data));
    card.append(img, lab, btn);
    list.append(card);
  });
}
function esc(s){ return (s||"").replace(/[&<>]/g, m=>({"&":"&amp;","<":"&lt;",">":"&gt;"}[m])); }
function openModal(lang, title, data){
  const ui = window.__I18N_ALL__[lang].ui;
  const m = document.getElementById("modal");
  m.querySelector(".ttl").textContent = title;
  m.querySelector(".h-desc").textContent = ui.modal.description;
  m.querySelector(".h-high").textContent = ui.modal.highlights;
  m.querySelector(".h-bonus").textContent = ui.modal.bonus;
  m.querySelector(".desc").textContent = data.desc;
  const ul = m.querySelector(".high"); ul.innerHTML="";
  (data.highlights||[]).forEach(h=> { const li=document.createElement("li"); li.textContent=h; ul.append(li); });
  // Stay22 map eager
  const fr = document.createElement("iframe");
  const addr = encodeURIComponent(data.address||title);
  const langparam = lang;
  fr.src = "https://www.stay22.com/embed/gm?address="+addr+"&hidebrand=true&language="+langparam;
  fr.setAttribute("loading","eager"); fr.style.border="0"; fr.style.width="100%"; fr.style.height="100%";
  const map = m.querySelector(".map"); map.innerHTML=""; map.append(fr);
  // Bonus
  m.querySelector(".bonus").textContent = data.bonus || "";
  // CTA link to flights in current slug
  m.querySelector(".cta a").setAttribute("href","/"+lang+"/flights.html");
  m.style.display="flex";
}
function closeModal(){ document.getElementById("modal").style.display="none"; }
function initLangSwitcher(lang){
  const sel = document.getElementById("lang-switcher"); if(!sel) return;
  sel.value = lang;
  sel.onchange = () => {
    const file = (location.pathname.split("/").pop() || "index.html");
    location.href = "/"+sel.value+"/"+file;
  };
}

/* CMP */
function getConsent(){ try{ return JSON.parse(localStorage.getItem('cmpConsent')||''); }catch(e){ return null; } }
function saveConsent(obj){ localStorage.setItem('cmpConsent', JSON.stringify(obj)); document.getElementById('cmp-banner')?.setAttribute('hidden',''); }
function showCMP(){ const el=document.getElementById('cmp-banner'); if(!el) return; el.removeAttribute('hidden');
  const cur=getConsent()||{necessary:true,preferences:false,analytics:false,marketing:false};
  el.querySelectorAll('[data-cmp-cat]').forEach(i=>{const k=i.dataset.cmpCat; if(k==='necessary'){i.checked=true;i.disabled=true;} else i.checked=!!cur[k];});
  el.querySelector('#cmp-accept').onclick=()=>saveConsent({necessary:true,preferences:true,analytics:true,marketing:true,ts:Date.now()});
  el.querySelector('#cmp-reject').onclick=()=>saveConsent({necessary:true,preferences:false,analytics:false,marketing:false,ts:Date.now()});
  el.querySelector('#cmp-save').onclick=()=>{ const r={necessary:true,preferences:false,analytics:false,marketing:false,ts:Date.now()}; el.querySelectorAll('[data-cmp-cat]').forEach(i=>{const k=i.dataset.cmpCat;if(k!=='necessary') r[k]=i.checked;}); saveConsent(r); };
}
document.addEventListener('DOMContentLoaded', async ()=>{
  const all = await loadI18n();
  const lang = getLangFromPath();
  applyUI(lang);
  initLangSwitcher(lang);
  renderDestinations(lang,"mare","sea-list");
  renderDestinations(lang,"montagna","mountain-list");
  if(!getConsent()) showCMP();
  document.querySelectorAll('[data-open-cmp]').forEach(a=> a.addEventListener('click', (e)=>{ e.preventDefault(); showCMP(); }));
  document.getElementById("modal-close").onclick = closeModal;
});
