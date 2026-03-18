---
id: "y1-09"
title: "Creating Instructions for Others"
grade: "1"
tags: [algorithms, peer-teaching, communication, unplugged, collaboration]
difficulty: beginner
estimated-time: 45 minutes
prerequisites: ["Following Instructions", "Introduction to Debugging", "Giving Clear Directions"]
type: lesson
learning_objectives:
  - "Write a set of instructions precise enough for a partner to follow without asking any questions."
  - "Test instructions by watching someone else follow them and identifying where they broke down."
  - "Revise instructions based on what was observed during testing."
materials:
  - "Paper and pencil per student"
  - "A simple physical task set up at the front: for example, a small tower of three blocks next to a cup, pen, and sheet of paper"
  - "A second identical set of materials at a separate station, hidden from the writer"
assessment:
  formative: "During the follow test, count how many times the follower had to guess or ask a question. The goal is zero."
  summative: "Each student produces a final revised set of instructions. Teacher checks that ambiguous steps from the first draft have been made specific."
sequence_position: 9
---

## Introduction

Writing instructions for yourself is one thing. Writing them for someone else is much harder. When you already know how to do something, you skip over the steps you think are obvious. But the person following your instructions does not know which steps you skipped. This problem is real in computing too. A programmer writes code that makes perfect sense to them, then another programmer reads it and has no idea what is happening. Today you are going to write instructions, watch someone else follow them, and find out where your instructions were not precise enough.

## What We Will Learn

- How to write instructions that work for someone who has never done the task before.
- Why steps that seem obvious still need to be written down.
- How to test instructions by observing someone else following them.
- How to revise instructions based on what the test reveals.

## Core Explanation

Instructions fail in three ways. First, a step is missing because the writer assumed the reader would know it. Second, a step is vague and the reader has to guess. Third, a step uses words the reader does not understand.

The solution is to write as if the reader knows nothing about the task. Every step must be specific. "Pick up the red block" is better than "pick up the block" if there are multiple blocks. "Place it on top of the blue block so the edges line up" is better than "put it on top."

The best way to test instructions is to watch someone else follow them without helping. Every time the follower pauses, guesses, or asks a question, that is a sign that an instruction failed. You note those moments and rewrite the steps that caused them.

This process has a name: it is called **user testing**. Professional software companies pay people to try their products while someone watches. Every confused expression, every wrong click, every question is information about what needs to be improved.

## Activity

**Write, Follow, Revise** (35 minutes)

Set up the task: on a table at the front, place a sheet of paper, a pencil, a cup, and three coloured blocks (red, blue, yellow). Arrange them in a specific layout. At a separate station (behind a divider or in another part of the room), set up an identical set of materials in a random arrangement.

Part 1: Writing instructions (10 minutes)

Step 1 (10 minutes): Each student studies the front arrangement for two minutes, then moves away from it and writes instructions that would tell someone else how to arrange the materials at the second station to match the front arrangement. They cannot look at the arrangement while writing.

Part 2: Following and observing (15 minutes)

Step 2 (5 minutes): Pairs swap instruction sheets. Partner A reads Partner B's instructions and attempts to arrange the second station to match the original. Partner B watches silently and takes notes. Every time Partner A hesitates, guesses, or cannot proceed, Partner B marks that step.

Step 3 (5 minutes): Swap roles. Partner B follows Partner A's instructions while Partner A observes.

Step 4 (5 minutes): Pairs compare the result at the second station with the original arrangement. They count how many items are in the wrong position.

Part 3: Revising (10 minutes)

Step 5 (5 minutes): Each student rewrites the steps their partner struggled with. They use the notes from the observation to identify exactly which words were unclear or which steps were missing.

Step 6 (5 minutes): Optionally, try the revised instructions with a different partner who has not seen them before. Did the revision improve the result?

## Real-World Connection

NASA writes procedures for astronauts that must be followed in exact order, in high-pressure situations, sometimes in a spacesuit with limited vision and motion. Every word in those procedures has been tested many times. Nothing is left to assumption. The stakes are too high for vague instructions. While your stakes are lower, the same principle applies: instructions must work for the reader, not just the writer.

## Check for Understanding

1. You wrote "put the cup near the paper." Your partner placed the cup on top of the paper. What went wrong with your instruction?
2. Name two ways to make a vague instruction more precise.
3. Why is it useful to watch someone follow your instructions rather than just reading them yourself?

## Extension and Differentiation

**For students who need more support:** Reduce the task to arranging two objects only. Work with the student to write one instruction together, then compare it to what the follower actually does. Focus on the gap between what was written and what was understood.

**For students who want a challenge:** Write instructions for a more complex arrangement with five objects. Add a rule that one specific object must always be placed last. Your partner must follow the instructions without any verbal guidance and recreate the arrangement exactly.

## Summary

- Instructions must be written for the reader, not the writer. Do not assume anything is obvious.
- Vague steps cause guessing. Specific steps leave nothing to chance.
- Testing instructions means watching someone else follow them without helping, and noting every point of confusion.
- Revising based on what was observed makes the next version more reliable.
