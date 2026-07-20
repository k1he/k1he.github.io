(()=>{
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)e.target.classList.add('visible')}),{threshold:.08});
  document.querySelectorAll('h2,.card,.lab,.course').forEach(e=>{e.classList.add('reveal');io.observe(e)});
  window.mc={
    playPipeline(rootId,noteId,notes,interval=900){
      const root=document.getElementById(rootId),note=document.getElementById(noteId);if(!root)return null;
      let i=0,t=null,nodes=[...root.querySelectorAll('.node')];
      const paint=()=>{nodes.forEach((n,j)=>{n.classList.toggle('active',j===i);n.classList.toggle('done',j<i)});if(note)note.innerHTML=notes[i]||''};paint();
      return {next(){i=(i+1)%nodes.length;paint()},toggle(btn){if(t){clearInterval(t);t=null;btn.textContent='▶ 播放'}else{btn.textContent='Ⅱ 暂停';t=setInterval(()=>{i=(i+1)%nodes.length;paint()},interval)}},reset(){i=0;paint()}};
    },
    bindRange(id,fn){const e=document.getElementById(id);if(e){e.addEventListener('input',fn);fn()}},
    clamp:(x,a,b)=>Math.max(a,Math.min(b,x)),
    fmtBytes(n){if(n>=1e9)return(n/1e9).toFixed(1)+' GB';if(n>=1e6)return(n/1e6).toFixed(1)+' MB';return(n/1e3).toFixed(1)+' KB'}
  };
})();
