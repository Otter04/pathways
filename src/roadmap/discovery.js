// Plain-language context for occupational exploration, not a learning checklist.
const ROLE_TERMS={
 'API':'프로그램끼리 요청과 결과를 주고받기 위해 정한 연결 규칙이에요.',
 '서버':'다른 기기의 요청을 받아 필요한 처리나 데이터를 제공하는 컴퓨터 또는 프로그램이에요.',
 '데이터베이스':'필요할 때 찾거나 바꿀 수 있도록 데이터를 정리해 보관하는 저장소예요.',
 'DB':'데이터베이스의 줄임말이에요. 데이터를 정리해서 보관하고 찾는 저장소를 뜻해요.',
 'SQL':'데이터베이스에서 필요한 데이터를 찾거나 바꾸는 데 쓰는 언어예요.',
 'HTTP':'웹에서 요청과 응답을 주고받는 규칙이에요.',
 'UI':'사용자가 보고 조작하는 화면·버튼·입력창 같은 부분이에요.',
 'UX':'제품을 사용하며 이해하고 행동하는 전체 경험이에요.',
 '인증':'접속한 사람이 누구인지 확인하는 과정이에요. 로그인 확인이 한 예예요.',
 '권한':'어떤 사람이나 프로그램이 무엇을 보고 바꿀 수 있는지 정한 범위예요.',
 '업무 로직':'주문·예약 같은 업무의 규칙을 프로그램의 처리 순서와 조건으로 표현한 것이에요.',
 '트랜잭션':'관련된 데이터 변경을 모두 성공시키거나 함께 취소하도록 묶은 처리 단위예요.',
 '멱등성':'같은 요청을 반복해서 받아도 결과가 중복해서 생기지 않게 하는 성질이에요.',
 '컴포넌트':'버튼이나 입력창처럼 여러 화면에서 다시 사용할 수 있게 묶은 부분이에요.',
 'HTML':'웹페이지에 제목·문단·버튼 같은 내용과 구조를 표시하는 언어예요.',
 'CSS':'웹페이지의 색·크기·배치 등 보이는 모습을 정하는 언어예요.',
 'JavaScript':'웹페이지의 버튼 반응이나 데이터 처리 같은 동작을 만드는 프로그래밍 언어예요.',
 'TypeScript':'값의 종류를 더 명확하게 표현할 수 있도록 JavaScript를 확장한 언어예요.',
 'React':'여러 화면 요소를 조합해 사용자 화면을 만드는 데 쓰는 개발 도구예요.',
 '접근성':'키보드나 화면 읽기 도구 등 다양한 방법으로도 제품을 이용할 수 있게 하는 특성이에요.',
 '상태':'현재 화면이나 장치가 입력 중·처리 중·완료처럼 어떤 조건에 있는지를 뜻해요.',
 '배포':'개발한 기능이나 모델을 사용자가 이용할 수 있는 실행 환경에 반영하는 일이에요.',
 '로그':'프로그램에서 언제 어떤 일이 일어났는지 남긴 기록이에요.',
 '클라우드':'필요한 서버와 저장 공간 등을 네트워크를 통해 제공받아 사용하는 방식이에요.',
 '인프라':'서비스가 돌아가는 데 필요한 서버·네트워크·저장 공간 등의 기반이에요.',
 '모델':'대상을 필요한 특성만 남겨 표현한 구조예요. AI에서는 예측·분류를 하는 계산 구조, 그래픽에서는 화면에 그릴 물체의 형태를 뜻해요.',
 '추론':'학습된 모델을 사용해 새로운 입력의 결과를 계산하는 과정이에요.',
 '색인':'정보를 빠르게 찾을 수 있도록 미리 정리한 목록이나 구조예요.',
 '전처리':'모델이나 분석 도구가 사용할 수 있도록 입력의 형식과 내용을 정리하는 과정이에요.',
 'MLOps':'AI 모델의 학습·검증·배포·운영을 반복하고 관리할 수 있도록 만드는 업무 영역이에요.',
 'DevOps':'개발과 운영이 함께 변경의 검사·배포·관찰을 개선하는 방식과 업무 영역이에요.',
 'SRE':'사용자가 서비스를 안정적으로 이용하도록 소프트웨어와 운영 방법을 개선하는 직무예요.',
 '펌웨어':'기기 안에서 센서·버튼·통신 같은 기본 동작을 제어하는 소프트웨어예요.',
 '드라이버':'운영체제와 특정 장치 사이에서 명령과 데이터를 주고받도록 돕는 소프트웨어예요.',
 '리셋':'회로나 장치의 상태를 정해진 시작 상태로 되돌리는 일이에요.',
 '클록':'회로가 동작할 시점을 맞추기 위해 일정하게 반복되는 기준 신호예요.',
 'RTL':'회로 안의 데이터가 언제 어디로 이동하고 어떻게 바뀌는지 코드로 표현하는 설계 방식이에요.',
 'FIFO':'먼저 넣은 데이터를 먼저 꺼내도록 잠시 보관하는 구조예요. 순서대로 기다리는 줄과 비슷해요.',
 'FPGA':'만든 뒤에도 내부 디지털 회로의 구성을 바꿔 사용할 수 있는 칩이에요.',
 'SoC':'계산·저장 장치 연결·입출력 등 여러 기능 회로를 하나의 칩에 모은 시스템이에요.',
 'CPU':'프로그램의 명령에 따라 계산과 처리를 수행하는 중심 장치예요.',
 'GPU':'많은 계산을 동시에 처리하는 장치예요. 화면 그리기와 AI 계산 등에 사용돼요.',
 '파형':'시간에 따라 신호가 어떻게 달라지는지 그린 그림이에요.',
 '합성':'회로 동작을 표현한 코드를 실제 논리 회로의 구성으로 바꾸는 과정이에요.',
 '테스트벤치':'회로에 시험 입력을 주고 출력이 예상과 맞는지 확인하는 검증 환경이에요.',
 'QA':'제품이 정한 요구와 사용자 흐름에 맞게 동작하는지 품질을 확인하고 개선하는 업무예요.',
 'ERP':'구매·재고·회계처럼 조직의 여러 업무와 데이터를 연결하는 시스템이에요.',
 'PoC':'큰 도입을 결정하기 전에 핵심 가능성을 작은 범위에서 확인하는 검증이에요.',
 '프로토타입':'완성하기 전에 화면이나 동작을 확인할 수 있게 만든 시제품이에요.',
 '캐시':'다시 쓸 가능성이 있는 데이터를 빠르게 꺼낼 수 있는 곳에 잠시 보관하는 공간이에요.',
 'LRU':'보관 공간이 가득 찼을 때 가장 오래 사용하지 않은 항목부터 교체하는 규칙이에요.',
 'HCI':'사람이 컴퓨터와 정보를 주고받고 사용하는 방식을 연구하는 분야예요.'
};
const ALL_ROLE_TERMS={...Object.fromEntries(Object.values(ROLE_EXAMPLES).flatMap(x=>x.terms.map(t=>[t.name,t.meaning]))),...ROLE_TERMS};
const TERM_PATTERN=new RegExp('(?<![A-Za-z0-9])('+Object.keys(ALL_ROLE_TERMS).sort((a,b)=>b.length-a.length).map(s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')(?![A-Za-z0-9])','g');
function termText(value){const text=String(value);let result='',last=0;for(const m of text.matchAll(TERM_PATTERN)){result+=esc(text.slice(last,m.index))+`<button type="button" class="term-trigger" data-action="term" data-term="${esc(m[0])}" aria-label="${esc(m[0])} 뜻 보기" aria-haspopup="dialog">${esc(m[0])}</button>`;last=m.index+m[0].length;}return result+esc(text.slice(last));}
function showTerm(name){const definition=ALL_ROLE_TERMS[name],dialog=document.getElementById('term-dialog');if(!definition||!dialog)return;dialog.innerHTML=`<div class="term-dialog-top"><span>업무 속 용어</span><button type="button" class="term-close" data-action="term-close" aria-label="용어 풀이 닫기">닫기 ×</button></div><h2 id="term-title">${esc(name)}</h2><p id="term-meaning">${esc(definition)}</p>`;dialog.showModal();}
const SEARCH_ALIASES=[
 {phrases:['게임 만드는 사람','게임 만들기','게임 제작','게임개발'],roles:['game-designer','game-client','game-server','graphics','technical-artist']},
 {phrases:['앱 만들기','앱 만드는 사람','어플 만들기','애플리케이션 만들기','앱 개발'],roles:['frontend','backend','fullstack','android','ios']},
 {phrases:['웹 만들기','웹사이트 만들기','홈페이지 만들기'],roles:['frontend','backend','fullstack']},
 {phrases:['해킹 막기','해킹 방어','해커 잡기'],roles:['security-engineer','soc-analyst','pentester','appsec','cloud-security']},
 {phrases:['로봇 만들기','로봇 개발'],roles:['robotics','firmware','embedded-linux','iot']},
 {phrases:['인공지능','ai 만들기'],roles:['ai-pm','data-scientist','ml-engineer','ai-app','mlops','ai-researcher']}
];
const normalSearch=s=>String(s).normalize('NFKC').toLocaleLowerCase().replace(/\s+/g,'').trim();
function searchRoles(query,tracks=TRACKS.map(t=>t.id)){
 const q=normalSearch(query);if(!q)return [];
 const aliasIds=SEARCH_ALIASES.filter(a=>a.phrases.some(p=>normalSearch(p)===q)).flatMap(a=>a.roles);
 const tokens=String(query).toLocaleLowerCase().trim().split(/\s+/).filter(x=>!['만드는','만들기','사람','관련','직무','직업'].includes(x)).map(normalSearch);
 return ROLES.map((r,index)=>{
  if(!tracks.includes(r.track))return {r,score:0,index};
  const name=normalSearch(r.name+' '+r.en),work=normalSearch([r.summary,...r.work].join(' ')),example=normalSearch(exampleSearchText(r)),field=normalSearch(trackBy(r.track).name+' '+subfieldForRole(r).name),skills=normalSearch(r.skills.join(' '));
  let score=name.includes(q)?100:work.includes(q)?75:aliasIds.includes(r.id)?85:example.includes(q)?55:field.includes(q)?25:skills.includes(q)?35:0;
  if(!score&&tokens.length>1&&tokens.every(t=>(name+work+example+skills).includes(t)))score=45;
  return {r,score,index};
 }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.index-b.index).map(x=>x.r);
}
