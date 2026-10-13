/* 센터원 업무 공유 — 화면 (사이트: 실제 저장 / 강의안: 가짜 예시 데이터)
   CenterApp.mount(el, { mode:'live'|'demo', room, api, step, tab, notch })
   step 2: 공지 · 할 일 / step 3: + 주소록 · 비상연락망 / step 4 이상: + 메신저 */
(function () {
  'use strict';

  var ICON = {
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10 20a2 2 0 0 0 4 0"/>',
    pin: '<path d="M12 17v4"/><path d="M8 3h8l-1 6 3 4H6l3-4z"/>',
    todo: '<rect x="3" y="4" width="18" height="17" rx="3"/><path d="M8 2v4M16 2v4M3 10h18"/><path d="M8 15l2.5 2.5L16 13"/>',
    users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><circle cx="17.5" cy="9" r="2.5"/><path d="M16 14.5a5 5 0 0 1 6 5"/>',
    siren: '<path d="M6 18v-6a6 6 0 0 1 12 0v6"/><path d="M4 18h16v3H4z"/><path d="M12 3V1M4.5 5.5 3 4M19.5 5.5 21 4"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/><path d="M8 10h8M8 13h5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    x: '<path d="M6 6l12 12M18 6L6 18"/>',
    check: '<path d="M5 12l5 5 9-10"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    warn: '<path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.5"/>',
    send: '<path d="M4 12l16-8-6 17-3-7z"/><path d="M11 14l9-10"/>',
  };
  function svg(n) { return '<svg viewBox="0 0 24 24">' + ICON[n] + '</svg>'; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function kst(t) { return new Date((t || Date.now()) + 9 * 3600e3); }
  function today() { return kst().toISOString().slice(0, 10); }
  function addDays(n) { return kst(Date.now() + n * 864e5).toISOString().slice(0, 10); }
  var WK = '일월화수목금토';
  function dayLabel(d) { var x = new Date(d + 'T00:00:00Z'); return (x.getUTCMonth() + 1) + '월 ' + x.getUTCDate() + '일 (' + WK[x.getUTCDay()] + ')'; }
  function prettyToday() { return dayLabel(today()); }
  function hhmm(ms) { var d = kst(ms); return String(d.getUTCHours()).padStart(2, '0') + ':' + String(d.getUTCMinutes()).padStart(2, '0'); }
  function ago(ms) {
    var s = (Date.now() - ms) / 1000;
    if (s < 60) return '방금'; if (s < 3600) return Math.floor(s / 60) + '분 전';
    if (s < 86400) return Math.floor(s / 3600) + '시간 전'; return Math.floor(s / 86400) + '일 전';
  }
  var AV = ['#4338CA', '#0F9F8F', '#E5484D', '#E59A12', '#2F80ED', '#8B5CF6', '#C2410C', '#0B7A6C'];
  function avColor(name) { var h = 0; for (var i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0; return AV[h % AV.length]; }
  function av(name) { return '<span class="ca-av" style="background:' + avColor(name || '?') + '">' + esc((name || '?').slice(0, 1)) + '</span>'; }
  function tel(p) { return 'tel:' + String(p || '').replace(/[^0-9+]/g, ''); }

  // ---------- 예시 데이터 (모두 가짜)
  function sample() {
    var t = today();
    return [
      { kind: 'notice', author: '윤센터', data: { text: '이번 주 금요일 오후 4시 센터 회의 (3층 회의실)\n미결 건 현황 챙겨 와 주세요.', pin: true } },
      { kind: 'notice', author: '박총무', data: { text: '연말 휴가 신청은 이번 달 말까지 부탁드립니다.' } },
      { kind: 'notice', author: '이대물', data: { text: '렌트 협력업체 연락처가 바뀌었어요. 주소록 확인해 주세요.' } },
      { kind: 'todo', author: '윤센터', data: { title: '주간 미결 건 점검', date: t, who: '김보상' } },
      { kind: 'todo', author: '이대물', data: { title: '가나공업사 현장 확인', date: t, who: '이대물' } },
      { kind: 'todo', author: '윤센터', data: { title: '분쟁심의 자료 준비', date: addDays(1), who: '박대인' } },
      { kind: 'todo', author: '최렌트', data: { title: '렌트 종료 안내 문자 발송', date: addDays(2), who: '최렌트' } },
      { kind: 'todo', author: '정사정', data: { title: '서류 미제출 건 재요청', date: addDays(-1), who: '김보상' } },
      { kind: 'todo', author: '정사정', data: { title: '법정 교육 이수 확인', date: addDays(-1), who: '정사정' }, done: true },
      { kind: 'contact', author: '박총무', data: { team: '센터', name: '윤센터', role: '센터장', ext: '1000', phone: '010-0000-0001' } },
      { kind: 'contact', author: '박총무', data: { team: '센터', name: '박총무', role: '총무', ext: '1001', phone: '010-0000-0009' } },
      { kind: 'contact', author: '박총무', data: { team: '대물1팀', name: '김보상', role: '과장', ext: '1101', phone: '010-0000-0002' } },
      { kind: 'contact', author: '박총무', data: { team: '대물1팀', name: '이대물', role: '대리', ext: '1102', phone: '010-0000-0003' } },
      { kind: 'contact', author: '박총무', data: { team: '대물2팀', name: '최렌트', role: '주임', ext: '1201', phone: '010-0000-0004' } },
      { kind: 'contact', author: '박총무', data: { team: '대물2팀', name: '정사정', role: '사원', ext: '1202', phone: '010-0000-0005' } },
      { kind: 'contact', author: '박총무', data: { team: '대인팀', name: '박대인', role: '과장', ext: '1301', phone: '010-0000-0006' } },
      { kind: 'contact', author: '박총무', data: { team: '대인팀', name: '한과실', role: '대리', ext: '1302', phone: '010-0000-0007' } },
      { kind: 'emergency', author: '박총무', data: { group: 'chain', step: 1, name: '윤센터', role: '센터장 · 최초 보고', phone: '010-0000-0001' } },
      { kind: 'emergency', author: '박총무', data: { group: 'chain', step: 2, name: '김보상', role: '대물1팀 대표', phone: '010-0000-0002' } },
      { kind: 'emergency', author: '박총무', data: { group: 'chain', step: 2, name: '박대인', role: '대인팀 대표', phone: '010-0000-0006' } },
      { kind: 'emergency', author: '박총무', data: { group: 'chain', step: 3, name: '각 팀원', role: '팀 대표가 순서대로 연락', phone: '' } },
      { kind: 'emergency', author: '박총무', data: { group: 'ext', name: '건물 관리실 (예시)', role: '정전 · 누수 · 출입', phone: '02-000-0000' } },
      { kind: 'emergency', author: '박총무', data: { group: 'ext', name: '긴급출동 접수 (예시)', role: '현장 출동 요청', phone: '1588-0000' } },
      { kind: 'message', author: '윤센터', data: { text: '오늘 오후 회의는 4시입니다. 늦지 않게 와 주세요.' } },
      { kind: 'message', author: '이대물', data: { text: '넵! 공업사 들렀다가 바로 가겠습니다.' } },
      { kind: 'message', author: '최렌트', data: { text: '회의 자료는 공지에 올려 두었어요.' } },
    ];
  }
  var REPLIES = ['확인했습니다!', '넵, 알겠습니다.', '오후에 다시 말씀드릴게요.', '좋습니다 👍', '제가 챙겨 볼게요.'];

  // ---------- 저장소: 강의안용 (메모리)
  var demoItems = null;
  function demoStore(me) {
    if (!demoItems) {
      var base = Date.now(), n = 0;
      demoItems = sample().map(function (x, i) {
        var at = x.kind === 'message' ? base - (12 - (n++) * 4) * 60e3 : base - (i + 1) * 37 * 60e3;
        return { id: 'd' + i, kind: x.kind, author: x.author, data: x.data, done: !!x.done, at: at };
      });
    }
    function mark() { return demoItems.map(function (x) { var y = Object.assign({}, x); y.mine = x.author === me; return y; }); }
    return {
      load: function () { return Promise.resolve({ today: today(), items: mark() }); },
      send: function (a) {
        if (a.op === 'delete') demoItems = demoItems.filter(function (x) { return x.id !== a.id; });
        else if (a.op === 'done') demoItems.forEach(function (x) { if (x.id === a.id) x.done = !x.done; });
        else if (a.op === 'add') demoItems.push({ id: 'n' + Date.now() + Math.random(), kind: a.kind, author: a.author, data: a.data, done: false, at: Date.now() });
        return Promise.resolve({ ok: true });
      },
      fakeReply: function () {
        demoItems.push({ id: 'r' + Date.now(), kind: 'message', author: '이대물', data: { text: REPLIES[Math.floor(Math.random() * REPLIES.length)] }, done: false, at: Date.now() });
      },
    };
  }

  // ---------- 저장소: 사이트용 (서버)
  function liveStore(api, room, cid) {
    function j(r) { return r.json().then(function (x) { if (!r.ok) throw new Error(x.error || r.status); return x; }); }
    return {
      load: function () { return fetch(api + '?room=' + encodeURIComponent(room), { headers: { 'x-cid': cid }, cache: 'no-store' }).then(j); },
      send: function (a) {
        a.room = room; a.cid = cid;
        return fetch(api, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(a) }).then(j);
      },
    };
  }
  function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

  var TABS = [['notice', '공지', 'bell', '센터 공지'], ['todo', '할 일', 'todo', '할 일'], ['contact', '주소록', 'users', '센터 주소록'], ['emergency', '비상연락', 'siren', '비상연락망'], ['chat', '메신저', 'chat', '센터 메신저']];

  function mount(root, opts) {
    opts = opts || {};
    var live = opts.mode === 'live';
    var step = live ? 5 : (opts.step || 4);
    var allow = step >= 4 ? 5 : step >= 3 ? 4 : 2;
    var tabs = TABS.slice(0, allow);
    var tab = opts.tab || 'notice';
    var me = live ? (lsGet('ca:name') || '') : '김보상';
    var cid = lsGet('ca:cid');
    if (!cid) { cid = 'c' + Math.random().toString(36).slice(2) + Date.now().toString(36); lsSet('ca:cid', cid); }
    var store = live ? liveStore(opts.api || '/api/center', opts.room || 'main', cid) : demoStore(me);
    var data = { items: [] };
    var todoFilter = 'open', query = '', online = true, lastJson = '', chatSeen = Number(lsGet('ca:chatSeen') || 0), stickBottom = true;

    root.classList.add('ca');
    root.innerHTML = '';
    var head = el('div', 'ca-head' + (opts.notch ? ' pad-top' : ''));
    var scroll = el('div', 'ca-scroll');
    var compose = el('form', 'ca-compose', '<input placeholder="메시지 입력" maxlength="300" autocomplete="off"><button type="submit" aria-label="보내기">' + svg('send') + '</button>');
    var bar = el('div', 'ca-tabbar');
    root.appendChild(head); root.appendChild(scroll); root.appendChild(compose); root.appendChild(bar);

    function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
    function toast(msg) { var t = el('div', 'ca-toast', esc(msg)); root.appendChild(t); setTimeout(function () { t.remove(); }, 1800); }
    function of(kind) { return data.items.filter(function (x) { return x.kind === kind; }); }
    function people() {
      var n = of('contact').map(function (c) { return c.data.name; });
      if (me) n.unshift(me);
      return n.filter(function (x, i, a) { return x && a.indexOf(x) === i; });
    }

    function refresh() {
      return store.load().then(function (d) {
        online = true;
        var j = JSON.stringify(d);
        if (j !== lastJson) { lastJson = j; data = d; draw(); } else drawHead();
      }, function (e) {
        online = false; drawHead();
        if (live && !data.items.length) scroll.innerHTML = '<div class="ca-sec"><div class="ca-empty">불러오지 못했어요. 잠시 후 다시 시도해 주세요.<br>' + esc(e.message) + '</div></div>';
      });
    }
    function act(a) {
      if (live && !me) { askName(function () { act(a); }); return Promise.resolve(); }
      a.author = me;
      return store.send(a).then(refresh, function (e) { toast('저장하지 못했어요: ' + e.message); });
    }

    // ---------- 머리
    function drawHead() {
      var t = TABS.filter(function (x) { return x[0] === tab; })[0];
      var sum = '';
      if (tab === 'todo' || tab === 'notice') {
        var td = of('todo'), d0 = today();
        var c = { today: 0, late: 0, mine: 0 };
        td.forEach(function (x) { if (x.done) return; if (x.data.date === d0) c.today++; if (x.data.date < d0) c.late++; if (x.data.who === me) c.mine++; });
        if (allow >= 2) sum = '<div class="ca-sum"><span>오늘 할 일<b>' + c.today + '</b></span><span>밀린 일<b>' + c.late + '</b></span>' + (me ? '<span>내 할 일<b>' + c.mine + '</b></span>' : '') + '</div>';
      }
      head.innerHTML =
        '<div class="ca-top"><div class="ca-logo"><i>C1</i>센터원</div>' +
        '<button class="ca-me" data-a="name">' + svg('user') + esc(me || '이름 설정') + '</button></div>' +
        '<div class="ca-date">' + prettyToday() + (live ? ' · <span class="ca-live' + (online ? '' : ' off') + '"><i></i>' + (online ? '실시간' : '연결 끊김') + '</span>' : '') + '</div>' +
        '<div class="ca-title">' + t[3] + '</div>' + sum;
    }

    // ---------- 공지
    function drawNotice() {
      var list = of('notice').sort(function (a, b) { return (b.data.pin ? 1 : 0) - (a.data.pin ? 1 : 0) || b.at - a.at; });
      var h = live ? '<div class="ca-warn">' + svg('warn') + '<span>교육용 공유 공간이에요. 실제 고객 이름 · 연락처 · 주민번호는 넣지 마세요.</span></div>' : '';
      h += '<div class="ca-sec"><div class="ca-sec-h"><h3>' + svg('bell') + '공지 <small>' + list.length + '개</small></h3><button class="ca-add" data-a="notice">' + svg('plus') + '공지</button></div><div class="ca-list">';
      h += list.length ? list.map(function (n) {
        return '<div class="ca-card ca-notice' + (n.data.pin ? ' pinned' : '') + '"><span class="pin">' + svg(n.data.pin ? 'pin' : 'bell') + '</span><div style="flex:1;min-width:0"><div class="tx">' + esc(n.data.text) + '</div>' +
          '<div class="ca-meta">' + esc(n.author) + ' · ' + ago(n.at) + (n.mine ? ' <button class="ca-del" data-del="' + n.id + '">삭제</button>' : '') + '</div></div></div>';
      }).join('') : '<div class="ca-empty">아직 공지가 없어요</div>';
      return h + '</div></div>';
    }

    // ---------- 할 일
    function drawTodo() {
      var d0 = today(), d1 = addDays(1);
      var all = of('todo');
      var list = all.filter(function (x) {
        if (todoFilter === 'mine') return !x.done && x.data.who === me;
        if (todoFilter === 'done') return x.done;
        return !x.done;
      }).sort(function (a, b) { return (a.data.date || '').localeCompare(b.data.date || '') || a.at - b.at; });
      var h = '<div class="ca-sec"><div class="ca-sec-h"><h3>' + svg('todo') + '할 일</h3><button class="ca-add" data-a="todo">' + svg('plus') + '할 일</button></div>';
      h += '<div class="ca-filter">' + [['open', '진행 중'], ['mine', '내 할 일'], ['done', '완료']].map(function (f) {
        return '<button class="' + (todoFilter === f[0] ? 'on' : '') + '" data-tf="' + f[0] + '">' + f[1] + '</button>';
      }).join('') + '</div>';
      if (!list.length) return h + '<div class="ca-empty">' + (todoFilter === 'mine' ? '나에게 배정된 할 일이 없어요' : '할 일이 없어요') + '</div></div>';
      var last = null;
      list.forEach(function (x) {
        var d = x.data.date || '';
        var key = !x.done && d < d0 ? 'late' : d;
        if (key !== last) {
          last = key;
          var lab = key === 'late' ? '밀린 일' : d === d0 ? '오늘 · ' + dayLabel(d) : d === d1 ? '내일 · ' + dayLabel(d) : dayLabel(d);
          h += '<div class="ca-day' + (key === 'late' ? ' late' : d === d0 ? ' today' : '') + '">' + lab + '</div>';
        }
        h += '<div class="ca-card ca-todo' + (x.done ? ' done' : '') + '" style="margin-bottom:.45em"><button class="ck" data-done="' + x.id + '" aria-label="완료 표시">' + svg('check') + '</button>' +
          '<div><div class="tt">' + esc(x.data.title) + '</div><div class="ca-meta">' + (key === 'late' ? dayLabel(d) + ' · ' : '') + esc(x.author) + '님이 등록' + (x.mine ? ' <button class="ca-del" data-del="' + x.id + '">삭제</button>' : '') + '</div></div>' +
          '<span class="ca-who">' + av(x.data.who) + esc(x.data.who) + '</span></div>';
      });
      return h + '</div>';
    }

    // ---------- 주소록
    function hl(s) {
      var t = esc(s); if (!query) return t;
      var q = esc(query).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      return t.replace(new RegExp(q, 'gi'), function (m) { return '<mark class="ca-hl">' + m + '</mark>'; });
    }
    function drawContact() {
      var q = query.toLowerCase();
      var list = of('contact').filter(function (x) {
        return !q || [x.data.team, x.data.name, x.data.role, x.data.ext, x.data.phone].join(' ').toLowerCase().indexOf(q) >= 0;
      }).sort(function (a, b) { return (a.data.team || '').localeCompare(b.data.team || '') || (a.data.name || '').localeCompare(b.data.name || ''); });
      var h = '<div class="ca-sec"><div class="ca-search">' + svg('search') + '<input id="caQ" placeholder="이름 · 팀 · 번호 검색" value="' + esc(query) + '"></div>';
      h += '<div class="ca-sec-h"><h3>' + svg('users') + '주소록 <small>' + list.length + '명</small></h3><button class="ca-add" data-a="contact">' + svg('plus') + '추가</button></div>';
      if (!list.length) return h + '<div class="ca-empty">' + (q ? '"' + esc(query) + '" 검색 결과가 없어요' : '아직 등록된 사람이 없어요') + '</div></div>';
      var last = null;
      list.forEach(function (x) {
        if (x.data.team !== last) { last = x.data.team; h += '<div class="ca-team">' + esc(last || '팀 없음') + '</div>'; }
        h += '<div class="ca-card ca-contact" style="margin-bottom:.45em">' + av(x.data.name) + '<div><div class="nm">' + hl(x.data.name) + '<small>' + hl(x.data.role) + '</small></div>' +
          '<div class="ln">' + (x.data.ext ? '<a class="ca-call" href="' + tel(x.data.ext) + '">내선 ' + hl(x.data.ext) + '</a>' : '') +
          (x.data.phone ? '<a class="ca-call" href="' + tel(x.data.phone) + '">' + svg('phone') + hl(x.data.phone) + '</a>' : '') +
          (x.mine ? '<button class="ca-del" data-del="' + x.id + '">삭제</button>' : '') + '</div></div></div>';
      });
      return h + '</div>';
    }

    // ---------- 비상연락망
    function drawEmergency() {
      var all = of('emergency');
      var chain = all.filter(function (x) { return x.data.group !== 'ext'; }).sort(function (a, b) { return (a.data.step || 9) - (b.data.step || 9) || a.at - b.at; });
      var ext = all.filter(function (x) { return x.data.group === 'ext'; });
      var h = '<div class="ca-sec"><div class="ca-sec-h"><h3>' + svg('siren') + '연락 순서</h3><button class="ca-add" data-a="emergency">' + svg('plus') + '추가</button></div>';
      if (!chain.length) h += '<div class="ca-empty">연락 순서가 없어요</div>';
      else {
        var steps = {}; chain.forEach(function (x) { (steps[x.data.step] = steps[x.data.step] || []).push(x); });
        h += '<div class="ca-chain">' + Object.keys(steps).sort(function (a, b) { return a - b; }).map(function (s) {
          return '<div class="ca-step"><span class="no">' + s + '차</span><div><div class="lab">' + (s === '1' ? '가장 먼저' : (s - 1) + '차가 연락') + '</div><div class="who">' +
            steps[s].map(function (x) {
              return '<div class="ca-card"><div class="nm">' + esc(x.data.name) + '<small>' + esc(x.data.role) + '</small></div>' +
                (x.data.phone ? '<a class="ca-call" href="' + tel(x.data.phone) + '">' + svg('phone') + esc(x.data.phone) + '</a>' : '') + '</div>';
            }).join('') + '</div></div></div>';
        }).join('') + '</div>';
      }
      h += '</div><div class="ca-sec ca-ext"><div class="ca-sec-h"><h3>' + svg('warn') + '외부 긴급 연락처</h3></div><div class="ca-list">';
      h += ext.length ? ext.map(function (x) {
        return '<div class="ca-card"><div><div style="font-weight:900;font-size:.92em">' + esc(x.data.name) + '</div><div class="ca-meta" style="margin-top:.1em">' + esc(x.data.role) + '</div></div>' +
          (x.data.phone ? '<a class="ca-call" href="' + tel(x.data.phone) + '">' + svg('phone') + esc(x.data.phone) + '</a>' : '') + '</div>';
      }).join('') : '<div class="ca-empty">등록된 외부 연락처가 없어요</div>';
      return h + '</div></div>';
    }

    // ---------- 메신저
    function drawChat() {
      var list = of('message').sort(function (a, b) { return a.at - b.at; }).slice(-200);
      if (!list.length) return '<div class="ca-chat"><div class="ca-empty">첫 메시지를 보내 보세요</div></div>';
      return '<div class="ca-chat">' + list.map(function (x) {
        if (x.mine) return '<div class="ca-msg me"><div><div class="bb">' + esc(x.data.text) + '</div><div class="tm">' + hhmm(x.at) + '</div></div></div>';
        return '<div class="ca-msg">' + av(x.author) + '<div><div class="nm">' + esc(x.author) + '</div><div class="bb">' + esc(x.data.text) + '</div><div class="tm">' + hhmm(x.at) + '</div></div></div>';
      }).join('') + '</div>';
    }

    function unread() {
      if (allow < 5 || tab === 'chat') return 0;
      return of('message').filter(function (x) { return !x.mine && x.at > chatSeen; }).length;
    }

    function draw() {
      drawHead();
      var keepFocus = document.activeElement && document.activeElement.id === 'caQ' && root.contains(document.activeElement);
      var pos = keepFocus ? document.activeElement.selectionStart : 0;
      var y = scroll.scrollTop;
      var nearBottom = scroll.scrollHeight - scroll.scrollTop - scroll.clientHeight < 60;
      var h = tab === 'notice' ? drawNotice() : tab === 'todo' ? drawTodo() : tab === 'contact' ? drawContact() : tab === 'emergency' ? drawEmergency() : drawChat();
      if (live && !data.items.length && online) h += '<div class="ca-seed"><button data-a="seed">예시 데이터로 채워 보기</button></div>';
      scroll.innerHTML = h;
      if (tab === 'chat') {
        if (stickBottom || nearBottom) scroll.scrollTop = scroll.scrollHeight; else scroll.scrollTop = y;
        stickBottom = false;
        var last = of('message').reduce(function (m, x) { return Math.max(m, x.at); }, 0);
        if (last > chatSeen) { chatSeen = last; lsSet('ca:chatSeen', String(last)); }
      } else scroll.scrollTop = y;
      compose.style.display = tab === 'chat' ? '' : 'none';
      if (keepFocus) { var q = root.querySelector('#caQ'); q.focus(); q.setSelectionRange(pos, pos); }
      var mineTodo = of('todo').filter(function (x) { return !x.done && x.data.who === me && x.data.date <= today(); }).length;
      var un = unread();
      bar.innerHTML = tabs.map(function (t) {
        var dot = t[0] === 'todo' && mineTodo ? mineTodo : t[0] === 'chat' && un ? un : 0;
        return '<button class="' + (tab === t[0] ? 'on' : '') + '" data-tab="' + t[0] + '">' + svg(t[2]) + '<span>' + t[1] + '</span>' + (dot ? '<span class="dot">' + dot + '</span>' : '') + '</button>';
      }).join('');
    }

    // ---------- 입력 시트
    function sheet(title, body, onSubmit) {
      var bg = el('div', 'ca-sheet-bg');
      bg.innerHTML = '<div class="ca-sheet"><h4>' + esc(title) + '<button class="ca-x" data-x type="button">' + svg('x') + '</button></h4><form class="ca-f">' + body + '<button class="ca-go" type="submit">저장</button></form></div>';
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
    function opts2(list, sel) { return list.map(function (n) { return '<option' + (n === sel ? ' selected' : '') + '>' + esc(n) + '</option>'; }).join(''); }
    var forms = {
      notice: function () {
        sheet('공지 올리기', '<label>내용<textarea name="text" maxlength="200" required placeholder="예: 금요일 16시 센터 회의"></textarea></label><label class="chk"><input type="checkbox" name="pin">맨 위에 고정</label>',
          function (v) { if (!v.text) return false; act({ op: 'add', kind: 'notice', data: { text: v.text, pin: v.pin } }); toast('공지를 올렸어요'); });
      },
      todo: function () {
        sheet('할 일 등록',
          '<label>할 일<input name="title" maxlength="60" required placeholder="예: 미결 건 점검"></label>' +
          '<div class="two"><label>날짜<input type="date" name="date" value="' + today() + '" required></label>' +
          '<label>담당자<select name="who">' + opts2(people(), me) + '</select></label></div>',
          function (v) { if (!v.title || !v.date) return false; act({ op: 'add', kind: 'todo', data: v }); toast(v.who + '님에게 할 일을 배정했어요'); });
      },
      contact: function () {
        sheet('주소록 추가',
          '<div class="two"><label>이름<input name="name" maxlength="12" required></label><label>직급<input name="role" maxlength="12" placeholder="예: 대리"></label></div>' +
          '<label>팀<input name="team" maxlength="20" placeholder="예: 대물1팀"></label>' +
          '<div class="two"><label>내선<input name="ext" maxlength="10" inputmode="tel"></label><label>휴대폰<input name="phone" maxlength="20" inputmode="tel"></label></div>',
          function (v) { if (!v.name) return false; act({ op: 'add', kind: 'contact', data: v }); toast('주소록에 추가했어요'); });
      },
      emergency: function () {
        sheet('비상연락망 추가',
          '<div class="two"><label>구분<select name="group"><option value="chain">연락 순서</option><option value="ext">외부 긴급 연락처</option></select></label>' +
          '<label>순서 (연락 순서일 때)<select name="step"><option>1</option><option selected>2</option><option>3</option><option>4</option></select></label></div>' +
          '<label>이름 · 기관<input name="name" maxlength="20" required></label>' +
          '<label>역할<input name="role" maxlength="30" placeholder="예: 대물1팀 대표"></label>' +
          '<label>연락처<input name="phone" maxlength="20" inputmode="tel"></label>',
          function (v) { if (!v.name) return false; v.step = Number(v.step); act({ op: 'add', kind: 'emergency', data: v }); toast('비상연락망에 추가했어요'); });
      },
    };

    compose.addEventListener('submit', function (e) {
      e.preventDefault();
      var inp = compose.querySelector('input'); var t = inp.value.trim(); if (!t) return;
      if (live && !me) { askName(); return; }
      inp.value = ''; stickBottom = true;
      act({ op: 'add', kind: 'message', data: { text: t } });
      if (!live && store.fakeReply) setTimeout(function () { store.fakeReply(); stickBottom = true; refresh(); }, 1400);
    });

    root.addEventListener('click', function (e) {
      var b = e.target.closest('button'); if (!b || !root.contains(b) || b.closest('.ca-sheet-bg') || b.closest('.ca-compose')) return;
      var d = b.dataset;
      if (d.tab) { tab = d.tab; query = ''; stickBottom = true; scroll.scrollTop = 0; draw(); return; }
      if (d.a === 'name') { if (live) askName(); return; }
      if (d.a === 'seed') {
        if (!me) { askName(function () { b.click(); }); return; }
        store.send({ op: 'seed', author: me, items: sample() }).then(function () { toast('예시를 채웠어요'); refresh(); }, function (er) { toast(er.message); });
        return;
      }
      if (d.a && forms[d.a]) { if (live && !me) { askName(forms[d.a]); return; } forms[d.a](); return; }
      if (d.tf) { todoFilter = d.tf; draw(); return; }
      if (d.done) { act({ op: 'done', id: d.done }); return; }
      if (d.del) { if (window.confirm('삭제할까요?')) act({ op: 'delete', id: d.del }); return; }
    });
    root.addEventListener('input', function (e) { if (e.target.id === 'caQ') { query = e.target.value; draw(); } });

    refresh();
    if (live) {
      if (!me) setTimeout(function () { askName(); }, 400);
      setInterval(function () { if (!document.hidden && !root.querySelector('.ca-sheet-bg')) refresh(); }, 3000);
    }
    return { refresh: refresh };
  }

  window.CenterApp = { mount: mount, sample: sample };
})();
