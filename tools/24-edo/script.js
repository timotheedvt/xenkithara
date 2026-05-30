function showTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(tabId).classList.add('active');
    document.getElementById(tabId + '-btn').classList.add('active');
    if (event && event.currentTarget) {
        event.currentTarget.classList.add('active');
    }
    const url = new URL(window.location);
    url.searchParams.set('page', tabId);
    window.history.pushState({}, '', url);
}

if (window.location) {
    const url = new URL(window.location);
    const tab = url.searchParams.get('page');
    if (tab) {
        showTab(tab);
    } else {
        showTab('fundamentals');
    }
}

const scaleLi = document.querySelectorAll('.scale-li');
scaleLi.forEach(li => {
    li.addEventListener('click', async () => {
        const text = li.innerHTML.trim();
        const scaleAttr = li.getAttribute('data-scale');

        if (scaleAttr === "chromatic") {
            const baseFreq = 261.63; // C4
            for (let i = 0; i < 24; i++) {
                const freq = baseFreq * Math.pow(2, i / 24);
                AudioManager.playNoteWithDuration(freq, 0.2);
                await new Promise(resolve => setTimeout(resolve, 250));
            }
        } else {
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
    const rootSel = document.getElementById('dynamic-root-24');
    const modeSel = document.getElementById('dynamic-mode-24');
    const playBtn = document.getElementById('play-dynamic-scale-24');
    const notesContainer = document.getElementById('dynamic-scale-notes-24');
    const keyboard = document.getElementById('global-keyboard-24');
    const listsContainer = document.getElementById('scales-lists-24');

    if (rootSel && modeSel && playBtn && notesContainer) {
        rootSel.innerHTML = TheoryEngine.base_notes_24.map(n => `<option value="${n}">${n}</option>`).join('');

        let optionsHtml = '';
        for (const [category, scales] of Object.entries(TheoryEngine.modes_24_categories)) {
            optionsHtml += `<optgroup label="${category}">`;
            scales.forEach(scale => {
                optionsHtml += `<option value="${scale}">${scale}</option>`;
            });
            optionsHtml += `</optgroup>`;
        }
        modeSel.innerHTML = optionsHtml;

        const updateDynamicScale = () => {
            const r = rootSel.value;
            const m = modeSel.value;
            const notes = TheoryEngine.getScale24(r, m);
            if (notes.length > 0) notes.push(notes[0]);
            if (notes.length > 1 && notes[notes.length - 1] === notes[notes.length - 2])
                notes.pop();

            notesContainer.innerHTML = notes.map(n => {
                n = n
                    .replace("d", "<sup>d</sup>")
                    .replace("‡", "<sup>‡</sup>")
                    .replace("b", "<sup>b</sup>")
                    .replace("#", "<sup>#</sup>")
                return `<span style="background: var(--bg-dark); padding: 10px 15px; border-radius: 8px; font-weight: bold; color: var(--accent-blue); border: 1px solid var(--glass); box-shadow: 0 4px 10px rgba(0,0,0,0.2);">
                                ${n}
                            </span>`
            }).join('');

            keyboard.setAttribute('keys', notes.join(' - '));
        };

        let highlightId = 0;
        rootSel.addEventListener('change', updateDynamicScale);
        modeSel.addEventListener('change', updateDynamicScale);
        playBtn.addEventListener('click', async () => {
            if (!window.AudioManager) return;
            const duration = 0.25;
            AudioManager.playScale24(rootSel.value, modeSel.value, duration);

            const currentHighlightId = ++highlightId;
            const spans = notesContainer.querySelectorAll('span');

            // Reset styling before starting new highlight
            spans.forEach(s => {
                s.style.backgroundColor = 'var(--bg-dark)';
                s.style.color = 'var(--accent-blue)';
                s.style.transform = 'scale(1)';
            });

            for (let i = 0; i < spans.length; i++) {
                if (currentHighlightId !== highlightId) break;

                if (spans[i]) {
                    spans[i].style.transition = 'all 0.1s ease';
                    spans[i].style.backgroundColor = 'var(--accent-blue)';
                    spans[i].style.color = 'var(--bg-dark)';
                    spans[i].style.transform = 'scale(1.1)';
                }
                await new Promise(r => setTimeout(r, duration * 1000));
                if (currentHighlightId !== highlightId) break;
                if (spans[i]) {
                    spans[i].style.backgroundColor = 'var(--bg-dark)';
                    spans[i].style.color = 'var(--accent-blue)';
                    spans[i].style.transform = 'scale(1)';
                }
            }
        });

        updateDynamicScale();

        const alph = "abcdefghijklmnopqrstuvwxyz"
        let i = 0;
        for (const [category, scales] of Object.entries(TheoryEngine.modes_24_categories)) {
            const card = document.createElement('div');
            card.className = 'card';
            const isHeptatonic = category.includes('Heptatonic');
            let listHtml = `<ul class="interval-list-2" ${isHeptatonic ? 'style="column-count: 2; column-gap: 20px;"' : ''}>`;
            scales.forEach(scale => {
                const intervals = TheoryEngine.modes_24[scale].join(' - ');
                listHtml += `<li class="playable-scale" data-scale="${scale}" title="Play ${scale}" ${isHeptatonic ? 'style="break-inside: avoid; margin-bottom: 8px;"' : ''}><strong>${scale}:</strong> ${intervals}</li>`;
            });
            listHtml += `</ul>`;
            card.style.gridArea = alph[i];
            i++;

            const parts = category.split(' (');
            const catName = parts[0];
            const numNotes = parts.length > 1 ? parts[1].replace(')', '') : '';

            card.innerHTML = `
                        <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 12px;">
                            <h3 style="margin-bottom: 0;">${catName} Scales</h3>
                            <span style="font-size: 0.85em; font-weight: bold; color: var(--text-muted); background: var(--glass); padding: 4px 8px; border-radius: 6px; border: 1px solid var(--glass);">${numNotes} Notes</span>
                        </div>
                        ${listHtml}
                    `;
            listsContainer.appendChild(card);
        }

        // Add click events to all the generated scales
        document.querySelectorAll('.playable-scale').forEach(li => {
            li.addEventListener('click', () => {
                modeSel.value = li.getAttribute('data-scale');
                updateDynamicScale();

                window.scrollTo(0, 0);
                playBtn.click(); // Trigger the play and visual highlight in the explorer
            });
        });
    }
});