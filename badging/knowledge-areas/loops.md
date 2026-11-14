# Loops
color: #1d4ed8
blurb: for, while, range
signoff: Ask: "How many numbers does range(1, 5) give you?" and "What would make your while loop run forever?"


## Running total
type: predict
hint: range(1, 5) stops before 5. Write out each value of i.
explain: i takes the values 1, 2, 3, 4, and 1 + 2 + 3 + 4 = 10. The 5 is not included.

What does this print?

```python
total = 0
for i in range(1, 5):
    total += i
print(total)
```

```answer
10
```


## Counting the laps
type: choice
hint: Track n: it starts at 10 and drops by 3 each time. When does n > 0 become False?
explain: n is 10, 7, 4, 1 when the loop body runs. Then n becomes -2 and the loop stops: 4 times.

How many times does this print `hi`?

```python
n = 10
while n > 0:
    print("hi")
    n -= 3
```

- [ ] 3
- [x] 4
- [ ] 10
- [ ] It never stops


## Countdown
type: code
given: start = 5
hint: Try for i in range(start, 0, -1), or a while loop that subtracts 1 each time. Print Liftoff! after the loop, not inside it.
explain: range(start, 0, -1) counts down and stops before 0. Liftoff! goes after the loop so it prints once.

The variable `start` is set for you. Use a loop to print a countdown from `start`
down to 1, one number per line, then print `Liftoff!`

```starter
# start is already set (see the line above).

```

```output
start = 5
---
5
4
3
2
1
Liftoff!
```

```output
start = 1
---
1
Liftoff!
```

```tests
start = 5  ->  uses("for", "while"),  "Use a loop: a for or while loop should do the counting."
```

```solution
for i in range(start, 0, -1):
    print(i)
print("Liftoff!")
```
