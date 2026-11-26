(() => {
 const menu=document.getElementById('school-nav'),toggle=document.querySelector('.menu-toggle');
 if(!menu||!toggle)return;
 const close=()=>{menu.classList.remove('open');toggle.setAttribute('aria-expanded','false');menu.querySelectorAll('details').forEach(d=>d.open=false);};
 toggle.addEventListener('click',()=>{const open=toggle.getAttribute('aria-expanded')!=='true';menu.classList.toggle('open',open);toggle.setAttribute('aria-expanded',String(open));});
 document.addEventListener('keydown',e=>{if(e.key==='Escape'){close();toggle.focus();}});
 document.addEventListener('click',e=>{if(!e.target.closest('.school-header'))close();});
 menu.querySelectorAll('a').forEach(a=>a.addEventListener('click',close));
})();
