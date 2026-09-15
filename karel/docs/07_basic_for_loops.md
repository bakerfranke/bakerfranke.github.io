# Basic For Loops

If you need Karel to repeat the exact same instruction a fixed number of times, writing it out over and over gets old fast:

```python
def takeSixSteps(self):
    self.step()
    self.step()
    self.step()
    self.step()
    self.step()
    self.step()
```

A **for loop** lets you say "do this N times" directly, instead of repeating the line by hand.

**Example:**

```python
def takeSixSteps(self):
    for street in range(6):
        self.step()
```

Both versions do exactly the same thing — call `self.step()` six times — but the loop version says so directly instead of making you count repeated lines.

---

## The form we're using

Python's `for` loop is actually a very flexible instruction with many forms — but for now, we're only using it for one specific purpose: **repeating something a fixed number of times.** That form looks like this:

```python
for <variable-name> in range(<number>):
    <do something>
```

- `for` and `in` are both reserved words in Python — they always appear together, in that order, in a for loop.
- `range(<number>)` produces a sequence of that many values for the loop to step through — `range(6)` gives the loop 6 things to do, so the indented block underneath runs 6 times.
- `<variable-name>` can be anything you like — Python needs some name to hold each value from `range()` as the loop steps through it, even if your code never actually uses that value.
- `<number>` should be a single whole number (for now).

---

## You usually won't use the loop variable itself

Notice that `takeSixSteps()` never actually refers to `street` anywhere inside the loop — it's just there because the `for ... in` syntax requires *some* variable name to hold each step's value. That's normal for this simple use of a for loop: you're using it purely to repeat something a set number of times, not because you need to know which repetition you're on.

> ### Pick a real name anyway
>
> Since the loop variable isn't used, it might be tempting to name it something meaningless, like `foo`:
>
> ```python
> for foo in range(8):
>     self.step()
> ```
>
> This is legal Python — it'll run exactly the same way — but it's bad style. Pick a name that means something in context, even if you never reference it directly. `takeSixSteps()`'s loop variable is called `street` because each repetition roughly corresponds to moving up one street; name yours by whatever the repetition represents in your own problem.

---

## Why this matters

- **Less to type, less to get wrong** — six repeated lines are six chances to typo one of them; one loop is one line to get right.
- **The count is explicit** — `range(6)` tells any reader exactly how many times this repeats, without them having to count lines.
- **It's the first step toward loops that do more** — later on you'll see for loops that use the loop variable's value, or repeat based on something other than a fixed number — but the repeat-N-times form is the one you'll reach for constantly from here on.
