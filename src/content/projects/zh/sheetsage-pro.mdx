---
title: 'SheetSage-Pro'
subtitle: '輸入一首歌，輸出可編輯的主旋律譜（旋律、和弦、段落與歌詞）'
description: '開源的採譜流程：把一首歌（本機音檔或 YouTube 連結）轉成可編輯的主旋律譜（lead sheet），包含旋律、和弦符號、小節線、段落標記，以及對齊到音符上的中文或英文歌詞，並輸出為 MusicXML、MIDI 與 JSON。'
role: '學生研究員 · 臺灣大學 Music and AI Lab'
year: 2026
status: 'active'
category: 'research'
tags: ['amt', 'lead-sheets', 'transcription', 'lyrics', 'python']
links:
  github: 'https://github.com/pingw220/sheetsage-pro'
featured: true
---

## 概述

主旋律譜（lead sheet，即旋律、和弦符號與段落結構）是樂手之間分享歌曲最常用的形式。
**SheetSage-Pro** 能直接從混音完成的整首歌曲產生主旋律譜。它在原本的
[Sheet Sage](https://github.com/chrisdonahue/sheetsage) 之上，加入依強拍切分的小節線、段落標記，
以及逐音節對齊到旋律上的演唱歌詞。

## 處理流程

SheetSage-Pro 不使用單一的大型模型，而是為每個子任務串接一個強大的預訓練模型，
再把各自的輸出合併到共同的節拍網格上：

| 階段 | 模型 |
| --- | --- |
| 音源分離 | Mel-Band RoFormer |
| 拍點與強拍偵測 | Beat This! |
| 段落結構與拍號 | All-In-One，搭配 SongPrep 標記 |
| 旋律採譜 | GAME |
| 和弦辨識 | BTC（預設）、ISMIR2019-LVCR 或 ChordMini BTC-CL |
| 歌詞轉錄 | SongPrep |
| 歌詞對齊 | Phonsa（中文）、SOFA（英文） |

每次執行會輸出結構化的 `leadsheet++.json`、MusicXML 樂譜、包含旋律、和弦與節拍器的 MIDI 檔、
所使用的歌詞，以及各階段的執行報告。批次模式讓每個模型只載入一次，並依 CSV 清單逐階段處理，
支援分片與中斷續跑；在單張 GPU 上，旋律與和弦的處理每首歌遠低於一分鐘。

## 結果

在相同音訊、相同評分方式下與 Sheet Sage 比較：

- **旋律：** GTSinger 上 50 ms 容許誤差的音符 F1 由 **0.112 → 0.295**。
- **和弦：** GuitarSet 上大小調 WCSR 由 **0.673 → 0.904**。
- **歌詞：** 在 GTSinger 上，中文每個音節的起始時間誤差中位數為 **24 ms**，英文每個單字為 **33 ms**。

詳細內容請見隨附的 ISMIR 2026 late-breaking demo 論文。
