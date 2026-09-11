import subprocess
import tempfile
import os

def longest_run(data):
    longest = 0
    current = 0
    for char in data:
        if char == 'H':
            current += 1
            if current > longest:
                longest = current
        else:
            current = 0
    return longest

cases = [
    ("all tails",         "TTTTTT",     0),
    ("all heads",         "HHHHHH",     6),
    ("single H",          "H",          1),
    ("single T",          "T",          0),
    ("run at start",      "HHHTT",      3),
    ("run at end",        "TTHHH",      3),
    ("run in middle",     "THHHHT",     4),
    ("multiple runs",     "HHTHHHTH",   3),
    ("alternating",       "HTHTHTHT",   1),
    ("hand trace",        "THHTHH",     2),
]

passed = 0
failed = 0

for name, data, expected in cases:
    result = longest_run(data)
    status = "PASS" if result == expected else "FAIL"
    if status == "PASS":
        passed += 1
    else:
        failed += 1
    print(f"{status}  [{name}]  input={data!r}  expected={expected}  got={result}")

print(f"\n{passed} passed, {failed} failed")
