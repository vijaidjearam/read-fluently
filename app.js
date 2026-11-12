/**
 * Main Application Controller for ReadFluently
 * Supports English & French, Speech Recognition, and Text-to-Speech Voice Selection.
 */

class ReadFluentlyApp {
    constructor() {
        window.app = this;
        this.speechEngine = new ReadingSpeechEngine();
        this.currentDoc = null; // { title, text, questions, lang, targetWpm }
        this.currentMode = 'library'; // 'library' | 'paste' | 'upload'
        this.activeTab = 'reading'; // 'reading' | 'progress' | 'profiles'
        this.isReadAlongPlaying = false;
        this.wordElements = [];

        // Low-latency word highlight tracking
        this.lastHighlightedWordIndex = -1;
        this.currentActiveReadAlongIndex = -1;
        this.lastScrollTime = 0;
        this.highlightCascadeTimeouts = [];

        this.init();
    }

    init() {
        // Initialize storage
        window.storageManager.init();

        // Initialize i18n
        const lang = window.i18n ? window.i18n.getLang() : 'en';
        window.audioManager.setLanguage(lang);
        this.speechEngine.setLanguage(lang);

        // Apply translations
        if (window.i18n) {
            window.i18n.applyTranslations();
        }

        // Setup speech engine callbacks
        this.setupSpeechCallbacks();

        // Setup DOM event listeners
        this.setupEventListeners();

        // Update profile header
        this.updateProfileHeader();

        // Render story library grid for active language
        this.renderStoryLibrary();

        // Load initial story from library in active language
        const storiesInLang = window.STORY_LIBRARY.filter(s => s.lang === lang);
        this.loadStory(storiesInLang[0] || window.STORY_LIBRARY[0]);

        // Setup accessibility & voice settings from localStorage
        this.loadAccessibilitySettings();
    }

    onLanguageChanged(lang) {
        this.speechEngine.setLanguage(lang);
        window.audioManager.setLanguage(lang);

        // Re-render story library
        this.renderStoryLibrary();

        // If currently viewing a library story in another language, switch to current language story
        if (this.currentDoc && this.currentDoc.lang && this.currentDoc.lang !== lang) {
            const storiesInLang = window.STORY_LIBRARY.filter(s => s.lang === lang);
            if (storiesInLang.length > 0) {
                this.loadStory(storiesInLang[0]);
            }
        } else if (this.currentDoc) {
            this.renderReadingArea();
        }

        // Re-render active tab if needed
        if (this.activeTab === 'progress') {
            this.renderProgressDashboard();
        } else if (this.activeTab === 'profiles') {
            this.renderProfilesManager();
        }

        this.updateProfileHeader();
    }

    setupSpeechCallbacks() {
        // Word matched live in real-time
        this.speechEngine.onWordMatched = (index, wordToken, currentWpm) => {
            this.highlightWordSmooth(index);
            if (window.audioManager) {
                window.audioManager.playWordChime();
            }
        };

        // Real-time progress and WPM ticker
        this.speechEngine.onProgress = (currentIndex, totalWords, currentWpm, percent) => {
            this.updateLiveMetrics(currentIndex, totalWords, currentWpm, percent);
        };

        // Status change
        this.speechEngine.onStatusChange = (status, message) => {
            this.updateMicStatusUI(status, message);
        };

        // Reading finished
        this.speechEngine.onFinished = (summary) => {
            this.handleReadingComplete(summary);
        };
    }

    setupEventListeners() {
        // Language Toggle Button (English / French)
        const btnLang = document.getElementById('btn-lang-toggle');
        if (btnLang) {
            btnLang.addEventListener('click', () => {
                if (window.i18n) {
                    window.i18n.toggleLang();
                    if (window.audioManager) {
                        window.audioManager.playTick();
                    }
                }
            });
        }

        // Voice Selector dropdown
        const selectVoice = document.getElementById('select-tts-voice');
        if (selectVoice) {
            selectVoice.addEventListener('change', (e) => {
                window.audioManager.setVoiceByURI(e.target.value);
            });
        }

        // Voice Gender selector dropdown
        const selectGender = document.getElementById('select-voice-gender');
        if (selectGender) {
            const savedGender = localStorage.getItem('rf_selected_gender') || 'auto';
            selectGender.value = savedGender;
            selectGender.addEventListener('change', (e) => {
                window.audioManager.setGender(e.target.value);
            });
        }

        // Voice Test Button
        const btnTestVoice = document.getElementById('btn-test-voice');
        if (btnTestVoice) {
            btnTestVoice.addEventListener('click', () => {
                window.audioManager.testCurrentVoice();
            });
        }

        // Nav tabs
        document.querySelectorAll('.nav-tab').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Reading Input Mode Buttons
        document.querySelectorAll('.input-mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const mode = e.currentTarget.dataset.mode;
                this.switchInputMode(mode);
            });
        });

        // Mic Start/Pause/Stop Buttons
        const btnMic = document.getElementById('btn-mic-toggle');
        if (btnMic) {
            btnMic.addEventListener('click', () => this.toggleMicrophone());
        }

        const btnFinishEarly = document.getElementById('btn-finish-early');
        if (btnFinishEarly) {
            btnFinishEarly.addEventListener('click', () => {
                const isFr = window.i18n && window.i18n.getLang() === 'fr';
                const confirmMsg = isFr ? "Es-tu prêt à terminer la lecture et à faire le quiz de compréhension ?" : "Are you ready to finish reading and check your comprehension?";
                if (confirm(confirmMsg)) {
                    this.speechEngine.finishReading();
                }
            });
        }

        const btnReadAlong = document.getElementById('btn-read-along');
        if (btnReadAlong) {
            btnReadAlong.addEventListener('click', () => this.toggleReadAlong());
        }

        const btnResetReading = document.getElementById('btn-reset-reading');
        if (btnResetReading) {
            btnResetReading.addEventListener('click', () => this.resetCurrentReading());
        }

        // Paste Text Button
        const btnLoadPasted = document.getElementById('btn-load-pasted');
        if (btnLoadPasted) {
            btnLoadPasted.addEventListener('click', () => this.handlePastedText());
        }

        // PDF Upload Input
        const fileInput = document.getElementById('pdf-file-input');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileUpload(e.target.files[0]));
        }

        // Drop Zone for PDF
        const dropZone = document.getElementById('pdf-drop-zone');
        if (dropZone) {
            ['dragenter', 'dragover'].forEach(eventName => {
                dropZone.addEventListener(eventName, (e) => {
                    e.preventDefault();
                    dropZone.classList.add('drag-active');
                });
            });
            ['dragleave', 'drop'].forEach(eventName => {
                dropZone.addEventListener(eventName, (e) => {
                    e.preventDefault();
                    dropZone.classList.remove('drag-active');
                });
            });
            dropZone.addEventListener('drop', (e) => {
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    this.handleFileUpload(e.dataTransfer.files[0]);
                }
            });
        }

        // Profile switcher button in header
        const btnProfileHeader = document.getElementById('btn-profile-header');
        if (btnProfileHeader) {
            btnProfileHeader.addEventListener('click', () => this.switchTab('profiles'));
        }

        // Text File Import in Profiles Tab
        const profileFileInput = document.getElementById('profile-file-input');
        if (profileFileInput) {
            profileFileInput.addEventListener('change', (e) => this.handleProfileFileImport(e.target.files[0]));
        }

        // Profile Modal Form
        const newProfileForm = document.getElementById('form-create-profile');
        if (newProfileForm) {
            newProfileForm.addEventListener('submit', (e) => this.handleCreateProfile(e));
        }

        // Accessibility controls
        const fontToggle = document.getElementById('toggle-dyslexia-font');
        if (fontToggle) {
            fontToggle.addEventListener('change', (e) => this.setDyslexiaFont(e.target.checked));
        }

        const fontSizeSelect = document.getElementById('select-font-size');
        if (fontSizeSelect) {
            fontSizeSelect.addEventListener('change', (e) => this.setFontSize(e.target.value));
        }

        const soundToggle = document.getElementById('toggle-sound');
        if (soundToggle) {
            soundToggle.addEventListener('change', (e) => {
                window.audioManager.setSoundEnabled(e.target.checked);
                localStorage.setItem('rf_sound_enabled', e.target.checked);
            });
        }

        const readingRulerToggle = document.getElementById('toggle-reading-ruler');
        if (readingRulerToggle) {
            readingRulerToggle.addEventListener('change', (e) => this.toggleReadingRuler(e.target.checked));
        }

        // Window resize re-renders charts
        window.addEventListener('resize', () => {
            if (this.activeTab === 'progress') {
                this.renderProgressDashboard();
            }
        });
    }

    // -------------------------------------------------------------
    // NAVIGATION & TAB SWITCHING
    // -------------------------------------------------------------

    switchTab(tabId) {
        this.activeTab = tabId;

        // Stop any active reading mic or speech synthesis
        if (this.speechEngine.isListening) {
            this.speechEngine.pause();
        }
        if (this.isReadAlongPlaying) {
            this.toggleReadAlong();
        }

        document.querySelectorAll('.nav-tab').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tabId);
        });

        document.querySelectorAll('.tab-view').forEach(view => {
            view.classList.toggle('active', view.id === `view-${tabId}`);
        });

        if (tabId === 'progress') {
            this.renderProgressDashboard();
        } else if (tabId === 'profiles') {
            this.renderProfilesManager();
        }
    }

    switchInputMode(mode) {
        this.currentMode = mode;
        document.querySelectorAll('.input-mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });

        document.getElementById('mode-library-panel').classList.toggle('hidden', mode !== 'library');
        document.getElementById('mode-paste-panel').classList.toggle('hidden', mode !== 'paste');
        document.getElementById('mode-upload-panel').classList.toggle('hidden', mode !== 'upload');

        if (mode === 'library') {
            this.renderStoryLibrary();
        }
    }

    // -------------------------------------------------------------
    // READING ROOM & TEXT RENDERING
    // -------------------------------------------------------------

    loadStory(story) {
        this.currentDoc = {
            id: story.id,
            lang: story.lang || 'en',
            title: story.title,
            text: story.text,
            questions: story.questions || null,
            targetWpm: story.targetWpmDefault || 75
        };

        this.renderReadingArea();
    }

    renderStoryLibrary() {
        const container = document.getElementById('story-library-grid');
        if (!container) return;

        const currentLang = window.i18n ? window.i18n.getLang() : 'en';
        const isFr = currentLang === 'fr';

        // Filter stories by current language
        const stories = window.STORY_LIBRARY.filter(s => !s.lang || s.lang === currentLang);

        container.innerHTML = stories.map(story => {
            const isSelected = this.currentDoc && this.currentDoc.title === story.title;
            const wordCount = story.text.trim().split(/\s+/).length;
            const wordsLabel = isFr ? 'mots' : 'words';
            const targetLabel = isFr ? 'Objectif :' : 'Target:';
            const unitLabel = isFr ? 'MPM' : 'WPM';

            return `
                <div class="story-card ${isSelected ? 'selected' : ''}" onclick="app.selectLibraryStory('${story.id}')">
                    <div class="story-card-icon">${story.icon}</div>
                    <div class="story-card-body">
                        <span class="story-card-level">${story.level}</span>
                        <h4 class="story-card-title">${story.title}</h4>
                        <div class="story-card-meta">
                            <span>📖 ${wordCount} ${wordsLabel}</span>
                            <span>🎯 ${targetLabel} ${story.targetWpmDefault} ${unitLabel}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    selectLibraryStory(storyId) {
        const story = window.STORY_LIBRARY.find(s => s.id === storyId);
        if (story) {
            this.loadStory(story);
            this.renderStoryLibrary();
            window.audioManager.playTick();
        }
    }

    handlePastedText() {
        const textarea = document.getElementById('paste-text-input');
        const titleInput = document.getElementById('paste-title-input');
        const text = textarea ? textarea.value.trim() : '';
        const currentLang = window.i18n ? window.i18n.getLang() : 'en';
        const defaultTitle = currentLang === 'fr' ? 'Texte de lecture personnalisé' : 'Pasted Reading Text';
        const title = titleInput && titleInput.value.trim() ? titleInput.value.trim() : defaultTitle;

        if (!text) {
            alert(currentLang === 'fr' ? 'Veuillez d\'abord coller du texte !' : 'Please paste some text first!');
            return;
        }

        this.currentDoc = {
            lang: currentLang,
            title: title,
            text: text,
            questions: null,
            targetWpm: 75
        };

        this.renderReadingArea();
        window.audioManager.playTick();
    }

    async handleFileUpload(file) {
        if (!file) return;

        const currentLang = window.i18n ? window.i18n.getLang() : 'en';
        const isFr = currentLang === 'fr';
        const statusEl = document.getElementById('upload-status-msg');

        if (statusEl) {
            statusEl.innerHTML = `<span class="loading-spinner"></span> ${isFr ? 'Extraction du texte de' : 'Extracting text from'} <strong>${file.name}</strong>...`;
        }

        try {
            const extracted = await DocumentExtractor.extractTextFromFile(file);
            this.currentDoc = {
                lang: currentLang,
                title: extracted.title,
                text: extracted.text,
                questions: null,
                targetWpm: 75
            };

            const wordCount = extracted.text.trim().split(/\s+/).length;
            if (statusEl) {
                statusEl.innerHTML = `✅ ${isFr ? 'Chargement réussi de' : 'Successfully loaded'} <strong>${extracted.title}</strong> (${wordCount} ${isFr ? 'mots' : 'words'})!`;
            }

            this.renderReadingArea();
            window.audioManager.playSuccessDing();
        } catch (err) {
            console.error('File extraction error:', err);
            if (statusEl) {
                statusEl.innerHTML = `❌ Error: ${err.message}`;
            }
        }
    }

    renderReadingArea() {
        if (!this.currentDoc) return;

        const currentLang = window.i18n ? window.i18n.getLang() : 'en';
        const isFr = currentLang === 'fr';

        // Reset speech engine
        const tokens = this.speechEngine.setText(this.currentDoc.text);
        this.wordElements = [];

        // Reset highlight tracking
        if (this.highlightCascadeTimeouts && this.highlightCascadeTimeouts.length > 0) {
            this.highlightCascadeTimeouts.forEach(t => clearTimeout(t));
            this.highlightCascadeTimeouts = [];
        }
        this.lastHighlightedWordIndex = -1;
        this.currentActiveReadAlongIndex = -1;

        // Update document title & word count in UI
        const titleEl = document.getElementById('reading-doc-title');
        if (titleEl) titleEl.textContent = this.currentDoc.title;

        const countEl = document.getElementById('reading-total-words');
        if (countEl) countEl.textContent = `${tokens.length} ${isFr ? 'mots' : 'words'}`;

        const targetWpmEl = document.getElementById('reading-target-wpm');
        const profile = window.storageManager.getActiveProfile();
        const targetWpm = profile ? profile.targetWPM : this.currentDoc.targetWpm;
        if (targetWpmEl) targetWpmEl.textContent = `${targetWpm} ${isFr ? 'Objectif MPM' : 'WPM Goal'}`;

        // Render words inside container
        const readingArea = document.getElementById('reading-words-container');
        if (!readingArea) return;
        readingArea.innerHTML = '';

        tokens.forEach((token, idx) => {
            const span = document.createElement('span');
            span.className = 'word-token' + (idx === 0 ? ' word-current' : ' word-upcoming');
            span.id = `word-${idx}`;
            span.textContent = token.original + ' ';

            // Click to hear pronunciation or advance
            span.addEventListener('click', () => {
                window.audioManager.speakWord(token.original);
                this.speechEngine.advanceToWord(idx);
            });

            readingArea.appendChild(span);
            this.wordElements.push(span);
        });

        // Reset live metrics UI
        this.updateLiveMetrics(0, tokens.length, 0, 0);
        const readyMsg = isFr ? 'Prêt à lire à voix haute ! Clique sur Commencer.' : 'Ready to read aloud! Click Start.';
        this.updateMicStatusUI('idle', readyMsg);

        // Hide quiz / results modal if open
        const quizModal = document.getElementById('modal-comprehension');
        if (quizModal) quizModal.classList.add('hidden');
    }

    /**
     * Instantly highlights the word the child just read.
     * No cascade timers — every match fires immediately so there is zero
     * artificial delay between speech recognition and visual feedback.
     */
    highlightWordSmooth(matchedIndex) {
        if (!this.wordElements || this.wordElements.length === 0) return;
        if (matchedIndex < 0 || matchedIndex >= this.wordElements.length) return;

        // Clear any stale cascade timeouts from a previous session
        if (this.highlightCascadeTimeouts && this.highlightCascadeTimeouts.length > 0) {
            this.highlightCascadeTimeouts.forEach(t => clearTimeout(t));
            this.highlightCascadeTimeouts = [];
        }

        // Apply immediately — no setTimeout, no cascade
        this.applySingleWordHighlight(matchedIndex);
    }

    applySingleWordHighlight(index) {
        if (index < 0 || index >= this.wordElements.length) return;

        // Mark previously read words as spoken (only touches needed nodes)
        if (this.lastHighlightedWordIndex >= 0 && this.lastHighlightedWordIndex < index) {
            for (let i = this.lastHighlightedWordIndex; i < index; i++) {
                if (this.wordElements[i]) {
                    this.wordElements[i].className = 'word-token word-spoken';
                }
            }
        }

        // Mark matched word as spoken
        if (this.wordElements[index]) {
            this.wordElements[index].className = 'word-token word-spoken';
        }

        // Advance golden cursor to the next word
        const nextIdx = index + 1;
        if (nextIdx < this.wordElements.length && this.wordElements[nextIdx]) {
            this.wordElements[nextIdx].className = 'word-token word-current';
            this.scrollToWord(this.wordElements[nextIdx]);
        }

        this.lastHighlightedWordIndex = index;
    }

    // Fallback direct highlighter
    highlightWord(matchedIndex) {
        this.highlightWordSmooth(matchedIndex);
    }

    /**
     * Low-latency, non-blocking auto-scroller.
     * Uses offsetTop checks without forcing synchronous layout recalculations.
     */
    scrollToWord(element) {
        const container = document.getElementById('reading-words-container');
        if (!container || !element) return;

        const now = Date.now();
        if (this.lastScrollTime && now - this.lastScrollTime < 280) return;

        const elemTop = element.offsetTop - container.offsetTop;
        const currentScroll = container.scrollTop;
        const viewHeight = container.clientHeight;

        // Smooth scroll only when the word moves past comfortable reading bounds
        if (elemTop > currentScroll + (viewHeight * 0.65) || elemTop < currentScroll + 20) {
            this.lastScrollTime = now;
            container.scrollTo({
                top: Math.max(0, elemTop - (viewHeight * 0.35)),
                behavior: 'smooth'
            });
        }
    }

    /**
     * Highlights the active word being read aloud in Listen to Story (TTS) mode.
     * High performance: only touches changed DOM nodes.
     */
    setActiveReadingWord(index) {
        if (!this.wordElements || this.wordElements.length === 0) return;
        if (index < 0 || index >= this.wordElements.length) return;
        if (index === this.currentActiveReadAlongIndex) return;

        const prev = this.currentActiveReadAlongIndex;
        this.currentActiveReadAlongIndex = index;

        // Mark previous words as spoken
        if (prev >= 0 && prev < index) {
            for (let i = prev; i < index; i++) {
                if (this.wordElements[i]) {
                    this.wordElements[i].className = 'word-token word-spoken';
                }
            }
        } else if (prev < 0) {
            for (let i = 0; i < index; i++) {
                if (this.wordElements[i]) {
                    this.wordElements[i].className = 'word-token word-spoken';
                }
            }
        }

        // Active word being spoken right now
        if (this.wordElements[index]) {
            this.wordElements[index].className = 'word-token word-current';
            this.scrollToWord(this.wordElements[index]);
        }
    }

    /**
     * Marks all words as read when story audio finishes
     */
    finishReadAlong() {
        if (!this.wordElements) return;
        this.wordElements.forEach(el => {
            el.className = 'word-token word-spoken';
        });
        this.currentActiveReadAlongIndex = this.wordElements.length - 1;
    }

    updateLiveMetrics(currentIndex, totalWords, currentWpm, percent) {
        const isFr = window.i18n && window.i18n.getLang() === 'fr';

        // Update WPM gauge
        const wpmValueEl = document.getElementById('live-wpm-value');
        if (wpmValueEl) {
            wpmValueEl.textContent = currentWpm;
        }

        // Update Speed Tier Animal Badge
        const tierBadgeEl = document.getElementById('live-speed-tier');
        if (tierBadgeEl) {
            let tierText = isFr ? "🐢 Tortue tranquille" : "🐢 Steady Turtle";
            let tierClass = "tier-turtle";
            if (currentWpm >= 90) {
                tierText = isFr ? "🚀 Lecteur fusée !" : "🚀 Rocket Reader!";
                tierClass = "tier-rocket";
            } else if (currentWpm >= 75) {
                tierText = isFr ? "🐆 Guépard agile !" : "🐆 Speedy Cheetah!";
                tierClass = "tier-cheetah";
            } else if (currentWpm >= 55) {
                tierText = isFr ? "🐰 Lapin rapide !" : "🐰 Fast Bunny!";
                tierClass = "tier-bunny";
            }
            tierBadgeEl.innerHTML = `<span class="tier-pill ${tierClass}">${tierText}</span>`;
        }

        // Update Words Read & Remaining
        const wordsReadEl = document.getElementById('live-words-read');
        if (wordsReadEl) {
            wordsReadEl.textContent = `${currentIndex} / ${totalWords} ${isFr ? 'mots' : 'words'}`;
        }

        // Progress bar
        const progressBar = document.getElementById('reading-progress-fill');
        if (progressBar) {
            progressBar.style.width = `${percent}%`;
        }

        // Timer
        const timerEl = document.getElementById('live-read-timer');
        if (timerEl) {
            const sec = Math.floor(this.speechEngine.activeDurationMs / 1000);
            const m = Math.floor(sec / 60);
            const s = sec % 60;
            timerEl.textContent = `${m}:${s < 10 ? '0' : ''}${s}`;
        }
    }

    toggleMicrophone() {
        const btn = document.getElementById('btn-mic-toggle');
        if (!btn) return;

        if (this.speechEngine.isListening) {
            this.speechEngine.pause();
        } else {
            if (this.speechEngine.isPaused) {
                this.speechEngine.resume();
            } else {
                this.speechEngine.start();
            }
        }
    }

    updateMicStatusUI(status, message) {
        const isFr = window.i18n && window.i18n.getLang() === 'fr';
        const pill = document.getElementById('mic-status-pill');
        const btn = document.getElementById('btn-mic-toggle');
        const mascot = document.getElementById('reading-mascot-msg');

        if (pill) {
            pill.className = `mic-pill status-${status}`;
            let icon = '⚪';
            if (status === 'listening') icon = '🟢';
            if (status === 'paused') icon = '⏸️';
            if (status === 'error') icon = '⚠️';
            pill.innerHTML = `${icon} <span>${message}</span>`;
        }

        if (btn) {
            if (status === 'listening') {
                btn.innerHTML = `<span>${isFr ? '⏸️ Mettre en pause' : '⏸️ Pause Mic'}</span>`;
                btn.classList.add('mic-active');
            } else {
                btn.innerHTML = `<span>${isFr ? '🎙️ Commencer la lecture' : '🎙️ Start Reading Aloud'}</span>`;
                btn.classList.remove('mic-active');
            }
        }

        if (mascot && message) {
            if (status === 'listening') {
                mascot.textContent = isFr ? "J'écoute ta voix ! Lis clairement et prends ton temps !" : "I'm listening to your voice! Read clearly and have fun!";
            } else if (status === 'paused') {
                mascot.textContent = isFr ? "Prends ton temps ! Clique sur le micro dès que tu es prêt." : "Take your time! Click the mic whenever you're ready to continue.";
            } else if (status === 'error') {
                mascot.textContent = isFr ? "Vérifie les permissions du microphone dans ton navigateur !" : "Check your microphone permissions in your browser!";
            }
        }
    }

    toggleReadAlong() {
        const isFr = window.i18n && window.i18n.getLang() === 'fr';
        const btn = document.getElementById('btn-read-along');

        if (this.isReadAlongPlaying) {
            window.audioManager.stopSpeaking();
            this.isReadAlongPlaying = false;
            if (btn) btn.innerHTML = `<span>${isFr ? "🔊 Écouter l'histoire" : '🔊 Listen to Story'}</span>`;
        } else {
            if (!this.currentDoc) return;
            this.isReadAlongPlaying = true;
            if (btn) btn.innerHTML = `<span>${isFr ? "⏹️ Arrêter l'écoute" : '⏹️ Stop Listening'}</span>`;

            window.audioManager.readTextAloud(
                this.currentDoc.text,
                this.speechEngine.tokens,
                (wordIndex) => {
                    this.setActiveReadingWord(wordIndex);
                },
                () => {
                    this.isReadAlongPlaying = false;
                    if (btn) btn.innerHTML = `<span>${isFr ? "🔊 Écouter l'histoire" : '🔊 Listen to Story'}</span>`;
                    this.finishReadAlong();
                }
            );
        }
    }

    resetCurrentReading() {
        this.speechEngine.reset();
        if (this.isReadAlongPlaying) {
            this.toggleReadAlong();
        }
        this.renderReadingArea();
    }

    // -------------------------------------------------------------
    // COMPLETION & COMPREHENSION CHALLENGE
    // -------------------------------------------------------------

    handleReadingComplete(summary) {
        window.audioManager.playFanfare();
        this.launchConfetti();

        const modal = document.getElementById('modal-comprehension');
        const container = document.getElementById('comprehension-quiz-content');
        if (modal && container) {
            modal.classList.remove('hidden');

            window.comprehensionManager.startQuiz(
                this.currentDoc.questions ? this.currentDoc : this.currentDoc.text,
                this.currentDoc.title,
                container,
                (quizResult) => {
                    this.saveAndShowFinalSessionReport(summary, quizResult);
                }
            );
        }
    }

    saveAndShowFinalSessionReport(summary, quizResult) {
        const profile = window.storageManager.getActiveProfile();
        if (!profile) return;

        const sessionPayload = {
            title: this.currentDoc.title,
            wordCount: summary.wordsRead || summary.totalWords,
            durationSeconds: summary.durationSeconds,
            wpm: summary.wpm,
            accuracy: summary.accuracy,
            comprehensionScore: quizResult.scorePercent,
            comprehensionQuestions: quizResult.total,
            comprehensionCorrect: quizResult.correct
        };

        const { session, newlyEarnedBadges } = window.storageManager.recordSession(sessionPayload);

        const quizModal = document.getElementById('modal-comprehension');
        if (quizModal) quizModal.classList.add('hidden');

        this.showFinalCelebrationModal(session, newlyEarnedBadges);
    }

    showFinalCelebrationModal(session, newlyEarnedBadges) {
        const modal = document.getElementById('modal-session-summary');
        const content = document.getElementById('session-summary-content');
        if (!modal || !content) return;

        const isFr = window.i18n && window.i18n.getLang() === 'fr';
        const profile = window.storageManager.getActiveProfile();
        const mins = Math.floor(session.durationSeconds / 60);
        const secs = session.durationSeconds % 60;

        let badgesHtml = '';
        if (newlyEarnedBadges && newlyEarnedBadges.length > 0) {
            badgesHtml = `
                <div class="new-badges-earned-card">
                    <h4>${isFr ? '🎖️ NOUVEAUX BADGES DÉBLOQUÉS !' : '🎖️ NEW BADGES UNLOCKED!'}</h4>
                    <div class="badges-row">
                        ${newlyEarnedBadges.map(b => `
                            <div class="badge-item-mini">
                                <span class="badge-icon">${b.icon}</span>
                                <span class="badge-name">${b.title}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }

        const titleText = isFr ? "Aventure de lecture terminée !" : "Reading Adventure Complete!";
        const greatJobText = isFr ? `Lecture remarquable, <strong>${profile.name}</strong> !` : `Outstanding reading, <strong>${profile.name}</strong>!`;
        const speedUnit = isFr ? "Mots par minute (MPM)" : "Words Per Minute";
        const correctSuffix = isFr ? "Correctes" : "Correct";
        const wordsUnit = isFr ? "mots au total" : "total words";
        const timeUnit = isFr ? "temps actif" : "active time";
        const fileNotice = isFr ? "📁 <em>Ta progression a été sauvegardée directement dans tes fichiers texte !</em>" : "📁 <em>Your progress has been saved directly to your profile text records!</em>";
        const btnDownloadTxt = isFr ? "💾 Télécharger le fichier texte (.txt)" : "💾 Download Updated Profile Text File (.txt)";
        const btnDash = isFr ? "📊 Voir le tableau de bord des progrès" : "📊 View Full Progress Dashboard";
        const btnReadMore = isFr ? "📖 Lire une autre histoire" : "📖 Read Another Story";

        content.innerHTML = `
            <div class="summary-hero">
                <div class="summary-trophy">🏆</div>
                <h2>${titleText}</h2>
                <p>${greatJobText}</p>
            </div>

            <div class="summary-stats-grid">
                <div class="sum-stat-card">
                    <span class="sum-label">${isFr ? 'Vitesse de lecture' : 'Reading Speed'}</span>
                    <span class="sum-value val-speed">${session.wpm}</span>
                    <span class="sum-unit">${speedUnit}</span>
                </div>
                <div class="sum-stat-card">
                    <span class="sum-label">${isFr ? 'Compréhension' : 'Comprehension'}</span>
                    <span class="sum-value val-comp">${session.comprehensionScore}%</span>
                    <span class="sum-unit">${session.comprehensionCorrect}/${session.comprehensionQuestions} ${correctSuffix}</span>
                </div>
                <div class="sum-stat-card">
                    <span class="sum-label">${isFr ? 'Mots lus' : 'Words Read'}</span>
                    <span class="sum-value">${session.wordCount}</span>
                    <span class="sum-unit">${wordsUnit}</span>
                </div>
                <div class="sum-stat-card">
                    <span class="sum-label">${isFr ? 'Temps de lecture' : 'Read Time'}</span>
                    <span class="sum-value">${mins}m ${secs}s</span>
                    <span class="sum-unit">${timeUnit}</span>
                </div>
            </div>

            ${badgesHtml}

            <div class="summary-textfile-notice">
                <p>${fileNotice}</p>
                <button type="button" class="btn-secondary" onclick="window.storageManager.downloadProfileTextFile()">
                    ${btnDownloadTxt}
                </button>
            </div>

            <div class="summary-actions">
                <button type="button" class="btn-primary-large" onclick="app.closeSummaryModalAndGoProgress()">
                    ${btnDash}
                </button>
                <button type="button" class="btn-outline" onclick="app.closeSummaryModal()">
                    ${btnReadMore}
                </button>
            </div>
        `;

        modal.classList.remove('hidden');
    }

    closeSummaryModal() {
        const modal = document.getElementById('modal-session-summary');
        if (modal) modal.classList.add('hidden');
        this.resetCurrentReading();
    }

    closeSummaryModalAndGoProgress() {
        this.closeSummaryModal();
        this.switchTab('progress');
    }

    // -------------------------------------------------------------
    // PROGRESS TRACKING DASHBOARD & CHARTS
    // -------------------------------------------------------------

    renderProgressDashboard() {
        const profile = window.storageManager.getActiveProfile();
        if (!profile) return;

        const isFr = window.i18n && window.i18n.getLang() === 'fr';
        const stats = window.storageManager.getProfileStats(profile);
        const unit = isFr ? 'MPM' : 'WPM';

        document.getElementById('dash-profile-name').textContent = profile.name;
        document.getElementById('dash-profile-avatar').textContent = profile.avatar;
        document.getElementById('dash-profile-grade').textContent = profile.grade;
        document.getElementById('dash-target-wpm').textContent = `${profile.targetWPM} ${unit}`;

        document.getElementById('stat-avg-wpm').textContent = stats.avgWpm;
        document.getElementById('stat-top-wpm').textContent = stats.topWpm;
        document.getElementById('stat-total-words').textContent = stats.totalWords.toLocaleString();
        document.getElementById('stat-avg-comp').textContent = `${stats.avgComprehension}%`;

        const totalMins = Math.floor(stats.totalTimeSeconds / 60);
        document.getElementById('stat-total-time').textContent = `${totalMins} mins`;

        window.ReadingProgressCharts.renderWpmChart('canvas-wpm-chart', profile.sessions || [], profile.targetWPM);
        window.ReadingProgressCharts.renderMetricsChart('canvas-comp-chart', profile.sessions || []);

        this.renderBadgesGrid(profile);
        this.renderHistoryTable(profile);
    }

    renderBadgesGrid(profile) {
        const grid = document.getElementById('dash-badges-grid');
        if (!grid) return;

        const isFr = window.i18n && window.i18n.getLang() === 'fr';
        const earnedSet = new Set(profile.badges || []);

        grid.innerHTML = window.BADGES_CATALOG.map(badge => {
            const isEarned = earnedSet.has(badge.id);
            const statusLabel = isEarned ? (isFr ? 'Débloqué ✨' : 'Unlocked ✨') : (isFr ? 'Verrouillé 🔒' : 'Locked 🔒');
            return `
                <div class="badge-tile ${isEarned ? 'earned' : 'locked'}">
                    <div class="badge-tile-icon">${badge.icon}</div>
                    <div class="badge-tile-info">
                        <span class="badge-tile-title">${badge.title}</span>
                        <span class="badge-tile-desc">${badge.desc}</span>
                        <span class="badge-status-label">${statusLabel}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    renderHistoryTable(profile) {
        const tbody = document.getElementById('dash-history-tbody');
        if (!tbody) return;

        const isFr = window.i18n && window.i18n.getLang() === 'fr';

        if (!profile.sessions || profile.sessions.length === 0) {
            const emptyMsg = isFr ? "Aucune session enregistrée pour le moment. Commence à lire !" : "No reading sessions recorded yet. Start reading to see your history!";
            tbody.innerHTML = `<tr><td colspan="7" class="empty-table-cell">${emptyMsg}</td></tr>`;
            return;
        }

        const wpmUnit = isFr ? 'MPM' : 'WPM';
        const wordsUnit = isFr ? 'mots' : 'words';

        tbody.innerHTML = profile.sessions.slice().reverse().map(s => {
            const dt = new Date(s.date).toLocaleDateString() + ' ' + new Date(s.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const m = Math.floor(s.durationSeconds / 60);
            const sec = s.durationSeconds % 60;
            return `
                <tr>
                    <td><strong>${dt}</strong></td>
                    <td>${s.title}</td>
                    <td>${s.wordCount} ${wordsUnit}</td>
                    <td>${m}m ${sec < 10 ? '0' : ''}${sec}s</td>
                    <td><span class="wpm-badge">${s.wpm} ${wpmUnit}</span></td>
                    <td><span class="comp-badge">${s.comprehensionScore}%</span></td>
                    <td>${s.accuracy}%</td>
                </tr>
            `;
        }).join('');
    }

    // -------------------------------------------------------------
    // PROFILES & TEXT FILE DATA MANAGEMENT
    // -------------------------------------------------------------

    renderProfilesManager() {
        const activeProfile = window.storageManager.getActiveProfile();
        const profiles = window.storageManager.getAllProfiles();
        const isFr = window.i18n && window.i18n.getLang() === 'fr';

        const listContainer = document.getElementById('profiles-list-container');
        if (listContainer) {
            listContainer.innerHTML = profiles.map(p => {
                const isActive = activeProfile && activeProfile.id === p.id;
                const stats = window.storageManager.getProfileStats(p);
                const switchLabel = isFr ? "Choisir ce profil" : "Switch to Profile";
                const exportLabel = isFr ? "💾 Exporter fichier texte" : "💾 Export Text File";
                const viewLabel = isFr ? "📄 Voir fichier" : "📄 View File";
                const activeLabel = isFr ? "Actif" : "Active";
                const speedUnit = isFr ? "MPM" : "WPM";

                return `
                    <div class="profile-card ${isActive ? 'active-profile' : ''}">
                        <div class="profile-card-top">
                            <span class="profile-card-avatar">${p.avatar}</span>
                            <div class="profile-card-title-box">
                                <h4 class="profile-card-name">${p.name}</h4>
                                <span class="profile-card-grade">${p.grade} • Goal: ${p.targetWPM} ${speedUnit}</span>
                            </div>
                            ${isActive ? `<span class="pill-active">${activeLabel}</span>` : ''}
                        </div>
                        <div class="profile-card-stats">
                            <span>📖 ${stats.sessionCount} sessions</span>
                            <span>⚡ ${stats.avgWpm} ${speedUnit}</span>
                            <span>🧠 ${stats.avgComprehension}% comp</span>
                        </div>
                        <div class="profile-card-actions">
                            ${!isActive ? `<button type="button" class="btn-sm btn-outline" onclick="app.selectActiveProfile('${p.id}')">${switchLabel}</button>` : ''}
                            <button type="button" class="btn-sm btn-secondary" onclick="window.storageManager.downloadProfileTextFile(window.storageManager.getProfile('${p.id}'))" title="Download as .txt">
                                ${exportLabel}
                            </button>
                            <button type="button" class="btn-sm btn-ghost" onclick="app.previewProfileTextFile('${p.id}')" title="Preview raw text file">
                                ${viewLabel}
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
        }
    }

    selectActiveProfile(id) {
        window.storageManager.setActiveProfile(id);
        this.updateProfileHeader();
        this.renderProfilesManager();
        window.audioManager.playTick();
    }

    handleCreateProfile(e) {
        e.preventDefault();
        const isFr = window.i18n && window.i18n.getLang() === 'fr';
        const nameInput = document.getElementById('new-profile-name');
        const gradeInput = document.getElementById('new-profile-grade');
        const wpmInput = document.getElementById('new-profile-wpm');
        const avatarRadio = document.querySelector('input[name="profile-avatar"]:checked');

        const name = nameInput ? nameInput.value.trim() : '';
        if (!name) {
            alert(isFr ? "Veuillez entrer le prénom de l'enfant !" : "Please enter a name for the reader!");
            return;
        }

        const avatar = avatarRadio ? avatarRadio.value : '🦉';
        const avatarNames = { '🦉': 'Wise Owl', '🦁': 'Brave Lion', '🦊': 'Clever Fox', '🐼': 'Chill Panda', '🚀': 'Astronaut', '🦄': 'Unicorn' };

        const newProfile = window.storageManager.createProfile({
            name,
            avatar,
            avatarName: avatarNames[avatar] || 'Reader Buddy',
            grade: gradeInput ? gradeInput.value : 'Grade 2',
            targetWPM: wpmInput ? parseInt(wpmInput.value, 10) : 75
        });

        if (nameInput) nameInput.value = '';

        this.updateProfileHeader();
        this.renderProfilesManager();
        window.audioManager.playSuccessDing();
        alert(isFr ? `Profil pour ${newProfile.name} créé avec succès !` : `Profile for ${newProfile.name} created! It is saved in your text profile system.`);
    }

    async handleProfileFileImport(file) {
        if (!file) return;
        const isFr = window.i18n && window.i18n.getLang() === 'fr';
        try {
            const result = await window.storageManager.importFromTextFile(file);
            this.updateProfileHeader();
            this.renderProfilesManager();
            window.audioManager.playSuccessDing();
            alert(isFr ? `🎉 Profil importé avec succès depuis le fichier texte !` : `🎉 Successfully imported text file profile!`);
        } catch (err) {
            console.error('Profile import error:', err);
            alert(isFr ? `Impossible d'importer le fichier profil : ${err.message}` : `Could not import profile text file: ${err.message}`);
        }
    }

    previewProfileTextFile(profileId) {
        const profile = window.storageManager.getProfile(profileId);
        if (!profile) return;

        const rawText = window.storageManager.serializeProfileToText(profile);
        const modal = document.getElementById('modal-textfile-preview');
        const pre = document.getElementById('raw-textfile-content');
        const title = document.getElementById('textfile-preview-title');

        if (title) title.textContent = `${profile.name}_reading_profile.txt`;
        if (pre) pre.textContent = rawText;
        if (modal) modal.classList.remove('hidden');
    }

    closeTextFilePreviewModal() {
        const modal = document.getElementById('modal-textfile-preview');
        if (modal) modal.classList.add('hidden');
    }

    updateProfileHeader() {
        const profile = window.storageManager.getActiveProfile();
        if (!profile) return;

        const avatarEl = document.getElementById('header-avatar');
        const nameEl = document.getElementById('header-name');
        const gradeEl = document.getElementById('header-grade');

        if (avatarEl) avatarEl.textContent = profile.avatar;
        if (nameEl) nameEl.textContent = profile.name;
        if (gradeEl) gradeEl.textContent = profile.grade;
    }

    // -------------------------------------------------------------
    // ACCESSIBILITY & DISPLAY OPTIONS
    // -------------------------------------------------------------

    loadAccessibilitySettings() {
        const dyslexia = localStorage.getItem('rf_dyslexia_font') === 'true';
        const fontSize = localStorage.getItem('rf_font_size') || 'normal';
        const sound = localStorage.getItem('rf_sound_enabled') !== 'false';

        this.setDyslexiaFont(dyslexia);
        this.setFontSize(fontSize);
        window.audioManager.setSoundEnabled(sound);

        const checkDyslexia = document.getElementById('toggle-dyslexia-font');
        if (checkDyslexia) checkDyslexia.checked = dyslexia;

        const selFontSize = document.getElementById('select-font-size');
        if (selFontSize) selFontSize.value = fontSize;

        const checkSound = document.getElementById('toggle-sound');
        if (checkSound) checkSound.checked = sound;
    }

    setDyslexiaFont(enabled) {
        document.body.classList.toggle('font-dyslexia', enabled);
        localStorage.setItem('rf_dyslexia_font', enabled);
    }

    setFontSize(size) {
        document.body.classList.remove('size-small', 'size-normal', 'size-large', 'size-xlarge');
        document.body.classList.add(`size-${size}`);
        localStorage.setItem('rf_font_size', size);
    }

    toggleReadingRuler(enabled) {
        let ruler = document.getElementById('reading-ruler-bar');
        if (enabled) {
            if (!ruler) {
                ruler = document.createElement('div');
                ruler.id = 'reading-ruler-bar';
                ruler.className = 'reading-ruler';
                document.body.appendChild(ruler);

                window.addEventListener('mousemove', (e) => {
                    ruler.style.top = `${e.clientY - 25}px`;
                });
            }
            ruler.style.display = 'block';
        } else if (ruler) {
            ruler.style.display = 'none';
        }
    }

    // Confetti celebration effect
    launchConfetti() {
        const canvas = document.getElementById('confetti-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const pieces = [];
        const colors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

        for (let i = 0; i < 80; i++) {
            pieces.push({
                x: canvas.width / 2,
                y: canvas.height / 2,
                vx: (Math.random() - 0.5) * 16,
                vy: (Math.random() - 0.7) * 16,
                size: Math.random() * 8 + 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * 360,
                vr: (Math.random() - 0.5) * 10
            });
        }

        let frame = 0;
        const animate = () => {
            frame++;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            pieces.forEach(p => {
                p.x += p.vx;
                p.y += p.vy;
                p.vy += 0.35;
                p.rotation += p.vr;

                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate((p.rotation * Math.PI) / 180);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
                ctx.restore();
            });

            if (frame < 120) {
                requestAnimationFrame(animate);
            } else {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
            }
        };

        requestAnimationFrame(animate);
    }
}

// Global App Initialization
window.addEventListener('DOMContentLoaded', () => {
    window.app = new ReadFluentlyApp();
});
