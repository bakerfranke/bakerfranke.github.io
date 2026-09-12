# Writing Your Own Boolean Methods

You've been using boolean methods Karel already comes with — `frontIsClear()`, `nextToABeeper()`, and the rest. But just like you can write your own *action* methods (`turnRight()`, `sweepStair()`) to name and reuse a sequence of moves, you can write your own **boolean methods** too — methods that don't do anything to the world, they just answer a yes/no question and hand back `True` or `False`.

This matters for the same reason writing your own action methods does: when a question you need to ask gets complicated, giving it a name makes the rest of your code dramatically easier to read.

---

## Action methods vs. boolean methods

An **action method** (`move()`, `sweepStair()`, one you write yourself) *does something* — it changes where Karel is, which way it's facing, or how many beepers exist somewhere.

A **boolean method** (`frontIsClear()`, `nextToABeeper()`) *answers a question* — on its own, it shouldn't change anything about Karel or the world. It just reports `True` or `False` back to whatever called it.

---

## The mechanics: `return`

To write your own boolean method, you need a new keyword: `return`. Put it at the end of a method to hand a value back to whoever called it.

**Example:** a trivial one — Karel already has `frontIsClear()`, but not the opposite. Let's write `frontIsBlocked()`:

```python
def frontIsBlocked(self):
    result = self.frontIsClear()
    return not result
```

`result` stores whatever `frontIsClear()` answered — `True` or `False`. `return not result` hands back the *opposite* of that. Once written, you can use `self.frontIsBlocked()` anywhere you'd use any other boolean method:

```python
if self.frontIsBlocked():
    self.putBeeper()
```

---

## When answering the question requires doing something first

`frontIsBlocked()` was easy — it's just built from an existing boolean method, with no moving involved. But some questions can only be answered by having Karel *do* something first. Recall from the [if statements page](04_if_statements.md) that there's no built-in way to ask "is there a wall to my left?" — you have to actually turn and check.

**Problem:** write a reusable `wallToLeft()` method, so instead of writing this out inline every time...

```python
def moveIfWallToLeft(self):
    self.turnLeft()
    if not self.frontIsClear():
        self.turnRight()
        self.move()
    else:
        self.turnRight()
```

...you could just write this:

```python
def moveIfWallToLeft(self):
    if self.wallToLeft():
        self.move()
```

That would be really nice to have! But `wallToLeft()` has a problem the earlier examples didn't: *answering* the question requires turning, which changes Karel's direction as a side effect — and a method whose whole point is to answer a yes/no question shouldn't leave Karel facing a different way just for having asked it.

### The technique: action → save → undo → return

1. **Do** whatever action is needed to be able to answer the question.
2. **Save** the answer (`True`/`False`) in a variable.
3. **Undo** the side effect — put Karel back the way it was.
4. **Return** the saved answer.

**Example:**

```python
def wallToLeft(self):
    self.turnLeft()                    # turn to check
    isWall = not self.frontIsClear()   # save the answer
    self.turnRight()                   # undo the turn
    return isWall                      # return the saved answer
```

Because the undo step always runs — regardless of which way the answer came out — `wallToLeft()` is safe to call from anywhere: Karel ends the method facing exactly the direction it started, every time, with no trace that a check even happened.

> This is the same idea as the `moveIfWallOnLeft()` example on the if-statements page, just packaged differently: there, the turn/check/turn-back was written inline, once, for one specific use. Here, it's pulled out into its own named method — so `wallToLeft()` can now be reused anywhere, the same way `frontIsClear()` can.

---

## Why bother?

- **Reuse** — write the turn/check/turn-back logic once, use `wallToLeft()` everywhere you need it.
- **Readability** — `if self.wallToLeft():` reads far better than re-deriving the turn/check/turn-back dance every time you need to ask.
- **It composes** — once you have a few of your own boolean methods, you can combine them (with `and`/`or`, coming up next) to ask more complex questions cleanly.
