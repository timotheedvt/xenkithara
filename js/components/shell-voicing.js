class ShellVoicing extends HTMLElement {
    static get observedAttributes() {
        return ['type', 'root-string', 'notes'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });

        // Base fret X-positions for your 4-fret span
        this.Xs = [3.35, 6.35, 9.35];

        // FORMULAS: [ [relString, relFretIdx, label], ... ]
        this.formulas = {
            "maj7": [[0, 1, "R"], [-1, 0, "3"], [-2, 2, "7"]],
            "min7": [[0, 2, "R"], [-1, 0, "b3"], [-2, 2, "b7"]],
            "dom7": [[0, 1, "R"], [-1, 0, "3"], [-2, 1, "b7"]],
            "6": [[0, 1, "R"], [-1, 0, "3"], [-2, 0, "6"]]
        };

        // Map root string names to their index in the ['E','B','G','D','A','E'] array
        this.stringMap = { "E": 5, "A": 4, "D": 3, "G": 2, "B": 1, "e": 0 };

        // Chromatic tools for raw note parsing
        this.chromaticScale = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
        this.enharmonics = { "Db": "C#", "Eb": "D#", "Gb": "F#", "Ab": "G#", "Bb": "A#" };
    }

    attributeChangedCallback() {
        this.render();
    }

    connectedCallback() { this.render(); }

    render() {
        const type = this.getAttribute('type') || 'maj7';
        const rootStrName = this.getAttribute('root-string') || 'E';
        const notesAttr = this.getAttribute('notes');

        const rootIdx = this.stringMap[rootStrName];
        const Xs = this.Xs;
        let activeMarkers = [];

        // Dynamic Note Parsing Engine
        if (notesAttr) {
            const strings = ['E', 'B', 'G', 'D', 'A', 'E'];
            const baseOctaves = [4, 3, 3, 3, 2, 2]; // Standard tuning octaves
            const targetNotes = notesAttr.split(/\s+/).map(n => this.enharmonics[n] || n);

            targetNotes.forEach((noteName, index) => {
                const stringIdx = rootIdx - index;
                if (stringIdx < 0 || stringIdx >= strings.length) return;

                // Match pitch relationships relative to open string note values
                const stringBaseName = strings[stringIdx];
                const stringBaseIdx = this.chromaticScale.indexOf(stringBaseName);
                const targetNoteIdx = this.chromaticScale.indexOf(noteName);

                if (targetNoteIdx !== -1) {
                    const fret = (targetNoteIdx - stringBaseIdx + 12) % 12;
                    const fIdx = fret % 3; // Keep within the 3-fret coordinate array domain

                    const fretPitch = (baseOctaves[stringIdx] * 12) + stringBaseIdx + fret;
                    const actualOctave = Math.floor(fretPitch / 12);

                    activeMarkers.push({
                        stringIdx: stringIdx,
                        xPos: Xs[fIdx],
                        label: noteName,
                        playNote: noteName + actualOctave
                    });
                }
            });
        } else {
            // Fallback to structural formula defaults
            const formula = this.formulas[type] || this.formulas['maj7'];
            activeMarkers = formula.map(([sOffset, fIdx, label]) => {
                return {
                    stringIdx: rootIdx + sOffset,
                    xPos: Xs[fIdx],
                    label: label,
                    fIdx: fIdx
                };
            });
        }

        const strings = ['E', 'B', 'G', 'D', 'A', 'E'];
        let stringsHtml = strings.map((label, idx) => {
            const marker = activeMarkers.find(m => m.stringIdx === idx);
            const markerHtml = marker
                ? `<div class="note-marker" style="left: calc(100% / 12 * ${marker.xPos});">${marker.label}</div>`
                : '';

            return `
                <div class="string">
                    <span class="string-label">${label}</span>
                    <div class="string-line">${markerHtml}</div>
                </div>`;
        }).join('');

        this.shadowRoot.innerHTML = `
            <style>
                :host { display: block; margin: 10px; }

                /* Applying your Fretboard CSS */
                .fretboard {
                    background: var(--bg-dark);
                    /* padding:10px; */
                    border-radius:10px;
                    /* margin:10px 0; */
                    border: 1px solid rgba(255,255,255,0.03);
                    max-height: 200px;
                    max-width: 200px;
                    position: relative;
                }

                .string-diagram { display:flex; flex-direction:column; gap:0px; margin:10px 0; }

                .string { display:flex; align-items:center; gap:1px; }

                .string-label{
                    width:15px;
                    font-weight:500;
                    color:var(--text-muted);
                }

                /* string line */
                .string-line {
                    flex: 1;
                    height: 2px;
                    border-radius: 2px;
                    position: relative;
                    background: repeating-linear-gradient(
                        90deg,
                        rgba(255, 255, 255, 0.8) 0,          /* bright fret edge */
                        rgba(255, 255, 255, 0.8) 2px,        /* fret width */
                        rgba(255, 255, 255, 0.1) 2px,       /* start of string area */
                        rgba(255, 255, 255, 0.1) calc(100% * 4)  /* divide into 12 equal segments */
                    );
                    background-size: calc(100% / 4) 100%;
                    background-repeat: repeat-x;
                }

                /* note markers (use accent and softer border) */
                .note-marker{
                    transform: translateY(-50%);
                    position:absolute;
                    width:22px;
                    height:22px;
                    background: var(--accent-blue);
                    border-radius:50%;
                    border: 1px solid rgba(255,255,255,0.5);
                    display:flex;
                    align-items:center;
                    justify-content:center;
                    font-size:0.72em;
                    color:#02262b;
                    font-weight:800;
                    box-shadow: 0 8px 20px rgba(0,0,0,0.6);
                }

            </style>
            <div class="fretboard">
                <div class="string-diagram">
                    ${stringsHtml}
                </div>
            </div>
        `;

        // Make the fretboard component itself playable
        const fb = this.shadowRoot.querySelector('.fretboard');
        fb.style.cursor = 'pointer';
        fb.title = "Play Voicing";
        fb.addEventListener('click', () => {
            if (!window.AudioManager) return;

            let freqs;
            if (notesAttr) {
                freqs = activeMarkers.map(m => TheoryEngine.getSimpleFrequency(m.playNote || m.label)).filter(Boolean);
            } else {
                // Formula based. This is a movable shape.
                const rootMarker = activeMarkers.find(m => m.label === "R" || m.label === "R ");
                const baseOctave = (rootMarker && rootMarker.stringIdx <= 3) ? 'C4' : 'C3';
                const rootFreq = TheoryEngine.getSimpleFrequency(baseOctave);
                if (!rootFreq || !rootMarker) return;

                const stringPitches = [24, 19, 15, 10, 5, 0]; // e, B, G, D, A, E
                freqs = activeMarkers.map(m => {
                    const deltaString = stringPitches[m.stringIdx] - stringPitches[rootMarker.stringIdx];
                    const deltaFret = m.fIdx - rootMarker.fIdx;
                    return rootFreq * Math.pow(2, (deltaString + deltaFret) / 12);
                }).filter(Boolean);
            }

            if (freqs.length > 0) {
                AudioManager.playNotes(freqs, 0.25);
            }
        });
    }
}
customElements.define('shell-voicing', ShellVoicing);