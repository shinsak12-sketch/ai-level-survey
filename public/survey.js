// 설문 문항·점수·등급 정의. 브라우저(index.html)와 서버(api/submit.js)가 같이 쓴다.

// AI 사용 경험 설문. 점수 · 등급 없이 문항별로 몇 명이 무엇을 골랐는지만 모은다.
// multi: 복수 선택 / exclusive: 고르면 나머지가 풀림 / short: 강사 화면용 짧은 이름
export const QUESTIONS = [
  {
    id: 'ai', title: '주로 쓰는 AI는?', hint: '해당하는 것 모두', multi: true, oneCol: true, headline: '우리가 쓰는 AI',
    options: [
      { key: 'chatgpt', label: 'ChatGPT' },
      { key: 'gemini', label: 'Gemini (제미나이)' },
      { key: 'claude', label: 'Claude (클로드)' },
      { key: 'grok', label: 'Grok (그록)' },
      { key: 'deepseek', label: 'DeepSeek (딥시크)' },
      { key: 'etc', label: '기타' },
      { key: 'none', label: '안 쓴다', exclusive: true },
    ],
  },
  {
    id: 'paid', title: '유료로 쓰고 있나요?', headline: '유료로 쓰는 사람',
    options: [
      { label: '무료만 쓴다' },
      { label: '써 봤다가 해지했다' },
      { label: '하나 쓴다', paid: true },
      { label: '두 개 이상 쓴다', paid: true },
    ],
  },
  {
    id: 'freq', title: '얼마나 자주 쓰나요?', headline: '얼마나 자주 쓰나',
    options: [
      { label: '거의 안 쓴다' },
      { label: '한 달에 몇 번' },
      { label: '일주일에 몇 번' },
      { label: '거의 매일' },
    ],
  },
  {
    // 추가 질문: 거의 안 쓰거나 한 달에 몇 번, 또는 '안 쓴다'를 고른 사람에게만 나온다
    id: 'why', title: '자주 안 쓰는 이유는?', hint: '해당하는 것 모두', multi: true, oneCol: true, headline: '자주 안 쓰는 이유',
    when: (a) => a.freq === 0 || a.freq === 1 || (a.ai || []).includes('none'),
    whenNote: '거의 안 쓰거나 가끔 쓰는 사람에게만 물었어요',
    options: [
      { key: 'meh', label: '답이 뻔해서 실망했다', short: '답이 뻔해서 실망' },
      { key: 'wrong', label: '틀린 답 · 지어낸 답이 나와서', short: '틀린 답이 나와서' },
      { key: 'what', label: '뭘 시켜야 할지 모르겠다', short: '뭘 시킬지 몰라서' },
      { key: 'hard', label: '쓰는 법이 어렵고 귀찮다', short: '쓰는 법이 어려워서' },
      { key: 'faster', label: '내가 직접 하는 게 더 빠르다', short: '직접 하는 게 빨라서' },
      { key: 'secure', label: '회사 자료를 넣기 걱정된다(보안)', short: '보안이 걱정돼서' },
      { key: 'cost', label: '유료가 비싸다', short: '유료가 비싸서' },
      { key: 'need', label: '딱히 필요를 못 느낀다', short: '필요를 못 느껴서' },
      { key: 'etc', label: '기타' },
    ],
  },
  {
    id: 'since', title: 'AI를 처음 써 본 건 언제인가요?', headline: '처음 써 본 때',
    options: [
      { label: '2023년 이전' },
      { label: '2024년' },
      { label: '2025년' },
      { label: '2026년' },
      { label: '아직 안 써 봤다' },
    ],
  },
  {
    id: 'where', title: '어디에 쓰나요?', headline: '어디에 쓰나',
    options: [
      { label: '업무에만' },
      { label: '개인 생활에만' },
      { label: '업무와 개인 둘 다' },
      { label: '아직 안 쓴다' },
    ],
  },
  {
    id: 'uses', title: '주로 무슨 일에 쓰나요?', hint: '해당하는 것 모두', multi: true, oneCol: true, headline: '주로 하는 일',
    options: [
      { key: 'search', label: '검색 · 질문' },
      { key: 'write', label: '문서 · 메일 작성' },
      { key: 'summary', label: '요약 · 번역' },
      { key: 'excel', label: '엑셀 · 표' },
      { key: 'idea', label: '아이디어 · 기획' },
      { key: 'image', label: '이미지 · 영상' },
      { key: 'study', label: '공부' },
      { key: 'code', label: '프로그램 만들기' },
      { key: 'none', label: '아직 없다', exclusive: true },
    ],
  },
  {
    id: 'feats', title: '써 본 기능을 모두 골라 주세요', hint: '해당하는 것 모두', multi: true, oneCol: true, headline: '써 본 기능',
    options: [
      { key: 'file', label: '파일(엑셀·PDF·사진) 올려서 시키기', short: '파일 올려서 시키기' },
      { key: 'out', label: '결과를 파일로 받기(엑셀·PPT·문서)', short: '결과를 파일로 받기' },
      { key: 'voice', label: '음성으로 대화하기', short: '음성 대화' },
      { key: 'memory', label: '맞춤 지침 · 메모리 설정', short: '맞춤 지침 · 메모리' },
      { key: 'project', label: '프로젝트(자료 모아 두고 쓰기)', short: '프로젝트' },
      { key: 'skill', label: '스킬 · GPTs(나만의 AI 만들기)', short: '스킬 · GPTs' },
      { key: 'research', label: '딥 리서치(조사 맡기기)', short: '딥 리서치' },
      { key: 'vibe', label: '바이브코딩(말로 프로그램 만들기)', short: '바이브코딩' },
      { key: 'none', label: '써 본 기능이 없다', exclusive: true },
    ],
  },
  {
    id: 'saved', title: 'AI 덕분에 하루에 아끼는 시간은?', headline: '하루에 아끼는 시간',
    options: [
      { label: '없다' },
      { label: '10분 미만' },
      { label: '10~30분' },
      { label: '30분~1시간' },
      { label: '1시간 이상' },
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

export const CHART_QS = QUESTIONS.filter((q) => !q.text);

// 이 사람에게 나오는 문항인지 (when 이 있는 추가 질문은 앞 답에 따라 나온다)
export function asked(q, answers) {
  return !q.when || !!q.when(answers || {});
}

// 방 코드 기본값: 한국 날짜 YYMMDD. 강사 화면 QR에는 방 코드가 붙어 나간다.
export function defaultRoom(now = Date.now()) {
  const d = new Date(now + 9 * 3600e3);
  return d.toISOString().slice(2, 10).replace(/-/g, '');
}

// 서버에서 들어온 값을 정리. 잘못된 값은 버린다.
export function clean(answers) {
  const a = answers || {};
  const out = {};
  for (const q of QUESTIONS) {
    if (!asked(q, out)) {
      out[q.id] = q.multi ? [] : null;
    } else if (q.text) {
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

// 문항별 집계. answersList: [{ai:[...], paid:2, ...}, ...]
// 결과: { qid: { n: 답한 사람 수, counts: [보기별 인원] } }
export function tally(answersList) {
  const out = {};
  for (const q of CHART_QS) {
    const counts = q.options.map(() => 0);
    let n = 0;
    for (const a of answersList) {
      const v = a?.[q.id];
      if (q.multi) {
        if (!Array.isArray(v) || !v.length) continue;
        n++;
        q.options.forEach((o, i) => { if (v.includes(o.key)) counts[i]++; });
      } else if (Number.isInteger(v) && v >= 0 && v < q.options.length) {
        n++; counts[v]++;
      }
    }
    out[q.id] = { n, counts };
  }
  return out;
}
