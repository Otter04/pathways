'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const {validatePublicDataset}=require('./src/validate-data.js');
const base=JSON.parse(fs.readFileSync('docs/jobs-data.json','utf8'));
const clone=x=>JSON.parse(JSON.stringify(x));
const passed=[];
function test(name,fn){fn();passed.push(name);}
async function main(){
 test('최소 기준 공고와 직무·기업 연결 검증',()=>{assert.ok(validatePublicDataset(base).jobs.length>=31);});
 test('중복 공고 ID 거부',()=>{let d=clone(base);d.jobs.push(d.jobs[0]);assert.throws(()=>validatePublicDataset(d));});
 test('javascript 링크 차단',()=>{let d=clone(base);d.jobs[0].url='javascript:alert(1)';assert.throws(()=>validatePublicDataset(d));});
 test('개인 기록 최상위 데이터 포함 차단',()=>{let d=clone(base);d.notes={private:'secret'};assert.throws(()=>validatePublicDataset(d));});
 test('존재하지 않는 직무 참조 거부',()=>{let d=clone(base);d.jobs[0].roles=['missing'];assert.throws(()=>validatePublicDataset(d));});
 test('색상 스타일 주입 거부',()=>{let d=clone(base);d.companies[0].color='red;display:none';assert.throws(()=>validatePublicDataset(d));});
 let payload=clone(base),failure=false,request=null,rendered=0;
 const target=base.jobs.find(j=>j.required.length>=2),jid=target.id;
 const ctx={URL,AbortController,setTimeout,clearTimeout,Date,JSON,console,
  validatePublicDataset,
  fetch:async(url,opts)=>{request={url:String(url),opts};return {ok:!failure,status:failure?503:200,headers:{get:()=>null},text:async()=>JSON.stringify(payload)};},
  location:{href:'https://example.test/pathways/index.html#/jobs'},
  live:{mode:'online',busy:false,lastFetch:null,error:'',pending:null},
  DATA:clone(base),stored:{notes:{[jid]:'local-only'},bookmarks:[jid],checks:{[jid]:[0]}},
  state:{view:'jobs',company:'all'},
  save:()=>{},render:()=>rendered++,
  document:{activeElement:null,getElementById:()=>null},
  window:{scrollY:17,scrollTo:()=>{}},
  esc:s=>String(s).replace(/[<>]/g,''),
  job:id=>ctx.DATA.jobs.find(j=>j.id===id),
  company:id=>ctx.DATA.companies.find(c=>c.id===id)
 };
 vm.createContext(ctx);vm.runInContext(fs.readFileSync('src/live.js','utf8'),ctx);
 let fetched=await ctx.fetchPublicData();assert.equal(fetched.jobs.length,base.jobs.length);
 assert.equal(request.opts.credentials,'omit');assert.equal(request.opts.cache,'no-store');
 assert.ok(request.url.startsWith('https://example.test/pathways/jobs-data.json?'));
 passed.push('동일 출처 JSON / 인증정보 제외 / 캐시 재확인');
 payload.jobs.find(j=>j.id===jid).required.reverse();
 payload.jobs.find(j=>j.id===jid).title='changed';
 await ctx.refreshPublicData();assert.equal(ctx.DATA.jobs.find(j=>j.id===jid).title,'changed');
 assert.equal(ctx.stored.notes[jid],'local-only');assert.equal(ctx.stored.bookmarks[0],jid);
 assert.equal(ctx.stored.checks[jid][0],target.required.length-1);
 passed.push('변경 데이터 반영 / 메모·북마크 보존 / 요건 체크 재매핑');
 payload.jobs[0].title='pending-change';ctx.document.activeElement={matches:()=>true,isContentEditable:false};
 await ctx.refreshPublicData();assert.ok(ctx.live.pending);assert.notEqual(ctx.DATA.jobs[0].title,'pending-change');
 ctx.document.activeElement=null;ctx.applyPublicData(ctx.live.pending);assert.equal(ctx.DATA.jobs[0].title,'pending-change');
 passed.push('입력 중 화면 교체 지연 / 입력 종료 후 적용');
 let previous=JSON.stringify(ctx.DATA);payload.jobs[0].url='javascript:alert(1)';
 await ctx.refreshPublicData();assert.equal(ctx.live.mode,'error');assert.equal(JSON.stringify(ctx.DATA),previous);
 passed.push('잘못된 새 데이터 거부 / 정상 데이터 유지');
 failure=true;await ctx.refreshPublicData();assert.equal(ctx.live.mode,'error');assert.equal(JSON.stringify(ctx.DATA),previous);
 passed.push('네트워크 실패 시 기존 데이터 유지');
 failure=false;payload=clone(base);ctx.live.mode='manual';request=null;await ctx.refreshPublicData();assert.equal(request,null);
 passed.push('수동 미리보기 중 자동 덮어쓰기 방지');
 ctx.live.mode='local';assert.ok(ctx.liveBanner().includes('온라인 자동 반영 미연결'));
 passed.push('로컬 미연결 상태 명시');
 let interval=0;ctx.app={addEventListener:()=>{}};ctx.window.addEventListener=()=>{};ctx.document.addEventListener=()=>{};ctx.setInterval=(_f,ms)=>{interval=ms;};
 ctx.startLiveSync();assert.equal(interval,300000);passed.push('5분 화면 재확인 주기');
 // Syntax-check the actual built browser script without executing external requests.
 const html=fs.readFileSync('docs/index.html','utf8');
 const script=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)][0][1];
 new vm.Script(script);passed.push('실제 배포 HTML JavaScript 구문 검증');
 console.log(JSON.stringify({passed:passed.length,tests:passed},null,2));
}
main().catch(e=>{console.error(e);process.exit(1);});
