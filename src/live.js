// Same-origin, credential-free data loading. This does NOT scrape job platforms.
async function fetchPublicData(){
  const controller=new AbortController();
  const timeout=setTimeout(()=>controller.abort(),8000);
  try{
    const u=new URL('jobs-data.json',location.href);u.hash='';u.search='v='+Date.now();
    const res=await fetch(u,{cache:'no-store',credentials:'omit',redirect:'error',signal:controller.signal});
    if(!res.ok)throw new Error('데이터 응답 HTTP '+res.status);
    if(Number(res.headers.get('content-length')||0)>3*1024*1024)throw new Error('데이터 크기 초과');
    const body=await res.text();
    if(body.length>3*1024*1024)throw new Error('데이터 크기 초과');
    return validatePublicDataset(JSON.parse(body));
  }finally{clearTimeout(timeout);}
}
function liveBanner(){
  const local=live.mode==='local', bad=['local','error','manual'].includes(live.mode);
  const title=local?'로컬 파일 · 온라인 자동 반영 미연결':live.mode==='error'?'온라인 확인 실패 · 마지막 정상 데이터 표시':live.mode==='manual'?'수동 데이터 미리보기 · 온라인 동기화 일시 중지':live.pending?'새 데이터 수신 · 입력 완료 후 반영':'온라인 데이터 연결됨';
  const fetched=live.lastFetch?live.lastFetch.toLocaleString('ko-KR',{timeZone:'Asia/Seoul',hour12:false}):'아직 없음';
  const subtitle=local?'최초 배포를 완료한 웹주소에서 열어야 서버 데이터를 가져옵니다.':live.mode==='manual'?'이 탭을 새로고침하면 온라인 데이터를 다시 불러옵니다.':`서버 조회 ${fetched} · 접속 시 / 열려 있는 동안 5분마다 확인 · 원문 검증 주기와 별개`;
  return `<section id="live-status" class="live-status ${bad?'warning':''}" role="status" aria-live="polite"><div><strong>${esc(title)}</strong><small>${esc(subtitle)}<br>원문 확인: 기업 ${esc(DATA.updatedAt)} · 플랫폼 ${esc(DATA.platformUpdatedAt)}. 개별 공고의 확인일을 우선하세요.</small></div>${!local&&live.mode!=='manual'?`<button type="button" id="live-refresh" class="btn outline small" ${live.busy?'disabled':''}>${live.busy?'확인 중':'지금 확인'}</button>`:''}</section>`;
}
function refreshLiveBanner(){const b=document.getElementById('live-status');if(b)b.outerHTML=liveBanner();}
function editingPublicUI(){const el=document.activeElement;return !!el&&(el.matches('input,textarea,select')||el.isContentEditable);}
function applyPublicData(next){
  // Checkmarks follow unchanged requirement text, not shifting list indices.
  const previous=new Map(DATA.jobs.map(j=>[j.id,j]));
  for(const j of next.jobs){
    const old=previous.get(j.id);
    if(old&&stored.checks[j.id]){
      const checked=new Set(stored.checks[j.id].map(i=>old.required[i]).filter(Boolean));
      stored.checks[j.id]=j.required.map((v,i)=>checked.has(v)?i:-1).filter(i=>i>=0);
    }
  }
  DATA=next;live.pending=null;live.mode='online';save();
  if(state.view==='job'&&!job(state.detail)){state.view='saved';state.detail=null;}
  if(state.company!=='all'&&!company(state.company))state.company='all';
  const sy=window.scrollY;render();window.scrollTo(0,sy);
}
async function refreshPublicData(){
  if(live.busy||['local','manual'].includes(live.mode))return;
  live.busy=true;refreshLiveBanner();
  try{
    const next=await fetchPublicData();
    live.lastFetch=new Date();live.mode='online';live.error='';
    if(JSON.stringify(next)!==JSON.stringify(DATA)){
      if(editingPublicUI())live.pending=next;else applyPublicData(next);
    }else live.pending=null;
  }catch(e){live.mode='error';live.error=e.message;}
  finally{live.busy=false;refreshLiveBanner();}
}
function startLiveSync(){
  app.addEventListener('click',e=>{if(e.target.closest('#live-refresh'))refreshPublicData();});
  app.addEventListener('focusout',()=>{setTimeout(()=>{if(live.pending&&!editingPublicUI())applyPublicData(live.pending);},0);});
  window.addEventListener('online',refreshPublicData);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')refreshPublicData();});
  setInterval(()=>{if(document.visibilityState==='visible')refreshPublicData();},300000);
}
