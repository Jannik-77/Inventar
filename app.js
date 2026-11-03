const $=id=>document.getElementById(id);
let db=JSON.parse(localStorage.getItem("fahrzeug-inventar-v4")||'{"articles":[],"drawers":{"Links":[1,1,1],"Rechts":[1]},"boxes":{}}');
let shelf="Links",section=1,drawer=1,compartment=1,editId=null;
const loc=()=>`${shelf} / Abschnitt ${section} / Schublade ${drawer} / Fach ${compartment}`;
function persist(){localStorage.setItem("fahrzeug-inventar-v4",JSON.stringify(db));render()}
function btn(container,text,val,active,fn){let b=document.createElement("button");b.textContent=text;b.className=active?"active":"";b.onclick=fn;container.append(b)}
function drawNav(){
 document.querySelectorAll(".shelf").forEach(b=>{b.classList.toggle("active",b.dataset.shelf===shelf);b.onclick=()=>{shelf=b.dataset.shelf;section=1;drawer=1;compartment=1;drawNav();render()}});
 $("sections").innerHTML="";let n=shelf==="Links"?3:1;for(let i=1;i<=n;i++)btn($("sections"),"Abschnitt "+i,i,section===i,()=>{section=i;drawer=1;compartment=1;drawNav();render()});
 $("drawers").innerHTML="";let dcount=db.drawers[shelf][section-1]||1;for(let i=1;i<=dcount;i++)btn($("drawers"),"Schublade "+i,i,drawer===i,()=>{drawer=i;compartment=1;drawNav();render()});
 $("compartments").innerHTML="";let key=`${shelf}-${section}-${drawer}`,cc=db.boxes[key]||4;for(let i=1;i<=cc;i++)btn($("compartments"),"Fach "+i,i,compartment===i,()=>{compartment=i;drawNav();render()});
 $("placeLabel").textContent="Ausgewählt: "+loc();
}
$("addDrawer").onclick=()=>{let a=db.drawers[shelf];a[section-1]=(a[section-1]||1)+1;drawer=a[section-1];drawNav();render()};
$("addCompartment").onclick=()=>{let k=`${shelf}-${section}-${drawer}`;db.boxes[k]=(db.boxes[k]||4)+1;compartment=db.boxes[k];drawNav();render()};
$("itemForm").onsubmit=e=>{e.preventDefault();let a={id:editId||crypto.randomUUID(),name:$("name").value.trim(),qty:Math.max(0,+$("qty").value),min:Math.max(0,+$("minimum").value),shelf,section,drawer,compartment};if(editId)db.articles=db.articles.map(x=>x.id===editId?a:x);else db.articles.push(a);editId=null;$("itemForm").reset();$("qty").value=1;$("minimum").value=0;$("save").textContent="＋ Artikel im Fach speichern";$("msg").textContent="Artikel gespeichert.";persist()};
function render(){let q=$("search").value.toLowerCase();let arr=db.articles.filter(a=>(a.name+" "+a.shelf+" Abschnitt "+a.section+" Schublade "+a.drawer+" Fach "+a.compartment).toLowerCase().includes(q)&&(!q||(a.shelf===shelf&&a.section===section&&a.drawer===drawer&&a.compartment===compartment)||a.name.toLowerCase().includes(q)) );$("items").innerHTML="";arr.forEach(a=>{let card=document.createElement("div");card.className="item";card.innerHTML=`<h3>${esc(a.name)}</h3><div>Bestand: <b>${a.qty}</b> · Mindestbestand: ${a.min}</div><div class="small">${esc(a.shelf)} / Abschnitt ${a.section} / Schublade ${a.drawer} / Fach ${a.compartment}</div>${a.qty<=a.min?'<div class="warn">⚠ Mindestbestand erreicht oder unterschritten!</div>':""}<div class="actions"><button data-out>Entnommen −1</button><button data-in>Aufgefüllt +1</button><button class="secondary" data-edit>Bearbeiten</button><button class="danger" data-del>Löschen</button></div>`;
card.querySelector("[data-out]").onclick=()=>{if(a.qty>0)a.qty--;persist()};card.querySelector("[data-in]").onclick=()=>{a.qty++;persist()};card.querySelector("[data-edit]").onclick=()=>{$("name").value=a.name;$("qty").value=a.qty;$("minimum").value=a.min;editId=a.id;$("save").textContent="Änderungen speichern";window.scrollTo({top:0,behavior:"smooth"})};card.querySelector("[data-del]").onclick=()=>{if(confirm(a.name+" löschen?")){db.articles=db.articles.filter(x=>x.id!==a.id);persist()}};$("items").append(card)});if(!arr.length)$("items").innerHTML='<p class="small">Keine passenden Artikel gefunden.</p>'}
function esc(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]))}
$("search").oninput=render;
$("export").onclick=()=>{let blob=new Blob([JSON.stringify(db,null,2)],{type:"application/json"}),u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download="FahrzeugInventar-Sicherung.json";a.click();URL.revokeObjectURL(u)};
$("import").onchange=async e=>{try{let x=JSON.parse(await e.target.files[0].text());if(!Array.isArray(x.articles)||!x.drawers)throw Error("Format");if(confirm("Import ersetzt den aktuellen Datenbestand. Vorher bitte exportieren. Fortfahren?")){db=x;persist();$("msg").textContent="Import erfolgreich."}}catch{$("msg").textContent="Import fehlgeschlagen: ungültige JSON-Datei."}e.target.value=""};
drawNav();render();
if("serviceWorker"in navigator)navigator.serviceWorker.register("sw.js").catch(()=>{});
