# Original music and rain

**After Hours** is a new original procedural instrumental written for Ambient Homepage V1. It is a local candidate for owner listening review, not an externally sourced recording. No samples, soundfonts, music recordings, vocals, streaming URLs, paid API calls, purchases, or subscriptions were used.

The full musical score and sound synthesis are retained in [`scripts/generate-ambient-audio.mjs`](../../scripts/generate-ambient-audio.mjs). The source contains the chord voicings, original melody, rests, arrangement, timing, instruments, deterministic random seed, room reflections, mastering, encoders, and signal analysis. Electric piano is synthesized with a gently decaying FM tine and a rounded fundamental; bass uses sine harmonics; all drums use oscillator/noise synthesis.

| Asset | Role | Length |
| --- | --- | --- |
| `public/audio/ambient/after-hours.ogg` | Bundled browser music, stereo Vorbis | 2:35.676 |
| `public/audio/ambient/after-hours.flac` | Full lossless edition for owner listening | 2:35.676 |
| `public/audio/ambient/window-rain.ogg` | Separate synthesized rain, stereo Vorbis | 0:40.000 |
| `public/audio/ambient/audio-analysis.json` | Master and decoded-file measurements, sizes, SHA-256 hashes | — |

The composition is **74 BPM, 48 bars, D major**, with an eight-bar Dmaj9 / Bm9 / Gmaj9 / A13 / F#m7 / Bm9 / Em9 / A13 progression. Six phrases vary a small melodic motif and include deliberate rests. The groove uses restrained swung hats, a soft backbeat, and rounded bass. The final A13 resolves into the opening Dmaj9. There is no intro/outro fade or silent tail: notes and finite room reflections are rendered on a circular timeline so the last bar's decay already exists at the start. Browser looping uses the Vorbis file's sample-accurate duration rather than an MP3 encoder gap.

**Window Rain** is independent filtered stochastic noise with slow periodic swells and a one-second overlapping splice. It contains no music, thunder, voices, or foreground impacts. Its timbre is intentionally diffuse; owner review should decide whether its density and default volume suit the room.

## Reproduce

From the isolated worktree root:

```powershell
node scripts/generate-ambient-audio.mjs
```

Requirements: Node 22 or newer and `ffmpeg` on `PATH`, with `libvorbis` and `flac` encoders. The implementation uses only Node's built-in modules. This run used Node 24.18.0 and FFmpeg 9.0.2. No package installation or network access is necessary. Intermediate PCM WAV files are created and removed inside the audio output directory. The program regenerates both web assets, the lossless edition, and the measured JSON report. PCM composition is deterministic; Vorbis container serials or encoder-version differences may change compressed-file hashes on a later run.

## Validation and review

The generator measured the entire source signals and fully decoded all three final encoded files using FFmpeg. It records duration, sample count, sample rate, peak, RMS, clipping count, and both channel boundary steps. The music master measured approximately **−3.10 dBFS peak, −18.41 dBFS RMS, zero clipped samples**. The music loop's boundary step was below its ordinary RMS adjacent-sample change. Rain's boundary step is comparable to ordinary adjacent changes in its noise waveform, not a silent break. Exact decoded-file numbers are in `audio-analysis.json`; RMS is not perceptual LUFS.

No sound was played through the owner's PC speakers. Numerical checks establish valid, nonclipping, decodable audio and a plausible seam; they do not substitute for listening. **Owner judgment remains pending** for musical tone, repetitiveness, mix balance, rain character, and perceived loop seam. The piece is a completed procedural composition with working local files; it is not a placeholder or a claim of owner-approved musical quality.

For review, launch the preview, deliberately press **Play music**, and set a comfortable volume. Toggle rain separately to assess the two sources in isolation and together. Hear the complete first loop, especially the transition around 2:35.7. The FLAC edition can also be opened in a local audio player or downloaded from `/audio/ambient/after-hours.flac`; opening it is an intentional listening action. Reloading the homepage must leave audio stopped.
