# Compound Boolean Expressions

Once you're checking more than one condition at a time, nested `if` statements can get deep fast. **Compound boolean expressions** — joining conditions with `and` / `or` — let you collapse that nesting into a single, flat `if`.

**Example — before:**

```python
if self.wallToLeft():
    if not self.nextToABeeper():
        self.putBeeper()
```

**Example — after:**

```python
if self.wallToLeft() and not self.nextToABeeper():
    self.putBeeper()
```

Same behavior, one level of nesting instead of two. As the number of conditions grows, the difference gets more dramatic — three or four nested `if`s become one line.

---

## `and`: every condition has to be true

`and` combines two boolean expressions into one: the result is `True` only if **both sides** are `True`.

| Left | Right | `Left and Right` |
|---|---|---|
| `True` | `True` | `True` |
| `True` | `False` | `False` |
| `False` | `True` | `False` |
| `False` | `False` | `False` |

## `or`: at least one condition has to be true

`or` combines two boolean expressions so the result is `True` if **either side** (or both) is `True` — only `False` when both sides are.

| Left | Right | `Left or Right` |
|---|---|---|
| `True` | `True` | `True` |
| `True` | `False` | `True` |
| `False` | `True` | `True` |
| `False` | `False` | `False` |

**Example:** stop moving if either the front is blocked or there are no beepers left to place:

```python
if self.frontIsBlocked() or not self.anyBeepersInBeeperBag():
    self.turnOff()
```

---

## Building bigger expressions

You can chain more than two conditions together, and mix `and` with `or`:

```python
if self.frontIsClear() and self.nextToABeeper() and not self.facingNorth():
    ...
```

> ### Careful — `and` binds tighter than `or`
>
> When you mix them without parentheses, Python evaluates every `and` first, then combines the results with `or` — the same way multiplication happens before addition in arithmetic. `a or b and c` means `a or (b and c)`, **not** `(a or b) and c`. If that's not what you meant, add parentheses to make the grouping explicit — it costs nothing and removes all doubt:
>
> ```python
> if self.wallToLeft() or (self.nextToABeeper() and self.frontIsClear()):
>     ...
> ```

---

## Short-circuit evaluation

Python evaluates an `and`/`or` expression left to right, and stops as soon as the overall answer is already decided — it never bothers evaluating the right side if the left side already settled it. This is called **short-circuit evaluation**.

- In `A and B`: if `A` is `False`, the whole expression is already `False` no matter what `B` is — so `B` never even runs.
- In `A or B`: if `A` is `True`, the whole expression is already `True` no matter what `B` is — so `B` never even runs.

This isn't just a performance detail — it's something you can rely on. It means you can safely write:

```python
if self.frontIsClear() and self.nextToABeeper():
    self.move()
```

If `frontIsClear()` is `False`, Python never calls `nextToABeeper()` at all — the `and` already knows the answer. Ordering matters here: put the condition that's safest to check *first*, on the left.

---

## Why this matters

- **Less nesting, easier to read** — a single flat `if` with a compound condition is usually easier to scan than several layers of nested ones asking the same overall question.
- **Matches how you'd say it out loud** — "if there's a wall to my left *and* I'm not already on a beeper" reads naturally as one condition, not two separate checks.
- **Still just `True`/`False`** — a compound expression is still just an expression that evaluates to `True` or `False`, the same as any single boolean method call. Everything you already know about `if` statements still applies.
