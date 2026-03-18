---
id: "y2-03"
title: "More on Loops"
grade: "2"
tags: [loops, count-loops, condition-loops, algorithms, programming-concepts]
difficulty: beginner
estimated-time: 45 minutes
prerequisites: ["Loops and Repeats", "Variables as Boxes"]
type: lesson
learning_objectives:
  - "Distinguish between a count loop and a condition loop and give an example of each."
  - "Trace a count loop with a variable and write the value of the variable after each iteration."
  - "Write a loop that uses a variable to count progress toward a goal."
materials:
  - "Whiteboard"
  - "Pencil and paper per student"
  - "A simple counting prop: a set of ten counters per pair"
assessment:
  formative: "During tracing, ask each student to say the value of the count variable after each pass through the loop, before checking the answer."
  summative: "Each student writes a count loop with a variable that starts at 0, adds 1 each time, and stops when it reaches 5. They trace the loop and write the variable value after each pass."
sequence_position: 3
---

## Introduction

In Year 1 you learned that a loop makes instructions repeat. You learned the difference between a loop that runs a set number of times and one that runs until something changes. This year you are going to connect loops to variables. The count variable is what makes a loop know when to stop. Understanding how a loop and a variable work together opens the door to writing programs that can do much more than a simple repeated sequence.

## What We Will Learn

- The difference between a count loop and a condition loop, with examples of each.
- How a variable is used inside a loop to track progress.
- How to trace a loop step by step and follow the variable as it changes.
- How to write a simple count loop with a stopping condition.

## Core Explanation

**Count loops**

A count loop runs a specific number of times. It uses a variable to keep track of how many times it has run.

```
count = 0
repeat while count < 5:
  print "hello"
  count = count + 1
```

Trace: the loop starts. Count is 0. 0 is less than 5, so the loop runs. It prints "hello" and adds 1 to count. Count is now 1. 1 is less than 5, so the loop runs again. This continues until count reaches 5. At that point, 5 is not less than 5, so the loop stops.

The output is "hello" printed five times.

The variable doing the counting has a name: it is called a **counter**. Counters start at 0 (or sometimes 1) and increase by 1 each pass.

**Condition loops**

A condition loop runs until a condition becomes false (or until it becomes true, depending on how it is written). The number of times it runs is not fixed in advance.

```
repeat while water is not boiling:
  keep heating
```

You do not know how many times this will run. It depends on how long the water takes to boil. When the condition "water is not boiling" becomes false (because the water is now boiling), the loop stops.

**The key difference**

A count loop has a known endpoint. A condition loop has an unknown endpoint that depends on the world changing.

Both are useful. You use a count loop when you know exactly how many times something should happen. You use a condition loop when you are waiting for something to change.

## Activity

**Loop Tracing and Writing** (33 minutes)

Part 1: Count loop tracing (15 minutes)

Step 1 (5 minutes): Write this loop on the board.

```
count = 0
repeat while count < 3:
  say "Jump!"
  count = count + 1
```

Ask: "What is count at the start?" (0.) "Is 0 less than 3?" (Yes.) "So what happens?" (Say "Jump!", then count becomes 1.) Work through all three passes together. After each pass, ask students to say the new value of count before continuing.

Step 2 (5 minutes): Give students a different loop to trace independently.

```
count = 1
repeat while count < 5:
  draw a circle
  count = count + 1
```

They fill in a tracking table: Pass 1, count before = 1, action, count after = 2. Pass 2, count before = 2, action, count after = 3. And so on until the loop stops.

Step 3 (5 minutes): Check answers together. Ask: "How many circles were drawn?" (4, because count goes 1, 2, 3, 4 and stops when count = 5.) Ask: "What would change if the starting value was 0 instead of 1?" (Five circles instead of four.)

Part 2: Condition loop discussion (8 minutes)

Step 4 (4 minutes): Present two scenarios. Which needs a count loop and which needs a condition loop?

Scenario A: A vending machine pushes out exactly three items when you select a pack of three.
Scenario B: A fan keeps running until the temperature drops below 25 degrees.

Ask for reasons. (A is count: three items, fixed. B is condition: depends on temperature, not a fixed count.)

Step 5 (4 minutes): One more pair. Which type?

Scenario C: A loading bar fills in exactly 20 steps.
Scenario D: A program waits for the user to press a key before continuing.

(C is count. D is condition: it waits until an event happens.)

Part 3: Writing a loop (10 minutes)

Step 6 (10 minutes): Each student writes a count loop from scratch. The scenario: a robot is stamping stars on a card. It must stamp exactly six stars and then stop.

They must write: the variable name, the starting value, the condition for continuing, the action inside the loop, and the update to the counter.

Teacher circulates and checks that the stopping condition correctly matches "six stars."

## Real-World Connection

A phone charging loop runs while the battery level is below 100 percent. It checks the level, adds power, and checks again. This is a condition loop. An animation that plays 30 frames per second uses a count loop that runs 30 times every second. Both loop types are running on your devices right now.

## Check for Understanding

1. Trace this loop and write the value of count after each pass:
   count = 0, repeat while count is less than 4: count = count + 1.

2. A robot must water exactly 8 plants. Write a count loop with a counter variable.

3. You want a program to keep playing music until the user presses stop. Should you use a count loop or a condition loop? Why?

## Extension and Differentiation

**For students who need more support:** Use the physical counters. Each counter represents one pass through the loop. Place them one at a time, counting aloud. When all the counters are placed, the loop stops. Connect this to the written form afterward.

**For students who want a challenge:** Write a loop where the counter increases by 2 each pass instead of 1. How many passes happen before count reaches 10? What if the counter starts at 1 and increases by 2 each time? Does count ever equal 10 exactly, or does it skip past it?

## Summary

- A count loop uses a counter variable to track how many times it has run, stopping when the counter reaches a set value.
- A condition loop runs until a condition changes, regardless of how many passes that takes.
- Tracing a loop means writing the value of the counter after each pass to follow exactly what the loop does.
- Connecting loops to variables gives you programs that can count, accumulate, and respond to changing situations.
