(() => {
 'use strict';
 const tests=window.diagnosticTests, app=document.getElementById('app');
 const VERSION='fipi-2026-v1', memory=new Map();
 let storageAvailable=true, pendingRestart=false;
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const paths={clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',check:'<path d="m5 12 4 4L19 6"/>',list:'<rect x="5" y="3" width="14" height="18" rx="3"/><path d="M9 8h6M9 12h6M9 16h4"/>',code:'<path d="m8 6-6 6 6 6m8-12 6 6-6 6M14 3l-4 18"/>',flask:'<path d="M9 3h6M10 3v7L4 20q-1 1 1 1h14q2 0 1-1l-6-10V3M7 15h10"/>',math:'<path d="M3 18h18M6 3v15m1-3 5-7 4 4 5-8M13 3h5M15.5 1v4"/>',book:'<path d="M12 5v16M3 4q5-2 9 1 4-3 9-1v15q-5-2-9 1-4-3-9-1Z"/>',save:'<path d="M5 3h12l4 4v14H3V3Zm2 0v6h10V3M7 21v-8h10v8"/>',lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>'};
 const icon=name=>`<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">${paths[name]||paths.list}</svg>`;
 const key=id=>`xexarxo.diagnostic.${tests[id].version||VERSION}.${id}`;
 function read(id){
  if(memory.has(id)) return memory.get(id);
  const empty={answers:Array(tests[id].tasks.length).fill(''),index:0,started:false,completed:false};
  try{
   const raw=JSON.parse(localStorage.getItem(key(id))||'null');
   if(raw&&Array.isArray(raw.answers)&&raw.answers.length===empty.answers.length){
    empty.answers=raw.answers.map(a=>typeof a==='string'?a.slice(0,64):'');
    empty.index=Number.isInteger(raw.index)?Math.max(0,Math.min(7,raw.index)):0;
    empty.started=raw.started===true;empty.completed=raw.completed===true;
   }
  }catch{storageAvailable=false;}
  memory.set(id,empty);return empty;
 }
 function save(id){try{localStorage.setItem(key(id),JSON.stringify(read(id)));}catch{storageAvailable=false;}}
 function normalized(v){return String(v).trim().toUpperCase().replace(/\s/g,'').replace(/−/g,'-').replace(/,/g,'.');}
 function correct(task,answer){
  const value=normalized(answer);if(!value)return false;
  if(task.kind==='algorithm'){
   if(!/^[12]{1,5}$/.test(value))return false;
   return [...value].reduce((n,c)=>c==='1'?n*n:n+1,3)===84;
  }
  if(task.kind==='set')return [...value].sort().join('')===[...task.answer].sort().join('');
  if(task.kind==='text')return (task.answers||[task.answer]).some(a=>value===normalized(a));
  return /^-?\d+(?:\.\d+)?$/.test(value)&&Number(value)===Number(task.answer);
 }
 function score(id){const s=read(id);return tests[id].tasks.reduce((n,t,i)=>n+Number(correct(t,s.answers[i])),0);}
 function go(path){pendingRestart=false;location.hash=path;}
 const answered=s=>s.answers.filter(a=>a.trim()).length;
 const source=t=>`<a href="${t.source}" target="_blank" rel="noopener">ФИПИ · ${t.exam} ${t.year||2026}</a>`;
 const bread=title=>`<div class="breadcrumb"><a href="/xexarxo/">Главная</a><span>/</span>${title?'<a href="#/">Диагностика</a><span>/</span><span>'+esc(title)+'</span>':'<span>Диагностика</span>'}</div>`;
 function catalog(){
  document.title='Диагностика знаний — XEXARXO';
  return `${bread()}<section class="hero"><div><span class="eyebrow">Точка старта</span><h1>Большой результат<br>начинается с <em>понимания.</em></h1><p class="lead">Узнайте, какие темы уже даются уверенно, а к каким стоит вернуться. Выберите предмет и сделайте первый шаг к подготовке.</p><div class="hero-meta"><span>${icon('clock')}20–30 минут</span><span>${icon('list')}8 заданий</span><span>${icon('check')}Результат сразу</span></div></div><aside class="hero-note"><div class="note-icon">${icon('book')}</div><h2>Знакомый формат экзамена</h2><p>Официальные задания ФИПИ 2026–2027 годов. В конце — ваши ответы и темы для повторения.</p></aside></section><section aria-labelledby="choose-title"><div class="section-heading"><h2 id="choose-title">Выберите свой предмет</h2><span class="small-label">Бесплатно</span></div><div class="test-grid">${Object.entries(tests).map(([id,t])=>{
   const s=read(id);return `<article class="test-card ${t.color}"><div class="card-art">${icon(t.symbol)}<span class="exam-label">${t.exam} · ${t.year||2026}</span></div><div class="card-body"><h3>${t.title}</h3><p>${t.description}</p><div class="card-meta"><span>${icon('list')}8 заданий</span><span>${icon('clock')}до ${t.minutes} мин</span></div><div class="teacher-mini"><img src="assets/${t.photo}" alt="" width="38" height="38"><div>${t.teacher}<small>Преподаватель школы</small></div></div><a class="btn primary block" href="#/${id}">${s.completed?'Посмотреть результат':s.started?'Продолжить диагностику':'Пройти диагностику'}</a>${s.started?`<div class="saved-hint">${s.completed?`Результат: ${score(id)} из 8`:`Прогресс сохранён · ответов ${answered(s)} из 8`}</div>`:''}</div></article>`;
  }).join('')}</div><div class="coming"><div><strong>Семь предметов — один удобный формат</strong><p>Выбирайте диагностику, решайте задания и смотрите темы для повторения.</p></div><a href="/xexarxo/predmety" aria-label="Посмотреть все предметы школы">${icon('book')}</a></div></section><section class="page-section fipi-materials"><h2>Официальные материалы ОГЭ 2027</h2><p>Полные комплекты ФИПИ для скачивания: демонстрационные варианты, спецификации и кодификаторы. Это материалы для самостоятельной работы, без автоматической проверки ответов.</p><div class="fipi-grid"><article><h3>Русский язык</h3><a class="btn primary" href="#/russkiy">Пройти диагностику</a><a class="btn secondary" href="assets/fipi-2027/russkiy.zip" download>Скачать комплект ZIP</a></article><article><h3>Математика</h3><a class="btn primary" href="#/matematika">Пройти диагностику</a><a class="btn secondary" href="assets/fipi-2027/matematika.zip" download>Скачать комплект ZIP</a></article><article><h3>Физика</h3><a class="btn primary" href="#/fizika">Пройти диагностику</a><a class="btn secondary" href="assets/fipi-2027/fizika.zip" download>Скачать комплект ZIP</a></article><article><h3>Химия</h3><a class="btn primary" href="#/khimiya">Пройти диагностику</a><a class="btn secondary" href="assets/fipi-2027/khimiya.zip" download>Скачать комплект ZIP</a></article><article><h3>Информатика</h3><a class="btn primary" href="#/informatika">Пройти диагностику</a><a class="btn secondary" href="https://doc.fipi.ru/oge/demoversii-specifikacii-kodifikatory/2027/inf_9_2027.zip" download>Скачать комплект ZIP</a></article><article><h3>Биология</h3><a class="btn primary" href="#/biologiya">Пройти диагностику</a><a class="btn secondary" href="assets/fipi-2027/biologiya.zip" download>Скачать комплект ZIP</a></article><article><h3>Обществознание</h3><a class="btn primary" href="#/obshchestvoznanie">Пройти диагностику</a><a class="btn secondary" href="assets/fipi-2027/obshchestvoznanie.zip" download>Скачать комплект ZIP</a></article></div><p>По чеченскому языку отдельного комплекта ОГЭ ФИПИ нет. Материалы этого направления предоставит школа.</p><p><a class="btn secondary" href="https://fipi.ru/oge/demoversii-specifikacii-kodifikatory" target="_blank" rel="noopener">Источник — ФИПИ</a></p></section><section class="how"><h2>Всё просто и спокойно</h2><div class="how-grid"><article>${icon('list')}<h3>Решайте в своём темпе</h3><p>Переходите между заданиями. Если пока не знаете ответ, вопрос можно пропустить.</p></article><article>${icon('check')}<h3>Посмотрите результат</h3><p>Получите баллы за верные ответы и список тем, которые стоит повторить.</p></article><article>${icon('book')}<h3>Выберите следующий шаг</h3><p>Обсудите подготовку с преподавателем на пробном занятии.</p></article></div><p class="source-line">Источник заданий: <a href="https://fipi.ru/oge/demoversii-specifikacii-kodifikatory" target="_blank" rel="noopener">демоверсии ОГЭ ФИПИ 2026–2027 годов</a>. Диагностики ЕГЭ появятся позже. Короткая диагностика показывает результат этой подборки; балл экзамена по ней не прогнозируется.</p></section>`;
 }
 function intro(id){
  const t=tests[id],s=read(id);document.title=`${t.title} · Диагностика — XEXARXO`;
  return `${bread(t.title)}<section class="intro-panel ${t.color}"><div class="intro-main"><span class="eyebrow">Диагностика · ${t.exam} ${t.year||2026}</span><h1>${t.title}</h1><p class="lead">${t.description} Восемь официальных заданий помогут понять, с чего начать подготовку.</p><div class="hero-meta"><span>${icon('list')}8 заданий</span><span>${icon('clock')}до ${t.minutes} минут</span></div><p>Приготовьте бумагу и ручку. Вводите ответы самостоятельно — так результат будет полезнее.</p>${t.exam==='ОГЭ'?'<p class="small-label" style="margin-top:15px">Задания этой диагностики соответствуют уровню ОГЭ.</p>':''}${id==='khimiya'?'<p style="margin-top:15px">Можно пользоваться периодической системой и таблицей растворимости.</p>':''}<div class="intro-actions">${s.completed?`<a class="btn primary" href="#/${id}/result">Посмотреть результат</a><button class="btn secondary" data-action="restart">Пройти ещё раз</button>`:`<button class="btn primary" data-action="start">${s.started?'Продолжить':'Начать диагностику'}</button>${s.started?'<button class="btn secondary" data-action="restart">Начать заново</button>':''}`}</div><div id="restart-panel"></div><div class="intro-links">${source(t)}<a href="assets/diagnostics/${t.pdf}" target="_blank" rel="noopener">Скачать задания в PDF</a></div></div><aside class="intro-side">${icon(t.symbol)}<h2>Что вас ждёт</h2><ul><li>Короткие ответы без регистрации</li><li>Свободный переход между вопросами</li><li>Верные ответы после завершения</li><li>Темы для дальнейшей подготовки</li></ul><div class="teacher-mini"><img src="assets/${t.photo}" alt="" width="38" height="38"><div>${t.teacher}<small>Преподаватель школы</small></div></div><p class="small-label">${s.started?`Ответов сохранено: ${answered(s)} из 8.`:'Таймер не ограничивает прохождение.'}</p></aside></section>`;
 }
 function original(id,index){return `<details class="original"><summary>Оригинал задания ФИПИ</summary><img src="assets/diagnostics/${id}-${index+1}.png" alt="Оригинальное условие задания ${tests[id].tasks[index].number} из демоверсии ФИПИ ${tests[id].year||2026} года" loading="lazy"><p>© ${tests[id].year||2026} Федеральная служба по надзору в сфере образования и науки</p></details>`;}
 function quiz(id,index){
  const t=tests[id],s=read(id),q=t.tasks[index];s.started=true;s.index=index;save(id);
  document.title=`Задание ${index+1} · ${t.title} — XEXARXO`;
  return `${bread(t.title)}<div class="quiz-top"><div><h1>${t.title}</h1><p>${t.exam} · официальные задания ФИПИ ${t.year||2026}</p></div><a class="btn secondary" href="#/">Выйти и сохранить</a></div><div class="quiz-layout"><div><div class="progress-wrap"><div class="progress-label"><span>Задание ${index+1} из 8</span><span id="answered-count">Ответов: ${answered(s)} из 8</span></div><progress value="${answered(s)}" max="8" aria-label="Количество заполненных ответов"></progress></div><article class="question-card"><div class="question-label"><span>${t.exam} · № ${esc(q.number)}</span><span>ФИПИ ${t.year||2026}</span></div><h2>${q.topic}</h2><div class="task-content">${q.html}</div>${original(id,index)}<form id="answer-form" class="answer-form"><label for="answer">Ваш ответ</label><input id="answer" class="answer-input" name="answer" value="${esc(s.answers[index])}" inputmode="${q.kind==='text'?'text':'decimal'}" autocomplete="off" spellcheck="false" maxlength="64" aria-describedby="answer-help"><p class="answer-help" id="answer-help">${q.hint||'Введите ответ без единиц измерения. Цифры в последовательности пишите подряд.'}${id==='matematika'?' Десятичную дробь можно записать через запятую или точку.':''}</p><div class="question-actions"><button type="button" class="btn secondary" data-action="previous" ${index===0?'disabled':''}>Назад</button><button type="button" class="btn quiet" data-action="skip">Не знаю, пропустить</button><button class="btn primary" type="submit">${index===7?'К завершению':'Дальше'}</button></div></form></article><p class="save-notice" id="save-notice">${storageAvailable?'Ответы сохраняются в этом браузере. Можно вернуться к диагностике позже.':'В этом браузере сохранение недоступно. Ответы сохранятся до обновления страницы.'}</p></div><aside class="side-panel"><h2>Ваши задания</h2><div class="number-grid" aria-label="Навигация по заданиям">${t.tasks.map((_,i)=>`<button data-question="${i}" class="${i===index?'active':s.answers[i].trim()?'answered':''}" ${i===index?'aria-current="step"':''} aria-label="Задание ${i+1}${s.answers[i].trim()?', ответ сохранён':''}">${i+1}</button>`).join('')}</div><p class="legend">Голубым отмечены задания с ответом.</p><button class="btn secondary block" data-action="finish">Завершить диагностику</button><div class="side-divider"><p>${icon('clock')} Ориентир — до ${t.minutes} минут. Решайте в удобном темпе.</p><p>Можно менять ответы до завершения.</p><p>${source(t)}</p></div></aside></div>`;
 }
 function finish(id){
  const s=read(id),n=answered(s);document.title='Завершение диагностики — XEXARXO';
  return `${bread(tests[id].title)}<section class="finish-panel"><span class="eyebrow">Последний шаг</span><h1 style="font-size:38px">Посмотрим результат?</h1><p>Вы ответили на ${n} из 8 заданий.${n<8?` Осталось без ответа: ${8-n}. Пропущенные задания принесут 0 баллов.`:' Все ответы заполнены.'}</p><p>Перед завершением можно вернуться и проверить решения.</p><div class="intro-actions"><button class="btn primary" data-action="submit-test">Завершить и посмотреть результат</button><a class="btn secondary" href="#/${id}/test/${s.index+1}">Вернуться к заданиям</a></div></section>`;
 }
 function result(id){
  const t=tests[id],s=read(id),points=score(id),n=answered(s),missed=t.tasks.filter((q,i)=>!correct(q,s.answers[i]));
  document.title=`Результат · ${t.title} — XEXARXO`;
  return `${bread(t.title)}<section class="result-hero"><div class="score-ring" style="--score:${points/8*100}%"><div><strong>${points} / 8</strong><span>верных ответов</span></div></div><div><span class="eyebrow">Ваш результат</span><h1>Первый шаг сделан.</h1><p>${points===8?'Все задания этой подборки решены верно. Можно двигаться к более сложным темам.':'Теперь понятнее, на какие темы обратить внимание в подготовке. Ниже можно проверить каждый ответ.'}</p><div class="result-summary"><span>Верно: ${points}</span><span>Ошибок: ${n-points}</span><span>Пропущено: ${8-n}</span></div></div></section>${missed.length?`<section class="result-section"><h2>К этим темам стоит вернуться</h2><div class="topics">${missed.map(q=>`<span>${q.topic}</span>`).join('')}</div></section>`:''}<section class="result-section"><h2>Разбор ваших ответов</h2>${t.tasks.map((q,i)=>{const ok=correct(q,s.answers[i]);return `<details class="review-row"><summary><span>${i+1}. ${q.topic}</span><span class="review-status ${ok?'':'wrong'}">${ok?'Верно':s.answers[i].trim()?'Есть ошибка':'Пропущено'}</span></summary><div class="review-body"><div class="answer-comparison"><div>Ваш ответ<strong>${esc(s.answers[i]||'Не указан')}</strong></div><div>Верный ответ<strong>${esc(q.answer.replace('.',','))}</strong></div></div><div class="task-content">${q.html}</div>${original(id,i)}${q.kind==='algorithm'?'<p class="small-label">Принимается любой алгоритм из команд 1 и 2 длиной до пяти команд, преобразующий 3 в 84.</p>':''}</div></details>`;}).join('')}</section><section class="next-step"><div><h2>Дальше — вместе с преподавателем</h2><p>На пробном занятии можно обсудить сложные темы и подобрать программу подготовки.</p></div><a class="btn" href="/xexarxo/zapis?predmet=${encodeURIComponent(id==='matematika'?'Математика':t.title)}">Записаться на пробное</a></section><div class="result-bottom"><a href="#/">Другие диагностики</a><a href="#/${id}">Пройти ещё раз</a><a href="assets/diagnostics/${t.pdf}" target="_blank" rel="noopener">Скачать задания</a></div><p class="source-line">Один верный ответ — один балл. Результат относится к этой подборке и не переводится в баллы экзамена. Источник: ${source(t)}.</p>`;
 }
 function wire(id,mode,index){
  app.querySelectorAll('[data-question]').forEach(b=>b.onclick=()=>go(`/${id}/test/${Number(b.dataset.question)+1}`));
  const answer=document.getElementById('answer');
  if(answer)answer.addEventListener('input',()=>{
   read(id).answers[index]=answer.value;save(id);
   const n=answered(read(id));document.getElementById('answered-count').textContent=`Ответов: ${n} из 8`;app.querySelector('progress').value=n;
   app.querySelectorAll('[data-question]').forEach(b=>{const i=Number(b.dataset.question);b.classList.toggle('answered',i!==index&&!!read(id).answers[i].trim());b.setAttribute('aria-label',`Задание ${i+1}${read(id).answers[i].trim()?', ответ сохранён':''}`);});
   if(!storageAvailable)document.getElementById('save-notice').textContent='В этом браузере сохранение недоступно. Ответы сохранятся до обновления страницы.';
  });
  document.getElementById('answer-form')?.addEventListener('submit',e=>{e.preventDefault();go(index===7?`/${id}/finish`:`/${id}/test/${index+2}`);});
  app.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>{
   const action=b.dataset.action;
   if(action==='start'){read(id).started=true;save(id);go(`/${id}/test/${read(id).index+1}`);}
   if(action==='previous')go(`/${id}/test/${index}`);
   if(action==='skip'){read(id).answers[index]='';save(id);go(index===7?`/${id}/finish`:`/${id}/test/${index+2}`);}
   if(action==='finish')go(`/${id}/finish`);
   if(action==='submit-test'){read(id).completed=true;save(id);go(`/${id}/result`);}
   if(action==='restart'){
    if(pendingRestart)return;pendingRestart=true;
    document.getElementById('restart-panel').innerHTML='<div class="finish-panel"><h2>Начать заново?</h2><p>Предыдущие ответы и результат по этому предмету будут удалены.</p><div class="intro-actions"><button class="btn primary" id="confirm-restart">Начать заново</button><button class="btn secondary" id="cancel-restart">Отмена</button></div></div>';
    document.getElementById('confirm-restart').onclick=()=>{memory.delete(id);try{localStorage.removeItem(key(id));}catch{}read(id).started=true;save(id);go(`/${id}/test/1`);};
    document.getElementById('cancel-restart').onclick=()=>{pendingRestart=false;document.getElementById('restart-panel').innerHTML='';};
    document.getElementById('confirm-restart').focus();
   }
  });
  app.querySelectorAll('.task-figure img,.original img').forEach(img=>{
   img.tabIndex=0;img.setAttribute('role','button');img.setAttribute('aria-label','Увеличить рисунок: '+img.alt);
   const open=()=>{const d=document.getElementById('image-dialog');d.querySelector('img').src=img.src;d.querySelector('img').alt=img.alt;d.showModal();};
   img.onclick=open;img.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();open();}};
  });
 }
 function render(){
  const [id,mode,param]=location.hash.replace(/^#\/?/,'').split('/');
  const robots=document.querySelector('meta[name=robots]');if(robots)robots.content=id?'noindex,follow':'index,follow';
  let html;
  if(!id)html=catalog();
  else if(!tests[id]){html=`${bread()}<section class="finish-panel"><h1>Диагностика пока недоступна</h1><p>Выберите один из доступных предметов.</p><a class="btn primary" href="#/">Выбрать предмет</a></section>`;}
  else{
   const s=read(id);
   if(mode==='test'){
    if(s.completed){location.replace(`#/${id}/result`);return;}
    const index=Math.min(7,Math.max(0,(Number(param)||1)-1));
    html=quiz(id,Math.floor(index));
   }else if(mode==='finish'&&s.started&&!s.completed)html=finish(id);
   else if(mode==='result'&&s.completed)html=result(id);
   else html=intro(id);
  }
  app.innerHTML=html;wire(id,mode,readSafeIndex(id));window.scrollTo(0,0);app.focus({preventScroll:true});
 }
 function readSafeIndex(id){return tests[id]?read(id).index:0;}
 document.querySelector('.skip-link').onclick=e=>{e.preventDefault();app.focus();};
 document.getElementById('close-image').onclick=()=>document.getElementById('image-dialog').close();
 window.addEventListener('hashchange',render);render();
 // Exposed pure helpers support regression checks without starting a browser.
 window.XexarxoDiagnostics={correct,normalized,version:VERSION};
})();
