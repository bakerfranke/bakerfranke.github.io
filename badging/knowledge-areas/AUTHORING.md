# Writing cards

All of the content lives in this folder, and you never need to touch the JavaScript.

- **One file per knowledge area** (`loops.md`, `conditionals.md`, ...). Each file is one box on the shelf and holds all of that box's cards.
- **`shelf.md`** lists which boxes appear, in what order, plus two settings: how many cards a student needs before sign-off, and the demo teacher PIN.
- **Check your work** by opening the site with `#/author` on the end of the URL (there's also a link in the footer). It lists every card, points to anything it can't read by line number, and **Test all cards** runs every card to make sure its answer is right.

---

## The top of a knowledge area file

```markdown
# Loops
color: #1d4ed8
blurb: for, while, range
signoff: Ask: "How many numbers does range(1, 5) give you?"
```

| Line | What it does |
|---|---|
| `# Name` | The box's name on the shelf. |
| `color:` | The box color. Pick a dark-ish color, because the name is shown in white on it. |
| `blurb:` | The short line under the name. |
| `signoff:` | A question for the teacher to ask during sign-off. |

A file with no cards yet shows on the shelf as "Coming soon".

---

## Every card has the same four parts

````markdown
## Card title                        ← 1. heading: starts the card
type: predict                        ← 2. header lines
hint: Shown after a wrong answer.
explain: Shown once they get it right.

What does this print?                ← 3. what the student sees: text and ```python blocks

```python
print(2 + 3)
```

```expected output                   ← 4. how it's checked (depends on the type)
5
```
````

1. **Heading.** `## Title` starts a new card. Cards appear in the order they're written.
2. **Header lines**, right under the heading, all as `key: value`:

   | Line | Needed? | What it does |
   |---|---|---|
   | `type:` | yes | `predict`, `choice`, or `code` |
   | `hint:` | no | Shown after a wrong answer. |
   | `explain:` | no | Shown once the answer is right. |
   | `given:` | code cards | Inputs that are set before the student's code runs (see below). |
   | `id:` | no | Saved progress is keyed by file + title, so renaming a card resets progress on it. Add `id: something` to keep it stable. |

3. **What the student sees.** Ordinary Markdown text (`code`, **bold**, bullet lists) and ` ```python ` blocks, in the order you write them.
4. **How it's checked.** This is the only part that changes between types:

| Type | The student… | You mark the right answer with… |
|---|---|---|
| `predict` | reads code and types what it prints | an ` ```expected output ` block |
| `choice` | picks one option | `[x]` on the right option |
| `code` | writes Python that runs in the browser | ` ```expected output ` and/or ` ```tests ` blocks, plus a hidden ` ```solution ` |

` ```expected output ` works the same way everywhere: the exact output, with optional setup above a `---` line (setup is only for code cards). See [Expected output](#expected-output-what-gets-printed) below.

---

## Predict the output

The student reads code and types exactly what it prints.

**How it's checked:** the ` ```expected output ` block holds the exact output. Spaces at the ends of lines and blank lines at the very end don't matter. No setup and no `---` here: all the code goes in the ` ```python ` block.

````markdown
## Running total
type: predict
hint: range(1, 5) stops before 5.
explain: i is 1, 2, 3, 4, and 1 + 2 + 3 + 4 = 10.

What does this print?

```python
total = 0
for i in range(1, 5):
    total += i
print(total)
```

```expected output
10
```
````

**Test all cards** runs the ` ```python ` block and confirms that it really prints the expected output.

---

## Multiple choice

The student picks one option.

**How it's checked:** write the options as a checklist and put `x` in the right one. Exactly one option must have `[x]`.

````markdown
## Counting the laps
type: choice
hint: Track n. When does n > 0 become False?
explain: n is 10, 7, 4, 1, so it prints 4 times.

How many times does this print `hi`?

```python
n = 10
while n > 0:
    print("hi")
    n -= 3
```

- [ ] 3
- [x] 4
- [ ] It never stops
````

Options can use `code` formatting, like `` - [x] `float` ``.

---

## Write code

The student writes Python in an editor, then presses **Run** to try it or **Check my code** to grade it.

**How it's checked:** ` ```expected output ` blocks (what gets printed) and/or ` ```tests ` blocks (values and anything else). Every check has to pass.

````markdown
## Letter grades
type: code
given: score = 87
hint: Start with the highest grade: if score >= 90 ...
explain: Each elif only runs when the conditions above it were False.

The variable `score` is set for you. Set `grade` to "A" (90+), "B" (80–89),
"C" (70–79), or "F".

```starter
# score is already set (see the line above).
```

```tests
score = 95  ->  grade == "A"
score = 90  ->  grade == "A",  "90 counts as an A. Check whether you used > or >=."
score = 89  ->  grade == "B"
score = 69  ->  grade == "F",  "Anything below 70 should be an F. Do you have an else?"
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
```
````

| Part | What it does |
|---|---|
| `given:` | Inputs set before the student's code runs. They're shown above the editor as "Set for you" and used by **Run**. Separate several with `;`. Leave it out if the card has no inputs. |
| ` ```starter ` | What's in the editor when the card opens. Optional. |
| ` ```expected output ` | A check on printed output, one block per input (below). |
| ` ```tests ` | Checks on values, one per line (below). |
| ` ```solution ` | Your model answer. Students never see it. **Test all cards** runs it against the checks. |

### ` ```tests `: one check per line

```
setup  ->  what should be True,  "feedback"
```

- **Setup** (left of `->`): the inputs for this check. It replaces `given:` and runs *before* the student's code. Separate several with `;`, like `a = 2; b = 3`. Leave it empty to use `given:` as is, which is also how you write checks for cards with no inputs:
  `->  average([2, 4, 6]) == 4`
- **What should be True** (right of `->`): any Python expression, checked *after* the student's code runs. Use `and` / `or` to combine conditions.
- **Feedback** (optional): what the student sees if the check fails. Without it, they see an automatic message like *Expected grade == "B", but grade is 'C'.*

Every line runs the student's code fresh with its own setup, so one card can try many inputs.

Besides the student's own variables and functions, the expression can use:

| Name | What it is | Example |
|---|---|---|
| `printed` | everything the code printed, as one string | `"Liftoff!" in printed` |
| `source` | the student's code, as text | `source.count("print") == 1` |
| `uses("for", "while")` | True if any of those words appears **as code** (comments and strings don't count) | `uses("for", "while")` |
| `calls("strip")` | True if the code calls that function or method | `not calls("sum")` |
| `has("text")` | True if that exact piece of code appears (spaces ignored) | `has("range(start, 0, -1)")` |

Examples:

```
start = 5               ->  uses("for", "while"),  "Use a loop."
words = ["x", "y"]      ->  not calls("Counter"),  "Build the dict yourself."
                        ->  Rectangle(3, 4).area() == 12
first = "Ada"; last = "Lovelace"  ->  full_name == "Ada Lovelace"
```

### Expected output: what gets printed

The same block as on predict cards: the exact output the student's code should print.
On a code card you can **optionally** put setup (inputs) on top, then a `---` line, so one card can
try several inputs, one block each.

````markdown
```expected output
start = 3
---
3
2
1
Liftoff!
```

```expected output
start = 1
---
1
Liftoff!
```
````

- **No `---`:** the whole block is the expected output, and the card's `given:` is used as the setup.
- **With `---`:** everything above it is setup (separate statements with `;` or put them on separate lines), and everything below it is the expected output.
- Spaces at the ends of lines and blank lines at the very end don't matter.
- If the output itself contains a line that is just `---`, start the block with a `---` line (empty setup), so that the first `---` is the separator.

---

## Tips

- **Test the edges.** `score = 90` and `score = 89` catch more mistakes than `95` and `50`.
- **Use different inputs in checks than in `given:`.** That way a student can't pass by printing the answer for the one value they can see.
- **Write feedback for the mistakes you expect** (`>` vs `>=`, a missing `else`). Leave the obvious checks to the automatic message.
- **Setup runs before the student's code.** For functions and classes, the student's code has to define them first, so call them on the right side of `->` (`->  average([1, 2]) == 1.5`) and leave the setup empty.
- **Infinite loops are safe.** Code that runs longer than 5 seconds is stopped.
- **Run the author check after every edit.** Reload the page first so it reads your changes.
