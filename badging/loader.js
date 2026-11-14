/* Reads knowledge-areas/*.md into card data. Format: knowledge-areas/AUTHORING.md */
const Loader = (() => {
  "use strict";
  const FOLDER = "knowledge-areas/";
  const CARD_KEYS = /^(type|given|hint|explain|id):\s*(.*)$/i;
  const AREA_KEYS = /^(color|blurb|signoff):\s*(.*)$/i;
  const TYPES = ["predict", "choice", "code"];

  const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  // ---------- tiny Markdown (prompts and choices) ----------
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  function inline(s) {
    return String(s).split(/(`[^`]+`)/).map((p, i) => {
      if (i % 2) return `<code>${esc(p.slice(1, -1))}</code>`;
      return esc(p)
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/(^|[^*\w])\*([^*\s][^*]*?)\*/g, "$1<em>$2</em>")
        .replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
    }).join("");
  }
  function mdBlock(text) {
    const out = [];
    let para = [], list = [];
    const flushP = () => { if (para.length) { out.push(`<p>${inline(para.join(" "))}</p>`); para = []; } };
    const flushL = () => { if (list.length) { out.push(`<ul>${list.map((x) => `<li>${inline(x)}</li>`).join("")}</ul>`); list = []; } };
    for (const l of text.split("\n")) {
      const m = l.match(/^\s*[-*]\s+(.*)$/);
      if (!l.trim()) { flushP(); flushL(); }
      else if (m) { flushP(); list.push(m[1]); }
      else { flushL(); para.push(l.trim()); }
    }
    flushP(); flushL();
    return out.join("");
  }

  // ---------- one knowledge area file ----------
  function parseArea(text, file) {
    const id = file.replace(/\.md$/i, "");
    const area = { id, file, name: id, color: "#475569", blurb: "", signoff: "", cards: [], problems: [] };
    const raw = [];
    let card = null, fence = null;
    const lines = text.replace(/\r/g, "").split("\n");

    lines.forEach((line, i) => {
      const lineNo = i + 1;
      if (fence) {
        if (/^\s*```\s*$/.test(line)) {
          if (card) card.body.push({ fence: fence.lang, text: fence.lines.join("\n"), line: fence.line });
          fence = null;
        } else fence.lines.push(line);
        return;
      }
      let m = line.match(/^\s*```(.*)$/);
      if (m) {
        // Block name, e.g. "python", "tests", "expected output" (also expected-output / expected_output)
        fence = { lang: m[1].trim().toLowerCase().replace(/[\s_-]+/g, " "), lines: [], line: lineNo };
        if (card) card.headDone = true;
        return;
      }
      if ((m = line.match(/^##\s+(.+)$/))) {
        card = { title: m[1].trim(), line: lineNo, meta: {}, body: [], headDone: false };
        raw.push(card);
        return;
      }
      if (!card) {
        if ((m = line.match(/^#\s+(.+)$/))) area.name = m[1].trim();
        else if ((m = line.match(AREA_KEYS))) area[m[1].toLowerCase()] = m[2].trim();
        return;
      }
      if (!card.headDone) {
        if (!line.trim()) return;
        if ((m = line.match(CARD_KEYS))) { card.meta[m[1].toLowerCase()] = m[2].trim(); return; }
        card.headDone = true;
      }
      card.body.push({ text: line, line: lineNo });
    });
    if (fence) area.problems.push(`Line ${fence.line}: this \`\`\` block is never closed.`);

    const seen = new Set();
    area.cards = raw.map((r) => buildCard(r, area));
    area.cards.forEach((c) => {
      if (seen.has(c.id)) c.problems.push(`Two cards have the id "${c.id}". Give one of them an id: line.`);
      seen.add(c.id);
    });
    return area;
  }

  function buildCard(r, area) {
    const card = {
      title: r.title,
      line: r.line,
      id: r.meta.id ? `${area.id}/${r.meta.id}` : `${area.id}/${slug(r.title)}`,
      type: (r.meta.type || "").toLowerCase(),
      given: r.meta.given || "",
      hint: r.meta.hint || "",
      explain: r.meta.explain || "",
      shown: [],      // [{html}] or [{code}] in order
      options: [],    // choice
      answer: null,   // predict
      starter: "", solution: null, checks: [],   // code
      problems: [],
    };
    let md = [];
    const flush = () => { if (md.some((l) => l.trim())) card.shown.push({ html: mdBlock(md.join("\n")) }); md = []; };

    for (const item of r.body) {
      if (item.fence !== undefined) {
        const t = item.text;
        switch (item.fence) {
          case "expected output": {
            // Optional setup above a --- line, then the exact output.
            const ls = t.split("\n");
            const sep = ls.findIndex((l) => l.trim() === "---");
            const setup = sep < 0 ? "" : ls.slice(0, sep).join("\n").trim();
            const expected = sep < 0 ? t : ls.slice(sep + 1).join("\n");
            if (card.type === "predict") {
              if (setup) card.problems.push(`Line ${item.line}: on a predict card, put all the code in the \`\`\`python block. Setup above --- is only for code cards.`);
              if (card.answer != null) card.problems.push(`Line ${item.line}: a predict card has just one \`\`\`expected output block.`);
              card.answer = expected;
            } else if (card.type === "code") {
              card.checks.push({ kind: "output", setup, expected, line: item.line });
            } else {
              card.problems.push(`Line ${item.line}: \`\`\`expected output is only for predict and code cards.`);
            }
            break;
          }
          case "answer":
          case "output":
            card.problems.push(`Line ${item.line}: \`\`\`${item.fence} is now called \`\`\`expected output.`);
            break;
          case "starter": card.starter = t.replace(/\n*$/, "\n"); break;
          case "solution": card.solution = t; break;
          case "tests":
            t.split("\n").forEach((l, k) => {
              if (l.trim() && !l.trim().startsWith("#")) card.checks.push({ kind: "line", text: l.trim(), line: item.line + k + 1 });
            });
            break;
          default:
            flush();
            card.shown.push({ code: t });
        }
        continue;
      }
      const opt = item.text.match(/^\s*[-*]\s+\[( |x|X)\]\s+(.*)$/);
      if (opt) { card.options.push({ html: inline(opt[2]), correct: opt[1] !== " " }); continue; }
      md.push(item.text);
    }
    flush();

    // ---- problems an author should fix ----
    const where = `Line ${r.line}`;
    if (!TYPES.includes(card.type)) card.problems.push(`${where}: type should be predict, choice, or code (it's "${r.meta.type || "missing"}").`);
    if (card.type === "predict") {
      if (card.answer == null) card.problems.push(`${where}: a predict card needs an \`\`\`expected output block.`);
      if (!card.shown.some((s) => s.code)) card.problems.push(`${where}: a predict card needs a \`\`\`python block to show.`);
    }
    if (card.type === "choice") {
      if (card.options.length < 2) card.problems.push(`${where}: a choice card needs at least two "- [ ]" choices.`);
      const n = card.options.filter((o) => o.correct).length;
      if (n !== 1) card.problems.push(`${where}: mark exactly one choice with [x] (found ${n}).`);
    }
    if (card.type === "code") {
      if (!card.checks.length) card.problems.push(`${where}: a code card needs a \`\`\`tests or \`\`\`expected output block.`);
      if (card.solution == null) card.problems.push(`${where}: add a \`\`\`solution block so the author page can test this card.`);
    }
    return card;
  }

  // ---------- shelf.md ----------
  function parseShelf(text) {
    const shelf = { files: [], cardsNeeded: "all", teacherPin: "1234" };
    for (const line of text.replace(/\r/g, "").split("\n")) {
      let m;
      if ((m = line.match(/^\s*[-*]\s+(\S+\.md)\s*$/i))) shelf.files.push(m[1]);
      else if ((m = line.match(/^cards-needed:\s*(\S+)/i))) shelf.cardsNeeded = /^all$/i.test(m[1]) ? "all" : Number(m[1]) || "all";
      else if ((m = line.match(/^teacher-pin:\s*(\S+)/i))) shelf.teacherPin = m[1];
    }
    return shelf;
  }

  async function fetchText(path) {
    const res = await fetch(FOLDER + path, { cache: "no-cache" });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
    return res.text();
  }

  async function load() {
    const shelf = parseShelf(await fetchText("shelf.md"));
    const areas = await Promise.all(shelf.files.map(async (file) => {
      try {
        return parseArea(await fetchText(file), file);
      } catch (err) {
        const id = file.replace(/\.md$/i, "");
        return { id, file, name: id, color: "#475569", blurb: "", signoff: "", cards: [], problems: [`Couldn't load ${file}: ${err.message}`] };
      }
    }));
    return { shelf, areas };
  }

  return { load, parseArea, inline, esc };
})();
