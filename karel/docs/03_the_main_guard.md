# The `__main__` Guard

You'll see this block at the bottom of every starter file, right below your class definition:

**Example:**

```python
if __name__ == "__main__":
    world.setSize(8, 8)
    world.setDelay(20)

    foo = UrRobot(3, 3, East, 100)
    foo.move()
```

This page explains what it is and why we use it. **You will always be given this block already written for you — you do not need to memorize the syntax.** What matters is understanding what it means, so you know where your own code should go.

---

## Why not just write the code out in the open?

We don't want your program to run automatically the moment we import your code. The main guard puts your code in a section that only runs when you ask it to — separately from the rest of the file.

Without the guard, everything just starts running right away. That means we don't have a way to test the individual pieces of your code on their own: to check your class, or test one of your methods directly, we have to `import` your file — and without a guard, that import triggers your whole program to run too, right then, as a side effect.

There's a second reason, less technical: this is just common practice. You're going to see `if __name__ == "__main__":` in basically every Python program you look at from here on, so it's worth getting used to the pattern now.

> **Take this one on faith for now.** We're not going to explain the syntax deeply until later — it's just the way Python programs are structured, and you'll see it enough that it'll stop looking strange.

---

## What goes where

|                          | Goes here                                              |
|--------------------------|---------------------------------------------------------|
| Above the guard, unindented | `import` statements, your class definition and its methods |
| Inside the guard, indented | world setup, creating your robot, calling the one method that solves the problem |

**Example:**

```python
from karel.robota import *

class HBot(UrRobot):
    def drawH(self):
        ...
    # your other methods here


if __name__ == "__main__":
    world.setSize(5, 5)
    world.setDelay(30)

    bob = HBot(2, 1, North, 7)
    bob.drawH()
    bob.turnOff()
```

Your class and its methods are defined once, at the top level, so they're always available to import. The guard only wraps the part where you actually *use* that class to run the program.

---

## Why this affects how you write your main block

Because the guarded block is what actually runs your program, it's tempting to put extra work there — an extra `move()`, a second helper call — to patch up something your class method doesn't quite do right. **Don't do work inside `__main__`.**

> **Our expectation:** your `__main__` block should only set up the world, construct a robot, and call a single method that makes it do its whole thing. That's it.

The whole reason main guards matter for grading is that your solving method gets tested **on its own**, by importing your class and calling that one method directly, completely bypassing whatever is inside your guard. If your method only produces the right answer *with help from your main block*, that isolated test will catch it — the correct answer from clicking Run doesn't mean the method itself is correct.

---

## What `__name__` actually is

If you're curious about the mechanism behind all this: every Python file has a hidden variable called `__name__` that Python fills in automatically. Its value depends on *how* the file gets used:

- If you **run the file directly** (hit Run, or `python main.py` from a terminal), Python sets `__name__` to the string `"__main__"`.
- If the file is **imported** by something else instead of run directly, Python sets `__name__` to the file's own name (e.g. `"main"`) — not `"__main__"`.

So `if __name__ == "__main__":` is really just asking one question: **"Was this file the one that got run directly?"** The code indented underneath only executes when the answer is yes — which is exactly the behavior described above.
