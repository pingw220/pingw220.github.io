---
title: 'SheetSage-Pro: Bilingual Lyric-Aligned Lead-Sheet Transcription from Music Audio'
authors: ['Ping Wang', 'Fang-Duo Tsai', 'Wei-Jaw Lee', 'Yi-Hsuan Yang']
venue: 'ISMIR 2026 Late-Breaking/Demo'
year: 2026
status: 'accepted'
abstract: 'A lead sheet is a compact, editable symbolic summary of a song. Sheet Sage showed that melody and chord symbols can be transcribed automatically from music audio, but it does not transcribe or align lyrics, and it predates several of the specialised MIR models now available. We present SheetSage-Pro, a modular audio-to-lead-sheet system that integrates recent pretrained models for separation, beat and downbeat tracking, structure analysis, melody, chords and lyric alignment, and exports a lyric-aligned lead sheet with bilingual Mandarin and English support. On public component benchmarks, scored with the same code for Sheet Sage and SheetSage-Pro, the new system improves pooled note F1@50 ms on GTSinger from 0.080 to 0.295 and maj/min chord WCSR on GuitarSet from 0.621 to 0.904, and completes every item. On MIR-ST500 its melody component reaches 0.670, comparable to dedicated singing transcribers trained on that dataset. Users can transcribe a song and inspect its melody, chords, bars, sections and lyrics aligned to the notes.'
tags: ['amt', 'lead-sheets', 'lyrics', 'mir']
links:
  paper: 'https://ismir2026program.ismir.net/lbd_621.html'
  code: 'https://github.com/pingw220/sheetsage-pro'
  demo: 'https://www.youtube.com/watch?v=_hfVEY70KRo'
  project: '/projects/sheetsage-pro'
bibtex: |
  @inproceedings{wang2026sheetsagepro,
    title     = {SheetSage-Pro: Bilingual Lyric-Aligned Lead-Sheet Transcription from Music Audio},
    author    = {Wang, Ping and Tsai, Fang-Duo and Lee, Wei-Jaw and Yang, Yi-Hsuan},
    booktitle = {Late-Breaking/Demo Session of the 27th International Society for Music Information Retrieval Conference (ISMIR)},
    year      = {2026},
  }
featured: true
---
