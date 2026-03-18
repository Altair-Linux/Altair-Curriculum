---
id: "k-07"
title: "Giving Clear Directions"
grade: "K"
tags: [algorithms, directions, instructions, unplugged, sequencing]
difficulty: beginner
estimated-time: 35 minutes
prerequisites: ["Following Instructions", "Patterns Everywhere"]
type: lesson
learning_objectives:
  - "Give step-by-step directions that another person can follow without guessing."
  - "Identify when a direction is too vague and suggest how to make it more precise."
  - "Follow a simple grid-based path using forward, turn left, and turn right."
materials:
  - "A large grid drawn on the floor with tape, or a printed grid map on paper (at least 4x4 squares)"
  - "A soft toy or figure to move along the grid"
  - "Direction cards: FORWARD, TURN LEFT, TURN RIGHT (one set per pair)"
  - "Optional: blindfold for the human robot activity"
assessment:
  formative: "As students give directions on the grid, check that each instruction moves the figure exactly one step and that left and right match the figure's facing direction."
  summative: "Each student writes or draws a three-step path on a small grid, marking the start and end. They swap with a partner who follows the directions exactly."
sequence_position: 7
---

## Introduction

If you asked someone to walk to the library but you only said "go that way," they might end up anywhere. Good directions are specific. They tell you exactly how many steps to take, when to turn, and which direction to face. Writing directions for a computer is the same skill. The computer cannot guess where "that way" is. It needs exact steps. Today we are going to practise giving directions so precise that anyone (or any computer) could follow them without asking a single question.

## What We Will Learn

- How to give directions that are clear enough for someone to follow without asking questions.
- The meaning of forward, turn left, and turn right relative to which way you are facing.
- How to describe a path across a grid using step-by-step instructions.
- Why precise directions matter for programming.

## Core Explanation

When you give someone directions, you must think from their point of view, not yours. Left and right change depending on which way you are facing. If you are facing north and someone else is facing south, their left is your right.

On a grid, we can describe movement clearly with just three instructions.

**Forward** means move one square in the direction you are currently facing.
**Turn left** means rotate to face the direction that is 90 degrees to your left, but do not move yet.
**Turn right** means rotate to face the direction that is 90 degrees to your right, but do not move yet.

By combining these three instructions in different orders and quantities, you can reach any square on the grid from any starting point.

This is exactly how simple robots are programmed. Bee-Bot, Dash, and floor robots all work on these three instructions. The programmer writes a sequence, the robot follows it exactly.

Vague directions fail because the instruction-follower has to guess. "Go to the corner" could mean any corner. "Forward 3, turn right, forward 2" cannot be misunderstood.

## Activity

**Human Robot on the Grid** (25 minutes)

Materials: a 4x4 or 5x5 grid on the floor made with tape, or a large paper grid. A soft toy as the "robot."

Step 1 (5 minutes): Place the toy on a start square. Point to a destination square. Ask: "Who can get our robot there using only FORWARD, TURN LEFT, and TURN RIGHT?" Take one volunteer. Help them give one instruction at a time, moving the toy after each one.

Step 2 (3 minutes): Demonstrate a wrong path where the robot ends up in the wrong place. Ask: "What went wrong? Which instruction was incorrect?" Fix it together.

Step 3 (10 minutes): Pairs take turns. One student is the programmer (gives instructions). The other is the robot (follows instructions with the toy or, if space allows, walks the grid themselves). The programmer must write or use direction cards to record each instruction before the robot acts on it. Set up two or three new start-and-destination challenges of increasing difficulty.

Step 4 (7 minutes): Increase the challenge. The teacher places a "wall" (a book or block) on one square of the grid. The path must now go around it. Ask: "Does your original set of instructions still work? What do you need to change?"

## Real-World Connection

GPS navigation on a phone gives you precise turn-by-turn directions: "In 200 metres, turn right onto Oak Street." It does not say "turn when it feels right." The direction must be exact because the phone does not know what you can see through the windscreen.

## Check for Understanding

1. A robot is facing right on a grid. You say "Turn left." Which direction is it now facing?
2. Write a set of directions to move from the bottom-left corner to the top-right corner of a 3x3 grid.
3. Why would "go forward a bit" be a bad instruction for a computer?

## Extension and Differentiation

**For students who need more support:** Use a 3x3 grid and allow the student to physically walk the path before writing instructions. Reduce to just FORWARD and TURN RIGHT until confident.

**For students who want a challenge:** Write a set of instructions and then swap with a partner. Your partner must follow the instructions exactly on the grid and see if they end up at the destination. If they do not, work together to find the mistake.

## Summary

- Good directions are specific. They tell you exactly what to do at each step.
- On a grid, forward, turn left, and turn right are enough to reach any square.
- Left and right depend on which way you are facing.
- Computers need precise directions for the same reason: they cannot guess.
