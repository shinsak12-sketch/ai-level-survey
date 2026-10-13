/* 센터원 업무 공유 — 화면 (사이트: 실제 저장 / 강의안: 가짜 예시 데이터)
   CenterApp.mount(el, { mode:'live'|'demo', room, api, step, tab, notch }) */
(function () {
  'use strict';

  var STATES = [
    ['출근', '#0F9F8F'], ['외근', '#2F80ED'], ['휴가', '#E5484D'],
    ['반차', '#E59A12'], ['교육', '#8B5CF6'], ['재택', '#8C8BA0'],
  ];
  var CATS = [
    ['공업사', '#2F80ED', 'wrench'], ['병원', '#E5484D', 'cross'], ['렌트', '#0F9F8F', 'car'],
    ['견인', '#E59A12', 'truck'], ['노하우', '#8B5CF6', 'bulb'], ['기타', '#8C8BA0', 'dot'],
  ];
  var ICON = {
    home: '<path d="M3 11l9-7 9 7"/><path d="M5 10v10h14V10"/>',
    swap: '<path d="M7 7h12l-3-3"/><path d="M17 17H5l3 3"/>',
    book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 19V5"/>',
    pin: '<path d="M12 17v4"/><path d="M8 3h8l-1 6 3 4H6l3-4z"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10 20a2 2 0 0 0 4 0"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    check: '<path d="M5 12l5 5 9-10"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    warn: '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.5"/>',
    wrench: '<path d="M14 6a4 4 0 0 0 5 5l-9 9-3-3 9-9a4 4 0 0 0-2-2z"/>',
    cross: '<path d="M10 4h4v6h6v4h-6v6h-4v-6H4v-4h6z"/>',
    car: '<path d="M5 16l1.5-5h11L19 16"/><rect x="3" y="16" width="18" height="4" rx="1"/><circle cx="7" cy="20" r="1.5"/><circle cx="17" cy="20" r="1.5"/>',
    truck: '<path d="M2 6h11v10H2z"/><path d="M13 10h4l4 4v2h-8z"/><circle cx="6" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
    bulb: '<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.5 10.9V16h7v-2.1A6 6 0 0 0 12 3z"/>',
    dot: '<circle cx="12" cy="12" r="4"/>',
  };
  function svg(n) { return '<svg viewBox="0 0 24 24">' + ICON[n] + '</svg>'; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function kst(d) { return new Date((d || Date.now()) + 9 * 3600e3); }
  function today() { return kst().toISOString().slice(0, 10); }
  function addDays(n) { return kst(Date.now() + n * 864e5).toISOString().slice(0, 10); }
  function prettyDate() {
    var d = kst(); var w = '일월화수목금토'[d.getUTCDay()];
    return (d.getUTCMonth() + 1) + '월 ' + d.getUTCDate() + '일 (' + w + ')';
  }
  function ago(ms) {
    var s = (Date.now() - ms) / 1000;
    if (s < 60) return '방금'; if (s < 3600) return Math.floor(s / 60) + '분 전';
    if (s < 86400) return Math.floor(s / 3600) + '시간 전'; return Math.floor(s / 86400) + '일 전';
  }
  function dday(due) {
    if (!due) return null;
    var diff = Math.round((Date.parse(due) - Date.parse(today())) / 864e5);
    if (diff === 0) return ['오늘까지', ''];
    if (diff < 0) return [(-diff) + '일 지남', ''];
    return ['D-' + diff, diff > 2 ? 'ok' : ''];
  }
  function stateColor(s) { for (var i = 0; i < STATES.length; i++) if (STATES[i][0] === s) return STATES[i][1]; return '#8C8BA0'; }
  function cat(c) { for (var i = 0; i < CATS.length; i++) if (CATS[i][0] === c) return CATS[i]; return CATS[5]; }
  var AV = ['#4338CA', '#0F9F8F', '#E5484D', '#E59A12', '#2F80ED', '#8B5CF6', '#C2410C', '#0B7A6C'];
  function avColor(name) { var h = 0; for (var i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0; return AV[h % AV.length]; }

  // ---------- 예시 데이터 (모두 가짜)
  function sample() {
    var t = today();
    return [
      { kind: 'notice', author: '윤센터', data: { text: '이번 주 금요일 오후 4시 센터 회의 (3층 회의실)\n미결 건 현황 챙겨 와 주세요.', pin: true } },
      { kind: 'notice', author: '이대물', data: { text: '렌트 협력업체 단가표가 바뀌었어요. 노하우 탭에 올려 뒀습니다.' } },
      { kind: 'notice', author: '박총무', data: { text: '연말 휴가 신청은 이번 달 말까지 부탁드립니다.' } },
      { kind: 'status', author: '이대물', data: { date: t, state: '외근', note: '가나공업사 현장 확인, 15시 복귀' } },
      { kind: 'status', author: '박대인', data: { date: t, state: '휴가', sub: '최렌트' } },
      { kind: 'status', author: '최렌트', data: { date: t, state: '출근' } },
      { kind: 'status', author: '정사정', data: { date: t, state: '교육', note: '오전 교육, 오후 복귀' } },
      { kind: 'status', author: '한과실', data: { date: t, state: '반차', note: '오후 반차', sub: '김보상' } },
      { kind: 'status', author: '윤센터', data: { date: t, state: '출근' } },
      { kind: 'handover', author: '박대인', data: { caseNo: '2026-000123', title: '후미 추돌 · 수리 진행', to: '최렌트', progress: '공업사 입고, 견적 확인 완료. 렌트 사용 중', next: '출고 예정일 확인 후 렌트 종료 안내', due: addDays(1) } },
      { kind: 'handover', author: '박대인', data: { caseNo: '2026-000187', title: '주차장 접촉 · 과실 협의', to: '최렌트', progress: '상대 보험사와 과실 협의 중', next: '상대사 회신 오면 고객에게 통화', due: addDays(3) } },
      { kind: 'handover', author: '한과실', data: { caseNo: '2026-000201', title: '통원 치료 · 서류 대기', to: '김보상', progress: '진단서 접수, 통원 확인서 미제출', next: '고객에게 서류 재요청 문자', due: t } },
      { kind: 'handover', author: '정사정', data: { caseNo: '2026-000099', title: '단독 사고 · 지급 완료', to: '이대물', progress: '지급 완료', next: '종결 처리' }, done: true },
      { kind: 'tip', author: '이대물', data: { cat: '공업사', name: '가나공업사 (예시)', area: '○○구', phone: '02-000-1234', text: '수입차 판금 잘함. 견적 사진을 바로 보내 줌' } },
      { kind: 'tip', author: '최렌트', data: { cat: '병원', name: '다라정형외과 (예시)', area: '△△동', phone: '02-000-5678', text: '서류 발급이 빠름. 오전 방문 추천' } },
      { kind: 'tip', author: '이대물', data: { cat: '렌트', name: '마바렌트 (예시)', phone: '1588-0000', text: '야간 · 주말 배차 가능. 협력 단가는 공지 참고' } },
      { kind: 'tip', author: '정사정', data: { cat: '견인', name: '사아견인 (예시)', phone: '010-0000-0000', text: '고속도로 출동이 빠름' } },
      { kind: 'tip', author: '윤센터', data: { cat: '노하우', name: '과실 협의 전 체크', text: '블랙박스 원본부터 확보 → 과실비율 기준에서 사고 유형 먼저 찾아 두기' } },
      { kind: 'tip', author: '최렌트', data: { cat: '노하우', name: '렌트 종료 안내 요령', text: '출고 확정 연락 받은 날 바로 렌트 종료 안내. 반납 시간까지 같이 안내' } },
    ];
  }

  // ---------- 저장소: 강의안용 (메모리)
  var demoItems = null;
  function demoStore() {
    if (!demoItems) {
      var base = Date.now();
      demoItems = sample().map(function (x, i) {
        return { id: 'd' + i, kind: x.kind, author: x.author, data: x.data, done: !!x.done, at: base - (i + 1) * 47 * 60e3, mine: x.author === '김보상' };
      });
    }
    return {
      load: function () { return Promise.resolve({ today: today(), items: demoItems.slice() }); },
      send: function (a) {
        if (a.op === 'delete') demoItems = demoItems.filter(function (x) { return x.id !== a.id; });
        else if (a.op === 'done') demoItems.forEach(function (x) { if (x.id === a.id) x.done = !x.done; });
        else if (a.op === 'add') {
          if (a.kind === 'status') demoItems = demoItems.filter(function (x) { return !(x.kind === 'status' && x.mine); });
          demoItems.unshift({ id: 'n' + Date.now(), kind: a.kind, author: a.author, data: a.data, done: false, at: Date.now(), mine: true });
        }
        return Promise.resolve({ ok: true });
      },
    };
  }

  // ---------- 저장소: 사이트용 (서버)
  function liveStore(api, room, cid) {
    return {
      load: function () {
        return fetch(api + '?room=' + encodeURIComponent(room), { headers: { 'x-cid': cid }, cache: 'no-store' })
          .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.error || r.status); return j; }); });
      },
      send: function (a) {
        a.room = room; a.cid = cid;
        return fetch(api, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(a) })
          .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.error || r.status); return j; }); });
      },
    };
  }

  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  function mount(root, opts) {
    opts = opts || {};
    var live = opts.mode === 'live';
    var step = live ? 5 : (opts.step || 4);
    var tabs = [['home', '홈', 'home']];
    if (step >= 3) tabs.push(['handover', '인수인계', 'swap']);
    if (step >= 4) tabs.push(['tips', '노하우', 'book']);
    var tab = opts.tab || 'home';
    var me = live ? (lsGet('ca:name') || '') : '김보상';
    var cid = lsGet('ca:cid');
    if (!cid) { cid = 'c' + Math.random().toString(36).slice(2) + Date.now().toString(36); lsSet('ca:cid', cid); }
    var store = live ? liveStore(opts.api || '/api/center', opts.room || 'main', cid) : demoStore();
    var data = { today: today(), items: [] };
    var hoFilter = 'all', tipCat = '전체', query = '';
    var online = true, lastJson = '';

    root.classList.add('ca');
    root.innerHTML = '';
    var head = el('div', 'ca-head' + (opts.notch ? ' pad-top' : ''));
    var scroll = el('div', 'ca-scroll');
    var bar = el('div', 'ca-tabbar');
    root.appendChild(head); root.appendChild(scroll);
    if (tabs.length > 1) root.appendChild(bar);

    function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
    function toast(msg) { var t = el('div', 'ca-toast', esc(msg)); root.appendChild(t); setTimeout(function () { t.remove(); }, 1800); }
    function of(kind) { return data.items.filter(function (x) { return x.kind === kind; }); }

    function refresh() {
      return store.load().then(function (d) {
        online = true;
        var j = JSON.stringify(d);
        if (j !== lastJson) { lastJson = j; data = d; draw(); } else drawHead();
      }, function (e) { online = false; drawHead(); if (live && !data.items.length) scroll.innerHTML = '<div class="ca-sec"><div class="ca-empty">불러오지 못했어요. 잠시 후 다시 시도해 주세요.<br>' + esc(e.message) + '</div></div>'; });
    }
    function act(a) {
      if (live && !me) { askName(function () { act(a); }); return; }
      a.author = me;
      return store.send(a).then(refresh, function (e) { toast('저장하지 못했어요: ' + e.message); });
    }

    // ---------- 머리
    function drawHead() {
      var st = of('status'); var cnt = {};
      st.forEach(function (s) { cnt[s.data.state] = (cnt[s.data.state] || 0) + 1; });
      var sum = ['출근', '외근', '휴가', '반차', '교육', '재택'].filter(function (k) { return cnt[k]; })
        .map(function (k) { return '<span>' + k + '<b>' + cnt[k] + '</b></span>'; }).join('');
      head.innerHTML =
        '<div class="ca-top"><div class="ca-logo"><i>C1</i>센터원</div>' +
        '<button class="ca-me" data-a="name">' + svg('user') + esc(me || '이름 설정') + '</button></div>' +
        '<div class="ca-date">' + prettyDate() + (live ? ' · <span class="ca-live' + (online ? '' : ' off') + '"><i></i>' + (online ? '실시간' : '연결 끊김') + '</span>' : '') + '</div>' +
        '<div class="ca-title">' + (tab === 'home' ? '오늘 우리 센터' : tab === 'handover' ? '인수인계' : '센터 노하우') + '</div>' +
        (tab === 'home' && sum ? '<div class="ca-sum">' + sum + '</div>' : '');
    }

    // ---------- 홈: 공지 + 근무 현황
    function drawHome() {
      var notices = of('notice').sort(function (a, b) { return (b.data.pin ? 1 : 0) - (a.data.pin ? 1 : 0) || b.at - a.at; });
      var st = of('status');
      var mine = st.filter(function (s) { return s.mine; })[0];
      var h = (live ? '<div class="ca-warn">' + svg('warn') + '<span>교육용 공유 공간이에요. 실제 고객 이름 · 연락처 · 주민번호는 넣지 마세요.</span></div>' : '');
      h += '<div class="ca-sec"><div class="ca-sec-h"><h3>' + svg('bell') + '공지</h3><button class="ca-add" data-a="notice">' + svg('plus') + '공지</button></div><div class="ca-list">';
      h += notices.length ? notices.map(function (n) {
        return '<div class="ca-card ca-notice' + (n.data.pin ? ' pinned' : '') + '"><span class="pin">' + svg(n.data.pin ? 'pin' : 'bell') + '</span><div style="flex:1;min-width:0"><div class="tx">' + esc(n.data.text) + '</div>' +
          '<div class="ca-meta">' + esc(n.author) + ' · ' + ago(n.at) + (n.mine ? ' <button class="ca-del" data-del="' + n.id + '">삭제</button>' : '') + '</div></div></div>';
      }).join('') : '<div class="ca-empty">아직 공지가 없어요</div>';
      h += '</div></div>';

      h += '<div class="ca-sec"><div class="ca-sec-h"><h3>' + svg('user') + '오늘 근무 <small>' + st.length + '명</small></h3></div>';
      h += '<div class="ca-card"><div style="font-weight:800;font-size:.8em;color:var(--sub);margin-bottom:.5em">내 상태 ' + (mine ? '· <b style="color:var(--ink)">' + esc(mine.data.state) + '</b>' : '선택') + '</div><div class="ca-mystat">' +
        STATES.map(function (s) { var on = mine && mine.data.state === s[0]; return '<button class="ca-chip' + (on ? ' on' : '') + '" style="' + (on ? 'background:' + s[1] : '') + '" data-st="' + s[0] + '">' + s[0] + '</button>'; }).join('') +
        '</div></div>';
      var order = {}; STATES.forEach(function (s, i) { order[s[0]] = i; });
      st.sort(function (a, b) { return (order[a.data.state] - order[b.data.state]) || a.author.localeCompare(b.author); });
      h += '<div class="ca-people">' + (st.length ? st.map(function (s) {
        var c = stateColor(s.data.state);
        var note = [s.data.note, s.data.sub ? '대직 ' + s.data.sub : ''].filter(Boolean).join(' · ');
        return '<div class="ca-card ca-person"><span class="ca-av" style="background:' + avColor(s.author) + '">' + esc(s.author.slice(0, 1)) + '</span>' +
          '<div><div class="nm">' + esc(s.author) + (s.mine ? ' <small style="color:var(--faint)">(나)</small>' : '') + '</div>' + (note ? '<div class="nt">' + esc(note) + '</div>' : '') + '</div>' +
          '<span class="ca-badge" style="background:' + c + '">' + esc(s.data.state) + '</span></div>';
      }).join('') : '<div class="ca-empty">아직 아무도 체크하지 않았어요</div>') + '</div></div>';
      return h;
    }

    // ---------- 인수인계
    function drawHandover() {
      var all = of('handover').sort(function (a, b) { return (a.done - b.done) || String(a.data.due || '9').localeCompare(String(b.data.due || '9')) || b.at - a.at; });
      var list = all.filter(function (x) {
        if (hoFilter === 'tome') return !x.done && x.data.to === me;
        if (hoFilter === 'byme') return !x.done && x.author === me;
        if (hoFilter === 'done') return x.done;
        return !x.done;
      });
      var tome = all.filter(function (x) { return !x.done && x.data.to === me; }).length;
      var h = '<div class="ca-sec"><div class="ca-sec-h"><h3>' + svg('swap') + '진행 중 <small>' + all.filter(function (x) { return !x.done; }).length + '건</small></h3><button class="ca-add" data-a="handover">' + svg('plus') + '인수인계</button></div>';
      h += '<div class="ca-filter">' + [['all', '전체'], ['tome', '나에게 온 것' + (tome ? ' ' + tome : '')], ['byme', '내가 넘긴 것'], ['done', '완료']].map(function (f) {
        return '<button class="' + (hoFilter === f[0] ? 'on' : '') + '" data-hf="' + f[0] + '">' + f[1] + '</button>';
      }).join('') + '</div><div class="ca-list">';
      h += list.length ? list.map(function (x) {
        var d = x.done ? null : dday(x.data.due);
        return '<div class="ca-card ca-ho' + (x.done ? ' done' : '') + '"><div class="row1"><span class="no">' + esc(x.data.caseNo || '번호 없음') + '</span>' + (d ? '<span class="due ' + d[1] + '">' + d[0] + '</span>' : '') + '</div>' +
          '<div class="tt">' + esc(x.data.title) + '</div>' +
          '<div class="flow"><b>' + esc(x.author) + '</b>' + svg('arrow') + '<b>' + esc(x.data.to || '누구나') + '</b></div>' +
          (x.data.progress ? '<div class="box"><em>진행 상황</em>' + esc(x.data.progress) + '</div>' : '') +
          (x.data.next ? '<div class="box"><em>다음 할 일</em>' + esc(x.data.next) + '</div>' : '') +
          '<div class="acts"><span class="ca-meta">' + ago(x.at) + (x.mine ? ' <button class="ca-del" data-del="' + x.id + '">삭제</button>' : '') + '</span>' +
          '<button class="ca-done-btn" data-done="' + x.id + '">' + svg('check') + (x.done ? '되돌리기' : '처리 완료') + '</button></div></div>';
      }).join('') : '<div class="ca-empty">' + (hoFilter === 'tome' ? '나에게 온 인수인계가 없어요' : '해당하는 인수인계가 없어요') + '</div>';
      return h + '</div></div>';
    }

    // ---------- 노하우
    function hl(s) {
      var t = esc(s); if (!query) return t;
      var q = esc(query).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return t.replace(new RegExp(q, 'gi'), function (m) { return '<mark class="ca-hl">' + m + '</mark>'; });
    }
    function drawTips() {
      var q = query.toLowerCase();
      var list = of('tip').filter(function (x) {
        if (tipCat !== '전체' && x.data.cat !== tipCat) return false;
        if (!q) return true;
        return [x.data.name, x.data.area, x.data.phone, x.data.text, x.data.cat, x.author].join(' ').toLowerCase().indexOf(q) >= 0;
      }).sort(function (a, b) { return b.at - a.at; });
      var h = '<div class="ca-sec"><div class="ca-search">' + svg('search') + '<input id="caQ" placeholder="공업사, 병원, 지역, 노하우 검색" value="' + esc(query) + '"></div>';
      h += '<div class="ca-filter">' + ['전체'].concat(CATS.map(function (c) { return c[0]; })).map(function (c) {
        return '<button class="' + (tipCat === c ? 'on' : '') + '" data-tc="' + c + '">' + c + '</button>';
      }).join('') + '</div>';
      h += '<div class="ca-sec-h"><h3>' + svg('book') + '목록 <small>' + list.length + '개</small></h3><button class="ca-add" data-a="tip">' + svg('plus') + '등록</button></div><div class="ca-list">';
      h += list.length ? list.map(function (x) {
        var c = cat(x.data.cat);
        return '<div class="ca-card ca-tip"><span class="ic" style="background:' + c[1] + '">' + svg(c[2]) + '</span><div style="min-width:0">' +
          '<div class="nm">' + hl(x.data.name) + '<span class="cat">' + esc(x.data.cat) + (x.data.area ? ' · ' + hl(x.data.area) : '') + '</span></div>' +
          (x.data.text ? '<div class="tx">' + hl(x.data.text) + '</div>' : '') +
          (x.data.phone ? '<a class="ph" href="tel:' + esc(x.data.phone.replace(/[^0-9+]/g, '')) + '">' + svg('phone') + hl(x.data.phone) + '</a>' : '') +
          '<div class="ca-meta">' + esc(x.author) + ' · ' + ago(x.at) + (x.mine ? ' <button class="ca-del" data-del="' + x.id + '">삭제</button>' : '') + '</div></div></div>';
      }).join('') : '<div class="ca-empty">' + (q ? '"' + esc(query) + '" 검색 결과가 없어요' : '아직 등록된 게 없어요') + '</div>';
      return h + '</div></div>';
    }

    function draw() {
      drawHead();
      var keepFocus = document.activeElement && document.activeElement.id === 'caQ' && root.contains(document.activeElement);
      var pos = keepFocus ? document.activeElement.selectionStart : 0;
      var y = scroll.scrollTop;
      var h = tab === 'home' ? drawHome() : tab === 'handover' ? drawHandover() : drawTips();
      if (live && !data.items.length && online) h += '<div class="ca-seed"><button data-a="seed">예시 데이터로 채워 보기</button></div>';
      scroll.innerHTML = h;
      scroll.scrollTop = y;
      if (keepFocus) { var q = root.querySelector('#caQ'); q.focus(); q.setSelectionRange(pos, pos); }
      var tome = of('handover').filter(function (x) { return !x.done && x.data.to === me; }).length;
      bar.innerHTML = tabs.map(function (t) {
        return '<button class="' + (tab === t[0] ? 'on' : '') + '" data-tab="' + t[0] + '">' + svg(t[2]) + '<span>' + t[1] + '</span>' + (t[0] === 'handover' && tome ? '<span class="dot">' + tome + '</span>' : '') + '</button>';
      }).join('');
    }

    // ---------- 입력 시트
    function sheet(title, body, onSubmit) {
      var bg = el('div', 'ca-sheet-bg');
      bg.innerHTML = '<div class="ca-sheet"><h4>' + esc(title) + '<button class="ca-x" data-x>' + svg('x') + '</button></h4><form class="ca-f">' + body + '<button class="ca-go" type="submit">저장</button></form></div>';
      root.appendChild(bg);
      var form = bg.querySelector('form');
      function close() { bg.remove(); }
      bg.addEventListener('click', function (e) { if (e.target === bg || e.target.closest('[data-x]')) close(); });
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var v = {}; Array.prototype.forEach.call(form.elements, function (f) { if (f.name) v[f.name] = f.type === 'checkbox' ? f.checked : f.value.trim(); });
        if (onSubmit(v) !== false) close();
      });
      var first = form.querySelector('input,textarea'); if (first && live) setTimeout(function () { first.focus(); }, 50);
    }
    function askName(then) {
      sheet('이름을 알려 주세요', '<label>이름 (센터에서 부르는 이름)<input name="n" maxlength="12" value="' + esc(me) + '" placeholder="예: 김보상" required></label>', function (v) {
        if (!v.n) return false; me = v.n; lsSet('ca:name', me); draw(); if (then) then();
      });
    }
    var forms = {
      notice: function () {
        sheet('공지 올리기', '<label>내용<textarea name="text" maxlength="200" required placeholder="예: 금요일 16시 센터 회의"></textarea></label><label class="chk"><input type="checkbox" name="pin">맨 위에 고정</label>',
          function (v) { if (!v.text) return false; act({ op: 'add', kind: 'notice', data: { text: v.text, pin: v.pin } }); toast('공지를 올렸어요'); });
      },
      handover: function () {
        var people = of('status').map(function (s) { return s.author; }).filter(function (n, i, a) { return n !== me && a.indexOf(n) === i; });
        sheet('인수인계 남기기',
          '<div class="two"><label>사고번호<input name="caseNo" maxlength="20" placeholder="2026-000000"></label><label>받는 사람<input name="to" maxlength="12" list="caPeople" required placeholder="이름"></label></div>' +
          '<datalist id="caPeople">' + people.map(function (p) { return '<option value="' + esc(p) + '">'; }).join('') + '</datalist>' +
          '<label>건 요약<input name="title" maxlength="40" required placeholder="예: 후미 추돌 · 수리 진행"></label>' +
          '<label>진행 상황<textarea name="progress" maxlength="200" placeholder="어디까지 했나요?"></textarea></label>' +
          '<label>다음 할 일<input name="next" maxlength="120" placeholder="받는 사람이 할 일"></label>' +
          '<label>기한<input type="date" name="due" value="' + addDays(1) + '"></label>',
          function (v) { if (!v.title || !v.to) return false; act({ op: 'add', kind: 'handover', data: v }); toast(v.to + '님에게 넘겼어요'); });
      },
      tip: function () {
        sheet('노하우 · 연락처 등록',
          '<div class="two"><label>종류<select name="cat">' + CATS.map(function (c) { return '<option>' + c[0] + '</option>'; }).join('') + '</select></label><label>지역<input name="area" maxlength="20" placeholder="예: ○○구"></label></div>' +
          '<label>이름 · 제목<input name="name" maxlength="40" required placeholder="예: 가나공업사 / 과실 협의 요령"></label>' +
          '<label>연락처<input name="phone" maxlength="20" inputmode="tel" placeholder="선택"></label>' +
          '<label>메모<textarea name="text" maxlength="300" placeholder="잘하는 것, 주의할 점, 요령"></textarea></label>',
          function (v) { if (!v.name) return false; act({ op: 'add', kind: 'tip', data: v }); toast('등록했어요'); });
      },
      status: function (state) {
        var mine = of('status').filter(function (s) { return s.mine; })[0];
        var needSub = state === '휴가' || state === '반차';
        sheet('오늘 ' + state,
          '<label>메모 (선택)<input name="note" maxlength="30" placeholder="' + (state === '외근' ? '예: 현장 확인, 15시 복귀' : '예: 오후 복귀') + '" value="' + esc(mine && mine.data.state === state ? mine.data.note || '' : '') + '"></label>' +
          (needSub ? '<label>대직자<input name="sub" maxlength="12" placeholder="이름" value="' + esc(mine && mine.data.sub || '') + '"></label>' : ''),
          function (v) { act({ op: 'add', kind: 'status', data: { date: today(), state: state, note: v.note || '', sub: v.sub || '' } }); toast('오늘 ' + state + '(으)로 표시했어요'); });
      },
    };

    // ---------- 클릭
    root.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b || !root.contains(b)) return;
      if (b.closest('.ca-sheet-bg')) return;
      var d = b.dataset;
      if (d.tab) { tab = d.tab; scroll.scrollTop = 0; draw(); return; }
      if (d.a === 'name') { if (live) askName(); return; }
      if (d.a === 'seed') {
        if (!me) { askName(function () { b.click(); }); return; }
        store.send({ op: 'seed', author: me, items: sample() }).then(function () { toast('예시를 채웠어요'); refresh(); }, function (er) { toast(er.message); });
        return;
      }
      if (d.a && forms[d.a]) { if (live && !me) { askName(forms[d.a]); return; } forms[d.a](); return; }
      if (d.st) { if (live && !me) { askName(function () { forms.status(d.st); }); return; } forms.status(d.st); return; }
      if (d.hf) { hoFilter = d.hf; draw(); return; }
      if (d.tc) { tipCat = d.tc; draw(); return; }
      if (d.done) { act({ op: 'done', id: d.done }); return; }
      if (d.del) { if (window.confirm('삭제할까요?')) act({ op: 'delete', id: d.del }); return; }
    });
    root.addEventListener('input', function (e) { if (e.target.id === 'caQ') { query = e.target.value; draw(); } });

    refresh();
    if (live) {
      if (!me) setTimeout(function () { askName(); }, 400);
      setInterval(function () { if (!document.hidden && !root.querySelector('.ca-sheet-bg')) refresh(); }, 5000);
    }
    return { refresh: refresh };
  }

  window.CenterApp = { mount: mount, sample: sample };
})();
