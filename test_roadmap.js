'use strict';
const fs=require('fs'),vm=require('vm'),assert=require('node:assert/strict');
const source=['data.js','explore-data.js','app.js','explorer-ui.js'].map(n=>fs.readFileSync('src/roadmap/'+n,'utf8')).join('\n');
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
