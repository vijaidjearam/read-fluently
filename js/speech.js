/**
 * Speech Recognition and Reading Speed (WPM) Engine for ReadFluently
 * 
 * Fine-tuned for zero-latency, word-by-word real-time matching
 * supporting English (en-US) and French (fr-FR).
 */

class ReadingSpeechEngine {
    constructor() {
        this.recognition = null;
        this.isSupported = false;
        this.isListening = false;
        this.isPaused = false;
        this.currentLang = 'en';
        this.recognitionLang = 'en-US';

        // Reading state
        this.tokens = [];            // Array of word objects { original, clean, index }
        this.currentIndex = 0;       // Index of word currently expected to be read
        this.matchedCount = 0;       // Total words correctly matched
        this.missedWords = [];       // Words skipped or missed

        // Recognition stream offset tracking (prevents duplicate matching and multi-word jumping)
        this.lastProcessedResultIndex = 0;
        this.interimWordOffset = 0;

        // Timing & WPM
        this.startTime = null;
        this.activeDurationMs = 0;
        this.lastSpeechTimestamp = null;
        this.wpmTimer = null;
        this.currentWpm = 0;

        // Callbacks
        this.onWordMatched = null;   // (index, word, currentWpm)
        this.onProgress = null;      // (currentIndex, totalWords, currentWpm, percent)
        this.onStatusChange = null;  // (status, message)
        this.onFinished = null;      // (summaryData)

        this.initRecognition();
    }

    setLanguage(lang) {
        this.currentLang = lang;
        this.recognitionLang = lang === 'fr' ? 'fr-FR' : 'en-US';
        if (this.recognition) {
            this.recognition.lang = this.recognitionLang;
        }
    }

    initRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = this.recognitionLang;
            // maxAlternatives = 1 significantly reduces recognition latency in Chromium
            this.recognition.maxAlternatives = 1;
            this.isSupported = true;

            this.recognition.onstart = () => {
                this.isListening = true;
                this.lastProcessedResultIndex = 0;
                this.interimWordOffset = 0;
                const msg = window.i18n ? window.i18n.t('micListening') : 'Microphone is listening...';
                if (this.onStatusChange) this.onStatusChange('listening', msg);
            };

            this.recognition.onresult = (event) => {
                this.handleSpeechResult(event);
            };

            this.recognition.onerror = (event) => {
                if (event.error === 'no-speech') {
                    return;
                }
                if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                    const msg = window.i18n ? window.i18n.t('mascotError') : 'Microphone permission blocked. Please allow microphone access.';
                    if (this.onStatusChange) {
                        this.onStatusChange('error', msg);
                    }
                    this.stop();
                }
            };

            this.recognition.onend = () => {
                if (this.isListening && !this.isPaused) {
                    try {
                        this.recognition.start();
                    } catch (e) {
                        // Restart debounce
                    }
                } else if (!this.isListening) {
                    const msg = window.i18n ? window.i18n.t('micReady') : 'Microphone ready';
                    if (this.onStatusChange) this.onStatusChange('idle', msg);
                }
            };
        } else {
            this.isSupported = false;
            console.warn('Web Speech API is not supported in this browser.');
        }
    }

    setText(text) {
        this.reset();
        if (!text) {
            this.tokens = [];
            return [];
        }

        const rawWords = text.trim().split(/\s+/).filter(Boolean);
        this.tokens = rawWords.map((raw, idx) => {
            const clean = this.normalizeWord(raw);
            return {
                index: idx,
                original: raw,
                clean: clean,
                matched: false
            };
        });

        return this.tokens;
    }

    normalizeWord(str) {
        if (!str) return '';

        const numMapEn = {
            '0': 'zero', '1': 'one', '2': 'two', '3': 'three', '4': 'four',
            '5': 'five', '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', '10': 'ten'
        };
        const numMapFr = {
            '0': 'zero', '1': 'un', '2': 'deux', '3': 'trois', '4': 'quatre',
            '5': 'cinq', '6': 'six', '7': 'sept', '8': 'huit', '9': 'neuf', '10': 'dix'
        };

        let cleaned = str.toLowerCase();
        
        // Remove French elision markers at start: l', d', c', j', m', t', s', n', qu'
        if (this.currentLang === 'fr') {
            cleaned = cleaned.replace(/^(l'|d'|c'|j'|m'|t'|s'|n'|qu'|l’|d’|c’|j’|m’|t’|s’|n’|qu’)/, '');
        }

        // Normalize accents (e.g. é -> e, à -> a, ç -> c) for phonetic resilience
        cleaned = cleaned.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        // Strip non-alphanumeric
        cleaned = cleaned.replace(/[^a-z0-9]/g, '');

        if (this.currentLang === 'fr') {
            if (numMapFr[cleaned]) cleaned = numMapFr[cleaned];
        } else {
            if (numMapEn[cleaned]) cleaned = numMapEn[cleaned];
        }

        return cleaned;
    }

    start() {
        if (this.tokens.length === 0) return;

        this.isListening = true;
        this.isPaused = false;
        this.lastProcessedResultIndex = 0;
        this.interimWordOffset = 0;
        this.startTime = Date.now();
        this.lastSpeechTimestamp = Date.now();

        this.startWpmTimer();

        if (this.recognition && this.isSupported) {
            try {
                this.recognition.lang = this.recognitionLang;
                this.recognition.start();
            } catch (e) {
                // Already started
            }
        } else {
            if (this.onStatusChange) {
                this.onStatusChange('unsupported', 'Speech Recognition not available in this browser. You can tap words or use read-along!');
            }
        }
    }

    pause() {
        this.isPaused = true;
        this.isListening = false;
        this.stopWpmTimer();
        if (this.recognition) {
            try {
                this.recognition.stop();
            } catch (e) {}
        }
        const msg = window.i18n ? window.i18n.t('micPaused') : 'Paused. Click microphone to resume!';
        if (this.onStatusChange) this.onStatusChange('paused', msg);
    }

    resume() {
        this.isPaused = false;
        this.isListening = true;
        this.lastSpeechTimestamp = Date.now();
        this.startWpmTimer();
        if (this.recognition && this.isSupported) {
            try {
                this.recognition.lang = this.recognitionLang;
                this.recognition.start();
            } catch (e) {}
        }
        const msg = window.i18n ? window.i18n.t('micListening') : 'Microphone is listening...';
        if (this.onStatusChange) this.onStatusChange('listening', msg);
    }

    stop() {
        this.isListening = false;
        this.isPaused = false;
        this.stopWpmTimer();
        if (this.recognition) {
            try {
                this.recognition.stop();
            } catch (e) {}
        }
    }

    reset() {
        this.stop();
        this.currentIndex = 0;
        this.matchedCount = 0;
        this.activeDurationMs = 0;
        this.currentWpm = 0;
        this.missedWords = [];
        this.tokens = [];
        this.lastProcessedResultIndex = 0;
        this.interimWordOffset = 0;
    }

    startWpmTimer() {
        this.stopWpmTimer();
        this.wpmTimer = setInterval(() => {
            if (this.isListening && !this.isPaused) {
                this.activeDurationMs += 250;
                this.updateWpm();
            }
        }, 250);
    }

    stopWpmTimer() {
        if (this.wpmTimer) {
            clearInterval(this.wpmTimer);
            this.wpmTimer = null;
        }
    }

    updateWpm() {
        if (this.matchedCount === 0 || this.activeDurationMs < 1000) {
            this.currentWpm = 0;
        } else {
            const activeMinutes = (this.activeDurationMs / 1000) / 60;
            const rawWpm = this.matchedCount / activeMinutes;
            if (this.matchedCount < 5) {
                this.currentWpm = Math.min(Math.round(rawWpm), 90);
            } else {
                this.currentWpm = Math.round(rawWpm);
            }
        }

        if (this.onProgress) {
            const pct = this.tokens.length > 0 ? Math.round((this.currentIndex / this.tokens.length) * 100) : 0;
            this.onProgress(this.currentIndex, this.tokens.length, this.currentWpm, pct);
        }
    }

    /**
     * Handles incoming speech stream with strict sequential matching.
     * Prevents multi-word jumping by processing only newly spoken tokens
     * and strictly checking the immediate expected word first.
     */
    handleSpeechResult(event) {
        if (!this.isListening || this.isPaused) return;

        this.lastSpeechTimestamp = Date.now();

        for (let i = event.resultIndex; i < event.results.length; i++) {
            const result = event.results[i];
            const transcript = result[0].transcript || '';
            const rawWords = transcript.trim().split(/\s+/).filter(Boolean);

            if (i > this.lastProcessedResultIndex) {
                this.lastProcessedResultIndex = i;
                this.interimWordOffset = 0;
            }

            // Only process new spoken words since last matched position
            const newWords = rawWords.slice(this.interimWordOffset);
            if (newWords.length === 0) continue;

            for (const rawWord of newWords) {
                if (this.currentIndex >= this.tokens.length) {
                    this.finishReading();
                    return;
                }

                const spoken = this.normalizeWord(rawWord);
                if (!spoken) {
                    this.interimWordOffset++;
                    continue;
                }

                // Priority 1: Match the immediate expected word (Index 0 lookahead)
                const currentTarget = this.tokens[this.currentIndex].clean;
                if (this.isWordMatch(spoken, currentTarget)) {
                    this.matchWordAtIndex(this.currentIndex);
                    this.interimWordOffset++;
                    continue;
                }

                // Priority 2: Check next word (+1 lookahead if child skipped 1 word)
                if (this.currentIndex + 1 < this.tokens.length) {
                    const nextTarget = this.tokens[this.currentIndex + 1].clean;
                    if (this.isWordMatch(spoken, nextTarget)) {
                        this.tokens[this.currentIndex].matched = false;
                        this.missedWords.push(this.tokens[this.currentIndex]);
                        this.matchWordAtIndex(this.currentIndex + 1);
                        this.interimWordOffset++;
                        continue;
                    }
                }

                // Priority 3: Check +2 lookahead ONLY if target word is distinctive (>= 4 letters)
                if (this.currentIndex + 2 < this.tokens.length) {
                    const skipTwoTarget = this.tokens[this.currentIndex + 2].clean;
                    if (skipTwoTarget.length >= 4 && this.isWordMatch(spoken, skipTwoTarget)) {
                        this.tokens[this.currentIndex].matched = false;
                        this.tokens[this.currentIndex + 1].matched = false;
                        this.missedWords.push(this.tokens[this.currentIndex], this.tokens[this.currentIndex + 1]);
                        this.matchWordAtIndex(this.currentIndex + 2);
                        this.interimWordOffset++;
                        continue;
                    }
                }

                // Priority 4: Stutter/repeat handling (child repeated previous word)
                if (this.currentIndex > 0) {
                    const prevTarget = this.tokens[this.currentIndex - 1].clean;
                    if (this.isWordMatch(spoken, prevTarget)) {
                        this.interimWordOffset++;
                        continue;
                    }
                }

                // Word did not match expected target: advance interim offset without jumping text
                this.interimWordOffset++;
            }

            if (result.isFinal) {
                this.interimWordOffset = 0;
                this.lastProcessedResultIndex = i + 1;
            }
        }
    }

    matchWordAtIndex(index) {
        this.tokens[index].matched = true;
        this.matchedCount++;
        this.currentIndex = index + 1;

        if (this.onWordMatched) {
            this.onWordMatched(index, this.tokens[index], this.currentWpm);
        }

        this.updateWpm();

        if (this.currentIndex >= this.tokens.length) {
            this.finishReading();
        }
    }

    isWordMatch(spoken, target) {
        if (!spoken || !target) return false;
        if (spoken === target) return true;

        // Prefix match for longer words
        if (spoken.length >= 4 && target.length >= 4) {
            if (target.startsWith(spoken) || spoken.startsWith(target)) return true;
        }

        const dist = this.levenshtein(spoken, target);
        if (target.length <= 3) return dist === 0;
        if (target.length <= 6) return dist <= 1;
        return dist <= 2;
    }

    levenshtein(a, b) {
        const matrix = [];
        for (let i = 0; i <= b.length; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= a.length; j++) {
            matrix[0][j] = j;
        }
        for (let i = 1; i <= b.length; i++) {
            for (let j = 1; j <= a.length; j++) {
                if (b.charAt(i - 1) === a.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
                    );
                }
            }
        }
        return matrix[b.length][a.length];
    }

    advanceToWord(index) {
        if (index < 0 || index >= this.tokens.length) return;
        this.tokens[index].matched = true;
        this.matchedCount++;
        this.currentIndex = index + 1;

        if (this.onWordMatched) {
            this.onWordMatched(index, this.tokens[index], this.currentWpm);
        }

        this.updateWpm();

        if (this.currentIndex >= this.tokens.length) {
            this.finishReading();
        }
    }

    finishReading() {
        this.stop();
        const durationSec = Math.max(Math.round(this.activeDurationMs / 1000), 1);
        const activeMins = durationSec / 60;
        const finalWpm = Math.max(Math.round(this.matchedCount / activeMins), 10);
        const accuracy = this.tokens.length > 0 ? Math.round((this.matchedCount / this.tokens.length) * 100) : 100;

        const summary = {
            totalWords: this.tokens.length,
            wordsRead: this.matchedCount,
            durationSeconds: durationSec,
            wpm: finalWpm,
            accuracy: Math.min(accuracy, 100),
            missedWords: this.missedWords
        };

        const finishedMsg = window.i18n ? (this.currentLang === 'fr' ? 'Hourra ! Tu as terminé l\'histoire !' : 'Hooray! You finished the story!') : 'Hooray! You finished the story!';
        if (this.onStatusChange) this.onStatusChange('finished', finishedMsg);
        if (this.onFinished) this.onFinished(summary);
    }
}

window.ReadingSpeechEngine = ReadingSpeechEngine;
