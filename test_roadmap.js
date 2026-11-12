'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const source=['data.js','explore-data.js','examples-data.js','app.js','explorer-ui.js'].map(n=>fs.readFileSync('src/roadmap/'+n,'utf8')).join('\n');
function boot(saved={},hash='#/map'){
 const app={innerHTML:'',addEventListener(){},querySelector(){return null},querySelectorAll(){return []}};
 const noop={addEventListener(){},classList:{add(){},remove(){}},textContent:''};
 const store=new Map(Object.entries(saved));
 const ctx={console,URL,Blob,setTimeout,clearTimeout,innerWidth:1440,location:{hash},history:{pushState(_a,_b,v){ctx.location.hash=v}},window:{addEventListener(){},scrollTo(){}},document:{getElementById(id){return id==='app'?app:id==='import-file'||id==='toast'?noop:null}},localStorage:{getItem(k){return store.get(k)||null},setItem(k,v){store.set(k,v)}}};
 vm.createContext(ctx);vm.runInContext(source,ctx);return {ctx,app,store,run:s=>vm.runInContext(s,ctx)};
}
const c=boot();
assert.equal(c.run('TRACKS.length'),12);assert.equal(c.run('ROLES.length'),64);
assert.equal(c.run('Object.keys(EXPLORER).length'),12);
assert.equal(c.run('TRACKS.every(t=>EXPLORER[t.id]&&subfieldsFor(t.id).every(g=>g.roles.length>0&&g.roles.every(id=>roleBy(id)?.track===t.id)))'),true);
assert.equal(c.run('ROLES.every(r=>Object.values(EXPLORER).flatMap(m=>m.groups.flatMap(g=>g[3])).filter(id=>id===r.id).length===1)'),true);
assert.equal(c.run('TRACKS.every(t=>EXPLORER[t.id].neighbors.every(id=>TRACKS.some(x=>x.id===id)))'),true);
assert.equal(c.run('ROLES.every(r=>r.work.length&&r.outputs.length&&r.sources.every(id=>SOURCES[id]))'),true);
assert.equal(c.run('career.compare.length'),0);
assert.ok(!c.app.innerHTML.includes('data-role-card='));assert.ok(c.app.innerHTML.includes('12</b>개의 분야'));
const historical={progress:{completed:{'role:data-analyst:r0':true},checks:{'role:data-analyst:r0':{'0':true}},notes:{'role:data-analyst:r0':'기존 학습 메모'}},career:{favorites:['data-analyst'],compare:['frontend','backend'],targets:{ai:'data-analyst'},lastTrack:'ai'}};
const kept=boot({'pathways-careers-v2':JSON.stringify(historical)},'#/map/ai/analysis');
assert.equal(kept.run('state.sub'),'analysis');assert.equal(kept.run('state.field'),'ai');assert.equal(kept.run('progress.notes["role:data-analyst:r0"]'),'기존 학습 메모');assert.equal(kept.run('career.compare.join(",")'),'frontend,backend');assert.equal(kept.run('career.targets.ai'),'data-analyst');assert.equal(kept.run('career.favorites[0]'),'data-analyst');
for(const route of ['#/map/ai','#/job/data-analyst','#/path/ai/data-analyst','#/compare','#/favorites','#/sources']){const b=boot({'pathways-careers-v2':JSON.stringify(historical)},route);assert.ok(b.app.innerHTML.length>100);}
for(const id of c.run('ROLES.map(r=>r.id)')){const b=boot({},'#/job/'+id);assert.ok(b.app.innerHTML.includes('어떤 일을 하나요?'));assert.ok(b.app.innerHTML.includes('무엇을 만들어 내나요?'));}
for(const [track,meta] of Object.entries(c.run('EXPLORER'))){for(const group of meta.groups){const b=boot({},'#/map/'+track+'/'+group[0]);assert.equal(b.run('state.sub'),group[0]);assert.equal((b.app.innerHTML.match(/data-role-card=/g)||[]).length,group[3].length);}}
assert.equal(boot({},'#/map/ai/unknown').run('state.sub'),'all');assert.equal(boot({},'#/job/unknown').run('state.view'),'map');
const legacy=boot({'pathways-cs-roadmap-v1':JSON.stringify(historical.progress)});assert.equal(legacy.run('progress.notes["role:data-analyst:r0"]'),'기존 학습 메모');
const html=fs.readFileSync('docs/cs-career-roadmap-v2.html','utf8');new vm.Script(html.match(/<script>([\s\S]*?)<\/script>/)[1]);
const jobs=JSON.parse(fs.readFileSync('docs/jobs-data.json','utf8'));const known=new Set(c.run('ROLES.map(r=>r.id)'));assert.ok(jobs.roles.every(r=>known.has(r.id)));
console.log('PASS: 12 fields / 64 roles, complete taxonomy, all role screens, original links, existing and legacy records, empty new-user comparison, generated script, job-page role IDs.');
// Every role has a distinct, complete authored example and a scoped project.
const exampleIds=c.run('Object.keys(ROLE_EXAMPLES).sort()');
assert.deepEqual(Array.from(exampleIds),Array.from(c.run('ROLES.map(r=>r.id).sort()')));
for(const field of ['case','project'])assert.equal(c.run(`new Set(Object.values(ROLE_EXAMPLES).map(x=>x.${field}.title)).size`),64);
for(const id of exampleIds){
 const x=c.run(`ROLE_EXAMPLES[${JSON.stringify(id)}]`);
 for(const key of ['title','situation','team','success'])assert.ok(x.case[key]?.length>5,`${id}: case.${key}`);
 assert.equal(x.case.steps.length,3,id);
 for(const s of x.case.steps){assert.ok(s.label&&s.action.length>15&&s.artifact);assert.ok(s.contents.length>=2&&s.contents.every(t=>t.length>5));}
 for(const key of ['title','goal','inputs','scope','check','extension'])assert.ok(x.project[key]?.length>5,`${id}: project.${key}`);
 assert.equal(x.project.steps.length,3);assert.ok(x.project.steps.every(t=>t.length>10));assert.ok(x.project.deliverables.length>=2);
 const b=boot({},'#/job/'+id);assert.ok(b.app.innerHTML.includes(x.case.title));assert.ok(b.app.innerHTML.includes(x.project.title));assert.ok(b.app.innerHTML.includes('가상의 설명용 사례'));assert.ok(b.app.innerHTML.includes('학습용 프로젝트 제안'));
 assert.equal((b.app.innerHTML.match(/data-action="case-step"/g)||[]).length,3);assert.equal((b.app.innerHTML.match(/class="case-stage"/g)||[]).length,3);
 assert.ok(!b.app.innerHTML.includes('undefined'));
}
const stepTest=boot({},'#/job/backend');stepTest.run("selectCaseStep('backend',2)");assert.equal(stepTest.run('state.caseSteps.backend'),2);stepTest.run("selectCaseStep('backend',9);selectCaseStep('frontend',1)");assert.equal(stepTest.run('state.caseSteps.backend'),2);assert.equal(stepTest.run('state.caseSteps.frontend'),undefined);
const search=boot();const searchNodes={'field-grid':{hidden:false,querySelectorAll(){return []}},'explorer-search-results':{hidden:true,innerHTML:''},'map-count':{textContent:''}};const baseGet=search.ctx.document.getElementById;search.ctx.document.getElementById=id=>searchNodes[id]||baseGet(id);
search.run("state.query='그럴듯하지만 근거가 없는 답';filterMap()");assert.ok(searchNodes['explorer-search-results'].innerHTML.includes('data-role-card="ai-pm"'));assert.ok(searchNodes['map-count'].textContent.includes('1개 직업'));
search.run("state.query='xyz없는직업987';filterMap()");assert.ok(searchNodes['explorer-search-results'].innerHTML.includes('아직 일치하는 직업을 찾지 못했어요'));
search.run("state.query='';filterMap()");assert.equal(searchNodes['field-grid'].hidden,false);assert.equal(searchNodes['explorer-search-results'].hidden,true);
const compared=boot({'pathways-careers-v2':JSON.stringify(historical)},'#/compare');assert.ok(compared.app.innerHTML.includes('한 번 주문했는데 주문서가 두 장이라면?'));assert.ok(compared.app.innerHTML.includes('중복에 강한 주문 API'));
console.log('PASS: 64 unique work cases + 64 scoped projects / 192 complete case stages, fictional labels, case selection bounds, case/project search, empty/reset results, example comparison.');
