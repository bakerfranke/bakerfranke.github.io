# If Statements

So far, every robot you've written does exactly the same moves every single time, no matter what the world looks like. But most interesting problems aren't that predictable — a wall might or might not be there, a beeper might or might not be waiting on the current corner. An **if statement** lets Karel make a decision: run some code *only if* something is true, and skip it otherwise.

A condition like this is a **boolean** — a value that's either `True` or `False`, nothing else.

**Example:**

```python
if self.frontIsClear():
    self.move()
```

If there's no wall in front of Karel, `move()` runs. If there *is* a wall, `move()` never happens, and the program just continues on to whatever comes after the if statement.

---

## Why does this matter?

- **Karel can react to the world** — instead of a fixed sequence of moves that only works for one exact layout, your method can adapt to whatever it actually finds.
- **One method, many worlds** — a method written with if statements can often solve a problem correctly no matter how big the world is, or where exactly the walls and beepers are.
- **It's the first step toward real decision-making** — everything else you'll build later (loops, more complex logic) is just more of this same idea: run code only when some condition holds.

---

## Karel's boolean methods

Whatever comes after `if` has to be something Karel can answer either **True** or **False** — never a command like `move()` or `pickBeeper()`. The `Robot` class (which is what your own classes will extend) comes with a set of built-in **boolean methods** that exist *only* to answer yes/no questions like this. They don't move Karel or change anything about the world — they just report `True` or `False` back to your code:

| Method                          | Answers...                                   |
|----------------------------------|-----------------------------------------------|
| `self.frontIsClear()`            | Is there **no** wall directly in front of me? |
| `self.nextToABeeper()`           | Is there at least one beeper on my current corner? |
| `self.anyBeepersInBeeperBag()`   | Am I carrying at least one beeper?            |
| `self.nextToARobot()`            | Is there another robot on my current corner?  |
| `self.facingNorth()`             | Am I currently facing North?                  |
| `self.facingSouth()`             | Am I currently facing South?                  |
| `self.facingEast()`              | Am I currently facing East?                   |
| `self.facingWest()`              | Am I currently facing West?                   |

> ### Careful — a common mix-up
>
> A lot of students assume `nextToABeeper()` means something like "there's a beeper somewhere nearby" or "a beeper one block away." It doesn't. It means Karel is standing on **the exact same corner** as a beeper, right now — not next to it the way you'd stand next to a person, but literally on top of it.
>
> A simpler way to think about it: `nextToABeeper()` is really just asking **"can I pick up a beeper right now?"**
>
> ```python
> if self.nextToABeeper():
>     self.pickBeeper()
> ```

> ### The `== True` you might see elsewhere
>
> You may see conditions written as `if self.nextToABeeper() == True:`. This works, but it's redundant — `nextToABeeper()` already *is* `True` or `False`, so comparing it to `True` doesn't add anything. Just write `if self.nextToABeeper():`.

---

## Indentation is what ties code to the `if`

**Example:**

```python
if self.frontIsClear():
    self.move()
    self.pickBeeper()
self.turnLeft()
```

- Only the lines indented underneath the `if` are controlled by it. Here, `move()` and `pickBeeper()` only happen when the condition is true.
- `turnLeft()` is **not** indented under the `if`, so it always runs — whether or not the front was clear.
- Python uses indentation, not `{ }` or `end`, to know which lines belong to the `if`. Getting the indentation right *is* part of writing the if statement correctly, not just a style choice.

---

## Stacking if statements

Nothing stops you from writing two separate `if` statements one right after the other:

```python
if self.nextToABeeper():
    self.pickBeeper()
if self.frontIsClear():
    self.move()
```

This is called **stacking** if statements, and it's a perfectly normal thing to do. The important thing to realize is that these two `if`s are **not connected to each other at all** — Karel checks the first condition and does whatever it decides, then, completely separately, checks the second condition and does whatever it decides. It's just a sequence of independent decisions, one after another.

That's different from the next thing we'll look at — `if`/`else` — where the two branches are genuinely tied together.

---

## `if` / `else`: covering both cases

Sometimes you don't just want to *skip* something when a condition is false — you want Karel to do something *different* instead. That's what `else` is for:

**Example:**

```python
if self.nextToABeeper():
    self.pickBeeper()
else:
    self.move()
```

Exactly one of these two branches runs, never both, and never neither: pick up the beeper if there's one here, otherwise just move on.

> ### Careful — stacking isn't the same as `if`/`else`
>
> It's easy to accidentally write two *stacked* ifs when what you really meant was one `if`/`else` — especially when the two conditions happen to be opposites of each other:
>
> ```python
> if self.nextToABeeper():
>     self.pickBeeper()
> if not self.nextToABeeper():
>     self.move()
> ```
>
> This happens to behave the same way, but it's fragile: the same condition (`nextToABeeper()`) is written twice and checked twice, and nothing forces those two conditions to stay exact opposites of each other if you edit one of them later. Whenever two branches are meant to be mutually exclusive — exactly one should ever run — write it as a single `if`/`else` instead, the way we did above.

---

## Nesting: more than two possibilities

You can put an entire `if`/`else` inside another one, to handle more than two possible outcomes:

**Example:**

```python
if self.nextToABeeper():
    self.pickBeeper()
else:
    if self.frontIsClear():
        self.move()
    else:
        self.turnLeft()
```

This has exactly three possible outcomes: pick up a beeper, or move forward, or turn left — never more than one of them. Nesting like this reads naturally as a decision tree: *first* check one thing; only if that's false, check the next thing.

---

## Stepwise refinement: the "one meaningful step" pattern

A common way if statements show up is inside a small method that describes **one meaningful step** — what should happen to move the robot from one state to the next, whatever that state happens to be right now.

Suppose Karel needs to take several steps forward, picking up any beeper it happens to be standing on along the way, but must never crash into a wall — even if it doesn't know in advance how many beepers are out there or exactly how far it can go.

### Start with the big picture

**Example:**

```python
class Harvester(Robot):
    def takeSixSteps(self):
        self.step()
        self.step()
        self.step()
        self.step()
        self.step()
        self.step()

    def step(self):
        pass  # figure this out next
```

`takeSixSteps()` is easy to read at a glance: it just takes six steps. `step()` is still a placeholder — but it names the one meaningful unit of work we actually need to figure out.

### Refine `step()`

Think about `step()` as a state transition: **before**, Karel is on some corner, maybe with a beeper underneath it. **After**, Karel should have picked up that beeper (if there was one) and moved forward one corner — but only if it's safe to move at all.

**Example:**

```python
def step(self):
    if self.nextToABeeper():
        self.pickBeeper()
    if self.frontIsClear():
        self.move()
```

Two independent questions, so stacking two `if`s is correct here — picking up a beeper and deciding whether to move don't exclude each other; either, both, or neither might happen on a given step. (Compare that to the earlier warning about stacking two `if`s that were meant to be an `if`/`else` — that warning was specifically about two conditions meant to be *opposites* of each other, which isn't the case here.)

### Put it all together

**Example:**

```python
from karel.robota import *

class Harvester(Robot):
    def takeSixSteps(self):
        self.step()
        self.step()
        self.step()
        self.step()
        self.step()
        self.step()

    def step(self):
        if self.nextToABeeper():
            self.pickBeeper()
        if self.frontIsClear():
            self.move()


if __name__ == "__main__":
    world.setSize(8, 3)
    world.setDelay(30)

    dana = Harvester(1, 1, East, 10)
    dana.takeSixSteps()
```

Because `step()` checks `frontIsClear()` before every `move()`, this same method works correctly whether there's a wall two corners away or ten — Karel just stops moving once it hits one, instead of crashing.

---

## Sometimes Karel has to change something to find out something

Every boolean method we've used so far answers its question for free — checking `frontIsClear()` or `nextToABeeper()` doesn't disturb anything. But sometimes there's no method that directly answers the question you need, and the only way to find out is to have Karel actually do something — turn, or pick up a beeper — and see what happens.

This is a more advanced idea than everything else on this page, but it's worth previewing now: **if answering your question changes Karel's state, you have to put that state back before deciding what to do next — no matter how the question turned out.** Otherwise the rest of your program can't rely on Karel being where it expects.

Here are two examples. Neither one uses a separate variable to remember what it found — instead, the restoring action is written directly into whichever branch actually needs it, so Karel's state gets put back correctly no matter which path the `if`/`else` takes.

### Checking a wall to the left

```python
class WallChecker(Robot):
    def turnRight(self):
        self.turnLeft()
        self.turnLeft()
        self.turnLeft()

    def moveIfWallOnLeft(self):
        self.turnLeft()
        if not self.frontIsClear():  # wall to left
            self.turnRight()  # restore direction, then move
            self.move()
        else:
            self.turnRight()  # restore direction only
```

There's no built-in way to ask "is there a wall to my left?" — so `moveIfWallOnLeft()` turns to face left and uses `frontIsClear()` directly inside the `if` (it's now checking in what used to be Karel's left-hand direction). Whichever branch runs, the very first thing it does is `turnRight()` to restore the original direction: the *then* branch turns back and moves, the *else* branch just turns back. Either way, Karel ends the method facing the direction it started in.

### Stopping on two beepers

```python
class BeeperChecker(Robot):
    def stopIfTwoBeepers(self):
        if self.nextToABeeper():        # 1st beeper
            self.pickBeeper()
            if self.nextToABeeper():    # 2nd beeper? stop
                self.putBeeper()
            else:                       # only 1 beeper
                self.putBeeper()
                self.move()
        else:                           # no beepers
            self.move()
```

`stopIfTwoBeepers()` needs an `if`/`else` nested a level deeper, because there are really three cases to sort out — zero, one, or two beepers — not just two. It only bothers picking anything up if there's a first beeper at all; with none, it just moves on. If there is one, it picks it up and checks `nextToABeeper()` again: finding a second beeper means stop, but only *after* putting that first beeper back down; finding no second beeper means put it back and keep moving. Every branch that changed something about the world restores it before the method finishes — the "no beepers" branch never touched anything, so it has nothing to restore.

---

## How Karel evaluates a condition

Every boolean method (`frontIsClear()`, `nextToABeeper()`, etc.) runs and hands back exactly one of two values: the Python keyword `True` or the Python keyword `False`. The `if` statement is really just asking one question: **"Did the condition come back `True`?"** If so, run the indented block. If not — and there's an `else` — run that block instead. A condition is just an expression that evaluates to `True` or `False`, the same way `2 + 2` evaluates to `4`.
