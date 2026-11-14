# Conditionals
color: #a16207
blurb: if / elif / else, operators
signoff: Ask: "If score is exactly 90, which branch runs, and why does the order of your elifs matter?"


## Which branch?
type: predict
hint: Python checks each condition from the top and runs only the first one that's True.
explain: 68 > 80 is False, then 68 > 60 is True, so only "nice" prints.

What does this print?

```python
temp = 68
if temp > 80:
    print("hot")
elif temp > 60:
    print("nice")
else:
    print("cold")
```

```answer
nice
```


## and, or, not
type: choice
hint: Work from the inside out: 3 > 2 first, then 5 < 4, then and, then not.
explain: 3 > 2 is True and 5 < 4 is False, so the and gives False, and not False is True.

What is the value of this expression?

```python
not (3 > 2 and 5 < 4)
```

- [x] `True`
- [ ] `False`
- [ ] It's an error


## Letter grades
type: code
given: score = 87
hint: Start with the highest grade: if score >= 90, then elif score >= 80, and so on. Watch the edges: 90 is an A, 89 is a B.
explain: Checking from the top down means each elif only runs when the conditions above it were False.

The variable `score` is set for you. Write code that sets `grade` to `"A"` (90 and up),
`"B"` (80–89), `"C"` (70–79), or `"F"` (below 70). The checker tries many different scores.

```starter
# score is already set (see the line above).


print(grade)
```

```tests
score = 95  ->  grade == "A"
score = 90  ->  grade == "A",  "90 counts as an A. Check whether you used > or >=."
score = 89  ->  grade == "B"
score = 80  ->  grade == "B",  "80 counts as a B. Check whether you used > or >=."
score = 79  ->  grade == "C"
score = 70  ->  grade == "C"
score = 69  ->  grade == "F",  "Anything below 70 should be an F. Do you have an else?"
score = 0   ->  grade == "F"
```

```solution
if score >= 90:
    grade = "A"
elif score >= 80:
    grade = "B"
elif score >= 70:
    grade = "C"
else:
    grade = "F"
print(grade)
```
