---
title: 'A Dual Evaluation for Music Transcription'
authors: ['Ping Wang', 'Guang Yang', 'Nazif Can Tamer', 'Victoria Ebert', 'Noah A. Smith']
venue: 'arXiv preprint arXiv:2608.04511'
year: 2026
status: 'preprint'
abstract: 'Automatic music transcription systems produce sheet music that can be read and played back. We argue that these two targets call for complementary evaluations of notation similarity to a reference score and playback similarity to the original performance, respectively. Our study considers notation similarity metrics from the optical music recognition literature and a wide range of playback-similarity methods validated through a listening study across over 100 participants and 230 piano recordings covering 23 works, 30 performers, and six composers. We find, fortuitously, that the playback similarity metric that correlates best with human judgments, CLEWS, is also the cheapest to run. We also find that the two evaluation dimensions favor different systems among a collection of 24 pipelines formed by pairing eight audio-to-MIDI models with three MIDI-to-score converters, with the latter component systematically determining the favored objective. The complementarity between metrics also holds when adding to the pool Rubato, a new end-to-end system that offers substantially improved notation similarity while remaining competitive, though not the best, on playback similarity.'
tags: ['amt', 'evaluation', 'mir']
links:
  paper: 'https://arxiv.org/abs/2608.04511'
  code: 'https://github.com/pingw220/AMT-Dual-Eval'
  project: '/projects/amt-dual-eval'
bibtex: |
  @article{wang2026dual,
    title   = {A Dual Evaluation for Music Transcription},
    author  = {Wang, Ping and Yang, Guang and Tamer, Nazif Can and Ebert, Victoria and Smith, Noah A.},
    journal = {arXiv preprint arXiv:2608.04511},
    year    = {2026},
  }
featured: true
---
