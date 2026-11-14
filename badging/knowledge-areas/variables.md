# Variables
color: #be123c
blurb: Strings, ints, floats
signoff: Ask: "Why does 7 // 2 give 3 but 7 / 2 gives 3.5?" and "What does int() do to the string "36"?"


## Two kinds of division
type: predict
hint: / always gives a float. // divides and drops the remainder.
explain: 7 / 2 is 3.5 (a float). 7 // 2 is floor division, which gives the int 3.

What does this print? Type the output exactly, one line per print.

```python
x = 7
y = 2
print(x / y)
print(x // y)
```

```answer
3.5
3
```


## Mixing types
type: choice
hint: When an int and a float are combined, Python keeps the more precise type.
explain: 3 + 2.0 is 5.0. Mixing an int with a float gives a float.

What type is the value of `3 + 2.0`?

- [ ] `int`
- [x] `float`
- [ ] `str`
- [ ] It's an error


## Build a name tag
type: code
given: first = "Ada"; last = "Lovelace"; age = "36"
hint: Use + to join strings (don't forget the space in the middle). int(age) turns "36" into 36.
explain: full_name = first + " " + last, and next_age = int(age) + 1.

The variables `first`, `last` and `age` are set for you. Notice that `age` is a **string**.

Make `full_name` hold the first and last name with a space between them.
Make `next_age` an **int** that is one more than `age`.

```starter
full_name = 
next_age = 

print(full_name, "will be", next_age)
```

```tests
first = "Ada"; last = "Lovelace"; age = "36"  ->  full_name == "Ada Lovelace",  "Join first and last with a space in between."
first = "Grace"; last = "Hopper"; age = "85"  ->  full_name == "Grace Hopper",  "Build full_name from first and last, so it works for any name."
first = "Ada"; last = "Lovelace"; age = "36"  ->  type(next_age) == int,  "next_age should be an int, not a string. Try int(age)."
first = "Grace"; last = "Hopper"; age = "85"  ->  next_age == 86
```

```solution
full_name = first + " " + last
next_age = int(age) + 1

print(full_name, "will be", next_age)
```
