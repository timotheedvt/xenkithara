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

const scaleLi = document.querySelectorAll('.scale-li');

scaleLi.forEach(li => {
	li.addEventListener('click', async () => {
		const text = li.innerHTML.trim();
		const scaleAttr = li.getAttribute('data-scale');

		if (scaleAttr === "chromatic") {
			const baseFreq = 261.63; // C4
			for (let i = 0; i < 12; i++) {
				const freq = baseFreq * Math.pow(2, i / 12);
				AudioManager.playNoteWithDuration(freq, 0.2);
				await new Promise(resolve => setTimeout(resolve, 250));
			}
		} else {
			const root = text.replace(/m$/, '');
			const mode = text.endsWith('m') ? 'Natural Minor/Aeolian' : 'Major/Ionian';
			await AudioManager.playScale(root, mode, 0.5);
		}
	});
});

const enharmonicLi = document.querySelectorAll('.enharmonic-li');
enharmonicLi.forEach(li => {
	li.addEventListener('click', () => {
		const note = li.getAttribute('data-note');
		AudioManager.playNoteWithDuration(note, 0.5);
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