---
id: "y2-02"
title: "Variables as Boxes"
grade: "2"
tags: [variables, data, storage, programming-concepts]
difficulty: beginner
estimated-time: 40 minutes
prerequisites: ["Review: Sequences, Inputs, and Outputs", "Data and Representation"]
type: lesson
learning_objectives:
  - "Explain what a variable is using the analogy of a labelled box."
  - "Describe what it means to store a value in a variable and to change it."
  - "Use variables in simple written programs to store a name and a score."
materials:
  - "A physical box or envelope per pair, plus small slips of paper"
  - "Sticky labels or tape for labelling boxes"
  - "Whiteboard"
  - "Pencil and paper"
assessment:
  formative: "During the box activity, ask each student: if I put a new slip in the box, what happens to the old one? This checks understanding that a variable holds one value at a time."
  summative: "Each student traces through a five-line written program involving two variables, writing down the value of each variable after each line changes it."
sequence_position: 2
---

## Introduction

A program often needs to remember something while it is running. It might need to remember your name so it can display it on screen. It might need to keep track of your score as it changes. It might need to store a number so it can do a calculation with it later. To do this, programs use **variables**. A variable is a place where a program stores one piece of information. The information can change as the program runs. Today you are going to build a physical model of how variables work, then use that understanding to trace a written program.

## What We Will Learn

- What a variable is and what it does in a program.
- That a variable has a name and a value, and the value can change.
- How to store, read, and update a value in a variable.
- How to trace a simple program and track the values of variables step by step.

## Core Explanation

Imagine a small cardboard box with a label on the front. The label is the variable's **name**. Whatever is inside the box is the variable's **value**.

You can do four things with a variable.

First, you can **create** it: get a box and write a name on the label.

Second, you can **store** a value in it: put a slip of paper with a number or word inside.

Third, you can **read** the value: open the box and look at the slip inside, without changing it.

Fourth, you can **update** the value: take out the old slip and put a new one in. The box is still the same box with the same name, but the value has changed.

A variable holds one value at a time. When you put a new value in, the old one is gone.

In a program, this looks like:

```
score = 0
score = score + 1
score = score + 1
```

After the first line, score is 0. After the second line, score is 1. After the third line, score is 2. The variable name stays the same. The value changes each time a line updates it.

Variables can store different types of information: numbers, words, or true-or-false values. A variable storing a number is useful for scores and counts. A variable storing a word is useful for names and messages.

## Activity

**Box Variables** (30 minutes)

Part 1: Physical model (12 minutes)

Step 1 (3 minutes): Give each pair one box or envelope and several slips of paper. Each pair writes a label on their box. Suggested labels: "score," "player name," or "count."

Step 2 (4 minutes): Teacher demonstrates with a box labelled "score." Say: "I am going to set score to zero." Put a slip saying "0" in the box. Say: "Now the program runs and the player earns a point. Score equals score plus one." Take out the 0 slip, write "1" on a new slip, and put it in. Repeat: "Player earns another point." Take out 1, write 2, put it in.

Ask: "What is the value of score now?" (2.) "What happened to the 0?" (It was replaced. It is gone.)

Step 3 (5 minutes): Pairs practise with their own box. Teacher calls out instructions:
- "Set your variable to 5."
- "Add 3 to your variable."
- "What is the value now?"
- "Subtract 2."
- "What is the value now?"
- "Set your variable to the word hello."
Ask: "What changed? What stayed the same?" (The name stayed the same. The value changed. You can also change the type of value stored.)

Part 2: Written tracing (18 minutes)

Step 4 (5 minutes): Introduce written variable notation on the board. Show that "name = Ali" means "store the word Ali in the variable called name." Show "score = 0" and "score = score + 10."

Step 5 (8 minutes): Give each student a five-line program to trace. For each line, they write the current value of each variable in a tracking table.

Program:
```
score = 0
lives = 3
score = score + 50
lives = lives - 1
score = score + 100
```

Tracking table has columns: Line, score, lives.

Students fill in the value of each variable after each line runs.

Correct values:
Line 1: score = 0, lives = (not set yet)
Line 2: score = 0, lives = 3
Line 3: score = 50, lives = 3
Line 4: score = 50, lives = 2
Line 5: score = 150, lives = 2

Step 6 (5 minutes): Review together. Ask: "Which line changed score for the first time? Which line changed lives? If the program ran lines 3 and 4 again, what would score and lives be?"

## Real-World Connection

Every game you have ever played uses variables. Your score, your health points, the level you are on, the number of coins you have collected: all of these are stored in variables that update as you play. When you save a game, the program stores all the current variable values so it can restore them when you come back.

## Check for Understanding

1. A variable called "temperature" currently holds the value 20. The program runs the line: temperature = temperature + 5. What is the new value of temperature?
2. A variable called "player" holds the value "Sam." The program then runs: player = "Alex." What does player hold now? What happened to "Sam?"
3. Why is it useful for a program to store information in a variable rather than just using the number directly?

## Extension and Differentiation

**For students who need more support:** Use the physical box throughout. Every time a variable changes, physically swap the slip. Do not introduce the written notation until the physical model is well understood.

**For students who want a challenge:** Write a short five-line program of your own that uses two variables and changes each one at least twice. Write a tracking table for your program. Swap with a partner who must fill in the tracking table without seeing yours.

## Summary

- A variable is a named storage place that holds one value at a time.
- The name stays the same. The value can be updated as the program runs.
- When a variable is updated, the old value is replaced and gone.
- Variables can store numbers, words, or other types of information, and are used in almost every program.
