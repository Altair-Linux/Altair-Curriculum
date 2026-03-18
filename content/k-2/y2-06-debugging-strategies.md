---
id: "y2-06"
title: "Debugging Strategies"
grade: "2"
tags: [debugging, problem-solving, testing, algorithms]
difficulty: beginner
estimated-time: 45 minutes
prerequisites: ["Introduction to Debugging", "More on Loops", "Simple Conditionals with Examples"]
type: lesson
learning_objectives:
  - "Apply three specific debugging strategies: tracing, testing with known values, and isolating sections."
  - "Identify which strategy is most appropriate for a given type of error."
  - "Fix a program containing multiple errors using a systematic approach."
materials:
  - "Printed buggy programs per student (three programs, each with two errors)"
  - "Pencil and eraser"
  - "Whiteboard"
assessment:
  formative: "After fixing each program, students name the strategy they used and explain why they chose it for that particular error."
  summative: "Each student is given one unseen buggy program with two errors. They write which strategy they will use, find both errors, fix them, and explain each fix in one sentence."
sequence_position: 6
---

## Introduction

In Year 1 you learned what a bug is and the three types of errors: missing step, wrong step, and wrong order. This year you are going to develop a systematic approach to finding bugs, not just recognising them. Professional programmers use specific strategies when debugging. They do not just read the program and hope to spot something. They trace it, test it with values they already know the answer to, and isolate sections one at a time. Today you will practise all three strategies and decide which one works best for different kinds of errors.

## What We Will Learn

- Three debugging strategies: tracing, testing with known values, and isolating sections.
- When each strategy is most useful.
- How to fix errors systematically rather than by guessing.
- How to document what you found and what you changed.

## Core Explanation

**Strategy 1: Tracing**

Tracing means reading through the program line by line, exactly as the computer would, and writing down what happens at each step. You track variable values, follow branches, and count loop passes. Tracing is most useful when you want to understand exactly what the program does. It is thorough but slow. Use it when you have a short program and need to understand all of it.

**Strategy 2: Testing with known values**

This means running the program (or tracing it) with a value where you already know what the correct output should be. If you test a program that should add two numbers and you give it 2 and 3, you know the answer should be 5. If the program gives you 4, there is an error. This strategy is most useful for programs with conditionals and variables, because you can test each branch by choosing values that trigger it.

**Strategy 3: Isolating sections**

When a program is long, testing the whole thing at once makes it hard to find where the error is. Isolating means testing one section at a time. You cover or ignore the rest of the program and check whether that one section works correctly on its own. Once each section works, you put them together. This strategy is most useful for longer programs with multiple parts.

## Activity

**Bug Hunt with Strategy** (35 minutes)

Part 1: Strategy introduction (7 minutes)

Step 1 (7 minutes): Present one buggy program on the board. Walk through it using tracing first. Then show how testing with a known value would have caught the error faster. Discuss: "Tracing found the error but took every step. Testing with 0 would have found it immediately because we know the answer should be 0."

Buggy program (wrong update in a loop):
```
count = 0
repeat while count < 3:
  print count
  count = count + 2
```
Expected: print 0, 1, 2. Actual with this code: print 0, 2, then count = 4 which is not less than 3, so the loop stops. Only 0 and 2 are printed. The bug is "count = count + 2" should be "count = count + 1."

Part 2: Pair debugging with assigned strategies (20 minutes)

Give each pair three printed buggy programs. Assign each pair one strategy to use for each program.

Program 1 (use tracing): A loop that is supposed to print the numbers 1 to 5.
```
count = 1
repeat while count <= 5:
  print count
  count = count + 2
```
Bug: count adds 2 instead of 1. Trace reveals: prints 1, 3, 5, then count = 7, loop stops. Should print 1, 2, 3, 4, 5.

Program 2 (use testing with known values): A conditional that checks if a score earns a certificate.
```
score = 80
if score > 90:
  print "Certificate earned."
else:
  print "Keep trying."
```
Bug: condition should be score >= 80, not > 90. Test with 80: correct output should be "Certificate earned." Actual output: "Keep trying." Bug found.

Program 3 (use isolating): A two-part program.
```
Part A:
total = 10 + 5
print total

Part B:
if total > 20:
  print "Big number."
else:
  print "Small number."
```
Bug: 10 + 5 = 15, and 15 is not > 20, so "Small number" prints. But the program was intended to check if total > 10. The condition is wrong. Isolating Part B reveals: Part A works fine (total = 15). Part B is where the error is.

Step 2 (20 minutes): Pairs work through their three programs using the assigned strategies. They write: the strategy used, the line number of the error, what the error was (type and description), and the fix.

Part 3: Share and compare (8 minutes)

Step 3 (8 minutes): Each pair shares one fix. Class asks: "Would a different strategy have found this bug? Would it have been faster or slower?"

## Real-World Connection

When a bridge engineer detects a crack in a structure, they do not replace the entire bridge. They isolate the section where the crack is, test it under controlled conditions, and fix only what is broken. Debugging code follows the same discipline. Change as little as possible. Understand the cause before applying the fix.

## Check for Understanding

1. You have a program with a loop that should run 4 times but runs 3. Which debugging strategy would you use first, and what would you look for?

2. A conditional is giving the wrong output when you test it with the value 50. Which strategy is best for finding this bug?

3. Why is fixing a bug by guessing and changing random lines dangerous?

## Extension and Differentiation

**For students who need more support:** Work on Program 1 only, using tracing. Provide a blank tracking table with columns for each loop pass. Focus on finding one bug by completing the trace and seeing where the output differs from what was expected.

**For students who want a challenge:** Write a program with two deliberate bugs, one in a loop and one in a conditional. Document which line each bug is on and what the correct fix is. Swap with a partner who must find both bugs using the most appropriate strategy for each one.

## Summary

- Tracing means reading a program step by step and tracking every value. It finds any error but takes time.
- Testing with known values means running a program with input where you already know the correct output. It finds errors quickly when you can predict the result.
- Isolating sections means testing one part of a program independently from the rest. It is fastest for long programs.
- Choosing the right strategy saves time. Fixing without understanding the cause often introduces new bugs.
