(() => {
 'use strict';
 const id=Number(window.XexarxoConfig?.metricaId);
 if(!Number.isSafeInteger(id)||id<=0)return;
 let active=false;
 const preference='xexarxo.analytics-consent.v1';
 function enable(){
  if(active)return;active=true;
  window.ym=window.ym||function(){(window.ym.a=window.ym.a||[]).push(arguments);};window.ym.l=Date.now();
  const tag=document.createElement('script');tag.async=true;tag.src='https://mc.yandex.ru/metrika/tag.js';document.head.append(tag);
  window.ym(id,'init',{clickmap:true,trackLinks:false,accurateTrackBounce:true,webvisor:true});
 }
 const goal=name=>{if(active)window.ym(id,'reachGoal',name);};
 document.addEventListener('xexarxo:message-prepared',()=>goal('message_prepared'));
 document.addEventListener('click',e=>{const a=e.target.closest('a');if(!a)return;const href=a.getAttribute('href')||'';if(href.startsWith('https://wa.me/'))goal(a.closest('#form-feedback')?'whatsapp_request_click':'whatsapp_click');else if(href.startsWith('tel:'))goal('phone_click');else if(href.startsWith('mailto:'))goal('email_click');});
 let saved;try{saved=localStorage.getItem(preference);}catch{}
 if(saved==='yes'){enable();return;}if(saved==='no')return;
 const box=document.createElement('aside');box.className='analytics-consent';box.setAttribute('aria-label','Настройки аналитики');
 box.innerHTML='<p>Разрешить аналитику? Яндекс Метрика использует cookie, чтобы помочь нам улучшать сайт. <a href="/xexarxo/politika/">Политика обработки данных</a></p><div><button type="button" class="btn secondary" data-consent="no">Без аналитики</button><button type="button" class="btn primary" data-consent="yes">Разрешить</button></div>';
 box.addEventListener('click',e=>{const choice=e.target.closest('[data-consent]')?.dataset.consent;if(!choice)return;try{localStorage.setItem(preference,choice);}catch{}if(choice==='yes')enable();box.remove();});document.body.append(box);
})();
