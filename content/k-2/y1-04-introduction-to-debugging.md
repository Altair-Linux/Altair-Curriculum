---
id: "y1-04"
title: "Introduction to Debugging"
grade: "1"
tags: [debugging, problem-solving, algorithms, errors]
difficulty: beginner
estimated-time: 40 minutes
prerequisites: ["Sequencing and Events", "Loops and Repeats"]
type: lesson
learning_objectives:
  - "Identify an error in a set of instructions and describe what went wrong."
  - "Fix an error by changing, adding, or removing a step."
  - "Explain the difference between a missing step, a wrong step, and a step in the wrong order."
materials:
  - "Printed buggy instruction sets per pair (see activity)"
  - "Pencil and eraser"
  - "Optional: a simple floor robot such as Bee-Bot if available"
assessment:
  formative: "After each buggy set, ask the pair to name the type of error: missing step, wrong step, or wrong order."
  summative: "Provide a five-step instruction set with two deliberate errors. Students find and fix both errors and describe what each error would have caused."
sequence_position: 4
---

## Introduction

Every programmer makes mistakes. The word for a mistake in a program is a **bug**. The process of finding and fixing bugs is called **debugging**. The name comes from the early days of computing when a real moth got stuck inside a computer and caused it to malfunction. Finding the moth and removing it was called "debugging the computer." Today, debugging means carefully reading instructions, running through them step by step, and finding the exact place where something goes wrong.

## What We Will Learn

- What a bug is in a set of instructions.
- Three types of errors: missing step, wrong step, and wrong order.
- How to debug by testing one step at a time.
- Why fixing the right bug matters more than fixing any bug.

## Core Explanation

There are three main kinds of errors in instructions.

A **missing step** means a step that should be there is not. If you write instructions for making a glass of juice but forget "open the carton," nothing will work from that point forward.

A **wrong step** means a step that is there but incorrect. "Pour milk into the cereal" when the recipe says "pour cereal into the bowl" is a wrong step. The sequence continues but the result is wrong.

A **wrong order** means the steps are all correct but they happen at the wrong time. "Eat the sandwich" appearing before "make the sandwich" is an ordering error. The instructions are not impossible, but the result is wrong.

To debug, you read through the instructions carefully, one step at a time, and ask: "If someone followed this step exactly, what would happen?" As soon as something does not make sense or would produce the wrong result, that is your bug.

It is important to understand the bug before you fix it. If you change something at random, you might fix one problem and introduce two new ones. Debugging is about finding the cause, not just changing things until it seems to work.

## Activity

**Bug Hunt** (30 minutes)

Part 1: Guided debugging (10 minutes)

Show this set of instructions on the board. Tell students it is meant to describe a robot getting a book from a shelf.

```
Step 1: Walk to the shelf.
Step 2: Pick up the book.
Step 3: Reach up to the shelf.
Step 4: Walk back to the desk.
Step 5: Put the book on the desk.
```

Ask: "Follow these steps in your head. What goes wrong?" Students should identify that Step 3 must come before Step 2. You cannot pick up a book before you reach for it.

Ask: "What type of error is this?" (Wrong order.)

Ask: "How do we fix it?" Move Step 3 to before Step 2.

Part 2: Pair debugging (20 minutes)

Give each pair two buggy instruction sets.

Buggy Set A (wrong step):
```
Step 1: Get a sheet of paper.
Step 2: Pick up a pencil.
Step 3: Draw a circle in the air.
Step 4: Draw a circle on the paper.
Step 5: Colour the circle.
```
Bug: Step 3 says "in the air." It should say "on the paper."

Buggy Set B (missing step):
```
Step 1: Fill a glass with water.
Step 2: Stir the water.
Step 3: Drink the water.
```
This is meant to be instructions for making a glass of squash. Bug: the step "add squash to the water" is missing between Steps 1 and 2.

For each set, pairs must:
1. Read through carefully.
2. Say what the instructions are supposed to do.
3. Identify the bug and name its type.
4. Write the corrected instructions.

Bring the class together to compare answers. Discuss: "Were there any bugs you almost missed? What helped you find it?"

## Real-World Connection

Software companies spend a huge amount of time debugging. When an app crashes on your phone, a programmer reads through the code step by step to find the exact line where something goes wrong. Finding the bug is usually harder than fixing it. Careful reading is the most important debugging skill.

## Check for Understanding

1. Here are instructions for washing hands:
   - Turn on the tap
   - Dry your hands
   - Put soap on your hands
   - Rub your hands for 20 seconds
   - Rinse the soap off
   Find the bug and name its type.

2. A robot is told to "pick up the red ball" but there is no red ball in the room. What type of error is this?

3. Why is it better to understand a bug before fixing it?

## Extension and Differentiation

**For students who need more support:** Provide only one buggy instruction set with a single obvious error. Act out the instructions physically so the student can see the moment the sequence fails.

**For students who want a challenge:** Write your own four-step instruction set with a deliberate bug, but do not tell your partner what the bug is or what type it is. Swap and see if they can find and name it.

## Summary

- A bug is an error in a set of instructions.
- There are three types: a missing step, a wrong step, and steps in the wrong order.
- To debug, read through the instructions one step at a time and find where the result would go wrong.
- Understand the bug first, then fix it precisely.
