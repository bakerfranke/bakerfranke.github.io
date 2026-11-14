/* Knowledge Area Boxes: shelf, cards, progress board, mock teacher sign-off, author check.
   Card content lives in knowledge-areas/*.md (see knowledge-areas/AUTHORING.md). */
(() => {
  "use strict";

  let AREAS = [];
  let SHELF = { cardsNeeded: "all", teacherPin: "1234" };

  // ---------- saved progress (this browser only) ----------
  const STORE_KEY = "badging-mockup-v2";
  const blank = () => ({ cards: {}, drafts: {}, signoff: {} });
  let state = load();

  function load() {
    try {
      const raw = localStorage.getItem(STORE_KEY);
      if (raw) return Object.assign(blank(), JSON.parse(raw));
    } catch (_) { /* storage unavailable: start fresh */ }
    return blank();
  }
  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (_) { /* ignore */ }
  }

  const cardState = (id) => state.cards[id] || { correct: false, attempts: 0 };
  function recordAttempt(id, correct) {
    const s = cardState(id);
    s.attempts += 1;
    if (correct && !s.correct) s.correct = true;
    state.cards[id] = s;
    save();
  }

  // ---------- knowledge area status ----------
  const areaById = (id) => AREAS.find((a) => a.id === id);
  const isOpen = (area) => area.cards.length > 0;
  const needed = (area) => (SHELF.cardsNeeded === "all" ? area.cards.length : Math.min(SHELF.cardsNeeded, area.cards.length));
  const correctCount = (area) => area.cards.filter((c) => cardState(c.id).correct).length;

  // locked | new | progress | ready | requested | mastered
  function areaStatus(area) {
    if (!isOpen(area)) return "locked";
    const so = state.signoff[area.id] || {};
    if (so.mastered) return "mastered";
    if (correctCount(area) >= needed(area)) return so.requested ? "requested" : "ready";
    return area.cards.some((c) => cardState(c.id).attempts > 0) ? "progress" : "new";
  }
  const STATUS_TEXT = {
    locked: "Coming soon",
    new: "Not started",
    progress: "In progress",
    ready: "Ready for sign-off",
    requested: "Waiting for teacher",
    mastered: "Mastered",
  };

  // ---------- helpers ----------
  const app = document.getElementById("app");
  const esc = Loader.esc;
  const normOut = (s) => String(s).replace(/\r/g, "").split("\n").map((l) => l.trimEnd()).join("\n").trim();
  const fmtDate = (t) => new Date(t).toLocaleDateString(undefined, { month: "short", day: "numeric" });
  const pips = (area) => area.cards.map((c) => `<span class="pip ${cardState(c.id).correct ? "on" : ""}" aria-hidden="true"></span>`).join("");

  // ---------- views ----------
  function viewShelf() {
    const boxes = AREAS.map((area) => {
      const st = areaStatus(area);
      const inner = `
        <span class="box-tab">${esc(area.name)}</span>
        <span class="box-body">
          <span class="box-blurb">${esc(area.blurb)}</span>
          ${isOpen(area)
            ? `<span class="box-cards">${correctCount(area)} of ${area.cards.length} cards <span class="pips">${pips(area)}</span></span>`
            : `<span class="box-cards">No cards yet</span>`}
          <span class="status status-${st}">${STATUS_TEXT[st]}</span>
        </span>`;
      return isOpen(area)
        ? `<a class="box" style="--skill:${esc(area.color)}" href="#/area/${area.id}">${inner}</a>`
        : `<div class="box locked" style="--skill:${esc(area.color)}" aria-disabled="true">${inner}</div>`;
    }).join("");

    app.innerHTML = `
      <section class="intro">
        <h1>Pick a box. Work at your own pace.</h1>
        <p>Each colored box is one knowledge area. Finish the cards in a box, then ask your teacher to sign off and earn the badge.
          Master all ${AREAS.length} knowledge areas to earn an A.</p>
      </section>
      ${summaryBar()}
      <section aria-label="Knowledge area boxes" class="shelf">${boxes}</section>`;
  }

  function summaryBar() {
    const mastered = AREAS.filter((a) => areaStatus(a) === "mastered").length;
    const pct = AREAS.length ? Math.round((mastered / AREAS.length) * 100) : 0;
    return `
      <div class="summary">
        <div class="summary-text"><strong>${mastered} of ${AREAS.length}</strong> badges mastered <span class="muted">&middot; all ${AREAS.length} = A</span></div>
        <div class="meter" role="progressbar" aria-valuemin="0" aria-valuemax="${AREAS.length}" aria-valuenow="${mastered}" aria-label="Badges mastered">
          <span style="width:${pct}%"></span>
        </div>
      </div>`;
  }

  function viewBoard() {
    const badges = AREAS.map((area) => {
      const st = areaStatus(area);
      const so = state.signoff[area.id] || {};
      const detail =
        st === "mastered" ? `Signed off ${fmtDate(so.mastered)}` :
        st === "locked" ? "Cards coming soon" :
        `${correctCount(area)} of ${needed(area)} cards needed`;
      const action =
        st === "ready" || st === "requested"
          ? `<button type="button" class="btn small primary" data-signoff="${area.id}">${st === "requested" ? "Teacher: sign off" : "Request sign-off"}</button>`
          : isOpen(area) && st !== "mastered"
          ? `<a class="btn small ghost" href="#/area/${area.id}">Open box</a>`
          : "";
      return `
        <li class="badge badge-${st}" style="--skill:${esc(area.color)}">
          <span class="medal" aria-hidden="true">${st === "mastered" ? "&#10003;" : esc(area.name.charAt(0))}</span>
          <span class="badge-name">${esc(area.name)}</span>
          <span class="status status-${st}">${STATUS_TEXT[st]}</span>
          <span class="badge-detail muted">${detail}</span>
          ${action}
        </li>`;
    }).join("");

    app.innerHTML = `
      <section class="intro">
        <h1>Progress board</h1>
        <p>A badge lights up once your teacher signs off. Badges don't expire, and you can earn them in any order.</p>
      </section>
      ${summaryBar()}
      <ul class="board">${badges}</ul>`;
  }

  function viewArea(areaId, cardNum) {
    const area = areaById(areaId);
    if (!area || !isOpen(area)) return viewShelf();
    const idx = Math.min(Math.max((cardNum || 1) - 1, 0), area.cards.length - 1);
    const card = area.cards[idx];
    const st = areaStatus(area);

    const tabs = area.cards.map((c, i) => {
      const cs = cardState(c.id);
      return `<a class="card-tab ${i === idx ? "current" : ""} ${cs.correct ? "done" : ""}" href="#/area/${area.id}/${i + 1}"
        ${i === idx ? 'aria-current="page"' : ""}>
        <span class="card-num">${i + 1}</span><span class="sr-only">${cs.correct ? " (correct)" : ""}</span>
      </a>`;
    }).join("");

    const banner = st === "mastered"
      ? `<div class="banner mastered">Badge mastered. Signed off ${fmtDate(state.signoff[area.id].mastered)}.</div>`
      : st === "ready" || st === "requested"
      ? `<div class="banner ready"><span>You finished this box. Ask your teacher to sign off.</span>
           <button type="button" class="btn small primary" data-signoff="${area.id}">${st === "requested" ? "Teacher: sign off" : "Request sign-off"}</button></div>`
      : `<div class="banner">Get ${needed(area)} of ${area.cards.length} cards right to be ready for sign-off. You have ${correctCount(area)}.</div>`;

    app.innerHTML = `
      <section class="skill-view" style="--skill:${esc(area.color)}">
        <div class="skill-head">
          <a class="back" href="#/">&larr; Shelf</a>
          <h1>${esc(area.name)}</h1>
          <span class="status status-${st}">${STATUS_TEXT[st]}</span>
        </div>
        <nav class="card-tabs" aria-label="Cards in this box">${tabs}</nav>
        ${banner}
        <article class="card" id="card"></article>
        <div class="card-nav">
          ${idx > 0 ? `<a class="btn ghost" href="#/area/${area.id}/${idx}">&larr; Previous card</a>` : "<span></span>"}
          ${idx < area.cards.length - 1 ? `<a class="btn ghost" href="#/area/${area.id}/${idx + 2}">Next card &rarr;</a>` : "<span></span>"}
        </div>
      </section>`;

    renderCard(document.getElementById("card"), area, card, idx);
  }

  // ---------- cards ----------
  const TYPE_LABEL = { predict: "Predict the output", choice: "Multiple choice", code: "Write code · runs real Python" };

  function shownHTML(card) {
    return card.shown.map((s) => (s.code != null ? `<pre class="code"><code>${esc(s.code)}</code></pre>` : `<div class="card-prompt">${s.html}</div>`)).join("");
  }

  function renderCard(el, area, card, idx) {
    const cs = cardState(card.id);
    el.innerHTML = `
      <header class="card-head">
        <span class="card-kicker">Card ${idx + 1} &middot; ${TYPE_LABEL[card.type] || "Card"}</span>
        <h2>${esc(card.title)}</h2>
        ${cs.correct ? '<span class="stamp">Correct</span>' : ""}
      </header>
      ${shownHTML(card)}
      <div class="card-work"></div>
      <div class="feedback" role="status" aria-live="polite"></div>`;

    const work = el.querySelector(".card-work");
    const fb = el.querySelector(".feedback");
    if (card.problems.length) {
      work.innerHTML = `<div class="feedback bad"><p><strong>This card has a problem.</strong> See the <a href="#/author">author check</a> page.</p></div>`;
      return;
    }
    if (card.type === "predict") predictCard(work, fb, area, card);
    else if (card.type === "choice") choiceCard(work, fb, area, card);
    else if (card.type === "code") codeCard(work, fb, area, card);
  }

  function showResult(fb, card, ok, detail) {
    const cs = cardState(card.id);
    fb.className = "feedback " + (ok ? "good" : "bad");
    if (ok) {
      fb.innerHTML = `<p><strong>Correct!</strong> ${esc(card.explain)}</p>`;
    } else {
      fb.innerHTML =
        `<p><strong>Not yet.</strong> ${detail ? "" : "Try again."}</p>` +
        (detail ? `<pre class="fb-detail">${esc(detail)}</pre>` : "") +
        (card.hint && cs.attempts >= 1 ? `<p class="hint"><strong>Hint:</strong> ${esc(card.hint)}</p>` : "");
    }
  }

  // Wrong answers are recorded first (so the hint shows). Right answers re-render
  // the box so tabs, banner and stamp update, keeping the feedback.
  function answered(area, card, fb, ok, detail) {
    if (!ok) { recordAttempt(card.id, false); showResult(fb, card, false, detail); return; }
    const before = areaStatus(area);
    recordAttempt(card.id, true);
    showResult(fb, card, true);
    const fbHTML = fb.outerHTML;
    route();
    const nfb = document.querySelector(".feedback");
    if (nfb) nfb.outerHTML = fbHTML;
    if (before !== areaStatus(area) && areaStatus(area) === "ready") toast(`${area.name} box complete. Ready for sign-off!`);
  }

  function predictCard(work, fb, area, card) {
    work.innerHTML = `
      <label class="field-label" for="ans-${esc(card.id)}">Your answer</label>
      <textarea id="ans-${esc(card.id)}" class="answer" rows="${Math.max(2, card.answer.split("\n").length + 1)}" spellcheck="false" autocomplete="off"></textarea>
      <div class="btn-row"><button type="button" class="btn primary">Check answer</button></div>`;
    const ta = work.querySelector("textarea");
    work.querySelector("button").addEventListener("click", () => {
      if (!ta.value.trim()) { ta.focus(); return; }
      answered(area, card, fb, normOut(ta.value) === normOut(card.answer));
    });
  }

  function choiceCard(work, fb, area, card) {
    const name = "ch-" + card.id.replace(/\W/g, "-");
    const opts = card.options.map((o, i) => `
      <label class="choice"><input type="radio" name="${name}" value="${i}"><span>${o.html}</span></label>`).join("");
    work.innerHTML = `
      <fieldset class="choices"><legend class="sr-only">Choose one</legend>${opts}</fieldset>
      <div class="btn-row"><button type="button" class="btn primary">Check answer</button></div>`;
    work.querySelector("button").addEventListener("click", () => {
      const picked = work.querySelector("input:checked");
      if (!picked) { fb.className = "feedback"; fb.innerHTML = "<p>Pick an answer first.</p>"; return; }
      answered(area, card, fb, card.options[Number(picked.value)].correct);
    });
  }

  function codeCard(work, fb, area, card) {
    const draft = state.drafts[card.id] != null ? state.drafts[card.id] : card.starter;
    const edId = "ed-" + card.id.replace(/\W/g, "-");
    work.innerHTML = `
      ${card.given ? `<div class="given"><span class="given-label">Set for you</span><code>${esc(card.given)}</code></div>` : ""}
      <label class="field-label" for="${edId}">Your code</label>
      <textarea id="${edId}" class="editor" rows="${Math.max(8, draft.split("\n").length + 2)}" spellcheck="false"
        autocomplete="off" autocapitalize="off" wrap="off">${esc(draft)}</textarea>
      <div class="btn-row">
        <button type="button" class="btn ghost" data-act="run">Run</button>
        <button type="button" class="btn primary" data-act="check">Check my code</button>
        <button type="button" class="link-btn" data-act="reset">Start over</button>
        <span class="py-status muted" aria-live="polite"></span>
      </div>
      <div class="output" hidden><div class="output-label">Output</div><pre></pre></div>`;

    const ed = work.querySelector("textarea");
    const status = work.querySelector(".py-status");
    const outBox = work.querySelector(".output");
    const outPre = outBox.querySelector("pre");
    const buttons = work.querySelectorAll("button[data-act='run'], button[data-act='check']");
    editorKeys(ed);
    ed.addEventListener("input", () => { state.drafts[card.id] = ed.value; save(); });

    Py.warm(status);

    async function go(op) {
      buttons.forEach((b) => (b.disabled = true));
      fb.className = "feedback"; fb.innerHTML = "";
      const result = await Py.request({ op, code: ed.value, given: card.given, checks: card.checks }, status);
      buttons.forEach((b) => (b.disabled = false));

      outBox.hidden = !!result.notRun;
      outPre.textContent = result.output ? result.output.replace(/\n$/, "") : "(nothing printed)";

      if (op === "run" || result.notRun || result.stage === "author") {
        if (!result.ok) {
          fb.className = "feedback bad";
          fb.innerHTML = `<pre class="fb-detail">${esc(result.error)}</pre>`;
        }
        return;
      }
      answered(area, card, fb, result.ok, result.ok ? "" : (result.label ? `With ${result.label}:\n` : "") + result.error);
    }
    work.querySelector("[data-act='run']").addEventListener("click", () => go("run"));
    work.querySelector("[data-act='check']").addEventListener("click", () => go("check"));
    work.querySelector("[data-act='reset']").addEventListener("click", () => {
      ed.value = card.starter; delete state.drafts[card.id]; save(); ed.focus();
    });
  }

  // Tab inserts 4 spaces; Enter keeps indentation and indents after a colon.
  function editorKeys(ed) {
    ed.addEventListener("keydown", (e) => {
      const { selectionStart: s, selectionEnd: t, value: v } = ed;
      if (e.key === "Tab" && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        ed.setRangeText("    ", s, t, "end");
        ed.dispatchEvent(new Event("input"));
      } else if (e.key === "Enter" && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
        const lineStart = v.lastIndexOf("\n", s - 1) + 1;
        const line = v.slice(lineStart, s);
        let indent = (line.match(/^ */) || [""])[0];
        if (/:\s*$/.test(line)) indent += "    ";
        e.preventDefault();
        ed.setRangeText("\n" + indent, s, t, "end");
        ed.dispatchEvent(new Event("input"));
      }
    });
  }

  // ---------- Python (Pyodide in a worker) ----------
  const Py = (() => {
    const TIMEOUT_MS = 5000;
    let worker = null, readyPromise = null, nextId = 1;
    const pending = new Map();

    function start() {
      worker = new Worker("py-worker.js");
      readyPromise = new Promise((resolve, reject) => {
        worker.addEventListener("message", (e) => {
          const m = e.data;
          if (m.type === "ready") resolve();
          else if (m.type === "load-error") reject(new Error(m.error));
          else if (m.type === "result" && pending.has(m.id)) {
            pending.get(m.id)(m.result);
            pending.delete(m.id);
          }
        });
        worker.addEventListener("error", (e) => reject(new Error(e.message || "Python failed to load")));
      });
      readyPromise.catch(() => {});
    }

    async function ensure(status) {
      if (!worker) start();
      let loaded = false;
      readyPromise.then(() => (loaded = true), () => {});
      await Promise.resolve();
      if (!loaded && status) status.textContent = "Loading Python… (first time takes a few seconds)";
      try {
        await readyPromise;
        if (status) status.textContent = "Python ready";
        return true;
      } catch (err) {
        if (status) status.textContent = "Python couldn't load. Check your internet connection.";
        worker = null;
        return false;
      }
    }

    return {
      warm: (status) => { ensure(status); },
      async request(msg, status) {
        if (!(await ensure(status))) {
          return { ok: false, notRun: true, output: "", error: "Python couldn't load, so the code wasn't run. Check your connection and try again." };
        }
        if (status) status.textContent = "Running…";
        const id = nextId++;
        const result = await new Promise((resolve) => {
          const timer = setTimeout(() => {
            pending.delete(id);
            worker.terminate();
            worker = null; // a fresh worker loads on the next run
            resolve({ ok: false, output: "", error: `The code ran for more than ${TIMEOUT_MS / 1000} seconds, so it was stopped. Is there a loop that never ends?` });
          }, TIMEOUT_MS);
          pending.set(id, (r) => { clearTimeout(timer); resolve(r); });
          worker.postMessage(Object.assign({ id }, msg));
        });
        if (status) status.textContent = worker ? "Python ready" : "";
        return result;
      },
    };
  })();

  // ---------- author check (#/author) ----------
  const authorResults = {};

  function viewAuthor() {
    const allCards = AREAS.flatMap((a) => a.cards);
    const nProblems = AREAS.reduce((n, a) => n + a.problems.length + a.cards.reduce((m, c) => m + c.problems.length, 0), 0);
    const sections = AREAS.map((area) => {
      const rows = area.cards.map((card, i) => {
        const r = authorResults[card.id];
        const res = card.problems.length
          ? `<span class="status status-bad">Problem</span>`
          : r === "running" ? `<span class="status">Testing…</span>`
          : r ? (r.ok ? `<span class="status status-mastered">Works</span>` : `<span class="status status-bad">Fails</span>`)
          : card.type === "choice" ? `<span class="status status-mastered">Reads OK</span>` : `<span class="status">Not tested yet</span>`;
        const issues = [...card.problems, ...(r && r.ok === false ? [r.msg] : [])];
        const checkCount = card.type === "code" ? ` · ${card.checks.length} check${card.checks.length === 1 ? "" : "s"}` : "";
        return `
          <li class="author-card">
            <div class="author-row">
              <a href="#/area/${area.id}/${i + 1}">${esc(card.title)}</a>
              <span class="muted">${esc(card.type || "?")}${checkCount} · line ${card.line}</span>
              ${res}
            </div>
            ${issues.map((p) => `<pre class="fb-detail author-issue">${esc(p)}</pre>`).join("")}
          </li>`;
      }).join("");
      return `
        <section class="author-area" style="--skill:${esc(area.color)}">
          <h2>${esc(area.name)} <span class="muted">${esc(area.file)} · ${area.cards.length} card${area.cards.length === 1 ? "" : "s"}</span></h2>
          ${area.problems.map((p) => `<pre class="fb-detail author-issue">${esc(p)}</pre>`).join("")}
          ${area.cards.length ? `<ul class="author-list">${rows}</ul>` : `<p class="muted">No cards yet (shows as "Coming soon").</p>`}
        </section>`;
    }).join("");

    app.innerHTML = `
      <section class="intro">
        <h1>Author check</h1>
        <p>Every card in <code>knowledge-areas/</code>. ${allCards.length} cards, ${nProblems} problem${nProblems === 1 ? "" : "s"} found while reading the files.
          <strong>Test all cards</strong> runs each code card's <code>solution</code> against its checks and each predict card's code against its <code>expected output</code>.
          Reload the page after editing a file.</p>
        <div class="btn-row"><button type="button" class="btn primary" id="author-run">Test all cards</button>
          <span class="py-status muted" id="author-status" aria-live="polite"></span></div>
      </section>
      ${sections}`;
    document.getElementById("author-run").addEventListener("click", testAll);
  }

  async function testAll() {
    const todo = AREAS.flatMap((a) => a.cards).filter((c) => !c.problems.length && (c.type === "code" || c.type === "predict"));
    todo.forEach((c) => (authorResults[c.id] = "running"));
    viewAuthor();
    for (const card of todo) {
      let res;
      if (card.type === "predict") {
        const code = card.shown.filter((s) => s.code != null).map((s) => s.code).join("\n");
        const r = await Py.request({ op: "run", code, given: "" }, document.getElementById("author-status"));
        res = r.ok && normOut(r.output) === normOut(card.answer)
          ? { ok: true }
          : { ok: false, msg: r.ok ? `The expected output doesn't match what the code really prints:\n${normOut(r.output)}` : `The shown code fails: ${r.error}` };
      } else {
        const r = await Py.request({ op: "check", code: card.solution, given: card.given, checks: card.checks }, document.getElementById("author-status"));
        res = r.ok ? { ok: true } : { ok: false, msg: `The solution fails a check${r.label ? ` (with ${r.label})` : ""}:\n${r.error}` };
      }
      authorResults[card.id] = res;
      if (location.hash === "#/author") viewAuthor();
    }
    const failed = todo.filter((c) => !authorResults[c.id].ok).length;
    const st = document.getElementById("author-status");
    if (st) st.textContent = failed ? `${failed} card${failed === 1 ? "" : "s"} failed.` : `All ${todo.length} tested cards work.`;
  }

  // ---------- teacher sign-off (mock) ----------
  const dlg = document.getElementById("signoff-dialog");
  const pinInput = document.getElementById("signoff-pin");
  const pinErr = document.getElementById("signoff-error");
  let signoffArea = null;

  function openSignoff(areaId) {
    const area = areaById(areaId);
    signoffArea = area;
    state.signoff[area.id] = Object.assign({}, state.signoff[area.id], { requested: Date.now() });
    save();
    document.getElementById("signoff-skill").textContent = `${area.name}: ${correctCount(area)} of ${area.cards.length} cards correct.`;
    document.getElementById("signoff-prompt").textContent = area.signoff || "Ask the student to explain one of their answers.";
    document.getElementById("signoff-pin-hint").textContent = `(demo PIN: ${SHELF.teacherPin})`;
    pinInput.value = "";
    pinErr.hidden = true;
    route();
    if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
    pinInput.focus();
  }

  document.getElementById("signoff-form").addEventListener("submit", (e) => {
    if (pinInput.value !== SHELF.teacherPin) {
      e.preventDefault();
      pinErr.textContent = `That PIN isn't right. (For this demo it's ${SHELF.teacherPin}.)`;
      pinErr.hidden = false;
      pinInput.select();
      return;
    }
    state.signoff[signoffArea.id].mastered = Date.now();
    save();
    toast(`${signoffArea.name} badge mastered!`);
    setTimeout(route, 0);
  });
  document.getElementById("signoff-cancel").addEventListener("click", () => dlg.close());

  app.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-signoff]");
    if (btn) openSignoff(btn.dataset.signoff);
  });

  document.getElementById("reset-btn").addEventListener("click", () => {
    if (!confirm("Clear all saved progress, code drafts and badges in this browser?")) return;
    state = blank();
    save();
    location.hash = "#/";
    route();
    toast("Progress reset");
  });

  // ---------- toast ----------
  let toastEl = null, toastTimer = null;
  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement("div");
      toastEl.className = "toast";
      toastEl.setAttribute("role", "status");
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("show"), 2800);
  }

  // ---------- routing ----------
  let lastHash = null;
  function route() {
    const hash = location.hash || "#/";
    const parts = hash.replace(/^#\/?/, "").split("/");
    document.querySelectorAll("[data-nav]").forEach((a) => a.classList.toggle("active", a.dataset.nav === (parts[0] || "shelf")));
    if (parts[0] === "area") viewArea(parts[1], Number(parts[2]) || 1);
    else if (parts[0] === "board") viewBoard();
    else if (parts[0] === "author") viewAuthor();
    else viewShelf();
    if (hash !== lastHash) { window.scrollTo(0, 0); lastHash = hash; }
  }

  // ---------- start ----------
  app.innerHTML = `<p class="muted loading">Loading the knowledge areas…</p>`;
  Loader.load().then(({ shelf, areas }) => {
    SHELF = shelf;
    AREAS = areas;
    window.addEventListener("hashchange", route);
    route();
  }).catch((err) => {
    app.innerHTML = `<section class="intro"><h1>Couldn't load the cards</h1>
      <p>${esc(err.message)}. This page reads <code>knowledge-areas/shelf.md</code>, so it has to be opened through a web server
      (GitHub Pages, or <code>python3 -m http.server</code> in this folder), not straight from a file.</p></section>`;
  });
})();
