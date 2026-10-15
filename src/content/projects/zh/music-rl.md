---
title: 'Rubric-Based Optimization for Text-to-Music Generation'
subtitle: '以音訊語言模型的評分標準作為文字生成音樂的獎勵'
description: '以 DPO 與 DiffusionNFT 對文字生成音樂模型（MusicGen 與 ACE-Step）進行後訓練，使用音訊語言模型依評分標準（rubric）給出的分數作為獎勵，並分析評分標準獎勵與客觀獎勵各自適用的情境。'
role: '第一作者 · 華盛頓大學 Noah’s ARK'
year: 2026
status: 'active'
category: 'research'
tags: ['generation', 'post-training', 'reinforcement-learning']
links:
  github: 'https://github.com/pingw220/Rubric-Based-Optimization-for-Text-to-Music-Generation'
  paper: 'https://arxiv.org/abs/2610.03589'
featured: true
---

## 想法

對音樂生成模型進行後訓練，需要能反映音樂品質的獎勵訊號，但沒有任何單一自動指標做得到。
我們請預訓練的**音訊語言模型（audio-language model, ALM）**依照結構化的評分標準為每段生成的音樂打分，
再用這些分數來最佳化生成模型。

## 方法

- **偏好最佳化：** 對每個文字提示，依評分標準的分數排序候選音樂片段，轉成偏好配對，
  在 MusicGen-small（自迴歸）與 ACE-Step v1（擴散模型）上進行 **DPO**。
- **純量獎勵：** 也直接把評分標準的分數作為 ACE-Step v1 上 **DiffusionNFT** 的獎勵。

## 發現

- 在 MusicCaps 上，以評分標準最佳化能**同時提升 CLAP、SongEval 與 Audiobox-Aesthetics**，
  其中 ACE-Step 搭配 DiffusionNFT 的提升最大。
- 在 MusicGen-small 上，針對任何單一自動評估指標最佳化，都會產生明顯的**指標間取捨**：
  目標指標上升，其他獨立指標卻下降。
- 對於**速度、調性與樂器編制**，直接最佳化客觀獎勵穩定有效；ALM 評分標準對速度與樂器編制只有部分效果，
  對調性則沒有可量測的提升。

結論是一種實務上的分工：評分標準適合難以形式化的整體感知品質；只要有可靠的量測方式，客觀獎勵仍是較好的選擇。

閱讀 [arXiv 上的論文](https://arxiv.org/abs/2610.03589)。
