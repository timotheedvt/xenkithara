class MainNav extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.setupAudioToggle();
    }

    setupAudioToggle() {
        const toggle = this.shadowRoot.getElementById('audio-toggle');

        // Synchronize UI with current AudioManager state
        const updateUI = () => {
            const isMuted = localStorage.getItem('audioMuted') === 'true';
            toggle.classList.toggle('muted', isMuted);
            toggle.innerHTML = isMuted ? '<i class="fa fa-volume-off"></i>' : '<i class="fa fa-volume-up"></i>';

            if (window.AudioManager && window.AudioManager.state.masterGain) {
                // Set gain to 0 if muted, otherwise restore to standard 0.7
                const targetGain = isMuted ? 0 : 0.7;
                window.AudioManager.state.masterGain.gain.setValueAtTime(
                    targetGain,
                    window.AudioManager.state.audioContext?.currentTime || 0
                );
            }
        };

        toggle.addEventListener('click', () => {
            const currentlyMuted = localStorage.getItem('audioMuted') === 'true';
            localStorage.setItem('audioMuted', !currentlyMuted);
            updateUI();
        });

        // Initial UI check
        updateUI();
    }

    render() {
        const root = this.getAttribute('root-path') || './';
        const activeTab = this.getAttribute('active-tab');

        this.shadowRoot.innerHTML = `
        <style>
            :host {
                display: block;
                width: 100%;
                background: var(--bg-nav);
                border-bottom: 1px solid var(--accent-blue);
                position: sticky;
                top: 0;
                z-index: var(--level-5); /* Ensure it stays above everything */
            }
            .nav-container {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 5px 15px;
                position: relative;
            }
            .nav-left, .nav-right {
                display: flex;
                flex: 1;
                align-items: center;
            }
            .nav-left {
                justify-content: flex-start;
            }
            .nav-right {
                justify-content: flex-end;
            }
            .nav-links {
                display: flex;
                justify-content: center;
                align-items: center;
                gap: 10px;
                flex-wrap: wrap;
            }
            .brand-name {
                font-size: 1.2em;
                font-weight: 800;
                color: var(--accent-blue);
                white-space: nowrap;
            }
            .nav-btn {
                background: none;
                border: none;
                color: var(--text-white);
                padding: 10px 15px;
                cursor: pointer;
                font-weight: 600;
                transition: all 0.3s;
                border-bottom: 2px solid transparent;
                text-decoration: none;
                font-family: 'Inter', sans-serif;
                font-size: 13px; /* Slightly smaller for mobile */
                white-space: nowrap;
            }
            .nav-btn:hover, .nav-btn.active {
                color: var(--accent-blue);
                border-bottom: 2px solid var(--accent-blue);
            }
            #audio-toggle {
                background: var(--glass);
                border: 1px solid var(--accent-blue);
                color: var(--accent-blue);
                width: 35px;
                height: 35px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                flex-shrink: 0; /* Prevents button from squishing */
                transition: all 0.3s ease;
            }
            #audio-toggle.muted {
                border-color: var(--accent-red);
                color: var(--accent-red);
                opacity: 0.6;
            }
            #audio-toggle:hover {
                transform: scale(1.1);
                background: var(--glass);
            }
            /* Mobile Adjustments */
            @media (max-width: 850px) {
                .nav-container {
                    flex-direction: column;
                    gap: 10px;
                    padding-top: 10px;
                }
                .nav-left {
                    justify-content: center;
                }
                .nav-right {
                    position: absolute;
                    top: 10px;
                    right: 15px;
                }
            }
            @media (max-width: 600px) {
                .nav-links {
                    gap: 5px;
                }
                .nav-btn {
                    padding: 8px 10px;
                    font-size: 11px;
                }
            }
        </style>
        <nav class="main-nav">
            <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
            <div class="nav-container">
                <div class="nav-left">
                    <span class="brand-name"><a style="text-decoration:none; color: var(--accent-blue);" href="${root}index.html">XenKithara</a></span>
                </div>
                <div class="nav-links">
                    <a href="${root}tools/harmonic_interface/index.html" class="nav-btn ${activeTab === 'harmonic' ? 'active' : ''}">Harmonic Interface</a>
                    <a href="${root}tools/modes_scales/index.html" class="nav-btn ${activeTab === 'modes' ? 'active' : ''}">Scales & modes</a>
                    <a href="${root}tools/12-edo/index.html" class="nav-btn ${activeTab === 'mindmap' ? 'active' : ''}">12-EDO theory</a>
                    <a href="${root}tools/24-edo/index.html" class="nav-btn ${activeTab === '24edo' ? 'active' : ''}">24-EDO theory</a>
                </div>
                <div class="nav-right">
                    <button id="audio-toggle" title="Toggle Sound">
                        <i class="fa fa-volume-up"></i>
                    </button>
                </div>
            </div>
        </nav>
        `;
    }
}

customElements.define('main-nav', MainNav);