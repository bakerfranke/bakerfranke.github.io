// Skill boxes and their cards. This file is the content: add a skill or card here
// and the page picks it up. Keep card ids stable: saved progress is keyed by them.
//
// Card types
//   predict : show code, the student types the exact output.      { code, answer }
//   choice  : multiple choice.                                     { code?, options, correct (index) }
//   code    : student writes Python, run in the browser (Pyodide). { starter, given?, checks }
//             Each check runs the student's code fresh: `setup` first, then their code,
//             then `test` (Python asserts). Tests can read _output (what was printed)
//             and _source (the student's code).
// Every card can have a `hint` (shown after a miss) and `explain` (shown once correct).

// How many cards in a box must be correct before the badge is ready for sign-off.
// A number, or "all".
const CARDS_NEEDED = "all";

// Demo-only teacher PIN for the mock sign-off step.
const TEACHER_PIN = "1234";

function gradeChecks(cases) {
  return cases.map(([score, want]) => ({
    label: `score = ${score}`,
    setup: `score = ${score}`,
    test: `assert grade == ${JSON.stringify(want)}, f"grade should be '${want}' but your code set it to {grade!r}"`,
  }));
}

function countdownChecks(starts) {
  return starts.map((n) => {
    const lines = [];
    for (let i = n; i >= 1; i--) lines.push(String(i));
    lines.push("Liftoff!");
    const want = lines.join("\\n");
    return {
      label: `start = ${n}`,
      setup: `start = ${n}`,
      test:
        `assert "for" in _source or "while" in _source, "Use a loop: a for or while loop should do the counting."\n` +
        `assert _output == "${want}", "Expected this output:\\n${want}\\n\\nYour code printed:\\n" + (_output or "(nothing)")`,
    };
  });
}

const SKILLS = [
  {
    id: "variables",
    name: "Variables",
    blurb: "Strings, ints, floats",
    color: "#be123c",
    open: true,
    signoffPrompt: "Ask: “Why does 7 // 2 give 3 but 7 / 2 gives 3.5?” and “What does int() do to the string \"36\"?”",
    cards: [
      {
        id: "var-1",
        type: "predict",
        title: "Two kinds of division",
        prompt: "What does this print? Type the output exactly, one line per print.",
        code: "x = 7\ny = 2\nprint(x / y)\nprint(x // y)",
        answer: "3.5\n3",
        hint: "/ always gives a float. // divides and drops the remainder.",
        explain: "7 / 2 is 3.5 (a float). 7 // 2 is floor division, which gives the int 3.",
      },
      {
        id: "var-2",
        type: "choice",
        title: "Mixing types",
        prompt: "What type is the value of <code>3 + 2.0</code>?",
        options: ["int", "float", "str", "It's an error"],
        correct: 1,
        hint: "When an int and a float are combined, Python keeps the more precise type.",
        explain: "3 + 2.0 is 5.0. Mixing an int with a float gives a float.",
      },
      {
        id: "var-3",
        type: "code",
        title: "Build a name tag",
        prompt:
          "Finish the code. Make <code>full_name</code> hold <code>\"Ada Lovelace\"</code> by joining <code>first</code> and <code>last</code> with a space. " +
          "Make <code>next_age</code> an <strong>int</strong> that is one more than <code>age</code>.",
        starter: 'first = "Ada"\nlast = "Lovelace"\nage = "36"   # careful: this is a string\n\nfull_name = \nnext_age = \n\nprint(full_name, "will be", next_age)\n',
        checks: [
          {
            label: "",
            setup: "",
            test:
              'assert full_name == "Ada Lovelace", f"full_name should be \'Ada Lovelace\' but it is {full_name!r}"\n' +
              'assert type(next_age) == int, f"next_age should be an int, but it is a {type(next_age).__name__}. Try int()."\n' +
              'assert next_age == 37, f"next_age should be 37 but it is {next_age!r}"\n' +
              'assert "Ada" not in _source.split("full_name")[1].split("\\n")[0], "Build full_name from the first and last variables instead of typing the name."',
          },
        ],
        hint: "Use + to join strings (don't forget the space in the middle). int(age) turns \"36\" into 36.",
        explain: "full_name = first + \" \" + last, and next_age = int(age) + 1.",
      },
    ],
  },
  {
    id: "objects",
    name: "Objects & Methods",
    blurb: "Calling methods on values",
    color: "#c2410c",
    open: false,
    cards: [],
  },
  {
    id: "conditionals",
    name: "Conditionals",
    blurb: "if / elif / else, operators",
    color: "#a16207",
    open: true,
    signoffPrompt: "Ask: “If score is exactly 90, which branch runs, and why does the order of your elifs matter?”",
    cards: [
      {
        id: "cond-1",
        type: "predict",
        title: "Which branch?",
        prompt: "What does this print?",
        code: 'temp = 68\nif temp > 80:\n    print("hot")\nelif temp > 60:\n    print("nice")\nelse:\n    print("cold")',
        answer: "nice",
        hint: "Python checks each condition from the top and runs only the first one that's True.",
        explain: "68 > 80 is False, then 68 > 60 is True, so only \"nice\" prints.",
      },
      {
        id: "cond-2",
        type: "choice",
        title: "and, or, not",
        prompt: "What is the value of this expression?",
        code: "not (3 > 2 and 5 < 4)",
        options: ["True", "False", "It's an error"],
        correct: 0,
        hint: "Work from the inside out: 3 > 2 first, then 5 < 4, then and, then not.",
        explain: "3 > 2 is True and 5 < 4 is False, so the and gives False, and not False is True.",
      },
      {
        id: "cond-3",
        type: "code",
        title: "Letter grades",
        prompt:
          "The variable <code>score</code> is set for you. Write code that sets <code>grade</code> to " +
          "<code>\"A\"</code> (90 and up), <code>\"B\"</code> (80–89), <code>\"C\"</code> (70–79), or <code>\"F\"</code> (below 70). " +
          "The checker tries many different scores.",
        given: "score = 87",
        starter: "# score is already set (see the line above).\n\n\nprint(grade)\n",
        checks: gradeChecks([[95, "A"], [90, "A"], [89, "B"], [80, "B"], [79, "C"], [70, "C"], [69, "F"], [0, "F"]]),
        hint: "Start with the highest grade: if score >= 90, then elif score >= 80, and so on. Watch the edges: 90 is an A, 89 is a B.",
        explain: "Checking from the top down means each elif only runs when the conditions above it were False.",
      },
    ],
  },
  {
    id: "functions",
    name: "Functions",
    blurb: "def, parameters, return",
    color: "#15803d",
    open: false,
    cards: [],
  },
  {
    id: "collections",
    name: "Lists, Dicts, Tuples, Sets",
    blurb: "Collections of values",
    color: "#0f766e",
    open: false,
    cards: [],
  },
  {
    id: "loops",
    name: "Loops",
    blurb: "for, while, range",
    color: "#1d4ed8",
    open: true,
    signoffPrompt: "Ask: “How many numbers does range(1, 5) give you?” and “What would make your while loop run forever?”",
    cards: [
      {
        id: "loop-1",
        type: "predict",
        title: "Running total",
        prompt: "What does this print?",
        code: "total = 0\nfor i in range(1, 5):\n    total += i\nprint(total)",
        answer: "10",
        hint: "range(1, 5) stops before 5. Write out each value of i.",
        explain: "i takes the values 1, 2, 3, 4, and 1 + 2 + 3 + 4 = 10. The 5 is not included.",
      },
      {
        id: "loop-2",
        type: "choice",
        title: "Counting the laps",
        prompt: "How many times does this print <code>hi</code>?",
        code: 'n = 10\nwhile n > 0:\n    print("hi")\n    n -= 3',
        options: ["3", "4", "10", "It never stops"],
        correct: 1,
        hint: "Track n: it starts at 10 and drops by 3 each time. When does n > 0 become False?",
        explain: "n is 10, 7, 4, 1 when the loop body runs. Then n becomes -2 and the loop stops: 4 times.",
      },
      {
        id: "loop-3",
        type: "code",
        title: "Countdown",
        prompt:
          "The variable <code>start</code> is set for you. Use a loop to print a countdown from <code>start</code> down to 1, " +
          "one number per line, then print <code>Liftoff!</code>",
        given: "start = 5",
        starter: "# start is already set (see the line above).\n\n",
        checks: countdownChecks([5, 3, 1]),
        hint: "Try for i in range(start, 0, -1), or a while loop that subtracts 1 each time. Print Liftoff! after the loop, not inside it.",
        explain: "range(start, 0, -1) counts down and stops before 0. Liftoff! goes after the loop so it prints once.",
      },
    ],
  },
  {
    id: "classes",
    name: "Classes",
    blurb: "Your own types",
    color: "#7e22ce",
    open: false,
    cards: [],
  },
  {
    id: "apps",
    name: "Apps",
    blurb: "Files, libraries, modules",
    color: "#475569",
    open: false,
    cards: [],
  },
];
