---
id: "y1-08"
title: "Simple Conditionals"
grade: "1"
tags: [conditionals, logic, if-then, decision-making, algorithms]
difficulty: beginner
estimated-time: 40 minutes
prerequisites: ["Sequencing and Events", "Introduction to Debugging"]
type: lesson
learning_objectives:
  - "Explain what a conditional is using everyday examples."
  - "Identify the condition and the action in an if-then statement."
  - "Write a simple if-then rule for a real situation."
materials:
  - "Whiteboard or large paper"
  - "Printed conditional scenario cards (one set per pair)"
  - "Pencil and paper"
  - "Optional: red and green cards for students to hold up"
assessment:
  formative: "For each scenario card, students identify the condition and write it as an if-then statement. Teacher checks that the condition and action are correctly separated."
  summative: "Each student writes three if-then rules for a robot helper at home. Each rule must have a clear condition and a specific action."
sequence_position: 8
---

## Introduction

Most programs do not just run the same steps every time. They make decisions. When you open a weather app, it does not show you the same message every day. It checks the current weather and then decides what to show. When a game character runs into a wall, the game checks: "Is there a wall here?" and if there is, the character stops. This kind of decision making is called a conditional. It is one of the most important ideas in all of computing, and it shows up in real life constantly.

## What We Will Learn

- What a conditional is and why programs need them.
- The structure of an if-then statement.
- How to identify the condition and the action separately.
- How to write a simple conditional rule for a real situation.

## Core Explanation

A **conditional** is a rule that only applies in certain situations. It has two parts.

The **condition** is something that can be true or false. "It is raining" is a condition. It is either true right now or it is not. "The number is bigger than 10" is a condition. "The door is open" is a condition.

The **action** is what happens when the condition is true.

Together, they form an if-then statement.

```
If it is raining, then bring an umbrella.
If the number is bigger than 10, then print "too high."
If the door is open, then close it.
```

The action only runs when the condition is true. If the condition is false, the program skips the action and moves on.

You can also add what happens when the condition is false.

```
If it is raining, then bring an umbrella.
Otherwise, bring sunglasses.
```

The "otherwise" part is called the **else** part. It covers the case when the condition is not true.

Conditionals let a program behave differently in different situations. Without them, a program would do exactly the same thing every time, no matter what.

## Activity

**Conditional Card Sort and Writing** (30 minutes)

Part 1: Spot the condition (10 minutes)

Step 1 (5 minutes): Write three everyday situations on the board. For each one, ask: "What is the condition? What is the action?"

Situation 1: When it is cold, wear a coat.
Condition: it is cold. Action: wear a coat.

Situation 2: If the light is red, stop the car.
Condition: the light is red. Action: stop.

Situation 3: If you are hungry, eat a snack.
Condition: you are hungry. Action: eat a snack.

For each one, rewrite it in the format: If [condition], then [action].

Step 2 (5 minutes): Ask students to think of one more example from their own day. Take three or four responses. Rewrite each as an if-then statement on the board.

Part 2: Scenario cards (15 minutes)

Step 3 (10 minutes): Give each pair a set of five scenario cards. Each card describes a situation but is not written as an if-then statement yet. Pairs must rewrite each one.

Card 1: The robot sees that the floor is wet. It puts out a warning sign.
Card 2: The alarm goes off. You wake up.
Card 3: The temperature drops below zero. The heating turns on.
Card 4: The battery is below 10 percent. The tablet shows a warning.
Card 5: You finish your vegetables. You get dessert.

Step 4 (5 minutes): Each pair shares one rewritten conditional. Class checks: is the condition something that can be true or false? Is the action specific enough?

Part 3: Write your own (5 minutes)

Step 5: Each student writes three if-then rules for an imaginary robot helper. The robot lives in their house and helps with daily tasks. Rules must be specific and practical.

## Real-World Connection

Every set of traffic lights runs on conditionals. If a sensor detects cars waiting on the side road and the main road has been green for a long time, then change to green on the side road. Automatic doors use conditionals: if a person is detected within one metre, then open the door. Your email app uses conditionals: if a message comes from an unknown sender and contains certain words, then move it to the spam folder.

## Check for Understanding

1. Rewrite this as an if-then statement: "When the toast pops up, take it out of the toaster."
2. What is the difference between the condition and the action in a conditional?
3. A game character picks up a key. The game checks if the character is standing in front of a locked door. Write this as an if-then statement.

## Extension and Differentiation

**For students who need more support:** Use physical red and green cards. Read a condition aloud. Students hold up green if true and red if false. Only when they hold up green do they perform the action. This makes the logic physical and visible.

**For students who want a challenge:** Add an else part to each of your three robot rules. For example: "If the floor is wet, then put out a sign. Otherwise, put the sign away." What happens when both parts are present? Does the robot always do something now?

## Summary

- A conditional is a rule that only applies when something is true.
- An if-then statement has two parts: the condition (something that is true or false) and the action (what happens when it is true).
- You can add an else part to say what happens when the condition is false.
- Conditionals let programs behave differently in different situations, which is what makes them useful.
