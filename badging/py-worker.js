// Runs student Python in a Web Worker with Pyodide, so an infinite loop can be
// stopped (the page terminates this worker) without freezing the page.
importScripts("https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js");

const HARNESS = `
import io, json, sys, traceback

def _fmt(e, fname):
    if isinstance(e, SyntaxError):
        return f"SyntaxError on line {e.lineno}: {e.msg}"
    tb = traceback.extract_tb(e.__traceback__)
    line = next((f.lineno for f in reversed(tb) if f.filename == fname), None)
    where = f" on line {line}" if line else ""
    if isinstance(e, NameError) and getattr(e, "name", None):
        return f"NameError{where}: '{e.name}' isn't defined yet."
    return f"{type(e).__name__}{where}: {e}"

def _harness(code, setup, test):
    ns = {"__name__": "__main__"}
    buf = io.StringIO()
    old = sys.stdout
    sys.stdout = buf
    err = None
    try:
        if setup:
            exec(setup, ns)
        try:
            exec(compile(code, "<your code>", "exec"), ns)
        except BaseException as e:
            err = _fmt(e, "<your code>")
    finally:
        sys.stdout = old
    out = buf.getvalue()
    if err:
        return json.dumps({"ok": False, "output": out, "error": err, "stage": "run"})
    if test:
        ns["_output"] = "\\n".join(line.rstrip() for line in out.rstrip().splitlines())
        ns["_source"] = code
        try:
            exec(test, ns)
        except AssertionError as e:
            return json.dumps({"ok": False, "output": out, "error": str(e) or "A check failed.", "stage": "check"})
        except NameError as e:
            return json.dumps({"ok": False, "output": out, "error": f"Your code needs to create a variable named '{e.name}'.", "stage": "check"})
        except Exception as e:
            return json.dumps({"ok": False, "output": out, "error": f"The check couldn't run: {type(e).__name__}: {e}", "stage": "check"})
    return json.dumps({"ok": True, "output": out})
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
  const { id, code, checks } = e.data;
  const py = await ready;
  const harness = py.globals.get("_harness");
  let result = { ok: true, output: "" };
  try {
    for (const check of checks) {
      result = JSON.parse(harness(code, check.setup || "", check.test || ""));
      result.label = check.label || "";
      if (!result.ok) break;
    }
  } catch (err) {
    result = { ok: false, output: "", error: String(err), stage: "internal" };
  } finally {
    harness.destroy();
  }
  self.postMessage({ type: "result", id, result });
};
