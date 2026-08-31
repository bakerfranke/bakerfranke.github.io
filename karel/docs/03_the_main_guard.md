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

## What `__name__` actually is

Every Python file has a hidden variable called `__name__` that Python fills in automatically. Its value depends on *how* the file gets used:

- If you **run the file directly** (hit Run, or `python main.py` from a terminal), Python sets `__name__` to the string `"__main__"`.
- If the file is **imported** by something else instead of run directly, Python sets `__name__` to the file's own name (e.g. `"main"`) — not `"__main__"`.

So `if __name__ == "__main__":` is really just asking one question: **"Was this file the one that got run directly?"** The code indented underneath only executes when the answer is yes.

---

## Why not just write the code out in the open?

Nothing stops you from skipping the guard entirely and writing your setup code at the top level of the file, with no `if` and no indentation:

```python
# Without a main guard - works, but only until it doesn't
class UrRobot:
    ...

world.setSize(8, 8)
foo = UrRobot(3, 3, East, 100)
foo.move()
```

This runs fine when you hit Run. The problem shows up the moment anyone else's code needs to use *just* your class, without also re-running your whole program.

That "anyone else" is almost always the grading tool. To check your class, count its methods, or test your solving method directly on a fresh robot, the grader has to `import` your file — that's the only way to get at your class from outside it. Without a main guard, importing your file has no way to hold back the moves-and-setup code sitting underneath your class: `import` runs the *entire* file top to bottom, so your whole program executes again, right then, as a side effect of just trying to look at your class.

The main guard is what makes that possible to avoid. Code inside it runs when you hit Run yourself, but is skipped entirely when the file is imported — so the grader can bring in your class cleanly, without triggering a second full run of your solution.

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

Because the guarded block is what actually runs your program, it's tempting to put extra work there — an extra `move()`, a second helper call — to patch up something your class method doesn't quite do right. Don't. The whole reason main guards matter for grading is that your solving method gets tested **on its own**, by importing your class and calling that one method directly, completely bypassing whatever is inside your guard. If your method only produces the right answer *with help from your main block*, that isolated test will catch it — the correct answer from clicking Run doesn't mean the method itself is correct.

**Takeaway:** your main block should only construct the robot and call the one method that's supposed to solve the whole problem (plus `turnOff()`, if the assignment calls for it). All of the actual problem-solving belongs inside your class's own methods.
