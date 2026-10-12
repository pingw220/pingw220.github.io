---
title: 'SheetSage-Pro'
subtitle: 'Song in, editable lead sheet out (melody, chords, structure, and lyrics)'
description: 'An open-source pipeline that turns a song (a local audio file or a YouTube link) into an editable lead sheet: melody, chord symbols, bar lines, section labels, and Mandarin or English lyrics aligned to the notes, exported as MusicXML, MIDI, and JSON.'
role: 'Student Researcher · Music and AI Lab, NTU'
year: 2026
status: 'active'
category: 'research'
tags: ['amt', 'lead-sheets', 'transcription', 'lyrics', 'python']
links:
  github: 'https://github.com/pingw220/sheetsage-pro'
featured: true
---

## Overview

Lead sheets (melody, chord symbols, and structure) are how working musicians share songs.
**SheetSage-Pro** builds one directly from a full-mix recording. It goes beyond the original
[Sheet Sage](https://github.com/chrisdonahue/sheetsage): it adds downbeat-aware bar lines,
section labels, and sung lyrics aligned syllable by syllable to the melody.

## Pipeline

Instead of one monolithic model, SheetSage-Pro chains a strong pretrained model for each
sub-task and merges their outputs onto a shared metrical grid:

| Stage | Model |
| --- | --- |
| Source separation | Mel-Band RoFormer |
| Beat & downbeat tracking | Beat This! |
| Structure & meter | All-In-One, with SongPrep labels |
| Melody transcription | GAME |
| Chord recognition | BTC (default), ISMIR2019-LVCR, or ChordMini BTC-CL |
| Lyric transcription | SongPrep |
| Lyric alignment | Phonsa (Mandarin), SOFA (English) |

Each run writes a structured `leadsheet++.json`, a MusicXML score, a MIDI file with melody,
chords, and a click track, the lyrics used, and a per-stage run report. A batch runner loads each
model once and processes a CSV manifest stage by stage. It supports sharding and resuming, and
the melody-and-chords path takes well under a minute per song on one GPU.

## Results

Compared with Sheet Sage on the same audio, scored the same way:

- **Melody:** note F1 at 50 ms on GTSinger rises from **0.112 → 0.295**.
- **Chords:** major/minor WCSR on GuitarSet rises from **0.673 → 0.904**.
- **Lyrics:** median onset error of **24 ms** per Mandarin syllable and **33 ms** per English word on GTSinger.

Details are in the accompanying ISMIR 2026 late-breaking demo paper.
