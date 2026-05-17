# myMusicApp

## Overview
myMusicApp is a comprehensive, interactive web-based music theory and performance hub. It is designed to help musicians, composers, and music theory enthusiasts explore standard Western tuning (12-EDO), microtonal systems (24-EDO), various string instrument tunings, and complex scales or modes directly from their web browser.

## Why This Project Exists
Music theory can often feel abstract when studied purely on paper, and exploring microtonality (like quarter tones) usually requires specialized software or hardware. myMusicApp was created to bridge this gap by providing an accessible, visual, and immediately playable environment. It centralizes scale generation, chord voicing visualization, and real-time audio synthesis into a single suite of tools, making complex musical concepts easier to understand and hear.

## Features and Possibilities

*   **Interactive Music Theory Engine:** Automatically generates and standardizes notes, scales, modes, and chords based on the root note. It handles enharmonics, generates Roman numeral chord charts, and structures complex musical math on the fly.
*   **Microtonal Support (24-EDO):** A dedicated section for 24 Equal Divisions of the Octave (quarter tones). Users can explore specialized scales, view quarter-tone intervals, and play them on a custom-built interface.
*   **Built-in Audio Synthesizer:** Features a custom Web Audio API synthesizer with dynamic gain staging, limiting, lowpass filtering, and ADSR envelopes. It supports polyphony (up to 12 voices) and provides smooth, click-free note playback.
*   **Custom UI Components:**
    *   *Interactive Keyboards:* Playable on-screen keyboards supporting both standard piano layouts and isomorphic (Wicki-Hayden/Exquis) layouts, dynamically adjusting to display 12-EDO or 24-EDO keys.
    *   *Fretboard & Shell Voicings:* Visualizes chords and scales on stringed instruments. It allows for custom tuning setups, variable string counts, and rendering specific shell voicings.
*   **Hardware and Keyboard Integration:** Play notes using your computer keyboard (supporting both AZERTY and QWERTY layouts) or connect a USB/Bluetooth MIDI keyboard to control the synthesizer in real-time.

## Technologies and Techniques Used

Built with lightweight web standards, avoiding the overhead of heavy frontend frameworks.

*   **Vanilla JavaScript (ES6+):** Core logic, music theory math, and DOM manipulation.
*   **Web Audio API:** Powers the custom synthesizer with oscillators, envelopes, filters, and dynamic compression.
*   **Web MIDI API:** Translates hardware MIDI input into real-time audio.
*   **Web Components:** Modular, shadow-DOM encapsulated UI elements (e.g., `<custom-keyboard>`, `<shell-voicing>`).
*   **CSS3 & CSS Variables:** Responsive, glassmorphic UI using CSS Grid and Flexbox.

## Potential Future Features

The architecture of myMusicApp leaves room for extensive future expansions, such as:

*   **Expanded Microtonal Systems:** Adding support for other tuning systems like 19-EDO, 31-EDO, 53-EDO, or Just Intonation.
*   **Advanced Synthesizer Controls:** Providing a user interface to adjust envelope (ADSR) parameters, or add effects like reverb and delay.
*   **Sequencer and Looper:** A built-in multi-track sequencer allowing users to record chord progressions, loop them, and practice scales over the playback.
*   **Sheet Music and Staff Visualization:** Generating standard notation or tablature dynamically based on the notes played or scales selected.