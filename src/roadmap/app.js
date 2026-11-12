'use strict';
// All content is local. Only explicitly clicked reference links access external sites.
const KEY='pathways-careers-v2';
const LEGACY_KEY='pathways-cs-roadmap-v1';
const app=document.getElementById('app');
const toast=document.getElementById('toast');
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const trackBy=id=>TRACKS.find(t=>t.id===id)||TRACKS[0];
const roleBy=id=>ROLES.find(r=>r.id===id);
const rolesFor=id=>ROLES.filter(r=>r.track===id);
const entryLabels={start:'신입·인턴 경로 탐색',experience:'관련 경험·책임 범위 확인',research:'학위·연구 요건 개별 확인'};
const kindLabels={plan:'기획·분석·설계',build:'구현·운영·검증',research:'연구·실험'};
let timer,storageOK=true;
let progress={completed:{},checks:{},notes:{}};
let career={targets:{},favorites:[],compare:[],lastTrack:'product'};
const state={view:'map',track:'product',role:null,selected:0,query:'',kind:'all',field:'all',interest:'all',sub:'all',caseSteps:{}};
function object(v){return !!v&&typeof v==='object'&&!Array.isArray(v)}
function cleanProgress(p){
 const out={completed:{},checks:{},notes:{}};if(!object(p))return out;
 for(const group of ['completed','checks','notes']){
  if(!object(p[group]))continue;
  for(const [key,val] of Object.entries(p[group])){
   if(!/^(common|role:[a-z0-9-]+|[a-z0-9-]+):[a-z0-9-]+$/.test(key))continue;
   if(group==='completed'&&typeof val==='boolean')out[group][key]=val;
   if(group==='notes'&&typeof val==='string')out[group][key]=val.slice(0,20000);
   if(group==='checks'&&object(val)){out[group][key]={};for(const [k,v] of Object.entries(val))if(/^\d{1,2}$/.test(k)&&typeof v==='boolean')out[group][key][k]=v;}
  }
 }
 return out;
}
function cleanCareer(c){
 const out={targets:{},favorites:[],compare:[],lastTrack:'product'};if(!object(c))return out;
 if(object(c.targets))for(const [track,id] of Object.entries(c.targets))if(roleBy(id)?.track===track)out.targets[track]=id;
 if(Array.isArray(c.favorites))out.favorites=[...new Set(c.favorites.filter(roleBy))];
 if(Array.isArray(c.compare))out.compare=[...new Set(c.compare.filter(roleBy))].slice(0,3);
 if(TRACKS.some(t=>t.id===c.lastTrack))out.lastTrack=c.lastTrack;
 return out;
}
try{
 const data=JSON.parse(localStorage.getItem(KEY)||'null');
 if(object(data)){progress=cleanProgress(data.progress);career=cleanCareer(data.career);}
 else {const old=JSON.parse(localStorage.getItem(LEGACY_KEY)||'null');if(object(old))progress=cleanProgress(old);}
 localStorage.setItem(KEY,JSON.stringify({progress,career}));
}catch(e){storageOK=false;}
function store(){try{localStorage.setItem(KEY,JSON.stringify({progress,career}));storageOK=true;}catch(e){storageOK=false;notify('이 환경에서는 자동 저장이 제한돼요. 백업 버튼으로 기록을 보관하세요.');}}
function notify(msg){clearTimeout(timer);toast.textContent=msg;toast.classList.add('visible');timer=setTimeout(()=>toast.classList.remove('visible'),2800);}
const done=key=>!!progress.completed[key];
function baseSteps(t){return [...COMMON.map(s=>({...s,key:'common:'+s.id,phase:'common'})),...t.steps.map(s=>({...s,key:t.id+':'+s.id,phase:'special'})),{...FINAL(t),key:t.id+':job',phase:'career'}];}
// A job route is deliberately not the same as its broad field syllabus.
function roleSteps(r){
 let ids=r.kind==='plan'?['c0','c4','c5']:['c0','c1','c2','c3','c4','c5'];
 if(r.id==='ux-writer'||r.id==='ux-researcher'||r.id==='product-designer')ids=['c0','c5'];
 const bases=COMMON.filter(s=>ids.includes(s.id)).map(s=>({...s,key:'common:'+s.id,phase:'common'}));
 const milestones=r.route.map((title,i)=>({id:'r'+i,key:'role:'+r.id+':r'+i,phase:'special',title,weeks:null,
  summary:`${r.name}의 역할과 연결되는 준비 단계입니다. ${r.work[Math.min(i,2)]}에 어떤 도움이 되는지 확인해보세요.`,
  topics:[...new Set([...title.split('·'),r.skills[i]])].filter(Boolean),
  tasks:[`${title}의 핵심 개념과 선택 기준을 정리한다`,`${r.portfolio}에 이 단계의 내용을 적용한다`,`${r.outputs[Math.min(i,1)]}에 적용 결과·한계·다음 개선을 기록한다`],
  output:`${title}을 적용한 실습 기록과 ${r.outputs[Math.min(i,1)]}`
 }));
 return [...bases,...milestones,{id:'portfolio',key:'role:'+r.id+':portfolio',phase:'portfolio',title:'직무 결과물로 포트폴리오 연결',weeks:null,summary:r.portfolio,topics:r.skills,tasks:['문제·판단·구현 또는 설계·검증 결과를 연결해 정리한다','직접 한 부분과 가상 가정·데이터를 구분한다','핵심 의사결정과 결과의 한계를 다른 사람에게 설명한다'],output:r.portfolio},{id:'job',key:'role:'+r.id+':job',phase:'career',title:r.name+' 지원 준비',weeks:null,summary:'학습 완료가 채용 자격을 보장하지는 않습니다. 실제 지원할 공고의 역할·경력·학위·과제를 확인합니다.',topics:['직무 공고 분석','이력서','포트폴리오·면접'],tasks:[`${r.name} / ${r.en} 공고 3개의 담당업무와 지원 조건을 비교한다`,'내 결과물을 각 공고의 요구 역량에 대응시킨다','부족한 증거·기술·경험을 정리하고 지원 자료를 준비한다'],output:r.name+' 중심 이력서·공고 비교표·지원 포트폴리오'}];
}
function currentRole(){return state.role?roleBy(state.role):null;}
function currentSteps(){return currentRole()?roleSteps(currentRole()):baseSteps(trackBy(state.track));}
function firstTodo(steps){const n=steps.findIndex(s=>!done(s.key));return n<0?steps.length-1:n;}
function stats(steps){const count=steps.filter(s=>done(s.key)).length;return {count,total:steps.length,pct:Math.round(count/steps.length*100)};}
function parseRoute(){
 const p=(location.hash||'#/map').replace(/^#\/?/,'').split('/');
 state.view=['map','job','path','compare','sources','favorites'].includes(p[0])?p[0]:'map';
 if(state.view==='map'){state.field=TRACKS.some(t=>t.id===p[1])?p[1]:'all';state.role=null;state.sub=state.field!=='all'&&subfieldsFor(state.field).some(g=>g.id===p[2])?p[2]:'all';}
 if(state.view==='job'){
  const r=roleBy(p[1]);if(r){state.role=r.id;state.track=r.track;}else{state.view='map';state.field='all';state.role=null;}
 }
 if(state.view==='path'){
  state.track=TRACKS.some(t=>t.id===p[1])?p[1]:career.lastTrack;
  const r=roleBy(p[2]);state.role=r?.track===state.track?r.id:null;
  state.selected=firstTodo(currentSteps());
 }
}
function navigate(hash,top=true){
 if(location.hash!==hash){try{history.pushState(null,'',hash);}catch(e){location.hash=hash;}}
 parseRoute();render();if(top)window.scrollTo({top:0,behavior:'instant'});
 const heading=app.querySelector('h1');if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}
}
function openRole(id){if(roleBy(id))navigate('#/job/'+id);}
function openPath(track,id){career.lastTrack=track;store();navigate('#/path/'+track+(id?'/'+id:''));}
function startRole(id){const r=roleBy(id);if(!r)return;career.targets[r.track]=r.id;career.lastTrack=r.track;store();openPath(r.track,r.id);notify(r.name+' 경로를 목표로 설정했어요.');}
function sourceLink(key){const s=SOURCES[key];if(!s)return '';return `<a class="source-link" href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.name)} ↗<span>${esc(s.type)}</span></a>`;}
function relatedButton(id){const r=roleBy(id);return r?`<button class="related-role" data-action="job" data-role="${r.id}">${esc(r.name)} ${I('arrow','s14')}</button>`:'';}
function phaseLabel(phase,t,r){return {common:'01 · 선택한 직무와 연결되는 전공 기반',special:r?'02 · '+r.name+' 준비':'02 · '+t.name+' 분야 학습',portfolio:'03 · 실제 직무 결과물 연결',career:r?'04 · 목표 직무 지원 준비':'03 · 취업 준비'}[phase]||'';}
function timeline(steps,t,r){let result='',phase='';steps.forEach((s,i)=>{if(s.phase!==phase){if(phase)result+='</div>';result+=`<div class="phase-heading"><span class="phase-dot"></span>${esc(phaseLabel(s.phase,t,r))}</div><div class="step-group">`;phase=s.phase;}result+=`<button class="step-row ${done(s.key)?'done':''} ${i===state.selected?'chosen':''}" data-action="step" data-index="${i}" ${i===state.selected?'aria-current="step"':''}><span class="step-pin">${done(s.key)?I('check','s14'):i+1}</span><span class="step-info"><span class="step-no">STEP ${String(i+1).padStart(2,'0')}</span><span class="step-title">${esc(s.title)}</span><span class="step-sub">${esc(s.phase==='special'&&r?r.work[Math.min(i-(steps.length-6),2)]||r.summary:s.summary)}</span></span><span class="step-right"><span class="step-status">${done(s.key)?'완료':i===state.selected?'선택됨':'시작 전'}</span>${s.weeks?`<span class="time">약 ${s.weeks}주 · 예시</span>`:''}</span></button>`;});if(phase)result+='</div>';return result+`<div class="destination"><strong>◉ &nbsp;${r?esc(r.name):'이 분야에서 연결되는 실제 직무'}</strong><p>${r?esc(r.summary):'아래 직무를 누르면 실제 업무와 직무별 준비 경로를 볼 수 있어요.'}</p>${r?`<button class="btn secondary small" data-action="job" data-role="${r.id}">실제 업무 다시 보기 ${I('arrow','s14')}</button>`:`<div class="branch-pills">${rolesFor(t.id).map(x=>`<button class="branch-pill" data-action="job" data-role="${x.id}">${esc(x.name)}</button>`).join('')}</div>`}</div>`;}
function detail(steps,r){const s=steps[state.selected],checked=progress.checks[s.key]||{};return `<aside class="detail panel" id="detail-rail" aria-label="선택한 학습 단계 상세"><span class="detail-flag">학습 단계 ${state.selected+1} / ${steps.length}</span><h2>${esc(s.title)}</h2><p class="detail-desc">${esc(s.summary)}</p>${r?`<div class="role-link-in-detail">이 단계가 연결되는 직무<br><button data-action="job" data-role="${r.id}">${esc(r.name)} →</button></div>`:''}<div class="detail-section"><h3>학습할 개념</h3><div class="tags">${s.topics.map(v=>`<span class="skill-tag">${esc(v)}</span>`).join('')}</div></div><div class="detail-section"><h3>확인할 내용</h3>${s.tasks.map((task,i)=>`<label class="checkitem"><input type="checkbox" data-action="task" data-task="${i}" ${checked[i]?'checked':''}><span>${esc(task)}</span></label>`).join('')}</div><div class="detail-section"><h3>남길 결과물</h3><div class="evidence">${esc(s.output)}</div></div><div class="detail-section"><h3>내 학습 메모</h3><textarea class="memo" id="step-note" aria-label="학습 메모" placeholder="학습 내용·프로젝트·링크를 기록하세요." maxlength="20000">${esc(progress.notes[s.key]||'')}</textarea><div class="detail-meta">브라우저별 로컬 저장 · 다른 기기에서는 백업 불러오기</div></div><div class="detail-buttons"><button class="btn ${done(s.key)?'outline':'primary'}" data-action="toggle-done">${I('check','s14')}${done(s.key)?'완료 표시 취소':'이 단계 완료'}</button><button class="btn secondary" data-action="next">${state.selected===steps.length-1?'목표 직무 확인':'다음 단계'} ${I('arrow','s14')}</button></div><div class="mini-note">완료 버튼은 체크리스트를 모두 완료로 표시합니다. 실습은 학습 제안이며 채용 자격이나 합격을 보장하지 않습니다.</div></aside>`;}
function renderPath(){const t=trackBy(state.track),r=currentRole(),steps=currentSteps(),st=stats(steps);state.selected=Math.max(0,Math.min(state.selected,steps.length-1));const next=steps.find(s=>!done(s.key));
 return `<div class="path-heading"><div class="breadcrumbs"><button class="crumb-btn" data-action="all">직무 지도</button>${I('chevron','s14')}${esc(t.name)}${r?I('chevron','s14')+esc(r.name):''}</div><button class="btn outline small" data-action="field" data-track="${t.id}">직무 다시 선택</button></div><section class="path-hero" style="--track:${t.accent}"><div><span class="tag">${r?'MY DESTINATION · 목표 직무':'FIELD SYLLABUS · 분야 탐색'}</span><h1>${esc(r?r.name:t.name)}</h1><p>${esc(r?r.summary:t.intro)}</p><div class="node-pathway"><span>컴퓨터공학</span>→<span>${esc(t.name)}</span>→<span class="active">${r?esc(r.name):'세부 직무 선택'}</span></div></div><div class="path-hero-bottom"><div><div class="path-hero-stat">${st.pct}%<small>${st.count} / ${st.total}단계</small></div><div class="hero-bar" role="progressbar" aria-label="학습 진행률" aria-valuenow="${st.pct}" aria-valuemin="0" aria-valuemax="100"><span style="width:${st.pct}%"></span></div></div><div class="hero-next">${next?'다음 준비 단계':'학습 경로 완료'}<strong>${next?esc(next.title):'실제 공고의 조건을 확인하세요'}</strong></div></div></section>${r?`<section class="job-summary-strip"><div><small>공부의 목적지에서 실제로 하는 일</small><strong>${esc(r.work[0])}</strong><p>주요 결과물: ${esc(r.outputs.join(' · '))}</p></div><button class="btn outline small" data-action="job" data-role="${r.id}">직무 상세 보기 ${I('arrow','s14')}</button></section>`:`<section class="job-summary-strip"><div><small>같은 분야 안에서도 직무마다 경로가 달라요</small><strong>아래 직무를 살펴보고 목표를 선택하세요.</strong><div class="branch-pills">${rolesFor(t.id).map(x=>`<button class="branch-pill" data-action="job" data-role="${x.id}">${esc(x.name)}</button>`).join('')}</div></div></section>`}<div class="path-layout"><section class="timeline-panel panel"><div class="timeline-intro"><div><strong>${r?'직무를 향한 나의 경로':'분야를 둘러보는 학습 경로'}</strong><br><span>이미 아는 내용은 건너뛰고 필요한 단계부터 시작하세요.</span></div><button class="btn outline small" data-action="reset">경로 초기화</button></div>${timeline(steps,t,r)}</section>${detail(steps,r)}</div><div class="mini-note">${r?'직무별 경로는 분야 전체 커리큘럼과 다릅니다. 기획·분석 직무에 모든 개발 기술을 필수로 요구하지 않으며, 지원할 공고에 맞춰 범위와 깊이를 조절하세요.':'이 화면은 넓은 분야 탐색용입니다. 분야의 모든 기술이 모든 세부 직무에 필요한 것은 아니며, 직무를 선택하면 별도의 준비 경로로 연결됩니다.'} 공통 기반의 완료 기록은 공유되고, 직무별 학습 기록은 별도로 보관됩니다.</div>`;
}
function renderCompare(){const items=career.compare.map(roleBy).filter(Boolean);const fields=[['주된 목적',r=>esc(r.summary)],['실제 업무',r=>r.work.map(v=>`<p>${esc(v)}</p>`).join('')],['남는 결과물',r=>r.outputs.map(v=>esc(v)).join('<br>')],['핵심 역량',r=>r.skills.map(v=>esc(v)).join(' · ')],['준비 경로',r=>r.route.map((v,i)=>`<p>${i+1}. ${esc(v)}</p>`).join('')],['진입 시 확인',r=>esc(r.entrynote)],['업무 사례',r=>`<b>${esc(ROLE_EXAMPLES[r.id].case.title)}</b><p>${esc(ROLE_EXAMPLES[r.id].case.steps.map(s=>s.label).join(' → '))}</p><small>가상의 설명용 사례</small>`],['학생 프로젝트',r=>`<b>${esc(ROLE_EXAMPLES[r.id].project.title)}</b><p>${esc(ROLE_EXAMPLES[r.id].project.scope)}</p><button class="link" data-action="job" data-role="${r.id}">프로젝트 자세히 보기 →</button>`],['공식 참고',r=>r.sources.map(sourceLink).join('')]];
 return `<section class="compare-head"><div class="eyebrow">COMPARE REAL ROLES</div><h1 class="hero-title">비슷해 보이는 이름,<br><em>다르게 하는 일.</em></h1><p class="hero-desc">관심 있는 직업을 최대 3개까지 비교해보세요. 목표·업무·결과물·준비 경로를 나란히 볼 수 있습니다.</p></section><div class="compare-picked">${items.map(r=>`<span class="compare-pick">${esc(r.name)}<button data-action="compare-remove" data-role="${r.id}" aria-label="${esc(r.name)} 비교에서 제거">×</button></span>`).join('')}</div><div class="compare-search-wrap"><label for="compare-choice" class="small-muted">비교할 직무</label><select id="compare-choice" aria-label="비교할 직무 선택"><option value="">직무를 선택하세요</option>${TRACKS.map(t=>`<optgroup label="${esc(t.name)}">${rolesFor(t.id).filter(r=>!career.compare.includes(r.id)).map(r=>`<option value="${r.id}">${esc(r.name)}</option>`).join('')}</optgroup>`).join('')}</select><button class="btn secondary small" data-action="compare-selected">비교에 추가</button></div>${items.length?`<div class="compare-table-wrap"><table class="compare-table"><thead><tr><th scope="col">비교 기준</th>${items.map(r=>`<th scope="col"><div class="compare-track-name">${esc(r.name)}</div><div class="small-muted">${esc(r.en)}</div><button class="btn secondary small" data-action="job" data-role="${r.id}">직무 상세 →</button></th>`).join('')}</tr></thead><tbody>${fields.map(([label,fn])=>`<tr><th scope="row">${label}</th>${items.map(r=>`<td>${fn(r)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`:'<div class="no-results">궁금한 직업을 위 목록에서 고르거나 분야 탐색에서 비교에 담아주세요.</div>'}<div class="comparison-hint">제품 PM과 프로젝트 PM, 기술 제품 PM과 기술 프로그램 PM은 이름이 비슷해도 책임의 초점이 다릅니다. 반대로 PM과 PO처럼 회사에 따라 실제 역할이 겹치는 명칭도 있어요. 직함보다 공고의 업무를 읽어보세요.</div>`;
}
function renderSources(){const seen=new Set(),unique=Object.entries(SOURCES).filter(([k,s])=>{if(seen.has(s.url))return false;seen.add(s.url);return true;});return `<div class="eyebrow">SOURCES & HOW TO READ THIS MAP</div><h1 class="hero-title">직무 지도의 <em>설명 기준</em></h1><p class="hero-desc">공식 직무소개·기업 채용 목록·공공 직업 설명을 참고해 대표 업무를 요약했습니다. 준비 경로와 실습 제안은 이 사이트에서 구성한 예시입니다.</p><section class="panel source-method"><strong>이 지도에서 구분해서 볼 것</strong><p>직무 소개: 대표 업무·결과물을 이해하기 위한 요약입니다. 64개 항목에는 전문 직무와 유사 직무를 묶은 항목이 함께 있으며, 표준 직업 분류 전체를 뜻하지 않습니다.</p><p>채용 링크: 직무명·업무 범위를 직접 확인하는 참고 링크입니다. 실시간 채용 집계나 채용 추천 엔진이 아니며, 공고는 마감·변경될 수 있습니다.</p><p>진입 경로: 신입 지원 가능 여부를 판정한 것이 아닙니다. 개별 공고의 학력·연차·담당 범위·과제를 확인하기 위한 안내입니다.</p><p>학습·실습: 학습 순서와 포트폴리오는 제안입니다. 공인 자격·입사 필수 조건·취업 보장이 아닙니다. 기존 분야 커리큘럼은 탐색용으로 유지하고, 목표 직무를 고르면 직무별 경로로 전환됩니다.</p><p>연결선: 실선은 분류·학습 흐름, 점선은 공유 역량·협업 접점을 뜻합니다. 직무 간 자동 전직이나 승진을 의미하지 않습니다.</p><p>자료 범위: 국내 기업 공식 자료와 일부 해외 공공 직업 설명을 사용했습니다. 미국의 학위·연봉·전망을 국내 취업 조건에 그대로 적용하지 않습니다. 이 사이트에는 연봉·채용 확률 예측을 넣지 않았습니다.</p><p>저장: 계정·서버 동기화 없이 이 브라우저의 localStorage를 사용합니다. 브라우저 삭제·시크릿 모드·파일 경로 변경에 대비해 JSON 백업을 보관하세요.</p><strong>자료 확인일: 2026년 11월 7일</strong></section><div class="sources-grid">${unique.map(([k])=>sourceLink(k)).join('')}</div>`;}
function render(){const old=app.querySelector('#detail-rail')?.scrollTop||0;app.innerHTML=header()+`<div class="shell">${side()}<main class="workspace" id="main-content" tabindex="-1">${mobile()}${state.view==='map'?renderMap():state.view==='job'?renderJob():state.view==='path'?renderPath():state.view==='compare'?renderCompare():state.view==='favorites'?renderFavorites():renderSources()}${footer()}</main></div>`;if(state.view==='map')filterMap();if(state.view==='path'){const rail=document.getElementById('detail-rail');if(rail)rail.scrollTop=old;}}
function setDone(value){const s=currentSteps()[state.selected];progress.completed[s.key]=value;progress.checks[s.key]={};s.tasks.forEach((_,i)=>progress.checks[s.key][i]=value);store();render();notify(value?'학습 단계를 완료로 표시했어요.':'완료 표시를 취소했어요.');}
function selectStep(i){if(i<0||i>=currentSteps().length)return;state.selected=i;render();const rail=document.getElementById('detail-rail');if(rail){rail.scrollTop=0;if(innerWidth<=1080)rail.scrollIntoView({behavior:'smooth',block:'start'});}}
function exportData(){const data={format:'pathways-careers-v2',exportedAt:new Date().toISOString(),progress,career};const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='PATHWAYS-career-records-'+new Date().toISOString().slice(0,10)+'.json';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);notify('직무 목표·관심·학습 기록을 백업했어요.');}
function addCompare(id,open=true){if(!roleBy(id))return;if(!career.compare.includes(id)){if(career.compare.length>=3){if(open)navigate('#/compare');notify('최대 3개까지 비교할 수 있어요. 기존 직무의 ×를 눌러 교체하세요.');return;}career.compare.push(id);store();}if(open)navigate('#/compare');else render();}
function reset(){const r=currentRole(),t=trackBy(state.track);if(!confirm(`${r?r.name:t.name}의 전문 단계 기록과 메모를 초기화할까요?\n공통 기반과 다른 직무의 기록은 유지됩니다.`))return;currentSteps().filter(s=>s.phase!=='common').forEach(s=>{delete progress.completed[s.key];delete progress.checks[s.key];delete progress.notes[s.key];});store();state.selected=firstTodo(currentSteps());render();notify('선택한 경로의 기록을 초기화했어요.');}
app.addEventListener('click',e=>{const el=e.target.closest('[data-action]');if(!el||!app.contains(el))return;const a=el.dataset.action;
 if(a==='case-step'){selectCaseStep(el.dataset.role,Number(el.dataset.step));return;}
 if(a==='jump-section'){const section=document.getElementById(el.dataset.section);if(section){section.scrollIntoView({block:'start',behavior:'instant'});section.querySelector('h2')?.focus({preventScroll:true});}return;}
 if(a==='all'){e.preventDefault();state.query='';state.kind='all';state.interest='all';navigate('#/map');}
 else if(a==='nav'){if(el.dataset.view==='map'){state.query='';state.interest='all';navigate('#/map');}else if(el.dataset.view==='path')openPath(career.lastTrack,career.targets[career.lastTrack]);else navigate('#/'+el.dataset.view);}
 else if(a==='field'){state.query='';state.kind='all';navigate('#/map/'+el.dataset.track);}
 else if(a==='kind'){state.kind=el.dataset.kind;state.query='';if(state.view!=='map')navigate('#/map');else render();}
 else if(a==='interest'){state.interest=el.dataset.interest;render();app.querySelector(`[data-interest="${state.interest}"]`)?.focus();}
 else if(a==='subfield'){navigate('#/map/'+state.field+(el.dataset.sub==='all'?'':'/'+el.dataset.sub));}
 else if(a==='compare-toggle'){const id=el.dataset.role;if(career.compare.includes(id)){career.compare=career.compare.filter(v=>v!==id);store();render();}else{addCompare(id,false);notify(career.compare.includes(id)?'비교에 담았어요. 최대 3개를 함께 볼 수 있어요.':'비교 목록이 가득 찼어요. 직업 비교에서 하나를 빼주세요.');}}
 else if(a==='job')openRole(el.dataset.role);
 else if(a==='start-role')startRole(el.dataset.role);
 else if(a==='base-path')openPath(el.dataset.track);
 else if(a==='resume')openPath(career.lastTrack,career.targets[career.lastTrack]);
 else if(a==='favorite'){const id=el.dataset.role;career.favorites=career.favorites.includes(id)?career.favorites.filter(x=>x!==id):[...career.favorites,id];store();render();app.querySelector(`[data-action="favorite"][data-role="${id}"]`)?.focus({preventScroll:true});notify(career.favorites.includes(id)?'관심 직업에 저장했어요.':'관심 직업에서 해제했어요.');}
 else if(a==='compare-add')addCompare(el.dataset.role);
 else if(a==='compare-selected'){const v=document.getElementById('compare-choice')?.value;if(v)addCompare(v,false);else notify('비교할 직무를 선택하세요.');}
 else if(a==='compare-remove'){career.compare=career.compare.filter(x=>x!==el.dataset.role);store();render();}
 else if(a==='step')selectStep(Number(el.dataset.index));
 else if(a==='next'){if(state.selected===currentSteps().length-1){if(currentRole())openRole(state.role);else navigate('#/map/'+state.track);}else selectStep(state.selected+1);}
 else if(a==='toggle-done')setDone(!done(currentSteps()[state.selected].key));
 else if(a==='reset')reset();
 else if(a==='sources')navigate('#/sources');
 else if(a==='export')exportData();
 else if(a==='import')document.getElementById('import-file').click();
});
app.addEventListener('input',e=>{if(e.target.id==='job-search'){state.query=e.target.value;filterMap();}else if(e.target.id==='step-note'){const s=currentSteps()[state.selected];progress.notes[s.key]=e.target.value;store();}});
app.addEventListener('change',e=>{if(e.target.dataset.action==='task'){const s=currentSteps()[state.selected],i=Number(e.target.dataset.task);progress.checks[s.key]??={};progress.checks[s.key][i]=e.target.checked;progress.completed[s.key]=s.tasks.every((_,j)=>progress.checks[s.key][j]===true);store();render();}});
document.getElementById('import-file').addEventListener('change',async e=>{const file=e.target.files?.[0];e.target.value='';if(!file)return;if(file.size>3000000){notify('백업 파일 크기가 너무 커요.');return;}try{const d=JSON.parse(await file.text());if(!['pathways-careers-v2','pathways-cs-v1'].includes(d.format)||!object(d.progress))throw Error('invalid');const legacy=d.format==='pathways-cs-v1';if(!confirm(legacy?'이전 버전의 학습 기록을 합칠까요? 현재 직무별 기록과 목표는 유지됩니다.':'백업으로 현재 직무·학습 기록을 교체할까요?'))return;const p=cleanProgress(d.progress);if(legacy){for(const g of ['completed','checks','notes'])progress[g]={...progress[g],...p[g]};}else{progress=p;career=cleanCareer(d.career);}store();if(state.view==='path')state.selected=firstTodo(currentSteps());render();notify(legacy?'이전 학습 기록을 합쳤어요.':'직무·학습 기록을 불러왔어요.');}catch(err){notify('PATHWAYS에서 내보낸 올바른 JSON 백업 파일을 선택하세요.');}});
window.addEventListener('hashchange',()=>{if(location.hash==='#main-content')return;arriveAtRoute();});
window.addEventListener('popstate',()=>{if(location.hash!=='#main-content')arriveAtRoute();});
parseRoute();render();

function arriveAtRoute(){parseRoute();render();window.scrollTo({top:0,behavior:'instant'});const h=app.querySelector('h1');if(h){h.tabIndex=-1;h.focus({preventScroll:true});}}
