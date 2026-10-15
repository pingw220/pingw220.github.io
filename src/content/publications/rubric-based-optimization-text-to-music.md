---
title: 'Rubric-Based Optimization for Text-to-Music Generation'
authors: ['Ping Wang', 'Guang Yang', 'Shao-Rong Su', 'Junkai Wu', 'Pang Wei Koh', 'Noah A. Smith']
venue: 'arXiv preprint arXiv:2610.03589'
year: 2026
status: 'preprint'
abstract: 'Post-training text-to-music generation requires reward signals that capture multiple aspects of musical quality beyond what any single automatic metric can measure. We study structured, rubric-based rewards from pretrained audio-language models (ALMs) as training signals for both autoregressive and diffusion-based music generators. An ALM scores each generated clip against the rubric; we rank candidates generated for the same text prompt by their scores and convert these rankings into preference pairs for DPO on both MusicGen-small and ACE-Step v1, and additionally use the rubric scores directly as scalar rewards for DiffusionNFT on ACE-Step v1. On MusicCaps, rubric-based optimization improves CLAP, SongEval, and Audiobox-Aesthetics simultaneously, with the strongest gains obtained by DiffusionNFT on ACE-Step. By contrast, on MusicGen-small, building preferences from any one of these automatic evaluators produces clear cross-metric trade-offs: the targeted evaluator improves while other independent evaluators deteriorate. We further study tempo, key, and instrumentation, where precise objective rewards are available. Directly optimizing these specialized rewards reliably improves the target attributes, whereas ALM rubrics provide only partial transfer for tempo and instrumentation and no measurable improvement for key. Together, these results suggest a practical division of labor: ALM rubrics are effective for broad perceptual qualities that are difficult to formalize, while specialized objective rewards remain preferable when reliable measurements are available.'
tags: ['generation', 'post-training', 'reinforcement-learning', 'evaluation']
links:
  paper: 'https://arxiv.org/abs/2610.03589'
  code: 'https://github.com/pingw220/Rubric-Based-Optimization-for-Text-to-Music-Generation'
  project: '/projects/music-rl'
bibtex: |
  @article{wang2026rubric,
    title   = {Rubric-Based Optimization for Text-to-Music Generation},
    author  = {Wang, Ping and Yang, Guang and Su, Shao-Rong and Wu, Junkai and Koh, Pang Wei and Smith, Noah A.},
    journal = {arXiv preprint arXiv:2610.03589},
    year    = {2026},
  }
featured: true
---
