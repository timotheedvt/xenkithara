/**
 * Centralized logic for Music Theory, Scales, and EDO Calculations
 */

const TheoryEngine = {
    base_notes_12: ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"],
    base_notes_24: ["C", "C‡", "C#", "Dd", "D", "D‡", "D#", "Ed", "E", "E‡", "F", "F‡", "F#", "Gd", "G", "G‡", "G#", "Ad", "A", "A‡", "A#", "Bd", "B", "B‡"],
    all_notes: [
        "C♮B#", "C#D♭", "D♮", "D#E♭", "E♮F♭", "E#F♮",
        "F#G♭", "G♮", "G#A♭", "A♮", "A#B♭", "B♮C♭"
    ],

    modes: typeof modes !== 'undefined' ? modes : {},
    modes_24: typeof modes_24 !== 'undefined' ? modes_24 : {},
    modes_24_categories: typeof modes_24_categories !== 'undefined' ? modes_24_categories : {},

    // Chord qualities for each mode degree
    chords_charts: {
        "Major/Ionian": "MmmMMmd",
        "Natural Minor/Aeolian": "mdMmmMM",
        "Dorian": "mmMMmdM",
        "Phrygian": "mMMmdMm",
        "Lydian": "MMmdMmm",
        "Mixolydian": "MmdMmmM",
        "Locrian": "dMmmMMm"
    },

    /**
     * Calculates frequencies for any EDO system.
     * Derived from EDO_interface/script.js logic
     */
    calculateEDOFrequencies(startFreq, subdivisions=12) {
        return Array.from({ length: subdivisions }, (_, i) => {
            return startFreq * Math.pow(2, i / subdivisions);
        });
    },

    /**
     * Centralized scale constructor
     * @param {string} root - e.g., "C", "F#"
     * @param {string} modeKey - e.g., "M", "m", "D"
     * @param {string} alteration - "#", "♭", or "♮"
     */
    getScale12(root, modeKey, alteration = "♮") {
        const modeIntervals = this.modes[modeKey];
        if (!modeIntervals) return [];

        // Convert step intervals to cumulative semitones
        let cumulative = 0;
        const semitoneSteps = [0, ...modeIntervals.map(step => cumulative += step)];

        let cleanRoot = root.replace(/b/g, '♭');
        let effectiveAlteration = alteration;
        if (cleanRoot.includes("#")) effectiveAlteration = "#";
        else if (cleanRoot.includes("♭")) effectiveAlteration = "♭";

        // Find index of root note
        const rootLookup = cleanRoot + alteration;
        let indexOfRoot = this.all_notes.findIndex(n => n.includes(rootLookup));
        if (indexOfRoot === -1) {
            indexOfRoot = this.all_notes.findIndex(n => n.includes(cleanRoot));
        }
        if (indexOfRoot === -1) indexOfRoot = 0; // Fallback to avoid crash

        return semitoneSteps.map(shift => {
            let noteGroup = this.all_notes[(indexOfRoot + shift) % 12];

            // Logic to choose the right enharmonic based on alteration
            if (effectiveAlteration === "#") return noteGroup.substring(0, 2).replace("♮", "");
            if (effectiveAlteration === "♭" || effectiveAlteration === "b") return noteGroup.slice(-2).replace("♮", "");
            return noteGroup.split("♮")[0] || noteGroup[0];
        }).map(n => this.normalizeNote(n)); // Final cleanup to remove natural signs
    },

    getScale24(root, modeKey) {
        const modeIntervals = this.modes_24[modeKey];
        if (!modeIntervals) return [];

        let cumulative = 0;
        const quarterToneSteps = [0, ...modeIntervals.map(step => cumulative += step)];

        let indexOfRoot = this.base_notes_24.findIndex(n => n === root);
        if (indexOfRoot === -1) indexOfRoot = 0;

        return quarterToneSteps.map(shift => {
            return this.base_notes_24[(indexOfRoot + shift) % 24];
        });
    },

    /**
     * Converts a Roman numeral into a concrete chord in the given key.
     * e.g., getChordFromNumeral("IV - Maj7", "C") -> "Fmaj7"
     */
    getChordFromNumeral(numeralStr, keyRoot = "C") {
        let alt = "♮";
        let cleanRoot = keyRoot;
        if (cleanRoot.includes('#')) { alt = "#"; cleanRoot = cleanRoot.replace('#', ''); }
        else if (cleanRoot.includes('b') || cleanRoot.includes('♭')) { alt = "♭"; cleanRoot = cleanRoot.replace(/[b♭]/, ''); }

        const scale = this.getScale12(cleanRoot, "Major/Ionian", alt);
        const match = numeralStr.match(/^(III|VII|IV|VI|II|I|V|iii|vii|iv|vi|ii|i|v)/i);
        if (!match || !scale || scale.length === 0) return null;

        const roman = match[1];
        const isMinor = roman === roman.toLowerCase();
        const degrees = { "i": 0, "ii": 1, "iii": 2, "iv": 3, "v": 4, "vi": 5, "vii": 6 };
        const degreeIndex = degrees[roman.toLowerCase()];
        let rootNote = scale[degreeIndex];

        if (numeralStr.includes("Maj7") || numeralStr.includes("maj7")) return rootNote + "maj7";
        if (numeralStr.includes("m7b5")) return rootNote + "m7b5";
        if (numeralStr.includes("m7")) return rootNote + "m7";
        if (numeralStr.includes("7")) return rootNote + (isMinor ? "m7" : "7");
        if (numeralStr.includes("dim") || numeralStr.includes("°")) return rootNote + "dim";

        if (roman.toLowerCase() === "vii") return rootNote + "dim";
        if (isMinor) return rootNote + "m";
        return rootNote;
    },

    getRomanNumeral(degree, chordType) {
        const numerals = ["I", "II", "III", "IV", "V", "VI", "VII"];
        let rom = numerals[(degree - 1) % 7];
        if (chordType === "m") return rom.toLowerCase();
        if (chordType === "d") return rom.toLowerCase() + "°";
        return rom;
    },

    getEDONoteName(index, subdivisions) {
        if (subdivisions == 12) {
            return this.base_notes_12[(index + 9) % 12];
        } else if (subdivisions == 24) {
            return this.base_notes_24[(index + 18) % 24];
        }
        // For other EDOs, use a numerical notation (e.g., "0", "1", "2"...)
        return index.toString();
    },

    findSmallestPerfectSquare(n) {
        const sqrt = Math.sqrt(n);
        return (sqrt % 1 === 0) ? sqrt : Math.floor(sqrt) + 1;
    },

    normalizeNote(note) {
        let clean = note.replace(/♮/g, "");

        const equivalents = {
            "CB#": "C",
            "C#D♭": "C#",
            "D#E♭": "D#",
            "EF♭": "E",
            "E#F": "F",
            "F#G♭": "F#",
            "G#A♭": "G#",
            "A#B♭": "A#",
            "BC♭": "B"
        };

        if (equivalents[clean]) clean = equivalents[clean];

        return clean;
    },

    getSimpleFrequency(note, division = 12) {
        note = note.replace("<sup>", "").replace("</sup>", "");
        const base = 440; // A4
        let noteIndex;
        const is24edo = division == 24;
        noteIndex = !is24edo
            ? this.base_notes_12.findIndex(n => n.includes(note))
            : this.base_notes_24.findIndex(n => n.includes(note));
        if (noteIndex === -1) return null;
        return base * Math.pow(2, (noteIndex) / (is24edo ? 24 : 12));
    }
};

// Export for use in other files
if (typeof module !== 'undefined') module.exports = TheoryEngine;