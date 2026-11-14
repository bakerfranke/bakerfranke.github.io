# Lists, Dicts, Tuples, Sets
color: #0f766e
blurb: Collections of values
signoff: Ask: "Why does colors[-1] give the last item?" and "When would you pick a dict instead of a list?"


## Indexes and slices
type: predict
hint: Indexes start at 0. A negative index counts from the end. A slice [1:3] stops before index 3.
explain: colors[1] is "green", colors[-1] is the last item "gold", and colors[1:3] is items 1 and 2.

What does this print?

```python
colors = ["red", "green", "blue", "gold"]
print(colors[1])
print(colors[-1])
print(colors[1:3])
```

```answer
green
gold
['green', 'blue']
```


## Can't be changed
type: choice
hint: One of these is written with parentheses, like (3, 4).
explain: A tuple can't be changed after it's made. Lists, dicts and sets can all have items added or removed.

Which of these **can't** be changed after it's created?

- [ ] list
- [ ] dict
- [ ] set
- [x] tuple


## Count the words
type: code
given: words = ["apple", "pear", "apple", "fig", "pear", "apple"]
hint: Start with counts = {}. Loop over words. If the word is already a key, add 1, otherwise set it to 1.
explain: A dict is a natural fit for counting: each word is a key, and its count is the value.

The list `words` is set for you. Build a dict `counts` where each key is a word
and its value is how many times that word appears in the list.

```starter
# words is already set (see the line above).
counts = {}


print(counts)
```

```tests
words = ["apple", "pear", "apple", "fig", "pear", "apple"]  ->  counts == {"apple": 3, "pear": 2, "fig": 1}
words = ["a"]                                               ->  counts == {"a": 1}
words = []                                                  ->  counts == {},  "With an empty list, counts should be an empty dict."
words = ["x", "y", "x"]                                     ->  not calls("Counter"),  "Build the dict yourself with a loop (no Counter)."
```

```solution
counts = {}
for w in words:
    if w in counts:
        counts[w] += 1
    else:
        counts[w] = 1


print(counts)
```
