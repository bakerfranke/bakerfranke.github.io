# Objects & Methods
color: #c2410c
blurb: Calling methods on values
signoff: Ask: "Why didn't word.upper() change word?" and "What's the difference between nums.sort() and sorted(nums)?"


## Methods make new strings
type: predict
hint: String methods give you back a new string. They never change the original.
explain: upper() returns "BALLOON" and count("l") finds 2, but word itself is still "balloon" because strings can't be changed.

What does this print?

```python
word = "balloon"
print(word.upper())
print(word.count("l"))
print(word)
```

```answer
BALLOON
2
balloon
```


## Changing a list in place
type: choice
hint: Look for the one that's a method called on nums, not a function that hands back something new.
explain: nums.sort() rearranges the list itself. sorted(nums) and nums + [4] build new lists and leave nums alone.

```python
nums = [3, 1, 2]
```

Which line changes the list `nums` itself?

- [ ] `sorted(nums)`
- [x] `nums.sort()`
- [ ] `nums + [4]`
- [ ] `len(nums)`


## Clean up a name
type: code
given: raw = "   ada LOVELACE  "
hint: Chain the methods: raw.strip() removes spaces at the ends, and .title() fixes the capitals.
explain: raw.strip().title() works because each method returns a new string you can call the next method on.

People type names in all kinds of ways. The variable `raw` is set for you.
Set `clean` to the same name with the extra spaces at the ends removed and
each word capitalized, like `"Ada Lovelace"`.

```starter
# raw is already set (see the line above).
clean = 

print(clean)
```

```tests
raw = "   ada LOVELACE  "  ->  clean == "Ada Lovelace"
raw = "grace hopper"       ->  clean == "Grace Hopper"
raw = "  ALAN turing"      ->  clean == "Alan Turing",  "Remove the spaces at the ends and fix the capitals."
raw = "  ada lovelace "    ->  calls("strip"),  "Use .strip() to remove the spaces at the ends."
```

```solution
clean = raw.strip().title()

print(clean)
```
