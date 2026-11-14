// Runs student Python in a Web Worker with Pyodide, so an infinite loop can be
// stopped (the page terminates this worker) without freezing the page.
//
// Messages in:  { id, op: "run",   code, given }
//               { id, op: "check", code, given, checks: [...] }   (checks from loader.js)
// Message out:  { type: "result", id, result: { ok, output, error?, label?, stage? } }
importScripts("https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js");

const HARNESS = String.raw`
import ast, io, json, sys, tokenize, traceback

def _fmt(e, fname):
    if isinstance(e, SyntaxError):
        return f"SyntaxError on line {e.lineno}: {e.msg}"
    tb = traceback.extract_tb(e.__traceback__)
    line = next((f.lineno for f in reversed(tb) if f.filename == fname), None)
    where = f" on line {line}" if line else ""
    if isinstance(e, NameError) and getattr(e, "name", None):
        return f"NameError{where}: '{e.name}' isn't defined yet."
    return f"{type(e).__name__}{where}: {e}"

def _norm(s):
    lines = [l.rstrip() for l in s.replace("\r", "").split("\n")]
    return "\n".join(lines).strip("\n")

def _exec(code, setup):
    """Run setup, then the student's code, in a fresh namespace. Capture printing."""
    ns = {"__name__": "__main__"}
    buf = io.StringIO()
    old = sys.stdout
    sys.stdout = buf
    err = setup_err = None
    try:
        if setup:
            try:
                exec(compile(setup, "<setup>", "exec"), ns)
            except BaseException as e:
                setup_err = f"{type(e).__name__}: {e}"
        if setup_err is None:
            try:
                exec(compile(code, "<your code>", "exec"), ns)
            except BaseException as e:
                err = _fmt(e, "<your code>")
    finally:
        sys.stdout = old
    return ns, buf.getvalue(), err, setup_err

def _helpers(code):
    words, called = set(), set()
    try:
        for tok in tokenize.generate_tokens(io.StringIO(code).readline):
            if tok.type == tokenize.NAME:
                words.add(tok.string)
    except Exception:
        pass
    try:
        for node in ast.walk(ast.parse(code)):
            if isinstance(node, ast.Call):
                f = node.func
                if isinstance(f, ast.Name):
                    called.add(f.id)
                elif isinstance(f, ast.Attribute):
                    called.add(f.attr)
    except Exception:
        pass
    squash = lambda s: "".join(str(s).split())
    flat = squash(code)
    return {
        "uses": lambda *ws: any(w in words for w in ws),
        "calls": lambda *ns: any(n in called for n in ns),
        "has": lambda text: squash(text) in flat,
    }

def _parse_line(text):
    if "->" not in text:
        raise ValueError('it needs "->" between the setup and the check.')
    setup, rhs = text.split("->", 1)
    setup, rhs = setup.strip(), rhs.strip()
    if not rhs:
        raise ValueError("there's nothing after ->.")
    if setup:
        try:
            compile(setup, "<setup>", "exec")
        except SyntaxError as e:
            raise ValueError(f"the setup before -> isn't valid Python ({e.msg}).")
    try:
        body = ast.parse(rhs, mode="eval").body
    except SyntaxError as e:
        raise ValueError(f"the check after -> isn't valid Python ({e.msg}).")
    feedback, expr = None, rhs
    if (isinstance(body, ast.Tuple) and len(body.elts) == 2
            and isinstance(body.elts[1], ast.Constant) and isinstance(body.elts[1].value, str)):
        feedback = body.elts[1].value
        expr = ast.get_source_segment(rhs, body.elts[0])
    return setup, expr, feedback

def _auto_msg(expr, g):
    try:
        body = ast.parse(expr, mode="eval").body
        if isinstance(body, ast.Compare) and len(body.ops) == 1:
            left = ast.get_source_segment(expr, body.left)
            return f"Expected {expr}, but {left} is {eval(left, g)!r}."
    except Exception:
        pass
    return f"Expected {expr} to be True."

def _result(ok, output="", error=None, label="", stage=None):
    return json.dumps({"ok": ok, "output": output, "error": error, "label": label, "stage": stage})

def _run(code, given):
    ns, out, err, serr = _exec(code, given)
    if serr:
        return _result(False, out, f"The given line failed: {serr}", stage="author")
    return _result(err is None, out, err, stage="run" if err else None)

def _check(code, given, checks_json):
    cache = {}
    last_out = ""
    for c in json.loads(checks_json):
        if c["kind"] == "line":
            try:
                setup, expr, feedback = _parse_line(c["text"])
            except ValueError as e:
                return _result(False, error=f"Card problem in a tests line ({c['text']}): {e}", stage="author")
        else:
            setup, expr, feedback = c.get("setup", ""), None, None
        setup = setup or given
        label = setup.replace("\n", "; ")
        if setup not in cache:
            cache[setup] = _exec(code, setup)
        ns, out, err, serr = cache[setup]
        last_out = out
        if serr:
            return _result(False, out, f"Card problem: the setup ({label}) failed: {serr}", stage="author")
        if err:
            return _result(False, out, err, label, "run")
        printed = _norm(out)
        if c["kind"] == "output":
            want = _norm(c["expected"])
            if printed != want:
                return _result(False, out, f"Expected this output:\n{want}\n\nYour code printed:\n{printed or '(nothing)'}", label, "check")
            continue
        g = dict(ns)
        g.update(_helpers(code))
        g["printed"], g["source"] = printed, code
        try:
            passed = bool(eval(expr, g))
        except NameError as e:
            return _result(False, out, f"Your code needs to create '{e.name}'.", label, "check")
        except Exception as e:
            crash = f"Checking {expr} caused {type(e).__name__}: {e}"
            return _result(False, out, f"{feedback}\n({crash})" if feedback else crash, label, "check")
        if not passed:
            return _result(False, out, feedback or _auto_msg(expr, g), label, "check")
    return _result(True, last_out)
`;

const ready = (async () => {
  const py = await loadPyodide();
  py.runPython(HARNESS);
  return py;
})();

ready.then(
  () => self.postMessage({ type: "ready" }),
  (err) => self.postMessage({ type: "load-error", error: String(err) })
);

self.onmessage = async (e) => {
  const { id, op, code, given, checks } = e.data;
  const py = await ready;
  let result;
  const fn = py.globals.get(op === "check" ? "_check" : "_run");
  try {
    const raw = op === "check" ? fn(code, given || "", JSON.stringify(checks || [])) : fn(code, given || "");
    result = JSON.parse(raw);
  } catch (err) {
    result = { ok: false, output: "", error: String(err), stage: "internal" };
  } finally {
    fn.destroy();
  }
  self.postMessage({ type: "result", id, result });
};
