class GuitarFretboard extends HTMLElement {
    static get observedAttributes() {
        return ['strings', 'tuning', 'notes', 'width', 'height', 'is24edo'];
    }

    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.hitboxes = [];
    }

    attributeChangedCallback() {
        this.render();
    }

    connectedCallback() {
        this.render();
    }

    render() {
        const stringsCount = parseInt(this.getAttribute('strings')) || 6;
        const tuning = (this.getAttribute('tuning') || "EADGBE").toUpperCase();
        const activeNotes = (this.getAttribute('notes') || "").split(/[\s,]+/).filter(n => n);
        const width = parseInt(this.getAttribute('width')) || 800;
        const height = parseInt(this.getAttribute('height')) || 250;
        const is24edo = this.getAttribute('is24edo') === 'true';

        this.fretToDraw = is24edo ? [0, 10, 14, 18, 24] :[0, 5, 7, 9, 12];
        this.notesArr = is24edo
            ? TheoryEngine.base_notes_24
            : TheoryEngine.base_notes_12;

        this.shadowRoot.innerHTML = `
            <style>
                :host { display: block; width: 100%; }
                canvas { width: 100%; height: auto; display: block; }
            </style>
            <canvas id="fretboard" width="${width}" height="${height}"></canvas>
        `;

        const canvas = this.shadowRoot.getElementById('fretboard');
        const ctx = canvas.getContext('2d');
        this.hitboxes = []; // Reset hitboxes before rendering
        this.drawFretboard(ctx, width, height, stringsCount, tuning, activeNotes, is24edo);

        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const mouseX = (e.clientX - rect.left) * scaleX;
            const mouseY = (e.clientY - rect.top) * scaleY;
            const isHover = this.hitboxes.some(hit => Math.sqrt((mouseX - hit.x)**2 + (mouseY - hit.y)**2) <= hit.radius);
            canvas.style.cursor = isHover ? 'pointer' : 'default';
        });

        canvas.addEventListener('click', (e) => {
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const mouseX = (e.clientX - rect.left) * scaleX;
            const mouseY = (e.clientY - rect.top) * scaleY;
            this.hitboxes.forEach(hit => {
                const dist = Math.sqrt((mouseX - hit.x)**2 + (mouseY - hit.y)**2);
                if (dist <= hit.radius && window.AudioManager) {
                    AudioManager.playNoteWithDuration(hit.note, 0.5);
                }
            });
        });
    }

    drawFretboard(ctx, w, h, stringsCount, tuning, activeNotes, is24edo) {
        const offsetX = 40;
        const offsetY = 20;
        const boardWidth = w - (offsetX * 2);
        const boardHeight = h - (offsetY * 2);
        const spaceBetweenStrings = boardHeight / (stringsCount - 1);
        const fretCount = is24edo ? 30 : 15;
        const spaceBetweenFrets = boardWidth / fretCount;
        const edo = (is24edo ? 24 : 12)

        // Draw strings and frets
        ctx.strokeStyle = "#AEB2B2";
        ctx.lineWidth = 1;

        for (let i = 0; i < stringsCount; i++) {
            let y = offsetY + (i * spaceBetweenStrings);
            ctx.beginPath();
            ctx.moveTo(offsetX, y);
            ctx.lineTo(w - offsetX, y);
            ctx.stroke();
        }

        for (let i = 0; i <= fretCount; i++) {
            let x = offsetX + (i * spaceBetweenFrets);
            ctx.lineWidth = i === 0 ? 4 : 1;
            ctx.beginPath();
            ctx.moveTo(x, offsetY);
            ctx.lineTo(x, h - offsetY);
            ctx.stroke();

            // Fret markers
            if (this.fretToDraw.includes(i % edo) && i !== 0) {
                ctx.fillStyle = "#AEB2B2";
                let midX = x - (is24edo ? spaceBetweenFrets : (spaceBetweenFrets / 2));
                let midY = offsetY + (boardHeight / 2);
                ctx.beginPath();
                if (i % edo === 0) { // Double dot for octave
                    ctx.arc(midX, midY - spaceBetweenStrings, 4, 0, Math.PI * 2);
                    ctx.arc(midX, midY + spaceBetweenStrings, 4, 0, Math.PI * 2);
                } else {
                    ctx.arc(midX, midY, 4, 0, Math.PI * 2);
                }
                ctx.fill();
            }
        }

        // Draw Active Notes
        activeNotes.forEach(note => {
            const targetIdx = this.notesArr.indexOf(note);
            if (targetIdx === -1) return;

            for (let sIdx = 0; sIdx < stringsCount; sIdx++) {
                // Tuning is typically defined from high string to low or low to high.
                // We assume standard index: tuning[0] is bottom visual string.
                let openNote = tuning[stringsCount - 1 - sIdx] || "E";
                let startIdx = this.notesArr.indexOf(openNote);
                let fret = (targetIdx - startIdx + edo) % edo;

                const radius = spaceBetweenFrets / 3.5;
                const drawNote = (f, xOffset = 0) => {
                    let x = offsetX + (f * spaceBetweenFrets) - (f === 0 ? 0 : spaceBetweenFrets / 2) + xOffset;
                    let y = offsetY + (sIdx * spaceBetweenStrings);

                    this.hitboxes.push({ x, y, radius, note });

                    ctx.beginPath();
                    ctx.fillStyle = "#6F8FF0"; // --accent-blue
                    ctx.arc(x, y, radius, 0, Math.PI * 2);
                    ctx.fill();

                    ctx.fillStyle = "#1C1C1C"; // --bg-dark
                    ctx.font = `bold ${radius}px Inter`;
                    ctx.textAlign = "center";
                    ctx.textBaseline = "middle";
                    ctx.fillText(note, x, y + 1);
                };

                drawNote(fret);
                if (fret <= 3) drawNote(fret + edo); // Show repeats at high frets
            }
        });
    }

    update() {
        this.render();
    }
}

customElements.define('guitar-fretboard', GuitarFretboard);