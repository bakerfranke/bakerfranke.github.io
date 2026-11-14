# Functions
color: #15803d
blurb: def, parameters, return
signoff: Ask: "What's the difference between print and return?" and "What does a function give back if it has no return?"


## Print or return?
type: predict
hint: print shows something on the screen. return hands a value back to whoever called the function. This function does both.
explain: double(4) prints 8, then returns 4 + 4 = 8 into x. Then x + 1 prints 9.

What does this print?

```python
def double(n):
    print(n * 2)
    return n + n

x = double(4)
print(x + 1)
```

```expected output
8
9
```


## No return
type: choice
hint: The function prints, but what does it hand back?
explain: greet prints "Hi Sam", but it has no return, so it gives back None, and that's what result holds.

```python
def greet(name):
    print("Hi " + name)

result = greet("Sam")
```

What value does `result` hold?

- [ ] `"Hi Sam"`
- [ ] `"Sam"`
- [x] `None`
- [ ] It's an error


## Average
type: code
hint: Use sum(nums) and len(nums). Handle the empty list first with an if, so you don't divide by zero.
explain: Returning (not printing) the answer means other code can use it, like the tests here do.

Write a function `average(nums)` that **returns** the average of a list of numbers.
If the list is empty, it should return `0`.

```starter
def average(nums):
    # your code here
    pass


print(average([2, 4, 6]))
```

```tests
->  average([2, 4, 6]) == 4
->  average([1, 2]) == 1.5
->  average([7]) == 7
->  average([]) == 0,  "An empty list should return 0 instead of causing an error."
->  uses("return"),  "average should return the answer, not just print it."
```

```solution
def average(nums):
    if len(nums) == 0:
        return 0
    return sum(nums) / len(nums)


print(average([2, 4, 6]))
```
