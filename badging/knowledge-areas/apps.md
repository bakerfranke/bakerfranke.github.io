# Apps
color: #475569
blurb: Files, libraries, modules
signoff: Ask: "What's the difference between import math and from math import sqrt?" and "Why use with open(...)?"


## Using a module
type: predict
hint: math.sqrt always returns a float. math.floor rounds down. round goes to the nearest whole number.
explain: sqrt(49) is the float 7.0, floor(3.7) rounds down to 3, and round(3.7) rounds to the nearest whole number, 4.

What does this print?

```python
import math
print(math.sqrt(49))
print(math.floor(3.7))
print(round(3.7))
```

```answer
7.0
3
4
```


## Importing one name
type: choice
hint: from ... import brings that one name straight into your program.
explain: from random import randint makes the name randint available directly. The name random was never imported, so random.randint would fail.

After this line, which call works?

```python
from random import randint
```

- [ ] `random.randint(1, 6)`
- [x] `randint(1, 6)`
- [ ] `random(1, 6)`
- [ ] `random.randint.randint(1, 6)`


## Add up a file
type: code
given: open("scores.txt", "w").write("90\n85\n77\n")
hint: Use with open("scores.txt") as f: and loop over f. Each line is a string like "90\n", so convert it with int().
explain: with open(...) closes the file for you. int() ignores the newline at the end of each line.

A file `scores.txt` has one whole number per line. (The line above creates it for you.)
Read the file and set `total` to the sum of all the numbers.

```starter
total = 0


print(total)
```

```tests
open("scores.txt", "w").write("90\n85\n77\n")   ->  total == 252
open("scores.txt", "w").write("10\n")           ->  total == 10
open("scores.txt", "w").write("1\n2\n3\n4\n")   ->  total == 10,  "Add up every line in the file, not just the first one."
open("scores.txt", "w").write("5\n")            ->  uses("open"),  "Read the numbers from scores.txt instead of typing them in."
open("scores.txt", "w").write("5\n")            ->  uses("with"),  "Open the file with: with open(\"scores.txt\") as f:"
```

```solution
total = 0
with open("scores.txt") as f:
    for line in f:
        total += int(line)

print(total)
```
