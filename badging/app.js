/* Python Skill Boxes: shelf, cards, progress board, mock teacher sign-off. */
(() => {
  "use strict";

  // ---------- saved progress (this browser only) ----------
  const STORE_KEY = "badging-mockup-v1";
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

  // ---------- skill status ----------
  const skillById = (id) => SKILLS.find((s) => s.id === id);
  const needed = (skill) => (CARDS_NEEDED === "all" ? skill.cards.length : Math.min(CARDS_NEEDED, skill.cards.length));
  const correctCount = (skill) => skill.cards.filter((c) => cardState(c.id).correct).length;

  // locked | new | progress | ready | requested | mastered
  function skillStatus(skill) {
    if (!skill.open) return "locked";
    if (state.signoff[skill.id] && state.signoff[skill.id].mastered) return "mastered";
    const done = correctCount(skill);
    if (done >= needed(skill)) return state.signoff[skill.id] && state.signoff[skill.id].requested ? "requested" : "ready";
    const tried = skill.cards.some((c) => cardState(c.id).attempts > 0);
    return tried ? "progress" : "new";
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
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const normOut = (s) => String(s).replace(/\r/g, "").split("\n").map((l) => l.trimEnd()).join("\n").trim();
  const fmtDate = (t) => new Date(t).toLocaleDateString(undefined, { month: "short", day: "numeric" });

  function pips(skill) {
    return skill.cards
      .map((c) => `<span class="pip ${cardState(c.id).correct ? "on" : ""}" aria-hidden="true"></span>`)
      .join("");
  }

  // ---------- views ----------
  function viewShelf() {
    const boxes = SKILLS.map((skill) => {
      const st = skillStatus(skill);
      const inner = `
        <span class="box-tab">${esc(skill.name)}</span>
        <span class="box-body">
          <span class="box-blurb">${esc(skill.blurb)}</span>
          ${skill.open
            ? `<span class="box-cards">${correctCount(skill)} of ${skill.cards.length} cards <span class="pips">${pips(skill)}</span></span>`
            : `<span class="box-cards">No cards yet</span>`}
          <span class="status status-${st}">${STATUS_TEXT[st]}</span>
        </span>`;
      return skill.open
        ? `<a class="box" style="--skill:${skill.color}" href="#/skill/${skill.id}">${inner}</a>`
        : `<div class="box locked" style="--skill:${skill.color}" aria-disabled="true">${inner}</div>`;
    }).join("");

    app.innerHTML = `
      <section class="intro">
        <h1>Pick a box. Work at your own pace.</h1>
        <p>Each colored box is one skill. Finish the cards in a box, then ask your teacher to sign off and earn the badge.
          Master all ${SKILLS.length} skills to earn an A.</p>
      </section>
      ${summaryBar()}
      <section aria-label="Skill boxes" class="shelf">${boxes}</section>`;
  }

  function summaryBar() {
    const mastered = SKILLS.filter((s) => skillStatus(s) === "mastered").length;
    const pct = Math.round((mastered / SKILLS.length) * 100);
    return `
      <div class="summary">
        <div class="summary-text"><strong>${mastered} of ${SKILLS.length}</strong> badges mastered <span class="muted">&middot; all ${SKILLS.length} = A</span></div>
        <div class="meter" role="progressbar" aria-valuemin="0" aria-valuemax="${SKILLS.length}" aria-valuenow="${mastered}" aria-label="Badges mastered">
          <span style="width:${pct}%"></span>
        </div>
      </div>`;
  }

  function viewBoard() {
    const badges = SKILLS.map((skill) => {
      const st = skillStatus(skill);
      const so = state.signoff[skill.id] || {};
      const detail =
        st === "mastered" ? `Signed off ${fmtDate(so.mastered)}` :
        st === "locked" ? "Cards coming soon" :
        `${correctCount(skill)} of ${needed(skill)} cards needed`;
      const action =
        st === "ready" || st === "requested"
          ? `<button type="button" class="btn small primary" data-signoff="${skill.id}">${st === "requested" ? "Teacher: sign off" : "Request sign-off"}</button>`
          : skill.open && st !== "mastered"
          ? `<a class="btn small ghost" href="#/skill/${skill.id}">Open box</a>`
          : "";
      return `
        <li class="badge badge-${st}" style="--skill:${skill.color}">
          <span class="medal" aria-hidden="true">${st === "mastered" ? "&#10003;" : esc(skill.name.charAt(0))}</span>
          <span class="badge-name">${esc(skill.name)}</span>
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

  function viewSkill(skillId, cardNum) {
    const skill = skillById(skillId);
    if (!skill || !skill.open) return viewShelf();
    const idx = Math.min(Math.max((cardNum || 1) - 1, 0), skill.cards.length - 1);
    const card = skill.cards[idx];
    const st = skillStatus(skill);

    const tabs = skill.cards.map((c, i) => {
      const cs = cardState(c.id);
      return `<a class="card-tab ${i === idx ? "current" : ""} ${cs.correct ? "done" : ""}" href="#/skill/${skill.id}/${i + 1}"
        ${i === idx ? 'aria-current="page"' : ""}>
        <span class="card-num">${i + 1}</span><span class="sr-only">${cs.correct ? " (correct)" : ""}</span>
      </a>`;
    }).join("");

    const ready = st === "ready" || st === "requested";
    const banner = st === "mastered"
      ? `<div class="banner mastered">Badge mastered. Signed off ${fmtDate(state.signoff[skill.id].mastered)}.</div>`
      : ready
      ? `<div class="banner ready"><span>You finished this box. Ask your teacher to sign off.</span>
           <button type="button" class="btn small primary" data-signoff="${skill.id}">${st === "requested" ? "Teacher: sign off" : "Request sign-off"}</button></div>`
      : `<div class="banner">Get ${needed(skill)} of ${skill.cards.length} cards right to be ready for sign-off. You have ${correctCount(skill)}.</div>`;

    app.innerHTML = `
      <section class="skill-view" style="--skill:${skill.color}">
        <div class="skill-head">
          <a class="back" href="#/">&larr; Shelf</a>
          <h1>${esc(skill.name)}</h1>
          <span class="status status-${st}">${STATUS_TEXT[st]}</span>
        </div>
        <nav class="card-tabs" aria-label="Cards in this box">${tabs}</nav>
        ${banner}
        <article class="card" id="card"></article>
        <div class="card-nav">
          ${idx > 0 ? `<a class="btn ghost" href="#/skill/${skill.id}/${idx}">&larr; Previous card</a>` : "<span></span>"}
          ${idx < skill.cards.length - 1 ? `<a class="btn ghost" href="#/skill/${skill.id}/${idx + 2}">Next card &rarr;</a>` : "<span></span>"}
        </div>
      </section>`;

    renderCard(document.getElementById("card"), skill, card, idx);
  }

  // ---------- cards ----------
  function renderCard(el, skill, card, idx) {
    const cs = cardState(card.id);
    const typeLabel = { predict: "Predict the output", choice: "Multiple choice", code: "Write code · runs real Python" }[card.type];
    el.innerHTML = `
      <header class="card-head">
        <span class="card-kicker">Card ${idx + 1} &middot; ${typeLabel}</span>
        <h2>${esc(card.title)}</h2>
        ${cs.correct ? '<span class="stamp">Correct</span>' : ""}
      </header>
      <p class="card-prompt">${card.prompt}</p>
      ${card.code ? `<pre class="code"><code>${esc(card.code)}</code></pre>` : ""}
      <div class="card-work"></div>
      <div class="feedback" role="status" aria-live="polite"></div>`;

    const work = el.querySelector(".card-work");
    const fb = el.querySelector(".feedback");
    if (card.type === "predict") predictCard(work, fb, skill, card);
    else if (card.type === "choice") choiceCard(work, fb, skill, card);
    else if (card.type === "code") codeCard(work, fb, skill, card);
  }

  function showResult(fb, card, ok, detail) {
    const cs = cardState(card.id);
    fb.className = "feedback " + (ok ? "good" : "bad");
    if (ok) {
      fb.innerHTML = `<p><strong>Correct!</strong> ${esc(card.explain || "")}</p>`;
    } else {
      fb.innerHTML =
        `<p><strong>Not yet.</strong> ${detail ? "" : "Try again."}</p>` +
        (detail ? `<pre class="fb-detail">${esc(detail)}</pre>` : "") +
        (card.hint && cs.attempts >= 1 ? `<p class="hint"><strong>Hint:</strong> ${esc(card.hint)}</p>` : "");
    }
  }

  function afterAnswer(skill, card, ok) {
    const before = skillStatus(skill);
    recordAttempt(card.id, ok);
    if (ok) {
      const after = skillStatus(skill);
      // Re-render the box so tabs, banner and stamp update, keeping the feedback.
      const fb = document.querySelector(".feedback");
      const fbHTML = fb ? fb.outerHTML : "";
      const scroll = window.scrollY;
      route();
      const nfb = document.querySelector(".feedback");
      if (nfb && fbHTML) nfb.outerHTML = fbHTML;
      window.scrollTo(0, scroll);
      if (before !== after && after === "ready") toast(`${skill.name} box complete. Ready for sign-off!`);
    }
  }

  function predictCard(work, fb, skill, card) {
    work.innerHTML = `
      <label class="field-label" for="ans-${card.id}">Your answer</label>
      <textarea id="ans-${card.id}" class="answer" rows="${Math.max(2, card.answer.split("\n").length + 1)}" spellcheck="false" autocomplete="off"></textarea>
      <div class="btn-row"><button type="button" class="btn primary">Check answer</button></div>`;
    const ta = work.querySelector("textarea");
    work.querySelector("button").addEventListener("click", () => {
      if (!ta.value.trim()) { ta.focus(); return; }
      const ok = normOut(ta.value) === normOut(card.answer);
      recordAttemptOnlyIfWrong(ok, card);
      showResult(fb, card, ok);
      if (ok) afterAnswer(skill, card, true);
    });
  }

  // Wrong attempts are recorded right away (so the hint appears); correct ones go
  // through afterAnswer, which also refreshes the view.
  function recordAttemptOnlyIfWrong(ok, card) {
    if (!ok) recordAttempt(card.id, false);
  }

  function choiceCard(work, fb, skill, card) {
    const opts = card.options.map((o, i) => `
      <label class="choice"><input type="radio" name="ch-${card.id}" value="${i}"><span>${esc(o)}</span></label>`).join("");
    work.innerHTML = `
      <fieldset class="choices"><legend class="sr-only">Choose one</legend>${opts}</fieldset>
      <div class="btn-row"><button type="button" class="btn primary">Check answer</button></div>`;
    work.querySelector("button").addEventListener("click", () => {
      const picked = work.querySelector("input:checked");
      if (!picked) { fb.className = "feedback"; fb.innerHTML = "<p>Pick an answer first.</p>"; return; }
      const ok = Number(picked.value) === card.correct;
      recordAttemptOnlyIfWrong(ok, card);
      showResult(fb, card, ok);
      if (ok) afterAnswer(skill, card, true);
    });
  }

  function codeCard(work, fb, skill, card) {
    const draft = state.drafts[card.id] != null ? state.drafts[card.id] : card.starter;
    work.innerHTML = `
      ${card.given ? `<div class="given"><span class="given-label">Set for you</span><code>${esc(card.given)}</code></div>` : ""}
      <label class="field-label" for="ed-${card.id}">Your code</label>
      <textarea id="ed-${card.id}" class="editor" rows="${Math.max(8, draft.split("\n").length + 2)}" spellcheck="false"
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

    async function go(mode) {
      buttons.forEach((b) => (b.disabled = true));
      fb.className = "feedback"; fb.innerHTML = "";
      const checks = mode === "run" ? [{ label: "", setup: card.given || "", test: "" }] : card.checks;
      const result = await Py.run(ed.value, checks, status);
      buttons.forEach((b) => (b.disabled = false));

      outBox.hidden = !!result.notRun;
      outPre.textContent = result.output ? result.output.replace(/\n$/, "") : "(nothing printed)";

      if (mode === "run" || result.notRun) {
        if (!result.ok) {
          fb.className = "feedback bad";
          fb.innerHTML = `<pre class="fb-detail">${esc(result.error)}</pre>`;
        }
        return;
      }
      if (result.ok) {
        showResult(fb, card, true);
        afterAnswer(skill, card, true);
      } else {
        recordAttempt(card.id, false);
        const where = result.label ? `Checking with ${result.label}:\n` : "";
        showResult(fb, card, false, where + result.error);
      }
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
      async run(code, checks, status) {
        if (!(await ensure(status))) {
          return { ok: false, notRun: true, output: "", error: "Python couldn't load, so your code wasn't run. Check your connection and try again." };
        }
        if (status) status.textContent = "Running…";
        const id = nextId++;
        const result = await new Promise((resolve) => {
          const timer = setTimeout(() => {
            pending.delete(id);
            worker.terminate();
            worker = null; // a fresh worker loads on the next run
            resolve({ ok: false, output: "", error: `Your code ran for more than ${TIMEOUT_MS / 1000} seconds, so it was stopped. Is there a loop that never ends?` });
          }, TIMEOUT_MS);
          pending.set(id, (r) => { clearTimeout(timer); resolve(r); });
          worker.postMessage({ id, code, checks });
        });
        if (status) status.textContent = worker ? "Python ready" : "";
        return result;
      },
    };
  })();

  // ---------- teacher sign-off (mock) ----------
  const dlg = document.getElementById("signoff-dialog");
  const pinInput = document.getElementById("signoff-pin");
  const pinErr = document.getElementById("signoff-error");
  let signoffSkill = null;

  function openSignoff(skillId) {
    const skill = skillById(skillId);
    signoffSkill = skill;
    state.signoff[skill.id] = Object.assign({}, state.signoff[skill.id], { requested: Date.now() });
    save();
    document.getElementById("signoff-skill").textContent =
      `${skill.name}: ${correctCount(skill)} of ${skill.cards.length} cards correct.`;
    document.getElementById("signoff-prompt").textContent = skill.signoffPrompt || "Ask the student to explain one of their answers.";
    pinInput.value = "";
    pinErr.hidden = true;
    route();
    if (typeof dlg.showModal === "function") dlg.showModal(); else dlg.setAttribute("open", "");
    pinInput.focus();
  }

  document.getElementById("signoff-form").addEventListener("submit", (e) => {
    if (pinInput.value !== TEACHER_PIN) {
      e.preventDefault();
      pinErr.textContent = "That PIN isn't right. (For this demo it's 1234.)";
      pinErr.hidden = false;
      pinInput.select();
      return;
    }
    state.signoff[signoffSkill.id].mastered = Date.now();
    save();
    toast(`${signoffSkill.name} badge mastered!`);
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
    document.querySelectorAll("[data-nav]").forEach((a) => {
      const on = (parts[0] === "board") === (a.dataset.nav === "board");
      a.classList.toggle("active", on);
    });
    if (parts[0] === "skill") viewSkill(parts[1], Number(parts[2]) || 1);
    else if (parts[0] === "board") viewBoard();
    else viewShelf();
    if (hash !== lastHash) { window.scrollTo(0, 0); lastHash = hash; }
  }
  window.addEventListener("hashchange", route);
  route();
})();
