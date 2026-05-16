const tabNames = ["fundamentals", "circle", "scales", "chords", "shell", "progressions"]

function showTab(tabName) {
	// Hide all tabs
	const tabs = document.querySelectorAll('.tab-content');
	tabs.forEach(tab => tab.classList.remove('active'));

	if (!tabNames.includes(tabName)) {
		tabName = "fundamentals";
	}

	// Remove active from all buttons
	const buttons = document.querySelectorAll('.tab-btn');
	buttons.forEach(btn => btn.classList.remove('active'));

	// Show selected tab
	document.getElementById(tabName).classList.add('active');

	// Add active to clicked button
	buttons.forEach(btn => { if (btn.innerHTML.toLowerCase().includes(tabName)) { btn.classList.add('active') } });

	const url = new URL(window.location);
	url.searchParams.set('page', tabName);
	window.history.pushState({}, '', url);
}

if (window.location) {
	const queryString = window.location.search;
	const urlParams = new URLSearchParams(queryString);

	const queryValue = urlParams.get('page');
	if (tabNames.includes(queryValue)) {
		showTab(queryValue);
	} else {
		showTab("fundamentals");
	}
}

// add event listeners to "note-circle"

const noteCircles = document.querySelectorAll('.note-circle');
noteCircles.forEach(circle => {
	circle.addEventListener('click', () => {
		const note = circle.innerHTML.trim();
		AudioManager.playNoteWithDuration(note, 0.5);
	});
});

// Handle the basic Chromatic scale items in Fundamentals tab
const scaleLi = document.querySelectorAll('.scale-li');
scaleLi.forEach(li => {
    li.style.cursor = 'pointer';
    li.title = "Play Chromatic Scale";
    li.addEventListener('click', async () => {
        const scaleAttr = li.getAttribute('data-scale');
        if (scaleAttr === "chromatic") {
            const baseFreq = 261.63; // C4
            for (let i = 0; i <= 12; i++) {
                const freq = baseFreq * Math.pow(2, i / 12);
                AudioManager.playNoteWithDuration(freq, 0.2);
                await new Promise(resolve => setTimeout(resolve, 250));
            }
        }
    });
});

// Handle the new Scale Cards in the Scales Tab
const scaleCardBtns = document.querySelectorAll('.scale-card-btn');
scaleCardBtns.forEach(btn => {
    const root = btn.getAttribute('data-root');
    const mode = btn.getAttribute('data-mode');
    const title = btn.getAttribute('data-title') || btn.innerText;
    const desc = btn.getAttribute('data-desc');

    btn.classList.add('card');
    btn.style.cursor = 'pointer';
    btn.style.transition = 'all 0.2s';
    btn.style.margin = '0';
    btn.style.padding = '10px 15px';
    btn.title = `Play ${title}`;

    const scaleNotes = TheoryEngine.getScale(root, mode);
    scaleNotes.push(scaleNotes[0]); // Add octave for completion
    const notesHtml = scaleNotes.map(n => `<span style="background: var(--bg-dark); padding: 4px 8px; border-radius: 4px; font-size: 0.85em; color: var(--text-muted); border: 1px solid var(--glass);">${n}</span>`).join('');

    const descHtml = desc ? `<div style="font-size: 0.85em; color: var(--text-muted); margin-bottom: 8px;">${desc}</div>` : '';

    btn.innerHTML = `
        <div style="font-weight: bold; color: var(--accent-blue); margin-bottom: ${desc ? '4px' : '8px'};">${title}</div>
        ${descHtml}
        <div style="display: flex; flex-wrap: wrap; gap: 5px;">${notesHtml}</div>
    `;

    btn.addEventListener('mouseover', () => btn.style.transform = 'translateY(-2px)');
    btn.addEventListener('mouseout', () => btn.style.transform = '');

    btn.addEventListener('click', async () => {
        const originalBg = btn.style.backgroundColor;
        btn.style.backgroundColor = 'var(--glass)';
        btn.style.borderColor = 'var(--accent-blue)';

        await AudioManager.playScale(root, mode, 0.25);

        btn.style.backgroundColor = originalBg;
        btn.style.borderColor = '';
    });
});

// Interactive Scale Explorer Logic (bound to DOM Elements)
const rootSel = document.getElementById('dynamic-root');
const modeSel = document.getElementById('dynamic-mode');
const playBtn = document.getElementById('play-dynamic-scale');
const notesContainer = document.getElementById('dynamic-scale-notes');

if (rootSel && modeSel && playBtn && notesContainer) {
    // Populate Dropdowns dynamically from TheoryEngine
    rootSel.innerHTML = TheoryEngine.base_notes_12.map(n => `<option value="${n}">${n}</option>`).join('');
    modeSel.innerHTML = Object.keys(TheoryEngine.modes).map(m => `<option value="${m}">${m}</option>`).join('');

    const updateDynamicScale = () => {
        const r = rootSel.value;
        const m = modeSel.value;
        const notes = TheoryEngine.getScale(r, m);
        notes.push(notes[0]); // Add octave visually
        notesContainer.innerHTML = notes.map(n => `
            <span style="background: var(--bg-dark); padding: 10px 15px; border-radius: 8px; font-weight: bold; color: var(--accent-blue); border: 1px solid var(--glass); box-shadow: 0 4px 10px rgba(0,0,0,0.2);">
                ${n}
            </span>
        `).join('');
    };

    rootSel.addEventListener('change', updateDynamicScale);
    modeSel.addEventListener('change', updateDynamicScale);
    playBtn.addEventListener('click', () => {
        AudioManager.playScale(rootSel.value, modeSel.value, 0.25);
    });

    // Initialize display immediately
    updateDynamicScale();
}

const enharmonicLi = document.querySelectorAll('.enharmonic-li');
enharmonicLi.forEach(li => {
	li.addEventListener('click', () => {
		const note = li.getAttribute('data-note');
		AudioManager.playNoteWithDuration(note, 0.25);
	});
});

document.querySelectorAll('.progression-box').forEach(box => {
	box.style.cursor = 'pointer';
	box.title = 'Play Progression';
	box.addEventListener('click', async () => {
		const chordBoxes = box.querySelectorAll('.chord-box');

		// Determine key from text below (e.g. "In C: ...")
		const p = box.nextElementSibling;
		const keyRoot = "C";

		for (let i = 0; i < chordBoxes.length; i++) {
			const currentBox = chordBoxes[i];
			let chord = TheoryEngine.getChordFromNumeral(currentBox.innerText.trim(), keyRoot);

			if (currentBox) {
				currentBox.style.transition = 'all 0.15s ease';
				currentBox.style.backgroundColor = 'var(--accent-blue)';
				currentBox.style.color = 'var(--bg-dark)';
				currentBox.style.transform = 'scale(1.05)';
			}

			if (chord && window.AudioManager) AudioManager.playChord(chord, 0.25);
			await new Promise(r => setTimeout(r, 400)); // Time between progression steps

			if (currentBox) {
				currentBox.style.backgroundColor = '';
				currentBox.style.color = '';
				currentBox.style.transform = '';
			}
		}
	});
});