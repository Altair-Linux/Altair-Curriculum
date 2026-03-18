---
id: "y2-11"
title: "Collaborative Projects and Versioning"
grade: "2"
tags: [collaboration, versioning, teamwork, project-management]
difficulty: beginner
estimated-time: 50 minutes
prerequisites: ["Creating Instructions for Others", "Debugging Strategies", "Algorithms for Everyday Tasks"]
type: lesson
learning_objectives:
  - "Divide a project into parts so that two people can work on it at the same time without creating conflicts."
  - "Explain what versioning is and why saving named versions of a project matters."
  - "Contribute to a shared project, review a partner's work, and merge both parts without losing either."
materials:
  - "A shared drawing or writing project per pair: a large sheet of paper divided into sections, or a shared document on screen"
  - "Pencil and pen (different colours per partner)"
  - "Sticky notes for version labels"
  - "Optional: a shared digital document tool if devices are available"
assessment:
  formative: "After the merge step, check that both partners' contributions are present and that the combined result is coherent. Ask each student to explain one decision they made about how to divide the work."
  summative: "Each pair submits a completed project with a version log showing at least three versions. Each student writes two sentences about what they contributed and one sentence about what they changed after reviewing their partner's work."
sequence_position: 11
---

## Introduction

Almost no program in the world is written by one person working alone. Teams of programmers work on the same project at the same time. This creates a challenge: if two people change the same thing at the same moment, one person's work can overwrite the other's. The solution is a system called **version control**. It keeps a record of every change, who made it, and when, so that work can be combined without anything being lost. Today you are going to experience a simplified version of this by working on a shared project with a partner, saving versions as you go, and merging both contributions at the end.

## What We Will Learn

- How to divide a project so that two people can work in parallel without conflicts.
- What a version is and why recording versions protects your work.
- How to merge two people's contributions and resolve any differences.
- Why communication matters as much as technical skill in a collaborative project.

## Core Explanation

**Dividing work**

Before two people can work in parallel, they must agree on who is responsible for what. If both work on the same section, they may end up with two different versions of the same thing and no clear way to combine them. Dividing by section, by type of task, or by alternating steps avoids this.

In programming, teams divide work by giving each person a different part of the program. One person writes the input handling. Another writes the output display. A third writes the processing logic. As long as they agree on how the parts connect, each person can work independently.

**Versioning**

A version is a saved snapshot of a project at a specific point in time. When you save a version, you give it a name or number so you can find it again. If a later change turns out to be wrong, you can go back to the earlier version.

Version control systems used by real programmers, such as Git, track every change automatically. For this lesson, you will create versions manually by labelling your saved states.

**Merging**

Merging means combining two people's contributions into one complete version. If the work was divided clearly, merging is straightforward. If there are conflicts, such as both people having changed the same section differently, the team must decide which version to keep or how to combine both.

## Activity

**Collaborative Story Map** (40 minutes)

The shared project is a story map: a poster-style layout with four sections. The four sections are: the setting (where and when the story takes place), the main character (who, what they want), the problem (what goes wrong), and the resolution (how it is solved). The story can be anything the pair chooses.

Step 1 (5 minutes): Partners divide the four sections between them. Partner A takes setting and problem. Partner B takes character and resolution. They write their names in their sections before starting.

Step 2 (3 minutes): Each partner independently writes their section label and starting notes in pencil. This is Version 1. They write "V1" and the date in the corner of each section.

Step 3 (12 minutes): Each partner fills in their two sections in pen. They work simultaneously, without looking at their partner's sections. When finished, they fold over or cover their completed sections so the partner cannot copy.

Step 4 (3 minutes): Both partners save Version 2 by writing "V2" in their section corner. This is the completed individual contribution.

Step 5 (10 minutes): Partners swap and read each other's sections for the first time. They check: does the character fit the setting? Does the resolution connect to the problem? Each partner writes one suggested change to their partner's sections on a sticky note (not directly on the paper). Changes must be suggestions, not corrections.

Step 6 (5 minutes): Partners discuss the suggestions. Each partner decides which suggested changes to accept and makes those changes in a third colour. They label these sections "V3."

Step 7 (2 minutes): Both partners look at the complete merged story map and confirm it is coherent. They write one sentence each: "My contribution was... " and "After review, I changed..."

## Real-World Connection

The code for the Linux operating system, which runs most of the world's servers and Android phones, is maintained by thousands of contributors working simultaneously in dozens of countries. They use a version control system called Git that records every single change, who made it, and why. Without versioning, those thousands of contributions would create chaos. With it, the team can work in parallel and merge reliably.

## Check for Understanding

1. Two students both edit the same paragraph of a shared document at the same time. Neither saves a version first. What is the risk?
2. What information should a version label include to be useful?
3. You make a big change to a project and it turns out to be worse than before. You have saved three versions. What do you do?

## Extension and Differentiation

**For students who need more support:** Reduce to two sections only, one per partner. Walk through Steps 1 to 5 together as a class before pairs continue independently. Provide sentence starters for the review sticky note: "I noticed that..." and "You might consider..."

**For students who want a challenge:** After merging, write a change log: a numbered list of every change made from V1 to V3, who made each change, and why. This mirrors the commit messages used in professional version control systems.

## Summary

- Dividing work clearly before starting prevents two people from overwriting each other's contributions.
- A version is a saved snapshot of a project. Labelling versions lets you return to an earlier state if a later change goes wrong.
- Merging combines two people's work into one complete result. Clear division makes merging straightforward.
- Collaboration requires communication. Agreeing on structure before starting and reviewing each other's work after produces better results than working in isolation.
