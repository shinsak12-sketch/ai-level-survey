// 설문 문항·점수·등급 정의. 브라우저(index.html)와 서버(api/submit.js)가 같이 쓴다.

// 문항 구성: 경험(넓이) · 상황(깊이) · 마음(점수 없음)
// noScore: 점수에 안 들어감(강사 화면 통계용) / scoreBy:'count': 고른 개수로 점수
export const QUESTIONS = [
  {
    id: 'freq',
    title: '최근 한 달, AI(챗GPT·제미나이·클로드 등)를 얼마나 썼나요?',
    options: [
      { label: '거의 안 썼다', score: 0 },
      { label: '궁금해서 한두 번', score: 1 },
      { label: '일주일에 몇 번', score: 2 },
      { label: '거의 매일 켜 둔다', score: 3 },
    ],
  },
  {
    id: 'paid',
    title: '유료 AI를 쓰고 있나요?',
    noScore: true,
    options: [
      { label: '무료만 쓴다' },
      { label: '써 봤다가 해지했다' },
      { label: '하나 쓰고 있다', paid: true },
      { label: '두 개 이상 쓴다', paid: true },
    ],
  },
  {
    id: 'feats',
    title: '써 본 기능을 모두 골라 주세요',
    hint: '해당하는 것 모두',
    multi: true,
    oneCol: true,
    scoreBy: 'count',
    options: [
      { key: 'file', label: '파일(엑셀·PDF·사진) 올려서 시키기', short: '파일 올려서 시키기' },
      { key: 'out', label: '결과를 파일로 받기(엑셀·PPT·문서)', short: '결과를 파일로 받기' },
      { key: 'image', label: '이미지 만들기', short: '이미지 만들기' },
      { key: 'voice', label: '음성으로 대화하기', short: '음성 대화' },
      { key: 'memory', label: '맞춤 지침·메모리 설정', short: '맞춤 지침·메모리' },
      { key: 'project', label: '프로젝트(자료 모아 두고 쓰기)', short: '프로젝트' },
      { key: 'skill', label: '스킬·GPTs(나만의 AI 만들기)', short: '스킬·GPTs' },
      { key: 'research', label: '딥 리서치(조사 맡기기)', short: '딥 리서치' },
      { key: 'vibe', label: '바이브코딩(말로 프로그램 만들기)', short: '바이브코딩' },
      { key: 'none', label: '아직 없음', exclusive: true },
    ],
  },
  {
    id: 'ctx',
    title: '주말 1박 2일 여행지를 물었더니 "가평, 춘천"처럼 뻔한 답이 나왔다. 나는?',
    hint: '이런 경험이 없다면, 그런 일이 생기면 어떻게 할지',
    options: [
      { label: '원래 이 정도겠지 하고 닫는다', score: 0 },
      { label: '검색창이나 블로그에서 다시 찾는다', score: 1 },
      { label: '"다른 데 더 알려 줘"라고 다시 묻는다', score: 2 },
      { label: '인원·예산·이동 수단·취향을 알려 주고 다시 부탁한다', score: 3 },
    ],
  },
  {
    id: 'delegate',
    title: '내일 아침까지 주간 보고서를 내야 한다. AI를 쓴다면?',
    options: [
      { label: '안 쓴다, 내가 쓰는 게 빠르다', score: 0 },
      { label: '문장 몇 개 다듬는 데만 쓴다', score: 1 },
      { label: '메모를 붙여 넣고 초안을 통째로 받는다', score: 2 },
      { label: '지난 보고서 양식까지 주고 그 모양대로 받는다', score: 3 },
    ],
  },
  {
    id: 'refine',
    title: 'AI가 준 결과가 70점짜리다. 나는?',
    options: [
      { label: '안 쓰고 닫는다', score: 0 },
      { label: '쓸 만한 부분만 복사해서 내가 마무리한다', score: 1 },
      { label: '"다시 해 줘"라고 한다', score: 2 },
      { label: '어디가 왜 별로인지 짚어서 고치게 한다', score: 3 },
    ],
  },
  {
    id: 'verify',
    title: 'AI가 쓴 글에 판례 번호와 날짜가 들어 있다. 나는?',
    options: [
      { label: '그럴듯하니 그대로 쓴다', score: 0 },
      { label: 'AI에게 "이거 확실해?"라고 다시 묻는다', score: 1 },
      { label: '찜찜하니 그 부분만 빼고 쓴다', score: 2 },
      { label: '원문을 찾아 맞는지 확인하고 쓴다', score: 3 },
    ],
  },
  {
    id: 'made',
    title: 'AI로 받은 것 중 실제 업무에 써 본 가장 큰 것은?',
    options: [
      { label: '아직 없다', score: 0 },
      { label: '답변이나 문장', score: 1 },
      { label: '문서·표·이미지 같은 파일', score: 2 },
      { label: '매번 쓰는 도구나 프로그램', score: 3 },
    ],
  },
  {
    id: 'know',
    title: '다음 중 AI가 가장 틀리기 쉬운 일은?',
    options: [
      { label: '긴 회의록 요약하기', score: 0 },
      { label: '고객 안내문 말투 다듬기', score: 0 },
      { label: '특정 판례의 번호와 날짜 대기', score: 3 },
      { label: '엑셀 수식 만들기', score: 0 },
    ],
  },
  {
    id: 'meh',
    title: 'AI 답을 보고 "뻔하다, 별거 없네" 싶었던 적이 있나요?',
    noScore: true,
    options: [
      { label: '자주 그렇다', meh: true },
      { label: '가끔 그렇다', meh: true },
      { label: '거의 없다' },
      { label: '써 본 게 적어서 모르겠다' },
    ],
  },
  {
    id: 'wish',
    title: 'AI한테 제일 떠넘기고 싶은 일은?',
    hint: '한 줄로 (강사 화면에 이름 없이 뜰 수 있어요)',
    text: true,
    max: 40,
  },
];

export const LEVELS = [
  {
    lv: 0, name: '관망형', title: 'AI? 아직 구경 중',
    light: '#9a8bf0', dark: '#6b5fc7',
    desc: '들어는 봤지만 손이 잘 안 가는 단계. 오늘이 시작하기 딱 좋은 날이에요.',
    next: '오늘은 AI에게 말 거는 것부터. 질문 하나만 던져 봐도 반은 왔어요.',
  },
  {
    lv: 1, name: '검색형', title: '똑똑한 검색창으로 쓰는 중',
    light: '#7c66e8', dark: '#8f7ff0',
    desc: '궁금한 걸 묻고 답을 받는 데는 익숙해요. 아직은 "물어보는" 쪽에 가까워요.',
    next: '질문 대신 "만들어 줘"라고 해 보세요. 결과물이 나오기 시작하면 Lv.2예요.',
  },
  {
    lv: 2, name: '제작형', title: 'AI로 결과물을 만든다',
    light: '#5b3fd1', dark: '#b9adff',
    desc: '문서·표·이미지처럼 손에 잡히는 결과를 AI와 같이 만들어요. 오늘 모두의 목표 지점!',
    next: '오늘 본 방법으로 내일 결과물 하나를 만들어 보세요. 반복되면 Lv.3이에요.',
  },
  {
    lv: 3, name: '자동화형', title: 'AI에게 일을 맡긴다',
    light: '#3a1f9e', dark: '#e6e0ff',
    desc: '반복되는 일을 AI가 만든 도구로 돌리고 있어요. 오늘은 동료들의 든든한 지원군!',
    next: '오늘 본 방법 하나를 옆자리 동료에게 알려 주세요. 가르치면 내 실력도 한 단계 올라가요.',
  },
];

export const MAX_SCORE = 24;

// 방 코드 기본값: 한국 날짜 YYMMDD. 강사 화면 QR에는 방 코드가 붙어 나간다.
export function defaultRoom(now = Date.now()) {
  const d = new Date(now + 9 * 3600e3);
  return d.toISOString().slice(2, 10).replace(/-/g, '');
}

// 써 본 기능 개수 → 점수: 0개 0 / 1~2개 1 / 3~4개 2 / 5개 이상 3
function countScore(n) { return n >= 5 ? 3 : n >= 3 ? 2 : n >= 1 ? 1 : 0; }

// answers: { freq: 0..3, paid, feats: ['file', ...], ctx, delegate, refine, verify, made, know, meh, wish: '...' }
export function grade(answers) {
  const a = answers || {};
  let score = 0;
  for (const q of QUESTIONS) {
    if (q.text || q.noScore) continue;
    if (q.multi) {
      const picked = q.options.filter((o) => !o.exclusive && (a[q.id] || []).includes(o.key));
      score += q.scoreBy === 'count' ? countScore(picked.length) : picked.reduce((m, o) => Math.max(m, o.score || 0), 0);
    } else {
      const o = q.options[a[q.id]];
      if (o) score += o.score || 0;
    }
  }
  const level = score >= 20 ? 3 : score >= 13 ? 2 : score >= 6 ? 1 : 0;
  return { score, level };
}

// 서버에서 들어온 값을 정리. 잘못된 값은 버린다.
export function clean(answers) {
  const a = answers || {};
  const out = {};
  for (const q of QUESTIONS) {
    if (q.text) {
      out[q.id] = String(a[q.id] || '').replace(/\s+/g, ' ').trim().slice(0, q.max);
    } else if (q.multi) {
      const keys = q.options.map((o) => o.key);
      out[q.id] = [...new Set(Array.isArray(a[q.id]) ? a[q.id] : [])].filter((k) => keys.includes(k));
    } else {
      const i = Number(a[q.id]);
      out[q.id] = Number.isInteger(i) && i >= 0 && i < q.options.length ? i : null;
    }
  }
  return out;
}

export function isPaid(answers) {
  const q = QUESTIONS.find((x) => x.id === 'paid');
  return !!q.options[answers?.paid]?.paid;
}

export function isMeh(answers) {
  const q = QUESTIONS.find((x) => x.id === 'meh');
  return !!q.options[answers?.meh]?.meh;
}
