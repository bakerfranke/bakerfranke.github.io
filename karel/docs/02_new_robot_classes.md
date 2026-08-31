# Building Your Own Robot Class

Sometimes the built-in commands aren't enough on their own — you want Karel to do something more specific, like draw a shape or climb a staircase, and you want to do it more than once without retyping the same moves every time. Instead of writing the same sequence of commands over and over, you can teach Karel a new trick by creating your **own** robot class with your **own** methods.

## Why make your own robot class?

- **Reuse** — define an action once, use it as many times as you want.
- **Readability** — `climber.climbStair()` reads a lot better than four lines of `move()`/`turnLeft()`.
- **Organization** — break a big problem down into small, clearly-named pieces instead of one long list of moves.

---

## Defining a new robot class

**Example:**

```python
from karel.robota import *

class StairClimber(UrRobot):
    pass
```

This creates a new *kind* of robot, `StairClimber`, that can do everything `UrRobot` can do (`move()`, `turnLeft()`, `pickBeeper()`, `putBeeper()`), plus anything you add to it.

## Adding your own method

**Example:**

```python
class StairClimber(UrRobot):
    def climbStair(self):
        self.move()
        self.turnLeft()
        self.move()
        self.turnRight()
```

- `def` starts a new method definition.
- `self` refers to "this robot" — the specific robot instance the method gets called on. Every method you write needs `self` as its first parameter.
- Inside the method, use `self.move()`, `self.turnLeft()`, etc. — the same commands as before, just written with `self.` instead of a robot's name, since the method doesn't know what the robot will actually be named when it's used.

## Using your new robot

**Example:**

```python
climber = StairClimber(1, 1, East, 0)
climber.climbStair()
```

Just like `UrRobot`, you give it a starting street, avenue, direction, and beeper count. Once it exists, you can call your new method on it just like any built-in one.

---

## Stepwise refinement: climbing a whole staircase

Let's use this to build something a bit bigger: a robot that climbs a **whole** staircase, not just one step.

### Start with the big picture

Before writing a single `move()`, think about what climbing a staircase actually involves: climbing one stair, over and over. Write that idea down as a method — even before you know exactly how `climbStair()` will work internally:

**Example:**

```python
class StairClimber(UrRobot):
    def climbAllStairs(self):
        self.climbStair()
        self.climbStair()
        self.climbStair()
        self.climbStair()

    def climbStair(self):
        pass  # figure this out next
```

This is **stepwise refinement**: start with a method that describes the big picture in terms of smaller pieces, even if those smaller pieces aren't written yet. `climbAllStairs()` is easy to read and review right now — anyone can tell what it's supposed to do — even though `climbStair()` is still just a placeholder.

### Refine `climbStair()`

Now fill in the one small piece: what does it actually take to climb a single stair? Say each stair is one corner forward, then one corner up:

**Example:**

```python
def climbStair(self):
    self.move()        # walk onto the step
    self.turnLeft()
    self.move()         # step up onto it
    self.turnRight()    # face forward again
```

### Put it all together

**Example:**

```python
from karel.robota import *

class StairClimber(UrRobot):
    def climbAllStairs(self):
        self.climbStair()
        self.climbStair()
        self.climbStair()
        self.climbStair()

    def climbStair(self):
        self.move()
        self.turnLeft()
        self.move()
        self.turnRight()


world.setSize(6, 6)
world.setDelay(30)

climber = StairClimber(1, 1, East, 0)
climber.climbAllStairs()
```

### Why bother refining instead of writing it all at once?

- `climbAllStairs()` is easy to read at a glance — you don't have to trace every `move()` to know what it does.
- If the staircase pattern changes later (say, each step is two corners tall instead of one), you only fix `climbStair()` — `climbAllStairs()` doesn't change at all.
- It's easier to check your work: you can test that `climbStair()` alone works correctly before worrying about the whole staircase.

This is the same idea behind **top-down design**: describe the big problem first, in terms of smaller sub-problems, and then solve each sub-problem on its own.
