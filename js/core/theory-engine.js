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

    // Mode definitions (interval steps)
    modes: {
        "Major/Ionian": [2, 2, 1, 2, 2, 2], // Major/Ionian
        "Natural Minor/Aeolian": [2, 1, 2, 2, 1, 2], // Natural Minor/Aeolian
        "Dorian": [2, 1, 2, 2, 2, 1], // Dorian
        "Phrygian": [1, 2, 2, 2, 1, 2], // Phrygian
        "Lydian": [2, 2, 2, 1, 2, 2], // Lydian
        "Mixolydian": [2, 2, 1, 2, 2, 1], // Mixolydian
        "Locrian": [1, 2, 2, 1, 2, 2], // Locrian
        "Hungarian Minor": [2, 1, 3, 1, 1, 2, 1], // Hungarian Minor
        "Pentatonic Major": [2, 2, 3, 2],       // Pentatonic Major
        "Pentatonic Minor": [3, 2, 2, 3]        // Pentatonic Minor
    },

    modes_24: {
        "Anchihoye: Ethiopia": [2, 8, 3, 6, 5],
        "Quasi-equal Pentatonic": [5, 5, 4, 5, 5],
        "Hába's Pentatonic": [5, 5, 5, 5, 4],
        "Spondeiakos": [1, 1, 8, 4, 2, 8],
        "Enharmonic Mixolydian": [1, 1, 8, 1, 1, 8, 4],
        "Enharmonic Lydian": [1, 8, 1, 1, 8, 4, 1],
        "Enharmonic Phrygian": [8, 1, 1, 8, 4, 1, 1],
        "Enharmonic Dorian": [1, 1, 8, 4, 1, 1, 8],
        "Enharmonic Hypolydian": [1, 8, 4, 1, 1, 8, 1],
        "Enharmonic Hypophrygian": [8, 4, 1, 1, 8, 1, 1],
        "Enharmonic Hypodorian": [4, 1, 1, 8, 1, 1, 8],
        "Soft Diatonic Mixolydian": [2, 3, 5, 2, 3, 5, 4],
        "Soft Diatonic Lydian": [3, 5, 2, 3, 5, 4, 2],
        "Soft Diatonic Phrygian": [5, 2, 3, 5, 4, 2, 3],
        "Soft Diatonic Dorian": [2, 3, 5, 4, 2, 3, 5],
        "Soft Diatonic Hypolydian": [3, 5, 4, 2, 3, 5, 2],
        "Soft Diatonic Hypophrygian": [5, 4, 2, 3, 5, 2, 3],
        "Soft Diatonic Hypodorian": [4, 2, 3, 5, 2, 3, 5],
        "Maqam Ouchairan-Hussaini": [3, 3, 4, 3, 3, 4, 4],
        "Dastgah-e Sehgah": [3, 4, 3, 3, 4, 4, 3],
        "Arabic Diatonic": [4, 3, 3, 4, 4, 3, 3],
        "Maqam Hussaini": [3, 3, 4, 4, 3, 3, 4],
        "Maqam Sikah": [3, 4, 4, 3, 3, 4, 3],
        "Neutral Diatonic Hypophrygian": [4, 4, 3, 3, 4, 3, 3],
        "Miha'il Musaqa's mode": [4, 3, 3, 4, 3, 3, 4],
        "Diatonic + Enharmonic Diesis Mixolydian": [1, 5, 4, 1, 5, 4, 4],
        "Diatonic + Enharmonic Diesis Lydian": [5, 4, 1, 5, 4, 4, 1],
        "Diatonic + Enharmonic Diesis Phrygian": [4, 1, 5, 4, 4, 1, 5],
        "Diatonic + Enharmonic Diesis Dorian": [1, 5, 4, 4, 1, 5, 4],
        "Diatonic + Enharmonic Diesis Hypolydian": [5, 4, 4, 1, 5, 4, 1],
        "Diatonic + Enharmonic Diesis Hypophrygian": [4, 4, 1, 5, 4, 1, 5],
        "Diatonic + Enharmonic Diesis Hypodorian": [4, 1, 5, 4, 1, 5, 4],
        "Chromatic/Enharmonic Mixolydian": [1, 3, 6, 1, 3, 6, 4],
        "Chromatic/Enharmonic Lydian": [3, 6, 1, 3, 6, 4, 1],
        "Chromatic/Enharmonic Phrygian": [6, 1, 3, 6, 4, 1, 3],
        "Chromatic/Enharmonic Dorian": [1, 3, 6, 4, 1, 3, 6],
        "Chromatic/Enharmonic Hypolydian": [3, 6, 4, 1, 3, 6, 1],
        "Chromatic/Enharmonic Hypophrygian": [6, 4, 1, 3, 6, 1, 3],
        "Chromatic/Enharmonic Hypodorian": [4, 1, 3, 6, 1, 3, 6],
        "Neutral Mixolydian": [3, 4, 3, 3, 4, 3, 4],
        "Neutral Lydian": [4, 3, 3, 4, 3, 4, 3],
        "Neutral Phrygian": [3, 3, 4, 3, 4, 3, 4],
        "Neutral Dorian": [3, 4, 3, 4, 3, 4, 3],
        "Neutral Hypolydian": [4, 3, 4, 3, 4, 3, 3],
        "Neutral Hypophrygian": [3, 4, 3, 4, 3, 3, 4],
        "Neutral Hypodorian": [4, 3, 4, 3, 3, 4, 3],
        "Athanasopoulos' Byzantine Liturgical Chromatic": [3, 5, 2, 4, 3, 5, 2],
        "Dastgah-e Nava": [4, 2, 4, 4, 3, 3, 4],
        "Second plagal Byzantine Liturgical mode": [2, 7, 1, 4, 2, 7, 1],
        "Maqam 'Ushshaq Turki": [3, 3, 4, 4, 2, 4, 4],
        "Maqam Nahfat": [3, 3, 4, 4, 4, 2, 4],
        "Maqam Saba": [3, 3, 2, 6, 2, 4, 4],
        "Maqam Sabr Jadid": [3, 3, 2, 6, 2, 6, 2],
        "Maqam Suznak": [4, 3, 3, 4, 2, 6, 2],
        "Maqam Mahur": [4, 3, 3, 4, 4, 4, 2],
        "Maqam Qarjighar": [3, 3, 4, 2, 6, 2, 4],
        "Maqam Hizam": [3, 4, 2, 6, 2, 4, 3],
        "Maqam Nawa": [2, 4, 4, 4, 3, 3, 4],
        "Maqam Higaz-kar": [2, 5, 3, 4, 2, 5, 3],
        "Maqam Su'ar": [3, 4, 4, 2, 4, 4, 3],
        "Maqam Jahargah": [4, 4, 2, 4, 4, 3, 3],
        "Dastgah-e Homayun": [3, 5, 2, 4, 2, 4, 4],
        "Naghmeh Esfahan": [4, 2, 4, 4, 3, 5, 2],
        "Maqam 'Awg 'ara": [3, 6, 1, 5, 2, 6, 1],
        "Maqam Buselik": [4, 1, 5, 4, 2, 6, 2],
        "Maqam Neuter": [4, 2, 6, 2, 2, 5, 3],
        "Dance scale of Yi people": [4, 3, 3, 4, 4, 2, 4],
        "Daniel-mode": [4, 4, 2, 3, 1, 4, 6],
        "8-equal": [3, 3, 3, 3, 3, 3, 3, 3],
        "Maqam Bayati (Octatonic)": [3, 3, 4, 4, 2, 1, 3, 4],
        "Maqam Saba (Octatonic)": [3, 3, 2, 6, 2, 4, 2, 2],
        "Maqam Suzidil 'ara": [4, 3, 1, 2, 4, 4, 2, 4],
        "Maqam Mansuri": [3, 3, 2, 2, 4, 3, 3, 4],
        "Maqam Rast (Octatonic)": [4, 3, 3, 4, 4, 2, 1, 3],
        "Maqam Rahat al-Arwah": [3, 4, 2, 6, 2, 4, 2, 1],
        "Maqam Iraq": [3, 4, 3, 3, 4, 4, 2, 1],
        "Maqam Hijaz": [2, 6, 2, 4, 2, 1, 3, 4],
        "Maqam Musta'ar": [3, 4, 4, 2, 1, 3, 4, 3],
        "Maqam Farahnak": [3, 4, 4, 4, 2, 4, 2, 1],
        "Maqam Bastanikar": [3, 4, 3, 3, 2, 6, 2, 1],
        "Maqam Farah Faza": [4, 2, 6, 2, 4, 2, 1, 3],
        "Maqam Jabburi": [3, 1, 2, 4, 4, 2, 4, 4],
        "Giancarlo Dalmonte's scale": [1, 4, 4, 2, 4, 4, 4, 1],
        "Progressive Enneatonic": [1, 2, 3, 4, 4, 1, 2, 3, 4],
        "de Vries 9-tone": [4, 1, 4, 1, 4, 1, 4, 1, 4],
        "Maqam Huzam (Enneatonic)": [3, 4, 2, 2, 2, 2, 2, 4, 3],
        "Maqam Shawq Afza": [4, 4, 2, 1, 3, 2, 2, 4, 2],
        "Breed Decatonic": [3, 1, 3, 3, 3, 1, 3, 3, 1, 3],
        "Oljare Decatonic": [2, 3, 2, 2, 3, 2, 3, 2, 2, 3],
        "Maqam Shawq Tarab": [2, 1, 3, 2, 2, 4, 2, 4, 2, 2],
        "Maqam Basandida": [4, 2, 1, 3, 2, 2, 4, 2, 1, 3],
        "Maqam Yakah": [4, 3, 1, 2, 1, 3, 4, 2, 1, 3],
        "Maqam Hayyan": [4, 2, 1, 3, 2, 2, 2, 2, 3, 1, 2],
        "de Vries 13-tone": [1, 2, 2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2],
        "Agmon Diatonic DS5": [2, 2, 2, 2, 2, 1, 2, 2, 2, 2, 2, 2, 1],
        "Young Half-Octave Diatonic": [2, 2, 1, 2, 2, 2, 1, 2, 2, 1, 2, 2, 2, 1]
    },

    modes_24_categories: {
        "Pentatonic (5)": ["Anchihoye: Ethiopia", "Quasi-equal Pentatonic", "Hába's Pentatonic"],
        "Hexatonic (6)": ["Spondeiakos"],
        "Heptatonic (7)": [
            "Enharmonic Mixolydian", "Enharmonic Lydian", "Enharmonic Phrygian", "Enharmonic Dorian",
            "Enharmonic Hypolydian", "Enharmonic Hypophrygian", "Enharmonic Hypodorian",
            "Soft Diatonic Mixolydian", "Soft Diatonic Lydian", "Soft Diatonic Phrygian", "Soft Diatonic Dorian",
            "Soft Diatonic Hypolydian", "Soft Diatonic Hypophrygian", "Soft Diatonic Hypodorian",
            "Maqam Ouchairan-Hussaini", "Dastgah-e Sehgah", "Arabic Diatonic", "Maqam Hussaini", "Maqam Sikah",
            "Neutral Diatonic Hypophrygian", "Miha'il Musaqa's mode", "Diatonic + Enharmonic Diesis Mixolydian",
            "Diatonic + Enharmonic Diesis Lydian", "Diatonic + Enharmonic Diesis Phrygian", "Diatonic + Enharmonic Diesis Dorian",
            "Diatonic + Enharmonic Diesis Hypolydian", "Diatonic + Enharmonic Diesis Hypophrygian", "Diatonic + Enharmonic Diesis Hypodorian",
            "Chromatic/Enharmonic Mixolydian", "Chromatic/Enharmonic Lydian", "Chromatic/Enharmonic Phrygian",
            "Chromatic/Enharmonic Dorian", "Chromatic/Enharmonic Hypolydian", "Chromatic/Enharmonic Hypophrygian",
            "Chromatic/Enharmonic Hypodorian", "Neutral Mixolydian", "Neutral Lydian", "Neutral Phrygian",
            "Neutral Dorian", "Neutral Hypolydian", "Neutral Hypophrygian", "Neutral Hypodorian",
            "Athanasopoulos' Byzantine Liturgical Chromatic", "Dastgah-e Nava", "Second plagal Byzantine Liturgical mode",
            "Maqam 'Ushshaq Turki", "Maqam Nahfat", "Maqam Saba", "Maqam Sabr Jadid", "Maqam Suznak", "Maqam Mahur",
            "Maqam Qarjighar", "Maqam Hizam", "Maqam Nawa", "Maqam Higaz-kar", "Maqam Su'ar", "Maqam Jahargah",
            "Dastgah-e Homayun", "Naghmeh Esfahan", "Maqam 'Awg 'ara", "Maqam Buselik", "Maqam Neuter",
            "Dance scale of Yi people", "Daniel-mode"
        ],
        "Octatonic (8)": [
            "8-equal", "Maqam Bayati (Octatonic)", "Maqam Saba (Octatonic)", "Maqam Suzidil 'ara", "Maqam Mansuri",
            "Maqam Rast (Octatonic)", "Maqam Rahat al-Arwah", "Maqam Iraq", "Maqam Hijaz", "Maqam Musta'ar",
            "Maqam Farahnak", "Maqam Bastanikar", "Maqam Farah Faza", "Maqam Jabburi", "Giancarlo Dalmonte's scale"
        ],
        "Enneatonic (9)": [
            "Progressive Enneatonic", "de Vries 9-tone", "Maqam Huzam (Enneatonic)", "Maqam Shawq Afza"
        ],
        "Decatonic (10)": [
            "Breed Decatonic", "Oljare Decatonic", "Maqam Shawq Tarab", "Maqam Basandida", "Maqam Yakah"
        ],
        "Hendecatonic (11)": ["Maqam Hayyan"],
        "Tridecatonic (13)": ["de Vries 13-tone", "Agmon Diatonic DS5"],
        "Tetradecatonic (14)": ["Young Half-Octave Diatonic"]
    },

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
    getScale(root, modeKey, alteration = "♮") {
        const modeIntervals = this.modes[modeKey];
        if (!modeIntervals) return [];

        // Convert step intervals to cumulative semitones
        let cumulative = 0;
        const semitoneSteps = [0, ...modeIntervals.map(step => cumulative += step)];

        // Find index of root note
        const rootLookup = root + alteration;
        const indexOfRoot = this.all_notes.findIndex(n => n.includes(rootLookup));

        return semitoneSteps.map(shift => {
            let noteGroup = this.all_notes[(indexOfRoot + shift) % 12];

            // Logic to choose the right enharmonic based on alteration
            if (alteration === "#") return noteGroup.substring(0, 2).replace("♮", "");
            if (alteration === "♭" || alteration === "b") return noteGroup.slice(-2).replace("♮", "");
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

        const scale = this.getScale(cleanRoot, "Major/Ionian", alt);
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