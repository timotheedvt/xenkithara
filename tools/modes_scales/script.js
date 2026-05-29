let currentTuning = "EADGBE";
let currentStringsCount = 6;
let checkedNotes = [];
let is24edoActive = false;
const grid = document.getElementById('grid');

// Standardized mapping to 12 semitones
const noteToSemitone = {
    "B#": "C", "C": "C", "C#": "C#", "Db": "C#", "D♭": "C#",
    "D": "D", "D#": "D#", "Eb": "D#", "E♭": "D#",
    "E": "E", "Fb": "E", "F♭": "E", "E#": "F", "F": "F",
    "F#": "F#", "Gb": "F#", "G♭": "F#", "G": "G",
    "G#": "G#", "Ab": "G#", "A♭": "G#", "A": "A",
    "A#": "A#", "Bb": "A#", "B♭": "A#", "B": "B", "Cb": "B", "C♭": "B"
};

const fretToDraw = [ 0, 5, 7, 10, 12 ];
let notesArr = TheoryEngine.base_notes_12;

window.addEventListener('DOMContentLoaded', () => {
    currentStringsCount = document.getElementById("string-number").value;
    changeTuning();
    initCheckboxes();
    initModes();
    writeTune();
});

function initCheckboxes() {
    const container = document.getElementById('checkbox-container');
    while (container.firstChild) {
        container.removeChild(container.lastChild);
    }
    notesArr.forEach(n => {
        const label = document.createElement('label');
        label.innerHTML = `${n} <input type="checkbox" value="${n}" class="note-check" ${checkedNotes.includes(n) ? 'checked' : ''}> `;
        label.querySelector('input').addEventListener('change', (e) => {
            const note = e.target.value;
            if (e.target.checked) {
                if (!checkedNotes.includes(note)) checkedNotes.push(note);
                if (window.AudioManager) AudioManager.playNoteWithDuration(note, 0.2);
            } else {
                checkedNotes = checkedNotes.filter(n => n !== note);
            }
            updateVisuals();
        });
        container.appendChild(label);
    });
}

function initModes() {
    const modeSelect = document.getElementById('mode-select');
    const currentValue = modeSelect.value;
    modeSelect.innerHTML = ""; // Clear existing

    if (is24edoActive) {
        const group12 = document.createElement('optgroup');
        group12.label = "12-EDO Modes";
        Object.keys(TheoryEngine.modes).forEach(mode => {
            const option = document.createElement('option');
            option.value = mode;
            option.text = mode;
            group12.appendChild(option);
        });
        modeSelect.appendChild(group12);

        const group24 = document.createElement('optgroup');
        group24.label = "24-EDO Modes";

        if (TheoryEngine.modes_24_categories && Object.keys(TheoryEngine.modes_24_categories).length > 0) {
            Object.keys(TheoryEngine.modes_24_categories).forEach(category => {
                const separator = document.createElement('option');
                separator.disabled = true;
                separator.text = `── ${category} ──`;
                group24.appendChild(separator);

                TheoryEngine.modes_24_categories[category].forEach(mode => {
                    const option = document.createElement('option');
                    option.value = mode;
                    option.text = mode;
                    group24.appendChild(option);
                });
            });
        } else {
            Object.keys(TheoryEngine.modes_24).forEach(mode => {
                const option = document.createElement('option');
                option.value = mode;
                option.text = mode;
                group24.appendChild(option);
            });
        }
        modeSelect.appendChild(group24);
    } else {
        Object.keys(TheoryEngine.modes).forEach(mode => {
            const option = document.createElement('option');
            option.value = mode;
            option.text = mode;
            modeSelect.appendChild(option);
        });
    }

    if (currentValue && Array.from(modeSelect.options).some(opt => opt.value === currentValue)) {
        modeSelect.value = currentValue;
    }
}

function writeTune() {
    const root = document.getElementById('tune-select').value;
    const alt = document.getElementById('alt-select').value;
    const modeKey = document.getElementById('mode-select').value;

    let rawScale = [];

    if (is24edoActive && TheoryEngine.modes_24[modeKey]) {
        let rawRoot = root + (alt !== '♮' ? alt : '');
        let rootNote = noteToSemitone[rawRoot] || rawRoot;
        rawScale = TheoryEngine.getScale24(rootNote, modeKey);

        if (!rawScale || rawScale.length === 0) {
            rawScale = TheoryEngine.getScale12(root, modeKey, alt);
        }
    } else {
        rawScale = TheoryEngine.getScale12(root, modeKey, alt);
    }

    const boxes = document.querySelectorAll('.note-check');
    boxes.forEach(b => b.checked = false);

    checkedNotes = rawScale.map(note => {
        const cleanNote = note.replace('♮', '');
        return noteToSemitone[cleanNote] || cleanNote;
    });

    checkedNotes.forEach(standardName => {
        let box = document.querySelector(`.note-check[value="${standardName}"]`);
        if (box) box.checked = true;
    });

    updateVisuals();
    updateChordTable(rawScale, modeKey);
}

function updateVisuals() {
    grid.setAttribute("notes", checkedNotes.join(", "));
    grid.setAttribute("strings", currentStringsCount);
    grid.setAttribute("tuning", currentTuning);
    grid.update();
}

function updateChordTable(scale, modeKey) {
    const table = document.getElementById('chord-table');
    table.innerHTML = "";
    const chart = TheoryEngine.chords_charts[modeKey];
    if (!chart) return;

    let headRow = table.insertRow();
    let dataRow = table.insertRow();

    scale.forEach((note, i) => {
        if (i >= chart.length) return;
        let quality = chart[i];
        let roman = TheoryEngine.getRomanNumeral(i + 1, quality);
        note = TheoryEngine.normalizeNote(note); // Ensure we have a standardized note name
        let chordName = note + (quality === 'M' ? '' : quality === 'd' ? '°' : quality);

        let hCell = headRow.insertCell();
        hCell.innerText = roman;

        let dCell = dataRow.insertCell();
        dCell.innerText = chordName;
        dCell.style.cursor = "pointer";
        dCell.title = "Play " + chordName + " chord";

        dCell.addEventListener('click', () => {
            if (!window.AudioManager) return;
            const rootFreq = TheoryEngine.getSimpleFrequency(note);
            if (!rootFreq) return;

            const st3 = (quality === 'm' || quality === 'd') ? 3 : 4;
            const st5 = (quality === 'd') ? 6 : 7;

            AudioManager.playNotes([rootFreq, rootFreq * Math.pow(2, st3/12), rootFreq * Math.pow(2, st5/12)], 0.25);
        });
    });
}

// change string count
function changeStringCount() {
    const stringCount = document.getElementById('string-number');
    currentStringsCount = parseInt(stringCount.value);
    if (currentStringsCount != 6) {
        if (currentTuning.length < currentStringsCount) {
            currentTuning = currentTuning + "X".repeat(currentStringsCount - currentTuning.length);
        } else if (currentTuning.length > currentStringsCount) {
            currentTuning = currentTuning.slice(0, currentStringsCount);
        }

        text = document.getElementById("custom-tuning")
        text.disabled = false;
        text.style.cursor = ""
        text.style.opacity = 1;
        text.placeholder = currentTuning;
    }
    writeTune();
    updateVisuals();
};

// change tuning mode (S;AO;TO)
function changeTuning() {
    var tuningMode = document.getElementById('tuning-select');
    if (getSelectedOption(tuningMode).value != "CUSTOM") {
        currentTuning = getSelectedOption(tuningMode).value;
        text = document.getElementById("custom-tuning")
        // stay visible but disable text input
        text.disabled = true;
        text.style.cursor = "not-allowed";
        text.style.opacity = 0.3;
        writeTune()
    } else {
        text = document.getElementById("custom-tuning");
        text.disabled = false;
        text.style.cursor = ""
        text.style.opacity = 1;
        text.placeholder = currentTuning;
    }
    updateVisuals();
};

// Return the selected option on the HTML Select element
function getSelectedOption(sel) {
    var opt;
    for (var i = 0, len = sel.options.length; i < len; i++) {
        opt = sel.options[i];
        if (opt.selected === true) {
            break;
        };
    };
    return opt;
};

function onTuningChange() {
    const key = window.event.keyCode;
    let t = document.getElementById("custom-tuning").value
    document.getElementById("custom-tuning").value = t.toUpperCase()

    if (key === 13) {
        if (t.length >= currentStringsCount) {
            t = t.toUpperCase()
            currentTuning = t.toUpperCase()
            writeTune()
            return false;
        } else {
            alert("L'accordage attendu doit avoir " + currentStringsCount + " cordes sont acceptés.")
        }
    }
    else {
        return true;
    }
}

function onEDOChange() {
    const value = document.getElementById("is24edoToggle").checked;
    is24edoActive = value;
    document.getElementById("grid").setAttribute("is24edo", value);
    notesArr = value ? TheoryEngine.base_notes_24 : TheoryEngine.base_notes_12;
    initCheckboxes();
    initModes();
    writeTune();
    updateVisuals();
}

document.getElementById('toggle-footer').addEventListener('click', () => {
    document.querySelector('footer').classList.toggle('folded');
    localStorage.setItem("foldedModesScales", document.querySelector('footer').classList.contains('folded'))
});

if (localStorage.getItem("foldedModesScales") === "true") {
    document.querySelector('footer').classList.add('folded');
}

document.addEventListener('keydown', (event) => {
    const isHardRefresh = (event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'r';

    if (isHardRefresh) {
        localStorage.clear();
    }
});