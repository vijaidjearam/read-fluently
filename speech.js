/**
 * Speech Recognition and Reading Speed (WPM) Engine for ReadFluently
 * 
 * High-performance, low-latency Sequence Alignment Engine.
 * Matches spoken words against the reading text in real-time with
 * child-friendly phonetic tolerance and zero artificial delay.
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
        this.missedWords = [];       // Words skipped

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

        // Per-utterance-segment deduplication counters
        this._processedWordCount = 0;
        this._lastResultIndex = 0;

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
            this.recognition.maxAlternatives = 1;
            this.isSupported = true;

            this.recognition.onstart = () => {
                this.isListening = true;
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
                        setTimeout(() => {
                            if (this.isListening && !this.isPaused) {
                                try { this.recognition.start(); } catch (err) {}
                            }
                        }, 50);
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

        // Normalize accents (e.g. é -> e, à -> a, ç -> c)
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
        this.startTime = Date.now();
        this.lastSpeechTimestamp = Date.now();

        this.startWpmTimer();

        if (this.recognition && this.isSupported) {
            try {
                this.recognition.lang = this.recognitionLang;
                this.recognition.start();
            } catch (e) {
                // Already running
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
        // Per-segment dedup counters
        this._processedWordCount = 0;
        this._lastResultIndex = 0;
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
     * Last-Word-First Matching Engine for Live Reading Aloud.
     *
     * Strategy: React to the LATEST word Chrome just recognised (last word
     * of the current interim transcript).  This gives the minimum possible
     * latency because we don't re-process the entire growing transcript —
     * we only act on what is new.
     *
     * Deduplication: we track the last raw transcript string we already
     * acted on so that repeated interim firings for the same word are
     * ignored.
     */
    handleSpeechResult(event) {
        if (!this.isListening || this.isPaused) return;
        this.lastSpeechTimestamp = Date.now();

        // ── 1. Build the current interim transcript from this result event ──
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
            const res = event.results[i];
            if (res && res[0] && res[0].transcript) {
                currentTranscript += ' ' + res[0].transcript;
            }
        }
        currentTranscript = currentTranscript.trim();
        if (!currentTranscript) return;

        // ── 2. Only process words we haven't matched yet ──
        // Split the full transcript into raw words, then skip over words we
        // already consumed in earlier events (tracked by this._processedWordCount).
        const allRaw = currentTranscript.split(/\s+/).filter(Boolean);
        if (allRaw.length === 0) return;

        // On a new utterance segment (resultIndex moves forward) Chrome resets
        // its transcript.  We reset our per-segment counter as well.
        const isNewSegment = event.resultIndex > (this._lastResultIndex || 0);
        if (isNewSegment) {
            this._lastResultIndex = event.resultIndex;
            this._processedWordCount = 0;
        }

        // Words spoken in THIS event that we haven't acted on yet
        const newRaw = allRaw.slice(this._processedWordCount || 0);
        if (newRaw.length === 0) return;

        // ── 3. Process each genuinely new word left-to-right ──
        let advanced = false;
        for (let w = 0; w < newRaw.length; w++) {
            if (this.currentIndex >= this.tokens.length) {
                this.finishReading();
                return;
            }

            const spokenNorm = this.normalizeWord(newRaw[w]);
            if (!spokenNorm) {
                // Count empty-after-normalize words as consumed so they don't block
                this._processedWordCount++;
                continue;
            }

            const target0 = this.tokens[this.currentIndex].clean;

            if (this.isWordMatch(spokenNorm, target0)) {
                // ✅ Exact sequential match — the ideal case
                this._advanceOne(this.currentIndex);
                this._processedWordCount++;
                advanced = true;

            } else if (this.currentIndex + 1 < this.tokens.length) {
                // Check one-word lookahead (skip a short function word)
                const target1 = this.tokens[this.currentIndex + 1].clean;
                if (this.isWordMatch(spokenNorm, target1)) {
                    // Mark the skipped word as missed, advance two steps
                    this.missedWords.push(this.tokens[this.currentIndex]);
                    this.currentIndex++; // skip over missed word
                    this._advanceOne(this.currentIndex);
                    this._processedWordCount++;
                    advanced = true;
                } else {
                    // No match — count this spoken word as consumed but don't advance
                    // the reading cursor, so we stay on the same expected word.
                    this._processedWordCount++;
                }
            } else {
                // Near end of text, no lookahead possible
                this._processedWordCount++;
            }
        }

        if (advanced) {
            this.updateWpm();
        }
    }

    /** Advance currentIndex past `index`, fire callback, check for end. */
    _advanceOne(index) {
        this.tokens[index].matched = true;
        this.matchedCount++;
        this.currentIndex = index + 1;

        if (this.onWordMatched) {
            this.onWordMatched(index, this.tokens[index], this.currentWpm);
        }

        if (this.currentIndex >= this.tokens.length) {
            this.finishReading();
        }
    }

    /**
     * Resilient child-friendly word matcher with phonetic & pronunciation tolerance.
     */
    isWordMatch(spoken, target) {
        if (!spoken || !target) return false;
        if (spoken === target) return true;

        const s = spoken.toLowerCase().replace(/[^a-z0-9]/g, '');
        const t = target.toLowerCase().replace(/[^a-z0-9]/g, '');

        if (!s || !t) return false;
        if (s === t) return true;

        // French article elision tolerance: "lune" vs "lalune", "arbre" vs "larbre"
        if (s === 'l' + t || s === 'd' + t || t === 'l' + s || t === 'd' + s) return true;

        // Prefix match (e.g. "regarde" for "regarder", "jump" for "jumped", "pipe" for "pip")
        if (s.length >= 3 && t.length >= 3) {
            if (s.startsWith(t) || t.startsWith(s)) return true;
        }

        // Levenshtein phonetic distance
        const dist = this.levenshtein(s, t);
        if (t.length <= 3) {
            // Short words (2-3 chars: "pip", "fox", "the", "le", "un"): allow distance <= 1!
            return dist <= 1;
        } else if (t.length <= 6) {
            return dist <= (t.length >= 5 ? 2 : 1);
        } else {
            return dist <= 2;
        }
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
