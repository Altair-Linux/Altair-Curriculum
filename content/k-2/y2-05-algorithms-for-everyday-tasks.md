---
id: "y2-05"
title: "Algorithms for Everyday Tasks"
grade: "2"
tags: [algorithms, decomposition, problem-solving, real-world]
difficulty: beginner
estimated-time: 45 minutes
prerequisites: ["Review: Sequences, Inputs, and Outputs", "Simple Conditionals with Examples", "More on Loops"]
type: lesson
learning_objectives:
  - "Decompose a complex everyday task into a precise algorithm using sequence, loops, and conditionals."
  - "Identify which control structure is most appropriate for each part of a task."
  - "Evaluate an algorithm written by a peer and suggest one specific improvement."
materials:
  - "Whiteboard"
  - "Pencil and paper per student"
  - "Printed algorithm template with three sections: sequence, loop, conditional"
assessment:
  formative: "During peer review, each student must name the specific line or step they would improve and say why."
  summative: "Each student writes a complete algorithm for a task of their choice that uses at least one sequence, one loop, and one conditional. Teacher checks that the structures are used correctly and for the right reasons."
sequence_position: 5
---

## Introduction

You now have three tools for writing algorithms: sequences, loops, and conditionals. A real task usually needs all three. Making breakfast uses a sequence to set up, a loop to stir the porridge, and a conditional to check if the toast has popped. Tidying a room uses a sequence to start, a loop to go through each item on the floor, and a conditional to decide where each item belongs. Today you are going to write a complete algorithm for a real task using all three tools, and then review a partner's algorithm to see if it is accurate and complete.

## What We Will Learn

- How to break a complex task into parts that need sequence, loop, or conditional logic.
- How to choose the right control structure for each part of a task.
- How to write a complete, readable algorithm that someone else could follow.
- How to review an algorithm and identify where it could be improved.

## Core Explanation

When you approach a task you want to turn into an algorithm, start by breaking it into parts. Ask three questions about each part.

Does this part happen once in a fixed order? If so, it is a **sequence**.

Does this part happen repeatedly, either a fixed number of times or until something changes? If so, it is a **loop**.

Does this part depend on a condition, where different situations lead to different actions? If so, it is a **conditional**.

Most real tasks use all three. Consider packing a school bag.

```
sequence:
  get your bag
  open the bag

loop for each subject on your timetable:
  if the book for that subject is not already in the bag:
    put the book in the bag

sequence:
  zip the bag closed
  put it by the door
```

The outer structure is a sequence. Inside, there is a loop over each subject. Inside the loop, there is a conditional checking whether the book is already packed. All three structures work together.

Good algorithms are precise enough that someone who does not know the task could follow them without asking questions. Vague steps are not acceptable at this level.

## Activity

**Algorithm Writing and Peer Review** (35 minutes)

Part 1: Guided algorithm construction (15 minutes)

Step 1 (5 minutes): Together, write an algorithm for making a bowl of cereal. On the board, go through the task step by step. As each step is written, ask: "Is this a sequence, a loop, or a conditional?"

Likely result:

```
get a bowl
get cereal from the cupboard
get milk from the fridge

if the milk carton is full:
  open the carton
else:
  use the already-open carton

pour cereal into the bowl

repeat until milk level looks right:
  pour a little milk

put the cereal and milk away
pick up a spoon
eat
```

Step 2 (5 minutes): Ask: "Is anything missing? Is any step vague?" Students suggest improvements. For example: "get a bowl" is fine. "Eat" is too vague: how long? Add: "eat until the bowl is empty."

Step 3 (5 minutes): Review the algorithm together for the three structures. Count: how many pure sequence steps? Where is the conditional? Where is the loop? Confirm that all three appear.

Part 2: Independent writing (15 minutes)

Step 4 (15 minutes): Each student chooses a task from this list and writes a complete algorithm. The algorithm must use at least one sequence section, one loop, and one conditional.

Task options: tidying a bedroom, brushing teeth, getting dressed for school, watering plants, feeding a pet.

They use the printed template with three labelled sections to organise their thinking before writing the final algorithm.

Part 3: Peer review (5 minutes)

Step 5 (5 minutes): Students swap algorithms with a partner. Each reviewer must find and write down: one step that is too vague (and suggest a more precise version), and one place where a different structure might fit better (and explain why).

## Real-World Connection

Navigation apps like Google Maps use algorithms exactly like the ones you wrote today. The overall journey is a sequence of steps. Every junction or roundabout involves a conditional: "if the exit is the third one, take it, otherwise continue." Toll roads might use a loop: "at each toll booth, pay the fee." One journey, three structures working together.

## Check for Understanding

1. You are writing an algorithm for watering five plants. Which part needs a loop?
2. You need to check if each plant is dry before watering it. Which structure handles this?
3. A peer's algorithm says "tidy the room." Why is this step too vague, and what would you replace it with?

## Extension and Differentiation

**For students who need more support:** Provide a partially written algorithm with gaps labelled "sequence step here," "loop here," or "conditional here." Students fill in only the labelled gaps rather than writing from scratch.

**For students who want a challenge:** Write an algorithm for a task that requires a nested structure: a loop that contains a conditional, or a conditional that contains a loop. Describe clearly why the nesting is needed rather than having the two structures run one after the other.

## Summary

- Complex tasks can be decomposed into parts that need sequences, loops, or conditionals.
- Choosing the right structure for each part makes the algorithm clearer and more reliable.
- A complete algorithm is precise enough that someone unfamiliar with the task could follow it without asking questions.
- Reviewing another person's algorithm develops the skill of reading programs critically, which is essential for debugging.
