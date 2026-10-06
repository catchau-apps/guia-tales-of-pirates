(function(){
const $=s=>document.querySelector(s),fmt=n=>Number(n).toLocaleString('pt-BR');
let ITENS=[],POR={};
const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const ic=i=>i.ic?`<img class="ic" src="assets/icones/${i.ic}.png" alt="" width="32" height="32" loading="lazy">`:'<span class="ic"></span>';
function lista(){
  const q=$('#iq').value.trim().toLowerCase(),t=$('#itipo').value,f=$('#ifonte').value;
  const r=ITENS.filter(i=>(!q||i.n.toLowerCase().includes(q))&&(!t||i.t===t)&&(!f||(i.f&&i.f[f])));
  $('#icont').textContent=r.length+' itens'+(r.length>300?' (mostrando 300; refine a busca)':'');
  $('#ilista').innerHTML=r.slice(0,300).map(i=>`<li><a href="#i${i.id}">${ic(i)}<span>${esc(i.n)}<br><small>${esc(i.t)}${i.lv?' · nível '+i.lv:''}</small></span></a></li>`).join('');
}
function bloco(tit,linhas){return linhas.length?`<h3>${tit}</h3><ul>${linhas.join('')}</ul>`:''}
function detalhe(){
  const m=location.hash.match(/^#i(\d+)$/),d=$('#idet');
  if(!m||!POR[m[1]]){d.hidden=true;return}
  const i=POR[m[1]],f=i.f||{};
  const tags=[i.t,i.lv?'Nível '+i.lv:'',...(i.c||[]),...(i.ch||[])].filter(Boolean).map(x=>`<span>${esc(x)}</span>`).join('');
  const st=(i.s||[]).length?`<h3>Atributos</h3><div class="tabela"><table>${i.s.map(([a,b])=>`<tr><th scope="row">${esc(a)}</th><td>${esc(b)}</td></tr>`).join('')}</table></div><p class="mut">Faixas (ex.: 0–10) = o valor varia de um item para outro.</p>`:'';
  const npc=(f.npc||[]).map(([n,mp,x,y])=>`<li><b>${esc(n)}</b> — ${esc(mp)} <code>(${x}, ${y})</code></li>`);
  const mob=(f.mob||[]).sort((a,b)=>b[2]-a[2]).slice(0,25).map(([n,lv,ch,onde])=>`<li><b>${esc(n)}</b> <span class="mut">(nível ${lv})</span> — ${ch}% por morte${onde.length?' · '+onde.map(esc).join(', '):' · <span class="mut">local fora das tabelas de spawn (evento/dungeon)</span>'}</li>`);
  const loja=(f.loja||[]).slice(0,12).map(([aba,p,pr])=>`<li>Aba <b>${esc(aba)}</b>: ${esc(p)} — ${fmt(pr)} gold</li>`);
  const mis=(f.missao||[]).map(([n,g,mp])=>`<li>Missão <b>${esc(n)}</b>${g?' — '+esc(g)+' ('+esc(mp)+')':''}</li>`);
  const nada=!(npc.length||mob.length||loja.length||mis.length);
  d.innerHTML=`<div class="idet"><div class="idet-top">${i.ic?`<img src="assets/icones/${i.ic}.png" alt="">`:''}<div><h2>${esc(i.n)}</h2><div class="tags">${tags}</div></div></div>
  ${i.d?`<p>${esc(i.d)}</p>`:''}${i.e?`<p><b>Efeito:</b> ${esc(i.e)}</p>`:''}${st}
  <h2>Onde conseguir</h2>${bloco('Vende em NPC',npc)}${bloco('Cai de monstro',mob)}${bloco('Store (gold)',loja)}${bloco('Recompensa de missão',mis)}
  ${nada?'<p class="mut">Sem origem fixa nas tabelas (evento, forja, combinação ou item especial).</p>':''}
  <p class="mut">${i.v?'Vende ao NPC por '+fmt(i.v)+' gold. ':''}Chance de drop já com a taxa 3x do servidor, sem bônus de fada ou de grupo. ID ${i.id}.</p></div>`;
  d.hidden=false;d.scrollIntoView({behavior:'smooth',block:'start'});document.title=i.n+' · Itens';
}
fetch('assets/itens.json').then(r=>r.json()).then(js=>{
  ITENS=js;js.forEach(i=>POR[i.id]=i);
  [...new Set(js.map(i=>i.t))].sort().forEach(t=>{const o=document.createElement('option');o.value=o.textContent=t;$('#itipo').appendChild(o)});
  ['iq','itipo','ifonte'].forEach(id=>$('#'+id).addEventListener('input',lista));
  lista();detalhe();
});
window.addEventListener('hashchange',detalhe);
})();