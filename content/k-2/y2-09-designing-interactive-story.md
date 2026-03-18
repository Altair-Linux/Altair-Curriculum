---
id: "y2-09"
title: "Designing a Simple Interactive Story"
grade: "2"
tags: [design, interactive, storytelling, block-programming, conditionals, sequencing]
difficulty: beginner
estimated-time: 50 minutes
prerequisites: ["Introduction to Block Programming", "Simple Conditionals with Examples", "Variables as Boxes"]
type: lesson
learning_objectives:
  - "Plan an interactive story using a flowchart showing at least two decision points."
  - "Identify the inputs, conditionals, and outputs in a story plan."
  - "Build or describe a three-scene interactive story in block code or written pseudocode."
materials:
  - "Flowchart template per student (boxes and arrows, blank)"
  - "Pencil and coloured pens"
  - "Tablets with ScratchJr or Scratch if available"
  - "If no devices: pencil and paper for written pseudocode"
assessment:
  formative: "Review each student's flowchart before they begin building. Check that at least two decision diamonds are present and that each branch leads to a different outcome."
  summative: "Each student presents their completed story plan and explains one decision point: what the condition is, what happens in the then-branch, and what happens in the else-branch."
sequence_position: 9
---

## Introduction

A book tells you one story in one order. An interactive story lets the reader make choices, and those choices change what happens next. Every choice in an interactive story is a conditional: if the reader chooses to open the door, then one thing happens. If they choose to run away, something else happens. Designing an interactive story means thinking carefully about structure before you write a single word of content. Today you are going to plan an interactive story using a flowchart, identify every decision point, and then build or write the program that makes it run.

## What We Will Learn

- What makes a story interactive and how choices are implemented as conditionals.
- How to use a flowchart to plan a program before writing any code.
- How to identify inputs, conditionals, and outputs within a story structure.
- How to build or write a short interactive story with at least two branching points.

## Core Explanation

An interactive story is a program. Like any program, it has inputs (the reader's choices), a sequence of steps (scenes and narration), conditionals (the decision points where choices lead to different paths), and outputs (the text, images, or sounds that the reader sees or hears).

A **flowchart** is a diagram that shows the structure of a program before you write the code. It uses three shapes.

A rectangle represents a step or action: show a scene, play a sound, display text.

A diamond represents a decision: a point where the program must check a condition and take one of two paths.

An arrow shows the flow from one shape to the next.

Planning with a flowchart first means you solve the structure before you worry about words or code. When you sit down to build, you already know what needs to exist.

A minimal interactive story needs at least two scenes, two choices, and four possible outcomes. Here is an example structure.

```
Scene 1: You are standing outside a cave. 
Decision 1: Do you go in or walk away?
  Go in: Scene 2A: Inside the cave, you find a chest.
    Decision 2A: Do you open it or leave it?
      Open it: Outcome 1: Gold coins inside. You win.
      Leave it: Outcome 2: You leave empty handed.
  Walk away: Scene 2B: You find a path through the forest.
    Decision 2B: Follow the path or turn back?
      Follow: Outcome 3: You find a village. Safe.
      Turn back: Outcome 4: You return home.
```

This is a two-level binary tree. Two decisions, four outcomes. Every decision is a conditional. The input is the reader's choice.

## Activity

**Plan, Build, Present** (40 minutes)

Part 1: Flowchart planning (15 minutes)

Step 1 (5 minutes): Show the example story structure above on the board as a flowchart. Walk through each shape. Ask: "Where are the conditionals? How many outcomes does this story have? What are the inputs?"

Step 2 (10 minutes): Each student creates their own story flowchart using a blank template. They must include: a title, at least three scene rectangles, at least two decision diamonds, at least three distinct outcome rectangles, and arrows connecting everything. They do not write story content yet, just label each shape with a short description.

Teacher circulates. Check that decision diamonds have exactly two outgoing arrows, each labelled with the condition (yes or no, or the two choices).

Part 2: Building the story (20 minutes)

**Device version (ScratchJr or Scratch):**

Step 3 (20 minutes): Students build their story using their flowchart as a guide. Each scene is one set of blocks. Each decision is a conditional block. The choice input comes from tapping or clicking a button. Students focus on getting the structure right before worrying about visuals.

**Unplugged version (pseudocode):**

Step 3 (20 minutes): Students write their story in written pseudocode, using indentation to show branching. They write each scene as a "show" action, each decision as "if player chooses [option]:" and each outcome as indented text below. They annotate each section with its type: sequence, conditional, or output.

Part 3: Short presentation (5 minutes)

Step 4 (5 minutes): Three or four students present their flowchart to the class and explain one decision point: "At this point the reader chooses between X and Y. If they choose X, then this happens. If they choose Y, then this happens instead." Class checks the flowchart matches the description.

## Real-World Connection

Video games are interactive stories at a larger scale. Games like Minecraft have conditionals running constantly: if the player touches lava, then health decreases. If health reaches zero, then respawn. If night falls, then hostile creatures appear. The whole experience of the game is the result of hundreds of conditionals playing out based on the player's choices and the world's changing state.

## Check for Understanding

1. In an interactive story, what type of programming structure handles a choice between two options?
2. A student's flowchart has a decision diamond with three outgoing arrows. What is the problem with this?
3. What is the advantage of drawing a flowchart before writing the code for a program?

## Extension and Differentiation

**For students who need more support:** Provide a half-completed flowchart with the first scene and first decision already drawn. Students only need to add the two branches and two outcomes. Keep the story to one decision and two outcomes total.

**For students who want a challenge:** Add a variable to track a state across scenes. For example, a variable called "has_key" that starts as false. In one scene, the player can pick up a key, setting has_key to true. A later decision only opens if has_key is true. This is how inventory systems in games work.

## Summary

- An interactive story is a program with inputs (choices), conditionals (decision points), sequence (scenes), and outputs (text and images).
- A flowchart maps the structure of a program before any code is written, using rectangles for steps and diamonds for decisions.
- Each decision diamond in the flowchart becomes an if-then-else conditional in the program.
- Planning before building saves time and produces a cleaner result.
