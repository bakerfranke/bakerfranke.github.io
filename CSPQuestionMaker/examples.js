	var examples =[] 

	examples[0] = {
  "type": "singleSelect",
  "qText": "What value of A would make the output of the logic circuit `false`?\n\n\n<img src=\"https://preview.ibb.co/iWHjgv/Screen_Shot_2017_09_10_at_6_13_58_PM.png\" alt=\"Screen_Shot_2017_09_10_at_6_13_58_PM\" border=\"0\" style=\"width: 250px; margin:auto; display:block\">\n",
  "eu": "2.2 Multiple levels of abstraction are used to write programs or create other computational artifacts",
  "lo": "2.2.3 Identify multiple levels of abstractions that are used when writing programs. [P3]",
  "ek": "2.2.3F",
  "ctp": "Abstracting",
  "difficulty": "4",
  "answers": {
    "answer_a": {
      "text": "`true`",
      "expl": "`true OR true = true`, `true AND true = true`",
      "correct": 0
    },
    "answer_b": {
      "text": "`false`",
      "expl": "`true OR false = true`, `true AND true = true`",
      "correct": 0
    },
    "answer_c": {
      "text": "The output will be `false` no matter what the value of A is",
      "expl": " Both 'A' being `true` and 'A' being `false` results in an output of  `true`",
      "correct": 0
    },
    "answer_d": {
      "text": "There is no value of A such that the output of the logic circuit will be false.",
      "expl": "The output of the `OR`-gate will always be true, making the output of the circuit always `true` as well.",
      "correct": 1
    }
  }
};
	examples[1] = {
  "type": "singleSelect",
  "qText": "In the following code block, assume that the variables Rainy and too_cold are boolean.\n\n    IF (NOT (Rainy OR too_cold))\n    {\n        DISPLAY(\"It's a good beach day\")\n    }\n\nWhich of the following are equivalent to the above code block?",
  "eu": "5.5 Programming uses mathematical and logical concepts.",
  "lo": "5.5.1 Employ appropriate mathematical and logical concepts in programming. [P1]",
  "ctp": "Connecting computing",
  "ek": "5.5.1E",
  "difficulty": "3",
  "answers": {
    "answer_a": {
      "text": "\n\n    IF (( NOT rainy) OR (NOT tooCold)\n    {\n        DISPLAY(\"It's a good beach day\")\n    }\n",
      "expl": "`NOT` can't be distributed over `OR`",
      "correct": 0
    },
    "answer_b": {
      "text": "\n\n    IF (( NOT rainy) AND  tooCold)\n    {\n        DISPLAY(\"It's a good beach day\")\n    }",
      "expl": "`NOT` needs to be applied to the second clause as well",
      "correct": 0
    },
    "answer_c": {
      "text": "\n\n    IF (( NOT rainy) AND (NOT tooCold)\n    {\n        DISPLAY(\"It's a good beach day\")\n    }",
      "expl": "This option makes sense in a real-world setting and also adheres to DeMorgan's law",
      "correct": 1
    },
    "answer_d": {
      "text": "\n\n    IF (rainy AND tooCold)\n    {\n        DISPLAY(\"It's a good beach day\")\n    }",
      "expl": "`NOT` needs to be applied to each clause",
      "correct": 0
    }
  }
};

examples[2] = {
  "type": "singleSelect",
  "qText": "You are writing a function called `swap (list, x, y)` which will exchange the position of the two values at indexes x and y in the list.\n\nExample: before and after a call to `swap (list, 2, 3)` on the list shown below\n\n<img src=\"https://preview.ibb.co/byCrDa/Screen_Shot_2017_09_11_at_1_59_14_PM.png\" alt=\"Screen_Shot_2017_09_11_at_1_59_14_PM\" border=\"0\" style=\"display: block; margin: auto; width: 600px\">\n\nThe function header is defined below.  Choose three lines of code that will perform the swap correctly.\n\n    procedure swap (list, x, y) {\n        < MISSING CODE >\n    }",
  "eu": "5.4 Programs are developed, maintained, and used by people for different purposes.",
  "lo": "5.4.1 Evaluate the correctness of a program. [P4]",
  "ek": "5.4.1F",
  "ctp": "Analyzing Problems and Artifacts",
  "difficulty": "4",
  "answers": {
    "answer_a": {
      "text": "\n\n    var temp <-- list[y]\n    list[x] <-- temp\n    list[y] <-- list[x]",
      "expl": "The data at index `x` is being overwritten by the data in `temp` *before* storing it at index y.  Resulting array: `list[40, 85, 85]`",
      "correct": 0
    },
    "answer_b": {
      "text": "\n\n    list[x] <-- temp\n    var temp <-- list[y]    \n    list[y] <-- list[x]",
      "expl": "The value of temp is being assigned *before* the variable has been initialized leading to unpredictable results. Resulting array: unpredictable.",
      "correct": 0
    },
    "answer_c": {
      "text": "\n\n    list[y] <-- list[x]\n    var temp <-- list[y]\n    list[x] <-- temp\n    \n     \n    ",
      "expl": "The data at index `y` is being overwritten by the data in `temp` *before* storing it at index y.  Resulting array: `list[40, 90, 90]`",
      "correct": 0
    },
    "answer_d": {
      "text": "\n\n    var temp <-- list[y]\n    list[y] <-- list[x]\n    list[x] <-- temp",
      "expl": "It's important to not that swapping x to y and then y to x will not work.  It is necessary to temporarily store the data of one of the variables to successfully swap the numbers.  To Do the, create a temp variable that holds the data at index `y`. Swap the data at `y` with `x` (move data from index `x` to index `y`), and then set the data at `x` to `temp` which holds the original value of the index `y`.  Resulting array: `list[40, 85, 90]`",
      "correct": 1
    }
  }
};