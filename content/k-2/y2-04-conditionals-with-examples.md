---
id: "y2-04"
title: "Simple Conditionals with Examples"
grade: "2"
tags: [conditionals, if-then-else, logic, decision-making, programming-concepts]
difficulty: beginner
estimated-time: 45 minutes
prerequisites: ["Simple Conditionals", "Variables as Boxes"]
type: lesson
learning_objectives:
  - "Write an if-then-else statement with a clear condition, then-action, and else-action."
  - "Trace a conditional that involves a variable and state the result for two different variable values."
  - "Combine a conditional with a variable to write a program that responds differently to different inputs."
materials:
  - "Whiteboard"
  - "Pencil and paper per student"
  - "Printed tracing worksheets with partially written programs"
assessment:
  formative: "For each tracing exercise, ask the student to name the value that would cause the program to take the else branch, not just the then branch."
  summative: "Each student writes a complete if-then-else program involving one variable. They trace it twice: once with a value that takes the then branch, once with a value that takes the else branch."
sequence_position: 4
---

## Introduction

In Year 1, you wrote simple if-then rules. This year you will add the else part, connect conditionals to variables, and trace programs that make real decisions based on stored values. A conditional that checks a variable is the building block of almost every useful program. Games check if your score is high enough to pass a level. Apps check if you are logged in before showing your data. Thermostats check the temperature variable before deciding whether to turn on the heating. Today you will practise writing and tracing these decisions.

## What We Will Learn

- How to write a complete if-then-else conditional.
- How a conditional checks a variable and uses its value to decide what to do.
- How to trace a conditional program for two different input values.
- How combining variables and conditionals makes programs that respond to different situations.

## Core Explanation

A complete conditional has three parts.

```
if score >= 10:
  print "You passed!"
else:
  print "Try again."
```

The condition is: score is greater than or equal to 10. If that is true, the program prints "You passed!" If it is false (score is less than 10), the program prints "Try again."

The **else** part covers every case where the condition is not true. Without an else, the program does nothing when the condition is false.

Conditionals with variables are powerful because the same program produces different results depending on what value the variable holds. You write the program once. The behaviour changes based on the data.

Tracing a conditional with a variable works like this. You are given the variable's value. You check the condition. You follow the correct branch (then or else). You ignore the other branch completely.

Example: score = 7.
Check: is score >= 10? No, 7 is not >= 10. So go to the else branch: print "Try again."
The then branch is skipped entirely.

Example: score = 15.
Check: is score >= 10? Yes, 15 is >= 10. So go to the then branch: print "You passed!"
The else branch is skipped entirely.

## Activity

**Tracing and Writing Conditionals** (33 minutes)

Part 1: Guided tracing (12 minutes)

Step 1 (5 minutes): Write this program on the board.

```
temperature = 8
if temperature < 15:
  print "Wear a coat."
else:
  print "A t-shirt is fine."
```

Ask: "What is the value of temperature?" (8.) "Is 8 less than 15?" (Yes.) "Which branch runs?" (The then branch: "Wear a coat.") "What does the else branch do in this run?" (Nothing. It is skipped.)

Now ask: "If temperature was 20 instead of 8, which branch would run?" (The else branch: "A t-shirt is fine.")

Step 2 (7 minutes): Give students two more programs to trace independently. Each program is traced twice: once with the value given, once with a different value that swaps the branch.

Program A:
```
coins = 12
if coins >= 10:
  print "You can buy it."
else:
  print "Not enough coins."
```
Trace with coins = 12. Then trace with coins = 4.

Program B:
```
lives = 0
if lives > 0:
  print "Keep playing."
else:
  print "Game over."
```
Trace with lives = 0. Then trace with lives = 3.

Part 2: Writing a conditional (12 minutes)

Step 3 (4 minutes): On the board, give students a scenario: "A door opens automatically if fewer than 10 people are inside the building. If there are 10 or more people inside, the door stays locked."

Ask students to write this as an if-then-else program using a variable called "people_inside."

Step 4 (4 minutes): Trace the program with two values: people_inside = 7, then people_inside = 11.

Step 5 (4 minutes): Share two or three programs from the class. Discuss: "Are the conditions the same? Did anyone use a different comparison? Are they all correct?"

Part 3: Freewrite (9 minutes)

Step 6 (9 minutes): Each student writes their own if-then-else program using a variable they choose. Suggestions: a robot that gives different greetings depending on the time of day, a game that unlocks a bonus level if the score is over 100, a weather app that shows an umbrella if rain is above 50 percent chance.

They must trace their program twice, showing both branches.

## Real-World Connection

A pelican crossing uses a conditional: if the button has been pressed and enough time has passed since the last crossing, then change the lights to green for pedestrians. Otherwise, keep the lights as they are. The "enough time" is a variable that changes each cycle. The conditional checks it and decides what to do.

## Check for Understanding

1. Write an if-then-else conditional for this situation: if a student's attendance is above 90 percent, print "Great attendance." Otherwise, print "Please try to attend more regularly."

2. Trace your conditional with attendance = 95. Which branch runs?

3. Trace it again with attendance = 85. Which branch runs now?

## Extension and Differentiation

**For students who need more support:** Use physical cards for the condition: a card showing the variable value, a card showing the condition, and two cards showing the two outcomes. Hold up the variable card and physically select the correct outcome card. Connect this to the written form.

**For students who want a challenge:** Write a conditional with three branches using two conditions. For example: if score >= 20, then "gold." If score >= 10, then "silver." Otherwise, "bronze." Trace this with three different values: one that gives gold, one that gives silver, one that gives bronze.

## Summary

- A complete if-then-else conditional has a condition, a then-action for when the condition is true, and an else-action for when it is false.
- When tracing, you check the condition with the variable's current value, follow one branch, and skip the other.
- Connecting a variable to a conditional lets the same program produce different results based on different data.
- This is what makes programs useful: they can respond to the world rather than doing the same thing every time.
