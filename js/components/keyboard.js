class CustomKeyboard extends HTMLElement {
  static get observedAttributes() {
    return ['height', 'width', 'keys', 'showNames', 'is24edo', 'layout'];
  }

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.defaultKeys = [
      { note: 'C', type: "white" },
      { note: 'C‡', type: "grey" },
      { note: 'C#', type: "black" },
      { note: 'Dd', type: "grey" },
      { note: 'D', type: "white" },
      { note: 'D‡', type: "grey" },
      { note: 'D#', type: "black" },
      { note: 'Ed', type: "grey" },
      { note: 'E', type: "white" },
      { note: 'E‡', type: "grey" },
      { note: 'F', type: "white" },
      { note: 'F‡', type: "grey" },
      { note: 'F#', type: "black" },
      { note: 'Gd', type: "grey" },
      { note: 'G', type: "white" },
      { note: 'G‡', type: "grey" },
      { note: 'G#', type: "black" },
      { note: 'Ad', type: "grey" },
      { note: 'A', type: "white" },
      { note: 'A‡', type: "grey" },
      { note: 'A#', type: "black" },
      { note: 'Bd', type: "grey" },
      { note: 'B', type: "white" },
      { note: 'B‡', type: "grey" },
      { note: 'Cd', type: "grey" }
    ];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (oldValue !== newValue) {
      this.render();
    }
  }

  connectedCallback() {
    this.render();
  }

  render() {
    // Read attributes or default values
    const height = this.getAttribute('height') || '70px';
    const width = this.getAttribute('width') || '100%';
    const is24edo = this.getAttribute('is24edo') === 'true';
    const showNames = this.getAttribute('showNames') || false;
    const layout = this.getAttribute('layout') || 'piano';
    let keysAttr = (this.getAttribute('keys') || '')
      .replace(" - ", " ")
      .replace("Db", "C#")
      .replace("Eb", "D#")
      .replace("Gb", "F#")
      .replace("Ab", "G#")
      .replace("Bb", "A#")
      .replace("Cd", "B‡")

    let keysToHighlight = [];

    if (keysAttr) {
      // Parse keys attribute (comma/space separated notes)
      const requestedNotes = keysAttr.split(/[\s,]+/).map(k => {
        try {
          const num = parseInt(k);
          if (!isNaN(num)) {
            const noteName = this.defaultKeys[num % this.defaultKeys.length].note;
            return noteName;
          }
        } catch (e) {
          // Ignore parse errors
        }
        return k.trim();
      });
      // Get keys to highlight by filtering
      keysToHighlight = this.defaultKeys.filter(k => requestedNotes.includes(k.note)).map(k => k.note);
    }

    if (layout === 'isomorphic') {
      const notesList = this.defaultKeys.map(k => k.note).slice(0, 24);
      // Standard Wicki-Hayden intervals
      const rightStep = 4;
      const upRightStep = 7;
      const totalNotes = 24;

      const numRows = 11;
      const numCols = 11;
      const baseNoteIndex = 0; // C

      const W = 100 / (numCols + 0.5);
      const H = 100 / (numRows * 0.75 + 0.25);

      let hexesHtml = '';
      for (let r = 0; r < numRows; r++) {
        for (let c = 0; c < numCols; c++) {
          let noteIdx = (baseNoteIndex + c * rightStep + r * upRightStep) % totalNotes;
          if (noteIdx < 0) noteIdx += totalNotes;
          const noteName = notesList[noteIdx];
          const highlightClass = keysToHighlight.includes(noteName) ? 'highlight' : '';

          const keyInfo = this.defaultKeys.find(k => k.note === noteName);
          const keyType = keyInfo ? keyInfo.type : 'white';

          const left = c * W + (r % 2) * (W / 2);
          const bottom = r * 75 * (H / 100);

          const noteToDisplay = showNames ? noteName.replace('^', '↑').replace('v', '↓') : '';
          const noteIndex = notesList.indexOf(noteName);
          const hue = (noteIndex * 360) / totalNotes;

          hexesHtml += `<div class="hex-outer" style="left: ${left}%; bottom: ${bottom}%; width: ${W}%; height: ${H}%;">
              <div class="hex-inner ${keyType} ${highlightClass}" data-note="${noteName}" style="--hex-bg: hsl(${hue}, 40%, 65%); --hex-bg-dark: hsl(${hue}, 40%, 45%);">
                  <span>${noteToDisplay}</span>
              </div>
          </div>`;
        }
      }

      const isoStyle = `
        <style>
          .keyboard {
            position: relative;
            width: ${width};
            height: ${height};
            background: transparent;
            border-radius: 6px;
            user-select: none;
            box-sizing: border-box;
            container-type: size;
            overflow: hidden;
          }
          .hex-outer {
            position: absolute;
            clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
            background: #222;
          }
          .hex-inner {
            position: absolute;
            top: 2%; left: 2%;
            width: 96%;
            height: 96%;
            clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
            display: flex;
            justify-content: center;
            align-items: center;
            font-family: monospace, sans-serif;
            font-weight: bold;
            font-size: max(8px, 9cqh);
            cursor: pointer;
            transition: filter 0.2s, background 0.2s, color 0.2s;
            background: linear-gradient(to bottom, var(--hex-bg), var(--hex-bg-dark));
            color: #fff;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.8);
          }
          .hex-inner span {
            pointer-events: none;
          }

          .hex-inner.highlight {
            background: var(--accent-blue);
            color: var(--text-dark);
            text-shadow: none;
          }
          .hex-inner:hover {
            filter: brightness(1.2);
          }
        </style>
      `;

      this.shadowRoot.innerHTML = `
        ${isoStyle}
        <div class="keyboard isomorphic">
          ${hexesHtml}
        </div>
      `;

      const keyboardNode = this.shadowRoot.querySelector('.keyboard');
      keyboardNode.addEventListener('click', (e) => {
        const hex = e.target.closest('.hex-inner');
        if (hex && window.AudioManager) {
          const note = hex.getAttribute('data-note');
          if (note) AudioManager.playNoteWithDuration(note, 0.25);
        } else if (window.AudioManager && keysToHighlight.length > 0) {
          keysToHighlight.forEach(note => {
            AudioManager.playNoteWithDuration(note, 0.25);
          });
        }
      });
      return;
    }

    const style = `
      <style>
        .keyboard {
          position: relative;
          width: ${width};
          height: ${height};
          background: #fff;
          border: 1px solid #999;
          border-radius: 6px;
          user-select: none;
          box-sizing: border-box;
          display: flex;
          container-type: size;
        }
        .white-key {
          flex: 1;
          border: 1px solid #999;
          border-right: none;
          height: 100%;
          background: linear-gradient(to bottom, #fff, #ccc);
          box-shadow:
            inset 0 0 5px #ddd,
            0 2px 5px rgba(0,0,0,0.15);
          position: relative;
          z-index: var(--level-0);
          display: flex;
          justify-content: center;
          align-items: flex-end;
          font-family: monospace, sans-serif;
          font-weight: bold;
          color: #333;
          font-size: max(10px, 14cqh);
          box-sizing: border-box;
          transition: background-color 0.3s, color 0.3s;
        }
        .white-key[data-note="C"] {
          border-radius: 6px 0 0 6px;
        }
        .white-key[data-note="B"] {
          border-radius: 0 6px 6px 0;
        }
        .white-key span {
          font-size: 1em;
          margin-bottom: 4cqh;
        }
        .black-key {
          position: absolute;
          --black-width: calc(${width} / ${this.defaultKeys.filter(k => k.type == "white").length} * 0.6);
          width: var(--black-width);
          height: ${is24edo ? '50%' : '60%'};
          background: linear-gradient(to bottom, #333, #000);
          border-radius: 0 0 4px 4px;
          border: 1px solid #222;
          box-shadow:
            inset 0 1px 2px rgba(255,255,255,0.2),
            0 2px 5px rgba(0,0,0,0.6);
          z-index: var(--level-1);
          top: 0;
          transition: background-color 0.3s;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }
        .black-key span {
          font-size: max(8px, 12cqh);
          margin-bottom: 4cqh;
        }
        .grey-key {
          position: absolute;
          width: calc(${width} / ${this.defaultKeys.filter(k => k.type == "white").length} * 0.6 / 1.4);
          height: 73%;
          background: linear-gradient(to bottom, #777, #555);
          border-radius: 0 0 4px 4px;
          border: 1px solid #222;
          box-shadow:
            inset 0 1px 2px rgba(255,255,255,0.2),
            0 2px 5px rgba(0,0,0,0.6);
          z-index: var(--level-1);
          top: 0;
          transition: background-color 0.3s;
          display: flex;
          flex-direction: column;
        }
        .grey-key span {
          color: var(--text-white);
          font-size: max(7px, 10cqh);
          align-self: center;
          margin-top: auto;
          margin-bottom: 4cqh;
        }
        .grey-key[data-note="E‡"] span,
        .grey-key[data-note="B‡"] span,
        .grey-key[data-note="Cd"] span {
          margin-top: auto;
          margin-bottom: auto;
        }
        .grey-key[data-note="Cd"] {
          border-radius: 6px 0 6px 0;
          width: calc(${width} / ${this.defaultKeys.filter(k => k.type == "white").length} * 0.6 / 1.4 * 0.5);
        }
        .grey-key[data-note="B‡"] {
          border-radius: 0px 6px 0px 6px;
          width: calc(${width} / ${this.defaultKeys.filter(k => k.type == "white").length} * 0.6 / 1.4 * 0.5);
        }
        /* Highlight styles */
        .white-key.highlight {
          background: var(--accent-blue);
          box-shadow:
            inset 0 0 3px  var(--accent-yellow),
            0 2px 10px var(--accent-yellow);
        }
        .black-key.highlight {
          background: var(--accent-blue);
          box-shadow:
            inset 0 0 3px var(--accent-yellow),
            0 2px 12px var(--accent-yellow);
          color: var(--text-dark);
        }
        .grey-key.highlight {
          background: var(--accent-blue);
          box-shadow:
            inset 0 0 3px var(--accent-yellow),
            0 2px 12px var(--accent-yellow);
        }
        .grey-key.highlight span {
          color:  var(--text-dark);
        }
      </style>
    `;

    const blackKeyOffsets = {
      'C#': 0.7,
      'D#': 1.7,
      'F#': 3.7,
      'G#': 4.7,
      'A#': 5.7
    };

    const whiteKeyCount = this.defaultKeys.filter(k => k.type == "white").length;

    // Construct white keys html
    const whiteKeysHtml = this.defaultKeys
      .filter(k => k.type == "white")
      .map(k => {
        const highlightClass = keysToHighlight.includes(k.note) ? 'highlight' : '';
        return `<div class="white-key ${highlightClass}" data-note="${k.note}"><span>${showNames ? k.note : ''}</span></div>`;
      }).join('');

    // Construct black keys html
    const blackKeysHtml = this.defaultKeys
      .filter(k => k.type == "black" && blackKeyOffsets.hasOwnProperty(k.note))
      .map(k => {
        const highlightClass = keysToHighlight.includes(k.note) ? 'highlight' : '';
        const leftPercent = (blackKeyOffsets[k.note] / whiteKeyCount) * 100;
        return `<div class="black-key ${highlightClass}" style="left: calc(${leftPercent}%);" data-note="${k.note}"><span>${showNames ? k.note : ''}</span></div>`;
      }).join('');

    let greyKeysHtml = '';
    if (is24edo) {
      const greyKeyOffsets = {
        'C‡': 0.55,
        'Dd': 1,
        'D‡': 1.55,
        'Ed': 2,
        'E‡': 2.8,
        'F‡': 3.55,
        'Gd': 4,
        'G‡': 4.55,
        'Ad': 5,
        'A‡': 5.55,
        'Bd': 6,
        'B‡': 6.75,
        'Cd': 0,
      }
      greyKeysHtml = this.defaultKeys
        .filter(k => k.type == "grey" && greyKeyOffsets.hasOwnProperty(k.note))
        .map(k => {
          const highlightClass = keysToHighlight.includes(k.note) ? 'highlight' : '';
          const leftPercent = (greyKeyOffsets[k.note] / whiteKeyCount) * 100;
          const noteToDisplay = k.note.replace('^', '↑').replace('v', '↓');
          return `<div class="grey-key ${highlightClass}" style="left: calc(${leftPercent}%);" data-note="${k.note}"><span>${showNames ? noteToDisplay : ''}</span></div>`;
        }).join('');
    }

    this.shadowRoot.innerHTML = `
      ${style}
      <div class="keyboard">
        ${whiteKeysHtml}
        ${is24edo ? greyKeysHtml : ''}
        ${blackKeysHtml}
      </div>
    `;

    const keyboardNode = this.shadowRoot.querySelector('.keyboard');
    if (keysToHighlight.length > 0) {
      keyboardNode.style.cursor = 'pointer';
      keyboardNode.title = 'Play highlighted notes';
    }
    keyboardNode.addEventListener('click', () => {
      if (window.AudioManager && keysToHighlight.length > 0) {
        keysToHighlight.forEach(note => {
          AudioManager.playNoteWithDuration(note, 0.25);
        });
      }
    });
  }
}

customElements.define('custom-keyboard', CustomKeyboard);
