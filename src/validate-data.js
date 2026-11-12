/* Shared browser/Node validation. Data is untrusted even on the publishing origin. */
function validatePublicDataset(x) {
  const fail=m=>{throw new Error('공개 데이터 검증 실패: '+m);};
  const text=(v,n=20000)=>typeof v==='string'&&v.length<=n;
  const safeId=v=>text(v,100)&&/^[a-zA-Z0-9_-]+$/.test(v)&&!['__proto__','constructor','prototype'].includes(v);
  const obj=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
  const date=v=>text(v,10)&&/^\d{4}-\d{2}-\d{2}$/.test(v)&&Number.isFinite(Date.parse(v))&&new Date(v).toISOString().slice(0,10)===v;
  const url=v=>{try{const u=new URL(v);return text(v,3000)&&u.protocol==='https:'&&!u.username&&!u.password;}catch{return false;}};
  const strings=(v,n=100)=>Array.isArray(v)&&v.length<=n&&v.every(s=>text(s,3000));
  const top=new Set(['schemaVersion','updatedAt','platformUpdatedAt','coverage','tracks','roles','companies','jobs','platforms','publication','refresh']);
  if(!obj(x)||x.schemaVersion!==1||!date(x.updatedAt)||!date(x.platformUpdatedAt))fail('schemaVersion/확인일');
  if(Object.keys(x).some(k=>!top.has(k)))fail('허용되지 않은 최상위 필드 (개인 기록 제외)');
  const tables={};
  for(const key of ['tracks','roles','companies','jobs','platforms']){
    if(!Array.isArray(x[key])||x[key].length>1000||(key!=='jobs'&&!x[key].length))fail(key+' 목록');
    const ids=new Set();
    for(const row of x[key]){
      if(!obj(row)||!safeId(row.id)||ids.has(row.id))fail(key+' ID 중복/형식');
      ids.add(row.id);
    }
    tables[key]=ids;
  }
  for(const t of x.tracks)if(!text(t.name,200)||!text(t.icon,12)||/[<>&"']/.test(t.icon))fail('분야 이름/기호');
  for(const r of x.roles)if(!text(r.name,200)||!tables.tracks.has(r.track))fail('직무/분야 연결');
  for(const c of x.companies){
    if(!text(c.name,200)||!text(c.mark,40)||!text(c.description,3000)||!/^#[a-fA-F0-9]{6}$/.test(c.color)||!url(c.url)||!strings(c.tracks)||!c.tracks.every(i=>tables.tracks.has(i)))fail('기업 정보');
  }
  for(const p of x.platforms){
    if(!text(p.name,200)||!text(p.mark,40)||!text(p.caption,3000)||!/^#[a-fA-F0-9]{6}$/.test(p.color)||!url(p.url)||!url(p.listing))fail('플랫폼 정보');
  }
  for(const j of x.jobs){
    if(!tables.companies.has(j.company)||!url(j.url)||!date(j.verifiedAt)||typeof j.archived!=='boolean')fail(j.id+' 기업/출처/확인일');
    for(const f of ['title','employment','experience','education','location','term','note'])if(!text(j[f]))fail(j.id+' '+f);
    for(const f of ['roles','tracks','levels','skills','required','preferred','documents','process','responsibilities'])if(!strings(j[f]))fail(j.id+' '+f);
    if(!j.roles.every(v=>tables.roles.has(v))||!j.tracks.every(v=>tables.tracks.has(v)))fail(j.id+' 직무 연결');
    if(!j.levels.every(v=>['intern','junior','experienced','any','unspecified'].includes(v)))fail(j.id+' 지원 대상');
    if(!['public','rolling','individual','unknown'].includes(j.method)||!['detail','listing','secondary'].includes(j.verification))fail(j.id+' 분류');
    if(!['date','minute'].includes(j.deadlinePrecision))fail(j.id+' 마감 정밀도');
    if(j.deadline!==null){
      if(j.deadlinePrecision==='date'&&!date(j.deadline))fail(j.id+' 마감일');
      if(j.deadlinePrecision==='minute'&&(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\+09:00$/.test(j.deadline)||!Number.isFinite(Date.parse(j.deadline))))fail(j.id+' 마감시각');
    }
    if(j.sourcePlatform&&!tables.platforms.has(j.sourcePlatform))fail(j.id+' 출처 플랫폼');
    if(j.sourceScope!==undefined&&!text(j.sourceScope,3000))fail(j.id+' 확인 범위');
    if(!Array.isArray(j.sources)||j.sources.length>20||!j.sources.every(s=>obj(s)&&text(s.label,300)&&url(s.url)))fail(j.id+' 근거 링크');
    if(!Array.isArray(j.prep)||j.prep.length>20||!j.prep.every(p=>obj(p)&&text(p.title,300)&&text(p.text,3000)&&tables.roles.has(p.role)))fail(j.id+' 준비 제안');
  }
  if(x.publication!==undefined){
    if(!obj(x.publication)||!text(x.publication.revision,100)||!text(x.publication.builtAt,50)||!Number.isFinite(Date.parse(x.publication.builtAt)))fail('배포 메타데이터');
  }
  return x;
}
if(typeof module!=='undefined'&&module.exports)module.exports={validatePublicDataset};
