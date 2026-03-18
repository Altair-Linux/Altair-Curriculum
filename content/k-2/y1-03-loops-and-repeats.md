---
id: "y1-03"
title: "Loops and Repeats"
grade: "1"
tags: [loops, repetition, algorithms, unplugged]
difficulty: beginner
estimated-time: 40 minutes
prerequisites: ["Sequencing and Events", "Patterns Everywhere"]
type: lesson
learning_objectives:
  - "Identify a repeating section in a set of instructions."
  - "Rewrite a repeated sequence using a loop instruction."
  - "Explain why loops make instructions shorter and easier to manage."
materials:
  - "Printed or written instruction cards for the jumping activity (see below)"
  - "Whiteboard for class demonstration"
  - "Pencil and paper"
assessment:
  formative: "Ask each student to circle the repeated section in a set of instructions written on the board, then say how many times it repeats."
  summative: "Each student is given a set of instructions containing a repeated section. They rewrite the instructions using a loop notation and state how many steps were saved."
sequence_position: 3
---

## Introduction

Imagine you are writing instructions for a robot to stamp 10 circles on a piece of paper. You could write "stamp circle" ten separate times. That works, but it is long and if you change your mind and want 20 circles, you have to rewrite everything. Or you could write "repeat 10 times: stamp circle." That is a loop. It is shorter, cleaner, and easier to change. Loops are one of the most important ideas in programming because nearly every useful program repeats something. Today we are going to find repeats in instructions and rewrite them as loops.

## What We Will Learn

- What a loop is and why it is useful.
- How to spot a repeating pattern in a set of instructions.
- How to rewrite repeated steps as a loop.
- The difference between a loop that runs a fixed number of times and one that runs until something changes.

## Core Explanation

A **loop** is a set of instructions that repeats. Instead of writing the same steps over and over, you write them once and say how many times to repeat them.

Here is an example without a loop:

```
jump
clap
jump
clap
jump
clap
jump
clap
```

Here is the same thing with a loop:

```
repeat 4 times:
  jump
  clap
```

Both sets of instructions tell the performer to jump and clap four times. The loop version is half as long and much easier to change. If you want five times instead of four, you change one number.

There are two common kinds of loops.

A **count loop** runs a fixed number of times. "Repeat 10 times." You know exactly when it stops.

A **condition loop** runs until something changes. "Keep stirring until the sugar dissolves." You do not know exactly how long it will take, but you know what to watch for. In computing this is written as: "repeat while sugar is not dissolved: stir."

Both kinds appear in real programs. Learning to spot which kind you need is part of becoming a programmer.

## Activity

**Loop Rewriting Challenge** (28 minutes)

Part 1: Class demonstration (8 minutes)

Step 1 (3 minutes): Write this on the board:

```
hop on one foot
wave your hand
hop on one foot
wave your hand
hop on one foot
wave your hand
```

Ask: "Is there a pattern here? What repeats?" Students identify "hop on one foot, wave your hand" as the repeating unit.

Step 2 (5 minutes): Show how to rewrite it as:

```
repeat 3 times:
  hop on one foot
  wave your hand
```

Ask the class to act it out. Count to make sure it runs exactly three times.

Part 2: Pair rewriting (15 minutes)

Give each pair three sets of instructions written without loops. They must:
1. Circle the repeating unit.
2. Count how many times it repeats.
3. Rewrite using the format: "repeat [number] times: [steps]"

Set A (4 repeats):
```
walk forward
clap
walk forward
clap
walk forward
clap
walk forward
clap
```

Set B (3 repeats):
```
draw a circle
colour it red
draw a circle
colour it red
draw a circle
colour it red
```

Set C (6 repeats of a single step):
```
tap the table
tap the table
tap the table
tap the table
tap the table
tap the table
```

Step 3 (5 minutes): Class discussion. For Set C, ask: "What is the repeating unit? It is just one step. Is a loop still useful here?" Yes, because if you wanted to change from 6 taps to 20 taps, you only change one number.

Introduce the condition loop idea with a quick example: "Keep walking forward until you reach the wall." Ask: "Why can't we use a count loop here?" (Because we do not know how far away the wall is.)

## Real-World Connection

Your washing machine uses loops. It fills with water, agitates, drains, and spins. That cycle repeats several times during a wash. Without loops, the machine would need a completely different program for every different wash length.

## Check for Understanding

1. Rewrite these instructions using a loop: sit down, stand up, sit down, stand up, sit down, stand up.
2. A robot must keep moving forward until it detects an obstacle. Is this a count loop or a condition loop? Why?
3. You have a loop that says "repeat 5 times: draw a star." How many stars will be drawn? If you change 5 to 8, how many stars are drawn now?

## Extension and Differentiation

**For students who need more support:** Use physical actions only. Clap a pattern and ask the student to identify what repeats. Then clap it again while counting. Connect the count to "repeat 3 times: clap, stomp."

**For students who want a challenge:** Write a loop that has another loop inside it. For example: "repeat 3 times: (repeat 2 times: clap) then stomp." How many claps happen in total? How many stomps? This is called a nested loop.

## Summary

- A loop is a set of instructions that repeats.
- Count loops run a fixed number of times. Condition loops run until something changes.
- Writing a loop instead of repeating steps makes instructions shorter and easier to update.
- Almost all real programs use loops because useful tasks nearly always involve repeating something.
