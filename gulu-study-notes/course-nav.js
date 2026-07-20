(function(){
  'use strict';
  const parts=location.pathname.split('/').filter(Boolean);
  const currentPath=decodeURIComponent(parts.slice(-2).join('/'));

  if(window.self!==window.top){
    window.parent.postMessage({type:'gulu:course-loaded',path:currentPath},'*');
    return;
  }

  const rootUrl=new URL('../',location.href);
  const homeUrl=new URL('index.html',rootUrl);
  const style=document.createElement('style');
  style.textContent=`
    :root{--gulu-nav-w:min(380px,90vw)}
    .gulu-nav-tab{position:fixed;left:0;top:46%;z-index:2147483600;display:flex;flex-direction:column;gap:2px;padding:10px 7px;border:1px solid rgba(112,240,189,.34);border-left:0;border-radius:0 10px 10px 0;background:rgba(10,16,23,.9);color:#70f0bd;font:700 12px/1.15 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;letter-spacing:.08em;box-shadow:0 10px 34px rgba(0,0,0,.3);backdrop-filter:blur(14px);cursor:pointer;writing-mode:vertical-rl;transition:background .2s,transform .2s}
    .gulu-nav-tab:hover{background:#15232b;transform:translateX(2px)}
    .gulu-nav-backdrop{position:fixed;inset:0;z-index:2147483601;background:rgba(0,0,0,.54);opacity:0;pointer-events:none;transition:opacity .22s;backdrop-filter:blur(2px)}
    .gulu-nav-drawer{position:fixed;inset:0 auto 0 0;z-index:2147483602;width:var(--gulu-nav-w);display:flex;flex-direction:column;background:#0b1219;color:#dce7e5;border-right:1px solid #263943;box-shadow:18px 0 60px rgba(0,0,0,.42);transform:translateX(-103%);transition:transform .25s cubic-bezier(.2,.8,.2,1);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC",sans-serif;text-align:left}
    .gulu-nav-open .gulu-nav-backdrop{opacity:1;pointer-events:auto}.gulu-nav-open .gulu-nav-drawer{transform:none}
    .gulu-nav-head{padding:20px 18px 15px;border-bottom:1px solid #1c2b33;background:linear-gradient(145deg,rgba(112,240,189,.07),transparent 55%)}
    .gulu-nav-title{display:flex;align-items:center;justify-content:space-between;gap:10px}.gulu-nav-title a{color:#f2f7f5!important;text-decoration:none!important;font-weight:800;font-size:17px}.gulu-nav-close{border:1px solid #2b3c45;border-radius:8px;background:#111d25;color:#94a7a8;width:31px;height:31px;cursor:pointer;font-size:18px}.gulu-nav-sub{margin:5px 0 13px;color:#708486;font-size:11px;letter-spacing:.08em}.gulu-nav-home{display:flex;align-items:center;justify-content:center;gap:7px;border:1px solid rgba(112,240,189,.32);border-radius:8px;background:rgba(112,240,189,.08);color:#70f0bd!important;text-decoration:none!important;padding:8px 10px;font-size:12px;font-weight:700}.gulu-nav-search{box-sizing:border-box;width:100%;margin-top:10px;border:1px solid #263943;border-radius:8px;background:#080e13;color:#dce7e5;padding:9px 11px;outline:none;font-size:12px}.gulu-nav-search:focus{border-color:#70f0bd}
    .gulu-nav-list{overflow:auto;overscroll-behavior:contain;padding:10px 0 30px;scrollbar-color:#29404a transparent}.gulu-nav-group{padding:10px 0 12px}.gulu-nav-group+.gulu-nav-group{border-top:1px solid rgba(255,255,255,.055)}.gulu-nav-group-title{padding:0 18px 8px;color:#ffc95c;font-size:11px;font-weight:800;letter-spacing:.06em}.gulu-nav-section{margin-bottom:5px}.gulu-nav-section-title{padding:7px 18px 5px;color:#8ea2a3;font-size:11px;font-weight:700}.gulu-nav-link{display:block;padding:7px 18px 7px 31px;border-left:2px solid transparent;color:#b9c7c6!important;text-decoration:none!important;font-size:12px;line-height:1.35;transition:.15s}.gulu-nav-link:hover{color:#fff!important;background:#101d24}.gulu-nav-link.active{border-left-color:#70f0bd;background:rgba(112,240,189,.09);color:#70f0bd!important;font-weight:700}.gulu-nav-empty{padding:25px 18px;color:#738687;font-size:12px}
    @media(max-width:680px){.gulu-nav-tab{top:auto;bottom:22px;writing-mode:horizontal-tb;padding:9px 12px}.gulu-nav-drawer{width:min(92vw,380px)}}
    @media(prefers-reduced-motion:reduce){.gulu-nav-tab,.gulu-nav-backdrop,.gulu-nav-drawer{transition:none!important}}
  `;
  document.head.appendChild(style);

  const tab=document.createElement('button');
  tab.className='gulu-nav-tab';tab.type='button';tab.textContent='全局目录';tab.setAttribute('aria-label','打开全局课程目录');
  const backdrop=document.createElement('div');backdrop.className='gulu-nav-backdrop';
  const drawer=document.createElement('aside');drawer.className='gulu-nav-drawer';drawer.setAttribute('aria-label','全局课程目录');
  drawer.innerHTML=`<div class="gulu-nav-head"><div class="gulu-nav-title"><a href="${homeUrl.href}">咕噜的学习笔记</a><button class="gulu-nav-close" type="button" aria-label="关闭目录">×</button></div><div class="gulu-nav-sub">SYSTEMS · INFERENCE · KERNELS</div><a class="gulu-nav-home" href="${homeUrl.href}">⌂ 回到主目录</a><input class="gulu-nav-search" type="search" placeholder="搜索 103 篇文章…" aria-label="搜索文章"></div><nav class="gulu-nav-list"></nav>`;
  document.body.append(tab,backdrop,drawer);

  const list=drawer.querySelector('.gulu-nav-list');
  const search=drawer.querySelector('.gulu-nav-search');
  let data=null;
  const close=()=>{document.documentElement.classList.remove('gulu-nav-open');tab.focus()};
  const open=()=>{document.documentElement.classList.add('gulu-nav-open');setTimeout(()=>search.focus(),180)};
  tab.onclick=open;backdrop.onclick=close;drawer.querySelector('.gulu-nav-close').onclick=close;
  document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});

  function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function render(query=''){
    if(!data)return;
    const q=query.trim().toLowerCase();
    const sections=new Map(data.sections.map(s=>[s.id,s]));
    const groups=data.groups?.length?data.groups:[{title:'全部课程',sections:data.sections.map(s=>s.id)}];
    let html='',count=0;
    groups.forEach(group=>{
      let body='';
      group.sections.map(id=>sections.get(id)).filter(Boolean).forEach(section=>{
        const courses=section.courses.filter(c=>!q||c.title.toLowerCase().includes(q)||(c.tags||[]).some(t=>t.toLowerCase().includes(q)));
        if(!courses.length)return;
        count+=courses.length;
        body+=`<div class="gulu-nav-section"><div class="gulu-nav-section-title">${escapeHtml(section.title)}</div>${courses.map(c=>`<a class="gulu-nav-link${c.path===currentPath?' active':''}" data-path="${escapeHtml(c.path)}" href="${new URL('index.html#course='+encodeURIComponent(c.id),rootUrl).href}">${escapeHtml(c.title)}</a>`).join('')}</div>`;
      });
      if(body)html+=`<section class="gulu-nav-group"><div class="gulu-nav-group-title">${escapeHtml(group.title)}</div>${body}</section>`;
    });
    list.innerHTML=count?html:'<div class="gulu-nav-empty">没有找到匹配文章</div>';
    if(!q)requestAnimationFrame(()=>list.querySelector('.active')?.scrollIntoView({block:'center'}));
  }
  search.oninput=()=>render(search.value);
  fetch(new URL('courses.json',rootUrl)).then(r=>{if(!r.ok)throw Error(r.status);return r.json()}).then(json=>{data=json;const current=data.sections.flatMap(s=>s.courses).find(c=>c.path===currentPath);if(current){const href=new URL('index.html#course='+encodeURIComponent(current.id),rootUrl).href;drawer.querySelector('.gulu-nav-home').href=href}render()}).catch(()=>{list.innerHTML='<div class="gulu-nav-empty">目录数据加载失败，但仍可通过上方按钮回到主目录。</div>'});
  if(new URLSearchParams(location.search).get('nav')==='open')open();
})();
