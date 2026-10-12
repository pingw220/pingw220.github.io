---
title: 'Rubric-Based Optimization for Text-to-Music Generation'
subtitle: 'Audio-language-model rubrics as rewards for text-to-music generation'
description: 'Post-training text-to-music models (MusicGen and ACE-Step) with DPO and DiffusionNFT, using rubric scores from audio-language models as rewards, and mapping where rubric rewards help and where objective rewards work better.'
role: 'Lead author · Noah’s ARK, UW'
year: 2026
status: 'active'
category: 'research'
tags: ['generation', 'post-training', 'reinforcement-learning']
links:
  paper: 'https://arxiv.org/abs/2610.03589'
featured: true
---

## Idea

Post-training a music generator needs a reward that reflects musical quality, and no single
automatic metric does. We ask a pretrained **audio-language model (ALM)** to score each generated
clip against a structured rubric, then use those scores to optimize the generator.

## Method

- **Preference optimization:** for each text prompt, we rank the candidate clips by rubric score
  and turn the rankings into preference pairs for **DPO** on MusicGen-small (autoregressive) and
  ACE-Step v1 (diffusion).
- **Scalar rewards:** we also feed rubric scores directly into **DiffusionNFT** on ACE-Step v1.

## Findings

- On MusicCaps, rubric-based optimization improves **CLAP, SongEval, and Audiobox-Aesthetics at
  the same time**. DiffusionNFT on ACE-Step gives the largest gains.
- Optimizing any single automatic evaluator on MusicGen-small creates clear **cross-metric
  trade-offs**: the targeted metric goes up while independent ones go down.
- For **tempo, key, and instrumentation**, directly optimizing objective rewards reliably works.
  ALM rubrics transfer only partially for tempo and instrumentation, and not at all for key.

The takeaway is a practical division of labor. Rubrics suit broad perceptual qualities that are
hard to formalize; objective rewards are better whenever a reliable measurement exists.

Read the [paper on arXiv](https://arxiv.org/abs/2610.03589).
