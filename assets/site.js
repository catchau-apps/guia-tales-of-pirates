(function(){
const sem=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
// abas acessiveis + link direto (#id da aba ou de algo dentro dela)
function ativa(tab,foco){const lista=tab.parentElement;lista.querySelectorAll('[role=tab]').forEach(t=>{const on=t===tab;t.setAttribute('aria-selected',on);t.tabIndex=on?0:-1;
document.getElementById(t.getAttribute('aria-controls')).hidden=!on});if(foco)tab.focus()}
document.querySelectorAll('[role=tablist]').forEach(l=>{const tabs=[...l.querySelectorAll('[role=tab]')];
tabs.forEach((t,i)=>{t.addEventListener('click',()=>{ativa(t);history.replaceState(null,'','#'+t.getAttribute('aria-controls'))});
t.addEventListener('keydown',e=>{let j=null;if(e.key==='ArrowRight')j=(i+1)%tabs.length;if(e.key==='ArrowLeft')j=(i-1+tabs.length)%tabs.length;if(e.key==='Home')j=0;if(e.key==='End')j=tabs.length-1;if(j!==null){e.preventDefault();ativa(tabs[j],true)}})})});
function abreHash(){const id=decodeURIComponent(location.hash.slice(1));if(!id)return;const el=document.getElementById(id);if(!el)return;
const painel=el.closest('[role=tabpanel]');if(painel){const t=document.getElementById('tab-'+painel.id);if(t)ativa(t)}
if(el.tagName==='DETAILS')el.open=true;setTimeout(()=>el.scrollIntoView({block:'start'}),0)}
document.querySelectorAll('[data-abre]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();location.hash=a.dataset.abre;abreHash()}));
window.addEventListener('hashchange',abreHash);abreHash();
// menu no celular
const bt=document.querySelector('.abrir'),menu=document.querySelector('nav.menu');if(bt)bt.addEventListener('click',()=>{const on=menu.classList.toggle('on');bt.setAttribute('aria-expanded',on)});
// filtros de dungeon
document.querySelectorAll('.filtro').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.filtro').forEach(x=>x.setAttribute('aria-pressed',x===b));
const f=b.dataset.filtro;document.querySelectorAll('.dg').forEach(c=>c.hidden=!(f==='todas'||c.dataset.grupo===f))}));
// busca
const inp=document.getElementById('q'),res=document.getElementById('res');if(!inp)return;
function busca(){const q=sem(inp.value.trim());if(q.length<2){res.classList.remove('on');res.innerHTML='';return}
const termos=q.split(/\s+/);const achados=BUSCA.map(b=>{const alvo=sem(b.t+' '+b.x);let p=0;for(const t of termos){if(!alvo.includes(t))return null;p+=sem(b.t).includes(t)?3:1}return[p,b]}).filter(Boolean).sort((a,b)=>b[0]-a[0]).slice(0,8);
res.innerHTML=achados.length?achados.map(([,b])=>{const i=sem(b.x).indexOf(termos[0]);const tr=b.x.slice(Math.max(0,i-40),i+90);return `<a href="${b.u}"><b>${b.t}</b><small>…${tr.replace(/</g,'&lt;')}…</small></a>`}).join(''):'<a><small>Nada encontrado.</small></a>';res.classList.add('on')}
inp.addEventListener('input',busca);inp.addEventListener('keydown',e=>{if(e.key==='Escape'){inp.value='';busca()}if(e.key==='ArrowDown'){const a=res.querySelector('a[href]');if(a){e.preventDefault();a.focus()}}});
document.addEventListener('click',e=>{if(!e.target.closest('.busca'))res.classList.remove('on')});
document.addEventListener('keydown',e=>{if(e.key==='/'&&document.activeElement!==inp){e.preventDefault();inp.focus()}});
})();