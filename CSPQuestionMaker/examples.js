	var examples =[];

	examples[0] = {
  "qType": "singleSelect",
  "qText": "What value of A would make the output of the logic circuit `false`?\n\n\n<img src=\"https://preview.ibb.co/iWHjgv/Screen_Shot_2017_09_10_at_6_13_58_PM.png\" alt=\"Screen_Shot_2017_09_10_at_6_13_58_PM\" border=\"0\" style=\"width: 250px; margin:auto; display:block\">\n",
  "eu": "2.2 Multiple levels of abstraction are used to write programs or create other computational artifacts",
  "lo": "2.2.3 Identify multiple levels of abstractions that are used when writing programs. [P3]",
  "eks": ["2.2.3F"],
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
  "qType": "singleSelect",
  "qText": "In the following code block, assume that the variables Rainy and too_cold are boolean.\n\n    IF (NOT (Rainy OR too_cold))\n    {\n        DISPLAY(\"It's a good beach day\")\n    }\n\nWhich of the following are equivalent to the above code block?",
  "eu": "5.5 Programming uses mathematical and logical concepts.",
  "lo": "5.5.1 Employ appropriate mathematical and logical concepts in programming. [P1]",
  "ctp": "Connecting computing",
  "eks": ["5.5.1E"],
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
  "qType": "singleSelect",
  "qText": "In the process of digging, a landscaping company cuts a fiber line. Transmission of Internet traffic is still possible through additional pathways that provide alternate routes between the source and destination.  The additional pathways describe a concept known as:",
  "eu": "6.1 The Internet is a network of autonomous systems.",
  "lo": "6.1.1 Explain the abstractions in the Internet and how the Internet functions. [P3]",
  "ctp": "Abstracting",
  "eks": ["6.1.1B"],
  "difficulty": "3",
  "answers": {
    "answer_a": {
      "text": "bandwidth",
      "expl": "Bandwidth is the data throughput of a network. If a connection is broken, there will be no throughput.",
      "correct": 0
    },
    "answer_b": {
      "text": "hierarchy",
      "expl": "Designing networks in a hierarchal manner allows a complex problem to be broken into smaller manageable parts.",
      "correct": 0
    },
    "answer_c": {
      "text": "latency",
      "expl": "Network latency is an expression of how much time it takes for a packet of data to get from one point to another.",
      "correct": 0
    },
    "answer_d": {
      "text": "redundancy",
      "expl": "Network redundancy is a process through which additional or alternate instances of network devices, equipment and communication mediums are installed within network infrastructure. It is a method for ensuring network availability in case of a network device or path failure and unavailability.",
      "correct": 1
    }
  }
};

examples[3] = {
  "qType": "singleSelect",
  "qText": "You decide you are going to take your internet privacy seriously. Which of the following actions poses the greatest risk to your internet privacy?",
  "eu": "6.3 Cybersecurity is an important concern for the Internet and the systems built on it.",
  "lo": "6.3.1 Identify existing cybersecurity concerns and potential options to address these issues with the Internet and the systems built on it. [P1]",
  "ctp": "Connecting computing",
  "eks": ["6.3.1C"],
  "difficulty": "2",
  "answers": {
    "answer_a": {
      "text": "Sharing your email address with those who request it.",
      "expl": "While sharing your email is a privacy concern as it will increase the\nlikelihood of Spam, it is not the greatest privacy infraction of the options.",
      "correct": 0
    },
    "answer_b": {
      "text": "Connection to secured networks using the provided network name and password when visiting hotels.",
      "expl": "Given that the network is part of the hotel infrastructure, requires a\nusername and password, it is not a major privacy concern unless the hotel IT structure is\ncompromised.",
      "correct": 0
    },
    "answer_c": {
      "text": "Encrypting your files and sharing your private key to ensure others who you choose to share files with can read them.",
      "expl": "When encrypting files using asymmetric methods, one should always share\nthe public key. If a private key is shared, all files encrypted by this user are able to be able to be\nunencrypted which is a major privacy risk.",
      "correct": 1
    },
    "answer_d": {
      "text": "Using cloud storage to ensure access to your files from all your devices.",
      "expl": "Cloud storage itself is not a privacy risk. While one should ensure proper\nsecurity settings when signing up for any cloud storage, the risk is minimal compared to other options given.",
      "correct": 0
    }
  }
};

examples[4] = {
  "qType": "singleSelect",
  "qText": "You are writing a function called `swap (list, x, y)` which will exchange the position of the two values at indexes x and y in the list.\n\nExample: before and after a call to `swap (list, 2, 3)` on the list shown below\n\n<img src=\"https://preview.ibb.co/byCrDa/Screen_Shot_2017_09_11_at_1_59_14_PM.png\" alt=\"Screen_Shot_2017_09_11_at_1_59_14_PM\" border=\"0\" style=\"display: block; margin: auto; width: 600px\">\n\nThe function header is defined below.  Choose three lines of code that will perform the swap correctly.\n\n    procedure swap (list, x, y) {\n        < MISSING CODE >\n    }",
  "eu": "5.4 Programs are developed, maintained, and used by people for different purposes.",
  "lo": "5.4.1 Evaluate the correctness of a program. [P4]",
  "eks": [
    "5.4.1F"
  ],
  "ctp": "Analyzing Problems and Artifacts",
  "difficulty": "4",
  "answers": {
    "answer_a": {
      "text": "<pre>\nvar temp <-- list[y]\nlist[x] <-- temp\nlist[y] <-- list[x]\n</pre>",
      "expl": "The data at index `x` is being overwritten by the data in `temp` *before* storing it at index y.  Resulting array: `list[40, 85, 85]`",
      "correct": 0
    },
    "answer_b": {
      "text": "<pre>\nlist[x] <-- temp\nvar temp <-- list[y]    \nlist[y] <-- list[x]\n</pre>",
      "expl": "The value of temp is being assigned *before* the variable has been initialized leading to unpredictable results. Resulting array: unpredictable.",
      "correct": 0
    },
    "answer_c": {
      "text": "<pre>\nlist[y] <-- list[x]\nvar temp <-- list[y]\nlist[x] <-- temp\n</pre>",
      "expl": "The data at index `y` is being overwritten by the data in `temp` *before* storing it at index y.  Resulting array: `list[40, 90, 90]`",
      "correct": 0
    },
    "answer_d": {
      "text": "<pre>\nvar temp <-- list[y]\nlist[y] <-- list[x]\nlist[x] <-- temp\n</pre>",
      "expl": "It's important to not that swapping x to y and then y to x will not work.  It is necessary to temporarily store the data of one of the variables to successfully swap the numbers.  To Do the, create a temp variable that holds the data at index `y`. Swap the data at `y` with `x` (move data from index `x` to index `y`), and then set the data at `x` to `temp` which holds the original value of the index `y`.  Resulting array: `list[40, 85, 90]`",
      "correct": 1
    }
  }
};