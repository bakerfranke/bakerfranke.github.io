# Project 1 Commands

This is everything you can use for Project 1. If a command isn't listed here, you don't need it yet.

## Setup

Every program starts the same way:

```python
from karel.robota import *
```

This gives you `UrRobot`, the direction names (`North`, `East`, `South`, `West`), and `world`.

---

## World commands

Call these before creating any robots.

### `world.setSize(streets, avenues)`
Sets how big the grid is. `streets` = number of rows, `avenues` = number of columns.

```python
world.setSize(6, 8)   # 6 streets tall, 8 avenues wide
```

### `world.setDelay(amount)`
Controls how fast the robot moves. `0` = instant, `100` = very slow. Good for slowing things down so you can watch what's happening.

```python
world.setDelay(30)
```

---

## Creating a robot

### `UrRobot(street, avenue, direction, beepers)`
Creates a robot at a corner, facing a direction, carrying a number of beepers.

- `street`, `avenue` — the corner to start on (corner (1, 1) is the bottom-left)
- `direction` — `North`, `East`, `South`, or `West`
- `beepers` — how many beepers it's carrying in its beeper bag

```python
bob = UrRobot(1, 1, East, 5)
```

---

## Robot commands

Once you have a robot, these are the actions it can take.

### `bob.move()`
Moves one corner forward in the direction it's facing. Karel will crash if there's a wall in front of it.

### `bob.turnLeft()`
Turns 90° to the left, in place (doesn't move to a new corner).

### `bob.pickBeeper()`
Picks up one beeper from the corner Karel is standing on and puts it in the beeper bag. Karel will crash if there's no beeper there.

### `bob.putBeeper()`
Takes one beeper out of the beeper bag and drops it on the current corner. Karel will crash if the beeper bag is empty.

---

## Putting it together

This drops a beeper, loops around the block, and picks it back up:

```python
from karel.robota import *

world.setSize(6, 6)
world.setDelay(30)

bob = UrRobot(1, 1, East, 5)

bob.move()
bob.move()
bob.putBeeper()

bob.turnLeft()
bob.move()
bob.turnLeft()
bob.move()
bob.turnLeft()
bob.move()
bob.turnLeft()
bob.move()

bob.pickBeeper()
```
