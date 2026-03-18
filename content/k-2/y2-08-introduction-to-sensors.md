---
id: "y2-08"
title: "Introduction to Sensors"
grade: "2"
tags: [sensors, inputs, real-world, hardware, conditionals]
difficulty: beginner
estimated-time: 40 minutes
prerequisites: ["Using Inputs", "Simple Conditionals with Examples"]
type: lesson
learning_objectives:
  - "Explain what a sensor is and how it differs from a manual input device."
  - "Name at least four sensors found in everyday devices and describe what each one detects."
  - "Describe how a sensor provides input to a conditional statement in a real system."
materials:
  - "A smartphone or tablet to demonstrate sensor-based features (screen rotation, camera, brightness adjustment)"
  - "Printed sensor matching cards: sensor name on one card, what it detects on another"
  - "Pencil and paper"
assessment:
  formative: "During the card match, ask each student to explain, in one sentence, how the sensor they matched is connected to a conditional in the device that uses it."
  summative: "Each student describes one real device that uses a sensor, names the sensor, says what it detects, and writes the if-then conditional that the device uses to act on that data."
sequence_position: 8
---

## Introduction

Most input devices you have studied, such as keyboards and mice, wait for a person to do something. Sensors are different. A sensor continuously monitors something in the physical world and sends data to a computer automatically, without anyone pressing a button. Your phone knows which way up it is held because it has a sensor that detects orientation. A car knows it is raining because a sensor on the windscreen detects water droplets. A smoke alarm responds to smoke particles in the air. Sensors give computers awareness of the real world. Today you are going to learn what sensors detect, where they are found, and how they connect to the conditionals that make devices respond to the world around them.

## What We Will Learn

- What a sensor is and how it differs from a keyboard or mouse.
- At least four types of sensor and what each one detects.
- How sensor data connects to a conditional to trigger an action.
- Where sensors are found in everyday devices students already use.

## Core Explanation

A **sensor** is an input device that monitors the physical world and sends data continuously or on a trigger, without a person having to take an action. The computer then uses that data in its program.

Here are six sensors found in everyday devices.

A **light sensor** detects the brightness of the environment. Phones and tablets use it to automatically adjust screen brightness when you move from a dark room to sunlight.

A **motion sensor** detects movement. Security lights turn on when someone walks past. Game consoles detect how you are moving the controller.

A **temperature sensor** detects heat. A smart thermostat reads the room temperature and decides whether to turn the heating on or off.

A **sound sensor** (microphone used as a sensor) detects whether sound is present and how loud it is. Some devices use it to wake from sleep when they detect your voice.

A **proximity sensor** detects how close an object is. The screen on a phone turns off automatically when you hold it to your ear, because the proximity sensor detects your face.

A **touch sensor** detects contact. Touchscreens use this. Some doorbells detect a hand approaching before the button is pressed.

Each of these sensors feeds data into a conditional. The conditional checks the sensor reading and decides what to do.

Example: the light sensor in a phone feeds a value to this conditional.

```
if brightness_reading < 50:
  increase screen brightness
else:
  decrease screen brightness
```

The sensor provides the input. The conditional uses it to make a decision. The screen adjustment is the output.

## Activity

**Sensor Card Match and Conditional Writing** (30 minutes)

Part 1: Card matching (10 minutes)

Step 1 (3 minutes): Give each pair a set of sensor cards (one card per sensor name: light sensor, motion sensor, temperature sensor, sound sensor, proximity sensor, touch sensor) and a set of "what it detects" cards. Pairs match each sensor to its detection.

Step 2 (4 minutes): Check answers together. For any disputed matches, explain why. Ask: "Which two sensors are most similar? How are they different?" (Sound sensor and microphone: a sound sensor detects presence or level of sound; a microphone also records the content of the sound.)

Step 3 (3 minutes): Ask: "Which of these sensors does a smartphone have?" Most modern smartphones have all six. Show one or two by demonstrating on a real device if available: rotate the phone to show orientation (motion sensor), cover the front camera to show screen dim (proximity sensor), or move to a bright area to show brightness adjust (light sensor).

Part 2: Conditional writing from sensor data (15 minutes)

Step 4 (5 minutes): Together, write a conditional for the temperature sensor in a smart thermostat.

```
temperature = read temperature sensor
if temperature < 18:
  turn heating on
else:
  turn heating off
```

Ask: "What is the input here?" (The sensor reading.) "What is the output?" (Heating turns on or off.) "What would happen if there was no sensor? Would this conditional still work?" (No. It needs real data to check.)

Step 5 (10 minutes): Each student chooses one of the remaining sensors and writes the if-then-else conditional that a device using that sensor would need. They name the device, the sensor, what it detects, and the conditional.

Bring two or three examples to the board. Check that the condition uses the sensor reading as the variable.

Part 3: Class discussion (5 minutes)

Step 6 (5 minutes): Ask: "What makes sensors better than manual inputs for some tasks?" Guide toward: sensors work without a person being there (automatic), they respond faster than a human could (a smoke alarm would be useless if you had to press a button), they work continuously so nothing is missed.

## Real-World Connection

Modern cars have dozens of sensors feeding data to the car's computer systems. A tyre pressure sensor monitors each tyre and triggers a warning light if pressure drops below a safe level. A parking sensor detects how close the car is to an obstacle and beeps faster as the car gets closer. Without sensors, drivers would have to check tyre pressure manually every day and reverse very slowly with no guidance.

## Check for Understanding

1. A phone screen turns off when you hold it to your ear. Name the sensor responsible and write the conditional the phone uses.
2. What is the difference between a keyboard and a sensor in terms of how each provides input?
3. Name one situation where a sensor is more useful than a manual input, and explain why.

## Extension and Differentiation

**For students who need more support:** Focus on two sensors: the light sensor and the temperature sensor. For each one, draw a picture of the device, label the sensor, and write a two-line conditional: "if [reading] then [action]."

**For students who want a challenge:** Design a fictional smart home system that uses at least three different sensors. For each sensor, write the conditional that the system uses. Describe what happens in the home when each sensor is triggered.

## Summary

- A sensor is an input device that detects something in the physical world and sends data to a computer automatically.
- Common sensors include light, motion, temperature, sound, proximity, and touch sensors.
- Sensor data feeds into conditionals that trigger automatic actions, such as turning on a light or adjusting screen brightness.
- Sensors make computers aware of the real world without needing a person to provide input manually.
