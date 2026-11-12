/* ---------- Card nav ---------- */
(function(){
  var nav=document.getElementById('cardNav'), btn=document.getElementById('burger'), content=document.getElementById('navContent');
  var cards=[].slice.call(content.querySelectorAll('.nav-card'));
  var open=false, tl=null, CLOSED=68;
  function setInert(v){ content.toggleAttribute('inert',v); }
  setInert(true);
  function targetHeight(){ return CLOSED + content.offsetHeight; }
  if(window.gsap){
    gsap.set(nav,{height:CLOSED}); gsap.set(cards,{y:40,opacity:0});
    tl=gsap.timeline({paused:true});
    tl.to(nav,{height:targetHeight,duration:.42,ease:'power3.out'});
    tl.to(cards,{y:0,opacity:1,duration:.4,ease:'power3.out',stagger:.08},'-=0.12');
  } else { document.documentElement.classList.add('no-gsap'); }
  function set(v){
    if(v===open) return; open=v;
    nav.classList.toggle('open',open);
    btn.setAttribute('aria-expanded',open); btn.setAttribute('aria-label',open?'Close menu':'Open menu');
    setInert(!open);
    var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(tl){
      if(reduce){ tl.invalidate(); tl.progress(open?1:0).pause(); }
      else if(open){ tl.invalidate().play(0); }
      else { tl.reverse(); }
    } else { nav.style.height=open?targetHeight()+'px':CLOSED+'px'; }
  }
  btn.addEventListener('click',function(){ set(!open); });
  document.addEventListener('keydown',function(e){ if(e.key==='Escape'&&open){ set(false); btn.focus(); } });
  document.addEventListener('click',function(e){ if(open&&!nav.contains(e.target)) set(false); });
  window.addEventListener('resize',function(){ if(open){ if(window.gsap) gsap.set(nav,{height:targetHeight()}); else nav.style.height=targetHeight()+'px'; } });
})();

/* ---------- Current page in the nav ---------- */
(function(){
  var path=location.pathname.replace(/\.html$/,'').replace(/\/$/,'')||'/';
  document.querySelectorAll('.card-nav a').forEach(function(a){
    var h=a.getAttribute('href');
    if(h===path || (h!=='/' && path.endsWith(h))) a.setAttribute('aria-current','page');
  });
})();

/* ---------- Hero photo slider ---------- */
(function(){
  var slides=[].slice.call(document.querySelectorAll('.hero-slide'));
  if(!slides.length) return;
  var cap=document.getElementById('heroCap'), cnt=document.getElementById('heroCount');
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches, i=0, timer;
  var pad=function(n){return (n<10?'0':'')+n;};
  function go(n){
    slides[i].classList.remove('on');
    i=(n+slides.length)%slides.length;
    slides[i].classList.add('on');
    cnt.textContent=pad(i+1)+' / '+pad(slides.length);
    cap.textContent=slides[i].dataset.caption;
  }
  function auto(){ clearInterval(timer); if(!reduce) timer=setInterval(function(){ go(i+1); },6500); }
  document.getElementById('heroPrev').addEventListener('click',function(){ go(i-1); auto(); });
  document.getElementById('heroNext').addEventListener('click',function(){ go(i+1); auto(); });
  auto();
})();

/* ---------- Medium feed: swap in the latest posts from /api/medium ---------- */
(function(){
  var boxes=[].slice.call(document.querySelectorAll('[data-medium]'));
  if(!boxes.length || !window.fetch) return;
  var esc=function(s){ return String(s||'').replace(/[&<>"]/g,function(c){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]; }); };
  var nice=function(t){ t=String(t).replace(/-/g,' '); return t.charAt(0).toUpperCase()+t.slice(1); };
  var M=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  function card(p){
    var d=new Date(p.date), day=d.getDate(), mon=M[d.getMonth()], full=day+' '+mon+' '+d.getFullYear();
    var media=p.image?'<img class="photo" src="'+esc(p.image)+'" alt="" loading="lazy">':'<div class="slot">Medium</div>';
    return '<article class="post"><a class="post-media" href="'+esc(p.link)+'">'+media+'<span class="date-badge"><b>'+day+'</b>'+mon+'</span></a>'+
      '<div class="post-body"><div class="post-tags">'+(p.tags||[]).slice(0,2).map(function(t){ return '<span class="chip">'+esc(nice(t))+'</span>'; }).join('')+'</div>'+
      '<h3><a href="'+esc(p.link)+'">'+esc(p.title)+'</a></h3><p class="byline">By '+esc(p.author)+' · '+full+'</p>'+
      (p.excerpt?'<p class="excerpt">'+esc(p.excerpt)+'</p>':'')+'<a class="read" href="'+esc(p.link)+'">Read on Medium ↗</a></div></article>';
  }
  fetch('/api/medium').then(function(r){ return r.ok ? r.json() : Promise.reject(r.status); }).then(function(data){
    if(!data.posts || !data.posts.length) return;
    boxes.forEach(function(b){
      var list=data.posts.slice(0, Number(b.getAttribute('data-limit'))||3);
      b.innerHTML=list.map(card).join('');
      b.setAttribute('data-count', String(Math.min(list.length,3)));
    });
  }).catch(function(){ /* keep the article already in the page */ });
})();

/* ---------- Copy till number ---------- */
(function(){
  var b=document.getElementById('copyTill'), t=document.getElementById('till');
  if(!b) return;
  b.addEventListener('click',function(){
    var done=function(){ b.textContent='Copied'; setTimeout(function(){ b.textContent='Copy'; },1600); };
    var fallback=function(){ var r=document.createRange(); r.selectNodeContents(t); var s=getSelection(); s.removeAllRanges(); s.addRange(r); b.textContent='Selected'; setTimeout(function(){ b.textContent='Copy'; },1600); };
    try{ navigator.clipboard.writeText(t.textContent).then(done,fallback); }catch(e){ fallback(); }
  });
})();

/* ---------- Terminal ---------- */
(function(){
  var body=document.getElementById('termBody'), replay=document.getElementById('replay');
  if(!body) return;
  var script=[
    {c:'whoami'},
    {o:"dpgsa · Data Privacy & Governance Students' Association, University of Nairobi"},
    {c:'cat mission.txt'},
    {o:'To nurture the next generation of practitioners and experts in technology and innovation law.'},
    {c:'ls focus-areas/'},
    {o:'digital-rights/  cybercrime/  internet-governance/  law-and-tech/',k:'path'},
    {c:'grep -n "data subject" kenya/data-protection-act-2019.txt'},
    {o:'s.26: Rights of a data subject'},
    {o:'# be informed, access, object, correct, delete',k:'dim'},
    {c:'./register --member'},
    {o:'✓ Membership registration is open: KES 200 via M-Pesa',k:'ok'}
  ];
  var run=0;
  var esc=function(s){return s.replace(/[&<>]/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;'}[m];});};
  function hl(cmd){
    var first=true;
    return cmd.split(/("[^"]*"?|\s+)/).filter(Boolean).map(function(tok){
      if(/^\s+$/.test(tok)) return tok;
      var cls;
      if(first){cls='t-cmd';first=false;}
      else if(tok[0]==='"') cls='t-str';
      else if(tok[0]==='-') cls='t-flag';
      else if(/[\/.]/.test(tok)) cls='t-path';
      return cls?'<span class="'+cls+'">'+esc(tok)+'</span>':esc(tok);
    }).join('');
  }
  var PROMPT='<span class="prompt">dpgsa<b>@uon</b>:~$ </span>';
  function line(html){ var s=document.createElement('span'); s.className='ln'; s.innerHTML=html; body.appendChild(s); body.scrollTop=body.scrollHeight; return s; }
  function wait(ms){ return new Promise(function(r){ setTimeout(r,ms); }); }
  function renderAll(){
    body.innerHTML='';
    script.forEach(function(s){ s.c?line(PROMPT+hl(s.c)):line('<span class="out '+(s.k||'')+'">'+esc(s.o)+'</span>'); });
    line(PROMPT+'<span class="caret"></span>');
  }
  async function play(){
    var id=++run; body.innerHTML='';
    for(var i=0;i<script.length;i++){
      var s=script[i];
      if(s.c){
        var l=line(PROMPT+'<span class="caret"></span>');
        await wait(i===0?250:420); if(id!==run) return;
        for(var j=1;j<=s.c.length;j++){
          l.innerHTML=PROMPT+hl(s.c.slice(0,j))+'<span class="caret"></span>';
          await wait(22+Math.random()*38); if(id!==run) return;
        }
        l.innerHTML=PROMPT+hl(s.c);
        await wait(180); if(id!==run) return;
      } else {
        line('<span class="out '+(s.k||'')+'">'+esc(s.o)+'</span>');
        await wait(90); if(id!==run) return;
      }
    }
    line(PROMPT+'<span class="caret"></span>');
  }
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduce){ renderAll(); } else { play(); }
  replay.addEventListener('click',function(){ reduce?renderAll():play(); });
})();
