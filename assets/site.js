(function(){
const sem=s=>s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase();
// abas acessiveis + link direto (#id da aba ou de algo dentro dela)
function ativa(tab,foco){const lista=tab.parentElement;lista.querySelectorAll('[role=tab]').forEach(t=>{const on=t===tab;t.setAttribute('aria-selected',on);t.tabIndex=on?0:-1;
document.getElementById(t.getAttribute('aria-controls')).hidden=!on});if(foco)tab.focus()}
document.querySelectorAll('[role=tablist]').forEach(l=>{const tabs=[...l.querySelectorAll('[role=tab]')];
tabs.forEach((t,i)=>{t.addEventListener('click',()=>{ativa(t);history.replaceState(null,'','#'+t.getAttribute('aria-controls'));if(l.classList.contains('lado')){window.scrollTo(0,0);const m=document.querySelector('nav.menu');if(m&&m.classList.contains('on'))document.querySelector('.abrir').click()}});
t.addEventListener('keydown',e=>{let j=null;if(e.key==='ArrowRight'||e.key==='ArrowDown')j=(i+1)%tabs.length;if(e.key==='ArrowLeft'||e.key==='ArrowUp')j=(i-1+tabs.length)%tabs.length;if(e.key==='Home')j=0;if(e.key==='End')j=tabs.length-1;if(j!==null){e.preventDefault();ativa(tabs[j],true)}})})});
function abreHash(){const id=decodeURIComponent(location.hash.slice(1));if(!id)return;const el=document.getElementById(id);if(!el)return;
const painel=el.closest('[role=tabpanel]');if(painel){const t=document.getElementById('tab-'+painel.id);if(t)ativa(t)}
let dt=el.closest('details');while(dt){dt.open=true;dt=dt.parentElement&&dt.parentElement.closest('details')}setTimeout(()=>el.scrollIntoView({block:'start'}),0)}
document.querySelectorAll('[data-abre]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();location.hash=a.dataset.abre;abreHash()}));
window.addEventListener('hashchange',abreHash);abreHash();
// menu lateral no celular (gaveta) e tema claro/escuro
const bt=document.querySelector('.abrir'),menu=document.querySelector('nav.menu'),veu=document.querySelector('.veu');
function gaveta(on){if(!menu)return;menu.classList.toggle('on',on);if(bt)bt.setAttribute('aria-expanded',on);if(veu)veu.hidden=!on}
if(bt)bt.addEventListener('click',()=>gaveta(!menu.classList.contains('on')));if(veu)veu.addEventListener('click',()=>gaveta(false));
document.addEventListener('keydown',e=>{if(e.key==='Escape')gaveta(false)});
const tm=document.querySelector('.tema');if(tm)tm.addEventListener('click',()=>{const r=document.documentElement;
const escuro=r.dataset.theme?r.dataset.theme==='dark':matchMedia('(prefers-color-scheme: dark)').matches;r.dataset.theme=escuro?'light':'dark';try{localStorage.setItem('tema',r.dataset.theme)}catch(e){}});
const atual=menu&&menu.querySelector('[aria-current]');if(atual)menu.scrollTop=atual.offsetTop-menu.clientHeight/2;
// listas de verificacao lembradas neste navegador
document.querySelectorAll('ul.check input[type=checkbox]').forEach((c,i)=>{const k='chk:'+location.pathname+':'+i;try{c.checked=localStorage.getItem(k)==='1'}catch(e){}
c.addEventListener('change',()=>{try{localStorage.setItem(k,c.checked?'1':'0')}catch(e){}conta()})});
function conta(){document.querySelectorAll('details.card').forEach(d=>{const cs=d.querySelectorAll(':scope>.det ul.check input');if(!cs.length)return;
let s=d.querySelector(':scope>summary .cont');if(!s){s=document.createElement('span');s.className='cont';d.querySelector(':scope>summary').appendChild(s)}
const n=[...cs].filter(c=>c.checked).length;s.textContent=n+'/'+cs.length;s.classList.toggle('feito',n===cs.length)})}conta();
// filtros de dungeon
document.querySelectorAll('.filtro').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('.filtro').forEach(x=>x.setAttribute('aria-pressed',x===b));
const f=b.dataset.filtro;document.querySelectorAll('.dg').forEach(c=>c.hidden=!(f==='todas'||c.dataset.grupo===f))}));

// ---------------------------------------------------------------- busca (indice em assets/busca.json)
const PARADAS=new Set(('a o as os um uma uns umas de do da dos das no na nos nas em ao aos e ou se que como onde qual quais quando quanto quanta '+
 'quantos quantas eu me meu minha meus minhas voce vc tu te seu sua pra pro para por com sem eh e ja so mais muito muita isso esse essa este esta '+
 'isto aqui la tem ter tenho posso pode consigo consegue faco faz fazer fazendo preciso precisa quero queria devo deve the to of and how do i is '+
 'what where can my in on for it fica ficam fico acho achar encontro encontrar encontra existe sao sou ser estao algum alguma jeito forma maneira '+
 'ganhar ganho ganha conseguir obter pegar pego pega compro rapido rapida rapidamente facil melhor bom boa certo direito funciona dica').split(' '));
const SIN=[['banco','bank','vault','banker','cofre','deposito','armazem','bancario'],['abrir','abre','aberto','acessar','acesso','open'],
 ['mochila','bag','inventario','bolsa','inventory'],['dinheiro','gold','ouro','grana','money','moeda'],['nivel','level','lv','upar','up','subir','exp','experiencia','xp','evoluir'],
 ['barco','navio','boat','ship','navegar','navegacao','mar','velejar','porto','atracar'],['teleporte','teleportar','viajar','viagem','travel','teleport','transporte'],
 ['missao','quest','mission','tarefa'],['fada','fairy','pet'],['montaria','mount','cavalo','montar'],['loja','store','shop','comprar','compra','mall'],
 ['vender','sell','venda','vende'],['forja','forge','forjar','gema','gem','socket','refino','refinar'],['habilidade','skill','magia'],
 ['casa','home','town'],['chefe','boss','mini-boss','miniboss'],['atalho','tecla','hotkey','teclado','comando'],
 ['organizar','sort','ordenar','arrumar'],['lixo','junk','descartar','deletar','apagar','jogar fora'],['morrer','morte','reviver','renascer','ressuscitar'],
 ['renascimento','rebirth','phoenix','reencarnar'],['classe','profissao','class','job'],['dropa','drop','cai','dropar','loot'],['monstro','mob','monster','bicho','inimigo'],
 ['hexathlon','hexa','pappa'],['diaria','daily','diario','recompensa'],['coleta','coletar','minerar','pescar','cortar','madeira','minerio','peixe'],
 ['taxa','custo','preco','custa','cobra','fee','price'],
 ['farmar','farm','render','rende','lucro'],['chat','!','comandos']];
const palavras=s=>sem(s).replace(/[^a-z0-9]+/g,' ').trim().split(' ').filter(Boolean);
const SUF=['amentos','imentos','amento','imento','adoras','adores','adora','ador','mente','ancia','encia','acoes','icoes','istas','ista','aveis','iveis',
 'avel','ivel','ando','endo','indo','aram','eram','iram','avam','ados','idos','adas','idas','ado','ido','ada','ida','coes','cao','oes','ao','ar','er','ir',
 'am','em','es','as','os','is','ns','a','e','o','s','i'];
function raiz(w){if(/^\d+$/.test(w)||w.length<=3)return w;for(const s of SUF){if(w.endsWith(s)&&w.length-s.length>=3)return w.slice(0,-s.length)}return w}
const SINR=new Map();SIN.forEach(g=>{const rs=[...new Set(g.flatMap(palavras).map(raiz))];rs.forEach(r=>SINR.set(r,(SINR.get(r)||[]).concat(rs.filter(x=>x!==r))))});
let IDX=null,carregando=null;
function carregar(){if(IDX)return Promise.resolve(IDX);if(carregando)return carregando;
 carregando=fetch('assets/busca.json').then(r=>r.json()).then(d=>{const inv=new Map(),N=d.b.length;
  d.b.forEach((b,i)=>{const visto=new Map();const add=(txt,peso)=>palavras(txt).forEach(w=>{if(PARADAS.has(w))return;const r=raiz(w);visto.set(r,(visto.get(r)||0)+peso)});
   add(b[3],b[4]===1?3:1);if(b[2])add(b[2],0.6);add(d.p[b[0]][1],0.3);
   visto.forEach((tf,r)=>{let l=inv.get(r);if(!l)inv.set(r,l=[]);l.push([i,tf])})});
  const voc=[...inv.keys()].sort();IDX={d,inv,voc,N};return IDX});return carregando}
function lev(a,b,max){if(Math.abs(a.length-b.length)>max)return max+1;let p=Array.from({length:b.length+1},(_,i)=>i);
 for(let i=1;i<=a.length;i++){const c=[i];let m=i;for(let j=1;j<=b.length;j++){c[j]=Math.min(p[j]+1,c[j-1]+1,p[j-1]+(a[i-1]===b[j-1]?0:1));m=Math.min(m,c[j])}if(m>max)return max+1;p=c}return p[b.length]}
// cada palavra da consulta vira um grupo de raizes com peso: ela mesma 1, sinonimo 0.75, prefixo (ultima palavra) 0.6, erro de digitacao 0.5
// expressoes comuns viram o termo do guia antes de separar as palavras
const REESCREVE=[[/\bvolta(r|o)?\s+(pra|para|pro|a|ao|na|no)?\s*(a|o)?\s*(cidade|casa|town)\b/g,'home'],[/\bonde\s+(cai|dropa|droppa)\b/g,'drop'],
 [/\bquem\s+(dropa|droppa)\b/g,'drop'],[/\b(2a|segunda)\s+(classe|profissao)\b/g,'segunda profissao'],[/\bfazer\s+(gold|dinheiro|grana)\b/g,'dinheiro']];
function reescreve(q){let s=palavras(q).join(' ');for(const [re,t] of REESCREVE)s=s.replace(re,t);return s}
function grupos(q,ix){const ws=palavras(reescreve(q));let uteis=ws.filter(w=>!PARADAS.has(w));if(!uteis.length)uteis=ws;
 return uteis.map((w,k)=>{const r=raiz(w),g=new Map([[r,1]]);(SINR.get(r)||[]).forEach(s=>{if(!g.has(s))g.set(s,0.75)});
  const ultima=k===uteis.length-1;if(ultima&&w.length>=3){let n=0;for(const v of ix.voc){if(v.startsWith(w)&&!g.has(v)){g.set(v,0.6);if(++n>=40)break}}}
  if(![...g.keys()].some(x=>ix.inv.has(x))&&w.length>=4){const max=w.length>=7?2:1;for(const v of ix.voc){if(Math.abs(v.length-r.length)<=max&&lev(r,v,max)<=max&&!g.has(v))g.set(v,0.5)}}
  return {w,g}})}
function procurar(q,ix,lim,porSecao){porSecao=porSecao||1;const gs=grupos(q,ix);if(!gs.length)return{res:[],gs};const pont=new Map();
 gs.forEach((gr,k)=>gr.g.forEach((peso,r)=>{const l=ix.inv.get(r);if(!l)return;const idf=Math.log(1+ix.N/l.length);
  for(const [i,tf] of l){let e=pont.get(i);if(!e)pont.set(i,e={s:new Float32Array(gs.length)});const v=peso*idf*(1+Math.log(tf));if(v>e.s[k])e.s[k]=v}}));
 const frase=gs.map(g=>g.w).join(' '),out=[];
 // peso de cada palavra na cobertura = raridade dela (idf): faltar "banco" pesa mais que faltar "abrir"
 const gw=gs.map(gr=>{let m=0;gr.g.forEach((peso,r)=>{const l=ix.inv.get(r);if(l)m=Math.max(m,peso*Math.log(1+ix.N/l.length))});return m||1}),gt=gw.reduce((x,y)=>x+y,0);
 pont.forEach((e,i)=>{let soma=0,cob=0;e.s.forEach((v,k)=>{soma+=v;if(v>0)cob+=gw[k]});const c=cob/gt;if(gs.length>1&&c<0.4)return;
  const b=ix.d.b[i];let sc=soma*c*c*(b[4]===2?1.3:b[4]===3?0.8:1);if(gs.length>1&&palavras(b[3]).join(' ').includes(frase))sc*=1.5;
  if(b[4]===3){const fr=gs.map(g=>g.w).filter(w=>w!=='drop').join(' ');if(fr.length>=3&&palavras(b[3].split(' (')[0]).join(' ').includes(fr))sc*=2.5}out.push([sc,i])});
 out.sort((a,b)=>b[0]-a[0]);const vistos=new Map(),res=[],corte=out.length?out[0][0]*0.15:0;
 for(const [sc,i] of out){if(sc<corte)break;const b=ix.d.b[i],ch=b[0]+'|'+(b[4]===1?b[3]:b[2]),n=vistos.get(ch)||0;if(n>=porSecao&&b[4]!==3)continue;vistos.set(ch,n+1);res.push(i);if(res.length>=lim)break}
 return{res,gs}}
const esc=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
function trecho(txt,gs,tam){const ws=txt.split(/(\s+)/);const alvo=new Set();gs.forEach(g=>g.g.forEach((_,r)=>alvo.add(r)));
 const hit=ws.map(w=>{const p=palavras(w);return p.length>0&&p.some(x=>alvo.has(raiz(x)))});
 let ini=0,pos=0,primeira=-1;for(let k=0;k<ws.length;k++){if(hit[k]){primeira=k;break}}
 if(primeira>=0){let c=0;for(let k=0;k<primeira;k++)c+=ws[k].length;ini=Math.max(0,c-50)}
 let out='',len=0;for(let k=0;k<ws.length;k++){const L=ws[k].length;if(pos+L<=ini){pos+=L;continue}pos+=L;if(len>tam)break;len+=L;out+=hit[k]?'<mark>'+esc(ws[k])+'</mark>':esc(ws[k])}
 return (ini>0?'…':'')+out.trim()+(len>tam?'…':'')}
function link(ix,i,gs){const b=ix.d.b[i],pg=ix.d.p[b[0]][0];const h=encodeURIComponent(gs.map(g=>g.w).join(' '));return b[1].includes('#')?b[1]:pg+'?h='+h+'#'+b[1]}
function rotulo(ix,i){const b=ix.d.b[i],pt=ix.d.p[b[0]][1];if(b[4]===3)return 'Item';if(b[4]===1)return pt;return b[2]?pt+' › '+b[2]:pt}
function titulo(ix,i){const b=ix.d.b[i];return b[4]===1||b[4]===3?b[3]:(b[2]||ix.d.p[b[0]][1])}
function sugestao(q,ix){const ws=palavras(q).filter(w=>!PARADAS.has(w));let mud=false;const novo=ws.map(w=>{if(ix.inv.has(raiz(w)))return w;let melhor=null,d=3;
 for(const v of ix.voc){if(v.length<3)continue;const x=lev(raiz(w),v,2);if(x<d){d=x;melhor=v}}if(melhor){mud=true;return melhor}return w});return mud?novo.join(' '):''}
const inp=document.getElementById('q'),res=document.getElementById('res');
if(inp){let ultimo='';
 const prep=()=>carregar();inp.addEventListener('focus',prep,{once:true});inp.addEventListener('pointerenter',prep,{once:true});
 async function busca(){const q=inp.value.trim();ultimo=q;if(sem(q).replace(/\s/g,'').length<2){res.classList.remove('on');res.innerHTML='';return}
  const ix=await carregar();if(q!==ultimo)return;const {res:r,gs}=procurar(q,ix,8);
  res.innerHTML=(r.length?r.map(i=>`<a href="${link(ix,i,gs)}"><span class="rt">${esc(rotulo(ix,i))}</span><b>${esc(titulo(ix,i))}</b><small>${trecho(ix.d.b[i][3],gs,150)}</small></a>`).join('')
   :`<a class="vazio"><small>Nada encontrado${(s=>s?` — tente <b>${esc(s)}</b>`:'')(sugestao(q,ix))}.</small></a>`)+
   `<a class="todos" href="busca.html?q=${encodeURIComponent(q)}">Ver todos os resultados ↵</a>`;res.classList.add('on')}
 inp.addEventListener('input',busca);
 inp.addEventListener('keydown',e=>{if(e.key==='Escape'){inp.value='';busca()}if(e.key==='Enter'&&inp.value.trim()){e.preventDefault();location.href='busca.html?q='+encodeURIComponent(inp.value.trim())}
  if(e.key==='ArrowDown'){const a=res.querySelector('a[href]');if(a){e.preventDefault();a.focus()}}});
 res.addEventListener('keydown',e=>{const as=[...res.querySelectorAll('a[href]')],k=as.indexOf(document.activeElement);if(k<0)return;
  if(e.key==='ArrowDown'){e.preventDefault();(as[k+1]||as[0]).focus()}if(e.key==='ArrowUp'){e.preventDefault();k?as[k-1].focus():inp.focus()}if(e.key==='Escape')inp.focus()});
 document.addEventListener('click',e=>{if(!e.target.closest('.busca'))res.classList.remove('on')});
 document.addEventListener('keydown',e=>{if(e.key==='/'&&document.activeElement!==inp&&!/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)){e.preventDefault();inp.focus()}});
 const pq=new URLSearchParams(location.search).get('q'),pag=document.getElementById('buscapg');
 if(pag){inp.value=pq||'';const titulo_=document.getElementById('buscaq');
  const roda=async()=>{const q=inp.value.trim();if(!q){pag.innerHTML='<p class="mut">Digite o que procura no campo de busca (ex.: <i>como abrir o banco</i>, <i>onde cai Elven Signet</i>, <i>montaria</i>).</p>';return}
   titulo_.textContent=q;const ix=await carregar(),{res:r,gs}=procurar(q,ix,60,4);
   if(!r.length){const s=sugestao(q,ix);pag.innerHTML=`<p>Nada encontrado para <b>${esc(q)}</b>.${s?` Você quis dizer <a href="busca.html?q=${encodeURIComponent(s)}">${esc(s)}</a>?`:''}</p>`;return}
   const por=new Map();r.forEach(i=>{const pg=ix.d.b[i][0];if(!por.has(pg))por.set(pg,[]);por.get(pg).push(i)});
   pag.innerHTML=`<p class="mut">${r.length} resultado${r.length>1?'s':''}, do mais relevante para o menos.</p>`+[...por].map(([pg,is])=>`<div class="card bres"><h2><a href="${ix.d.p[pg][0]}">${esc(ix.d.p[pg][1])}</a></h2>`+
    is.map(i=>`<a class="bhit" href="${link(ix,i,gs)}"><b>${esc(titulo(ix,i))}</b><span>${trecho(ix.d.b[i][3],gs,260)}</span></a>`).join('')+'</div>').join('')};
  roda();inp.addEventListener('keydown',e=>{if(e.key==='Enter'){history.replaceState(null,'','busca.html?q='+encodeURIComponent(inp.value.trim()));roda()}})}
}
// destaque do trecho aberto pela busca (?h=palavras#ancora)
(function(){const h=new URLSearchParams(location.search).get('h'),id=decodeURIComponent(location.hash.slice(1));if(!h||!id)return;
 const el=document.getElementById(id);if(!el)return;el.classList.add('alvo');const rs=new Set(palavras(h).filter(w=>!PARADAS.has(w)).map(raiz).flatMap(r=>[r,...(SINR.get(r)||[])]));
 const tw=document.createTreeWalker(el,NodeFilter.SHOW_TEXT),nos=[];while(tw.nextNode())nos.push(tw.currentNode);
 nos.forEach(n=>{const partes=n.nodeValue.split(/(\s+)/);if(!partes.some(p=>palavras(p).some(x=>rs.has(raiz(x)))))return;const f=document.createDocumentFragment();
  partes.forEach(p=>{if(palavras(p).some(x=>rs.has(raiz(x)))){const m=document.createElement('mark');m.textContent=p;f.appendChild(m)}else f.appendChild(document.createTextNode(p))});n.replaceWith(f)})})();
})();