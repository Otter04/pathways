// Navigation categories are editorial groupings, not an official occupation taxonomy.
const EXPLORER = {
 product:{lead:'사람들의 불편을 발견하고, 어떤 서비스를 만들지 정해요.',question:'무엇을 만들고, 왜 만들어야 할까?',neighbors:['ux','consult','software'],groups:[
 ['product-direction','제품의 방향과 가치','해결할 문제와 우선순위를 정하고 제품의 성과를 살펴봐요.',['product-manager','product-owner','ai-pm']],
 ['service-design','서비스와 업무 설계','아이디어와 현업의 요구를 구체적인 기능·규칙으로 바꿔요.',['service-planner','business-analyst']],
 ['technical-planning','기술 제품과 프로젝트','기술 제품을 기획하거나 여러 팀의 실행을 조율해요.',['technical-product','project-manager','technical-program']]]},
 ux:{lead:'사람이 제품을 이해하고 편하게 쓰도록 경험을 설계해요.',question:'어떻게 하면 더 쉽고 편하게 쓸 수 있을까?',neighbors:['product','software','research'],groups:[
 ['user-understanding','사용자 이해','사람이 무엇을 필요로 하고 어디서 어려움을 겪는지 조사해요.',['ux-researcher']],
 ['experience-design','화면과 언어 설계','제품의 화면·상호작용·문장을 이해하기 쉽게 만들어요.',['product-designer','ux-writer']],
 ['design-code','디자인 구현','디자인을 코드로 실험하고 재사용할 수 있게 만들어요.',['ux-engineer']]]},
 software:{lead:'웹과 앱부터 시스템까지, 작동하는 소프트웨어를 만들어요.',question:'아이디어를 실제로 동작하는 기능으로 만들려면?',neighbors:['product','cloud','qa'],groups:[
 ['web','웹 서비스','브라우저의 화면과 서버의 기능을 연결해 서비스를 만들어요.',['frontend','backend','fullstack']],
 ['mobile','모바일 앱','스마트폰과 태블릿에서 사용하는 앱을 만들어요.',['android','ios']],
 ['systems','시스템 소프트웨어','운영체제와 저수준 프로그램의 동작·성능을 다뤄요.',['system-dev']]]},
 ai:{lead:'데이터에서 의미를 찾고, AI가 실제 문제를 풀도록 만들어요.',question:'데이터와 AI로 무엇을 이해하고 해결할 수 있을까?',neighbors:['software','cloud','research'],groups:[
 ['analysis','분석과 의사결정','숫자와 실험으로 현상을 설명하고 다음 선택을 도와요.',['data-analyst','data-scientist']],
 ['data-foundation','데이터 기반','분석과 모델에 필요한 데이터를 모으고 신뢰할 수 있게 정리해요.',['data-engineer','analytics-engineer']],
 ['models-services','모델과 AI 서비스','모델을 학습·평가하거나 기존 모델을 사용자 서비스에 연결해요.',['ml-engineer','ai-app']],
 ['ai-platform','AI 운영 기반','모델의 학습과 배포를 반복할 수 있는 환경을 만들어요.',['mlops']]]},
 cloud:{lead:'서비스가 안정적으로 돌아가도록 실행 환경과 운영 기반을 만들어요.',question:'많은 사람이 계속 써도 서비스가 잘 돌아가려면?',neighbors:['software','security','ai'],groups:[
 ['infrastructure','서버·네트워크·데이터베이스','서비스가 실행되고 데이터를 보관하는 기반을 구성·관리해요.',['cloud-engineer','system-admin','dba']],
 ['delivery','배포와 개발 환경','개발자가 더 쉽게 배포하고 운영할 수 있도록 자동화해요.',['devops','platform']],
 ['reliability','서비스 신뢰성','장애와 반복 운영 문제를 찾아 소프트웨어로 개선해요.',['sre']]]},
 security:{lead:'시스템의 약점을 찾고, 정보와 서비스를 안전하게 지켜요.',question:'무엇이 위험하고 어떻게 예방·대응할 수 있을까?',neighbors:['cloud','software','consult'],groups:[
 ['defense','방어와 사고 대응','위험 신호를 관찰하고 방어 체계와 사고 대응을 운영해요.',['security-engineer','soc-analyst']],
 ['secure-development','안전한 개발과 진단','허가된 범위에서 취약점을 찾고 개발·설정 단계부터 위험을 줄여요.',['pentester','appsec','cloud-security']],
 ['governance','정책과 위험 관리','조직의 정보보호 기준과 관리 체계를 마련해요.',['security-grc']]]},
 embedded:{lead:'코드가 센서와 기기를 움직이도록 소프트웨어와 하드웨어를 연결해요.',question:'프로그램으로 현실의 기기를 움직이려면?',neighbors:['hardware','software','ai'],groups:[
 ['device-software','기기의 기본 동작','장치 제어 코드와 제품의 운영체제를 만들어요.',['firmware','embedded-linux']],
 ['connected-devices','연결된 기기와 차량','기기의 통신·제어 기능을 시스템에 연결해요.',['iot','automotive-sw']],
 ['robotics','로봇 소프트웨어','로봇이 주변을 이해하고 움직이는 기능을 연결해요.',['robotics']]]},
 hardware:{lead:'컴퓨터의 계산을 실제로 수행하는 회로와 칩을 설계하고 검증해요.',question:'프로그램이 동작할 회로와 칩은 어떻게 만들까?',neighbors:['embedded','software','research'],groups:[
 ['chip-design','회로와 칩 설계','디지털 회로의 동작과 칩 안의 구성 요소를 설계해요.',['rtl','soc']],
 ['programmable','프로그래밍 가능한 회로','용도에 맞게 논리 회로의 기능을 구현해요.',['fpga']],
 ['chip-validation','설계 검증','설계한 회로가 사양대로 동작하는지 확인해요.',['verification']]]},
 game:{lead:'게임의 규칙부터 실시간 화면까지, 플레이 경험을 만들어요.',question:'재미있는 규칙과 생생한 화면을 어떻게 구현할까?',neighbors:['software','ux','hardware'],groups:[
 ['game-design','게임 경험과 규칙','게임의 성장·보상·콘텐츠 구조를 설계해요.',['game-designer']],
 ['game-development','게임 프로그래밍','플레이어 기기와 서버에서 게임이 동작하도록 만들어요.',['game-client','game-server']],
 ['visual-tech','그래픽과 제작 기술','실시간 화면과 아트 제작 과정의 기술을 개선해요.',['graphics','technical-artist']]]},
 qa:{lead:'기능과 성능을 확인해 사용자가 믿고 쓸 수 있는 제품을 만들어요.',question:'원하는 대로 동작하고, 충분히 빠르고 안정적일까?',neighbors:['software','cloud','product'],groups:[
 ['quality','제품 품질 검증','사용자의 흐름과 요구사항에 맞춰 품질을 살펴봐요.',['qa-engineer']],
 ['automation-performance','자동화와 성능','반복 검증을 자동화하고 부하가 걸린 상황을 시험해요.',['test-automation','performance-test']]]},
 consult:{lead:'기업과 고객의 문제를 이해하고, 필요한 기술과 운영 방식을 연결해요.',question:'조직의 문제에 어떤 기술과 변화가 필요할까?',neighbors:['product','cloud','security'],groups:[
 ['strategy','진단과 IT 전략','기업의 문제를 분석하고 기술 도입의 방향을 제안해요.',['it-consultant','it-strategy']],
 ['solutions','솔루션 설계와 도입','고객 요구에 맞는 제품과 시스템을 설계·검증·적용해요.',['solution-engineer','solution-architect','erp-consultant']],
 ['operations','지원과 운영 개선','제품 사용 과정의 문제와 반복 업무를 개선해요.',['it-support','product-ops']]]},
 research:{lead:'아직 풀리지 않은 질문을 세우고, 새로운 방법을 실험해요.',question:'지금의 방법보다 더 나은 방법이 있을까?',neighbors:['ai','hardware','ux'],groups:[
 ['ai-methods','AI 방법 연구','모델과 학습 방법에 관한 새로운 가설을 실험해요.',['ai-researcher']],
 ['computer-systems','컴퓨터 시스템 연구','운영체제·분산 시스템·컴퓨터구조를 연구해요.',['systems-researcher']],
 ['human-computer','사람과 컴퓨터 연구','사람과 컴퓨터 사이의 새로운 상호작용을 탐구해요.',['hci-researcher']]]}
};
const INTERESTS=[
 {id:'all',label:'전체 분야',tracks:[]},
 {id:'make',label:'화면과 서비스를 만들고 싶어요',tracks:['software','game','ux']},
 {id:'people',label:'사람과 문제를 이해하고 싶어요',tracks:['product','ux','consult']},
 {id:'data',label:'데이터와 AI가 궁금해요',tracks:['ai','research']},
 {id:'operate',label:'안정적으로 운영하고 지키고 싶어요',tracks:['cloud','security','qa']},
 {id:'devices',label:'기기와 새로운 기술이 좋아요',tracks:['embedded','hardware','research']}
];
const subfieldsFor=id=>EXPLORER[id].groups.map(([id,name,summary,roles])=>({id,name,summary,roles}));
const subfieldForRole=r=>subfieldsFor(r.track).find(g=>g.roles.includes(r.id));
