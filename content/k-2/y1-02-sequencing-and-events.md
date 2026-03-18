---
id: "y1-02"
title: "Sequencing and Events"
grade: "1"
tags: [sequencing, events, algorithms, unplugged]
difficulty: beginner
estimated-time: 40 minutes
prerequisites: ["Following Instructions", "Data and Representation"]
type: lesson
learning_objectives:
  - "Arrange steps in the correct order to complete a task."
  - "Explain what an event is and give two real examples."
  - "Describe what happens when steps are in the wrong order."
materials:
  - "Sequencing cards: one set of six to eight printed or drawn steps per pair (see activity)"
  - "Whiteboard or large paper"
  - "Pencil and paper for students"
assessment:
  formative: "After the card sort, ask each pair to explain why one specific step must come before another."
  summative: "Each student draws a four-step sequence for a task they choose. Steps must be in logical order. They mark one step and explain what would go wrong if that step was removed."
sequence_position: 2
---

## Introduction

A computer program is a sequence. The computer starts at the top and works through each instruction, one at a time, in order. The order is not optional. If the steps are wrong, the result is wrong. In real life, sequences are everywhere too. You put on socks before shoes, not after. You read a chapter before you can talk about what happened in it. You boil water before you make tea. Today we are going to look closely at sequences and at the events that trigger them.

## What We Will Learn

- What a sequence is and why order matters.
- What an event is, and the difference between an event and an action.
- How to arrange a set of steps into the correct order.
- What goes wrong when a step is missing or misplaced.

## Core Explanation

A **sequence** is a set of steps in a specific order. Each step must be completed before the next one begins. The order is part of what makes the sequence work.

An **event** is something that happens to trigger the next step. An alarm rings (event) and you wake up (action). You press a button on a vending machine (event) and the machine starts its sequence (action). In computing, events are important because many programs wait for something to happen before they do anything. A game waits for you to press a key. A doorbell waits for someone to press the button.

The difference between an event and an action is this: an event is a trigger, something that happens from the outside. An action is what the program does in response. You press a key (event). The character on screen jumps (action).

When a step in a sequence is in the wrong place, the whole task can fail. You cannot dry your hands before you wash them. You cannot pour the cereal before you open the box. You cannot log in to a website before you have created an account. Sequence errors are one of the most common types of mistake in computer programs.

## Activity

**Recipe Scramble and Event Spotting** (30 minutes)

Part 1: Sequence card sort (20 minutes)

Give each pair a set of scrambled cards for making a jam sandwich. Cards include:

- Pick up a knife
- Get two slices of bread
- Open the jam jar
- Spread jam on one slice of bread
- Press the two slices together
- Put the knife in the sink
- Put the jam jar away
- Eat the sandwich

Step 1 (3 minutes): Pairs arrange the cards in the order they think is correct. Tell them there may be more than one valid answer for some steps, but no step can logically come before a step it depends on.

Step 2 (5 minutes): Each pair reads their sequence aloud. Where groups disagree, discuss. Ask: "Can you put jam on bread before you have the bread? No. That step depends on having the bread first."

Step 3 (5 minutes): Introduce the idea of a "dependency." One step depends on another when it cannot happen unless the earlier step is done. Ask students to find one dependency in their sequence.

Step 4 (7 minutes): Now deliberately scramble one card out of place on the board, such as "Eat the sandwich" placed second. Ask: "What goes wrong here? Is this funny or would it actually cause a problem?"

Part 2: Event spotting (10 minutes)

Step 5 (3 minutes): Explain the difference between an event and an action. "An event is what triggers something. An action is what happens next."

Step 6 (7 minutes): Read out five simple scenarios. Students write or say the event and the action for each.

- The school bell rings. Students pack up their bags. (Event: bell rings. Action: pack up bags.)
- It starts raining. You open your umbrella. (Event: rain starts. Action: open umbrella.)
- Your phone buzzes. You look at the screen. (Event: phone buzzes. Action: look at screen.)
- The traffic light turns green. Cars move forward. (Event: light turns green. Action: cars move.)
- You press the power button. The tablet screen turns on. (Event: button pressed. Action: screen turns on.)

## Real-World Connection

Every button on every app you use is an event trigger. When the app is waiting, it is watching for events. When you tap, swipe, or type, you create an event. The app reads the event and runs a sequence of actions in response. Without events, programs would have to run continuously without stopping, which would waste power and make devices impossible to use.

## Check for Understanding

1. Write a four-step sequence for washing hands. Find one step that depends on a previous step and name the dependency.
2. A game shows a character on screen. Nothing happens until you press a key. What is the event? What is the action?
3. What would happen if a computer program ran all its steps at once instead of in order?

## Extension and Differentiation

**For students who need more support:** Use a three-step sequence. Have the student physically act out each step before writing or drawing it. Focus on one dependency only.

**For students who want a challenge:** Write a sequence with a branching step. For example: "If the bread is stale, get new bread. If the bread is fresh, continue." How does this change the sequence? This is an introduction to conditional logic, which appears in later lessons.

## Summary

- A sequence is a set of steps in a specific order. Order matters because some steps depend on earlier ones.
- An event is something that triggers an action. Pressing a button is an event. The screen turning on is the action.
- When steps are in the wrong order, the task fails or produces the wrong result.
- Computer programs are sequences of instructions waiting for events to trigger them.
