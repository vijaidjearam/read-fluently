/**
 * Audio & Text-to-Speech (TTS) Engine for ReadFluently
 * 
 * Fine-tuned for smooth, low-latency word synchronization in French and English.
 */

class AudioManager {
    constructor() {
        this.ctx = null;
        this.soundEnabled = true;
        this.synth = window.speechSynthesis || null;
        this.voices = [];
        this.currentLang = 'en';
        this.selectedVoiceURI = localStorage.getItem('rf_selected_voice') || null;
        this.selectedGender = localStorage.getItem('rf_selected_gender') || 'auto';
        this.lastChimeTime = 0;
        
        // Read-along playback state
        this.readAlongState = {
            isRunning: false,
            pacerInterval: null,
            keepAliveTimer: null,
            utterance: null,
            voiceHasBoundaries: false
        };

        this.initVoices();
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    setSoundEnabled(enabled) {
        this.soundEnabled = enabled;
    }

    setLanguage(lang) {
        this.currentLang = lang;
        this.updateVoiceOptions();
    }

    initVoices() {
        if (!this.synth) return;

        const load = () => {
            this.voices = this.synth.getVoices();
            this.updateVoiceOptions();
        };

        load();
        if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = load;
        }
    }

    detectGender(voice) {
        const name = (voice.name + ' ' + (voice.voiceURI || '')).toLowerCase();
        
        const femaleKeywords = [
            'female', 'woman', 'girl', 'zira', 'julie', 'hortense', 'denise', 'celine',
            'virginie', 'audrey', 'aurelie', 'amelie', 'samantha', 'victoria', 'karen',
            'susan', 'catherine', 'jenny', 'aria', 'hazel', 'charlotte', 'alice'
        ];
        const maleKeywords = [
            'male', 'man', 'boy', 'david', 'mark', 'paul', 'george', 'henri', 'pierre',
            'thomas', 'nicolas', 'alain', 'claude', 'guy', 'daniel', 'richard', 'james',
            'oliver', 'arthur'
        ];

        for (const kw of femaleKeywords) {
            if (name.includes(kw)) return 'female';
        }
        for (const kw of maleKeywords) {
            if (name.includes(kw)) return 'male';
        }
        return 'neutral';
    }

    getVoicesForLanguage(lang = this.currentLang) {
        const prefix = lang === 'fr' ? 'fr' : 'en';
        return this.voices.filter(v => v.lang && v.lang.toLowerCase().startsWith(prefix));
    }

    getActiveVoice() {
        const available = this.getVoicesForLanguage(this.currentLang);
        if (available.length === 0) {
            return this.voices[0] || null;
        }

        if (this.selectedVoiceURI) {
            const found = available.find(v => v.voiceURI === this.selectedVoiceURI);
            if (found) return found;
        }

        if (this.selectedGender && this.selectedGender !== 'auto') {
            const byGender = available.find(v => this.detectGender(v) === this.selectedGender);
            if (byGender) return byGender;
        }

        return available.find(v => v.default) || available[0];
    }

    setVoiceByURI(uri) {
        this.selectedVoiceURI = uri;
        localStorage.setItem('rf_selected_voice', uri);
        const voice = this.voices.find(v => v.voiceURI === uri);
        if (voice) {
            this.selectedGender = this.detectGender(voice);
            localStorage.setItem('rf_selected_gender', this.selectedGender);
        }
    }

    setGender(gender) {
        this.selectedGender = gender;
        localStorage.setItem('rf_selected_gender', gender);
        const voice = this.getActiveVoice();
        if (voice) {
            this.selectedVoiceURI = voice.voiceURI;
            localStorage.setItem('rf_selected_voice', voice.voiceURI);
        }
        this.updateVoiceOptions();
    }

    updateVoiceOptions() {
        const select = document.getElementById('select-tts-voice');
        if (!select) return;

        const available = this.getVoicesForLanguage(this.currentLang);
        select.innerHTML = '';

        if (available.length === 0) {
            const opt = document.createElement('option');
            opt.value = '';
            opt.textContent = this.currentLang === 'fr' ? 'Voix par défaut' : 'Default System Voice';
            select.appendChild(opt);
            return;
        }

        const activeVoice = this.getActiveVoice();

        available.forEach(v => {
            const opt = document.createElement('option');
            opt.value = v.voiceURI;
            const gender = this.detectGender(v);
            const genderLabel = gender === 'female' ? '👩' : gender === 'male' ? '👨' : '👤';
            
            let cleanName = v.name
                .replace(/Microsoft/g, '')
                .replace(/Google/g, '')
                .replace(/Desktop/g, '')
                .replace(/Online \(Natural\)/g, 'Natural')
                .replace(/-/g, '')
                .trim();
            
            opt.textContent = `${genderLabel} ${cleanName} (${v.lang})`;
            if (activeVoice && v.voiceURI === activeVoice.voiceURI) {
                opt.selected = true;
            }
            select.appendChild(opt);
        });
    }

    testCurrentVoice() {
        const sentence = window.i18n ? window.i18n.t('voiceTestSentence') : (this.currentLang === 'fr' ? 'Bonjour ! Je suis prêt à lire avec toi.' : 'Hello! I am ready to read stories with you.');
        this.speakSentence(sentence);
    }

    speakWord(word) {
        if (!this.synth) return;
        this.stopSpeaking();

        const clean = word.replace(/[^\w\s'’àâéèêëîïôùûüçÀÂÉÈÊËÎÏÔÙÛÜÇ-]/g, '').trim();
        if (!clean) return;

        const utterance = new SpeechSynthesisUtterance(clean);
        utterance.lang = this.currentLang === 'fr' ? 'fr-FR' : 'en-US';
        utterance.rate = 0.88;
        utterance.pitch = 1.05;

        const voice = this.getActiveVoice();
        if (voice) {
            utterance.voice = voice;
        }

        this.synth.speak(utterance);
    }

    speakSentence(sentence) {
        if (!this.synth) return;
        this.stopSpeaking();

        const utterance = new SpeechSynthesisUtterance(sentence);
        utterance.lang = this.currentLang === 'fr' ? 'fr-FR' : 'en-US';
        utterance.rate = 0.92;
        utterance.pitch = 1.05;

        const voice = this.getActiveVoice();
        if (voice) {
            utterance.voice = voice;
        }

        this.synth.speak(utterance);
    }

    /**
     * Read whole story aloud with finely-tuned real-time word highlighting.
     */
    readTextAloud(text, tokensOrCallback, callbackOrEnd, optionalEnd) {
        if (!this.synth) return;
        this.stopSpeaking();

        let tokens = null;
        let onWordCallback = null;
        let onEndCallback = null;

        if (Array.isArray(tokensOrCallback)) {
            tokens = tokensOrCallback;
            onWordCallback = callbackOrEnd;
            onEndCallback = optionalEnd;
        } else {
            onWordCallback = tokensOrCallback;
            onEndCallback = callbackOrEnd;
        }

        if (!tokens || tokens.length === 0) {
            const raw = text.trim().split(/\s+/).filter(Boolean);
            tokens = raw.map((w, idx) => ({ index: idx, original: w }));
        }

        // Exact regex token range scanner: avoids substring indexOf collisions
        const regex = /\S+/g;
        let match;
        const tokenRanges = [];
        let rIdx = 0;
        while ((match = regex.exec(text)) !== null) {
            tokenRanges.push({
                index: rIdx,
                start: match.index,
                end: match.index + match[0].length,
                original: match[0]
            });
            rIdx++;
        }

        // Calibrated timings matching Web Speech rate 0.9
        const rate = 0.9;
        let cumulativeMs = 0;

        const tokenTimings = tokens.map((tok, idx) => {
            const raw = tok.original || '';
            const clean = raw.replace(/[^\w]/g, '');
            const len = Math.max(clean.length, 1);
            
            // Tuned base word duration
            let durationMs = 190 + (len * 30);

            if (len <= 2) {
                durationMs = 210;
            } else if (len <= 4) {
                durationMs = 260;
            } else if (len >= 9) {
                durationMs = 380;
            }

            // Punctuation pauses
            if (/[.!?]$/.test(raw) || /[.!?]['"»”]?$/.test(raw)) {
                durationMs += 190;
            } else if (/[,;:—]$/.test(raw) || /[,;:—]['"»”]?$/.test(raw)) {
                durationMs += 110;
            } else if (raw.includes('\n')) {
                durationMs += 150;
            }

            durationMs = Math.round(durationMs / rate);

            const startMs = cumulativeMs;
            cumulativeMs += durationMs;
            const endMs = cumulativeMs;

            return {
                index: idx,
                startMs,
                endMs,
                durationMs,
                original: raw
            };
        });

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = this.currentLang === 'fr' ? 'fr-FR' : 'en-US';
        utterance.rate = rate;
        utterance.pitch = 1.05;

        const voice = this.getActiveVoice();
        if (voice) {
            utterance.voice = voice;
        }

        // Player state
        let startTime = 0;
        let timeOffset = 0;
        let currentHighlightedIndex = -1;
        this.readAlongState.isRunning = true;
        this.readAlongState.voiceHasBoundaries = false;
        this.readAlongState.utterance = utterance;

        const startHeartbeat = () => {
            startTime = Date.now();
            currentHighlightedIndex = 0;
            if (onWordCallback) onWordCallback(0);

            this.readAlongState.pacerInterval = setInterval(() => {
                if (!this.readAlongState.isRunning) return;

                // If native boundary events are actively driving this voice, let them lead
                if (this.readAlongState.voiceHasBoundaries) {
                    return;
                }

                const elapsed = Date.now() - startTime + timeOffset;

                // Advance sequentially
                for (let i = 0; i < tokenTimings.length; i++) {
                    const item = tokenTimings[i];
                    if (elapsed >= item.startMs && elapsed < item.endMs) {
                        if (i !== currentHighlightedIndex) {
                            currentHighlightedIndex = i;
                            if (onWordCallback) onWordCallback(i);
                        }
                        break;
                    } else if (i === tokenTimings.length - 1 && elapsed >= item.endMs) {
                        if (currentHighlightedIndex !== i) {
                            currentHighlightedIndex = i;
                            if (onWordCallback) onWordCallback(i);
                        }
                    }
                }
            }, 20);
        };

        let hasStarted = false;
        const triggerStart = () => {
            if (!hasStarted && this.readAlongState.isRunning) {
                hasStarted = true;
                startHeartbeat();
            }
        };

        utterance.onstart = () => {
            triggerStart();
        };

        // Fallback in case onstart is delayed
        setTimeout(() => {
            if (this.readAlongState.isRunning && !hasStarted) {
                triggerStart();
            }
        }, 250);

        // Native boundary event listener
        utterance.onboundary = (event) => {
            if (!this.readAlongState.isRunning) return;

            if (typeof event.charIndex === 'number' && event.charIndex >= 0) {
                let matchedIndex = -1;
                for (let i = 0; i < tokenRanges.length; i++) {
                    const nextStart = (i < tokenRanges.length - 1) ? tokenRanges[i + 1].start : Infinity;
                    if (event.charIndex >= tokenRanges[i].start && event.charIndex < nextStart) {
                        matchedIndex = i;
                        break;
                    }
                }

                if (matchedIndex !== -1 && matchedIndex !== currentHighlightedIndex) {
                    // Signal that native boundary events are functional on this voice
                    if (matchedIndex > 0) {
                        this.readAlongState.voiceHasBoundaries = true;
                    }
                    currentHighlightedIndex = matchedIndex;
                    if (onWordCallback) onWordCallback(matchedIndex);

                    if (startTime > 0 && tokenTimings[matchedIndex]) {
                        const expectedStart = tokenTimings[matchedIndex].startMs;
                        const actualElapsed = Date.now() - startTime;
                        timeOffset = expectedStart - actualElapsed;
                    }
                }
            }
        };

        utterance.onend = () => {
            const wasRunning = this.readAlongState.isRunning;
            this.cleanUpReadAlong();
            if (wasRunning) {
                if (onWordCallback && tokens.length > 0) {
                    onWordCallback(tokens.length - 1);
                }
                if (onEndCallback) {
                    onEndCallback();
                }
            }
        };

        utterance.onerror = (e) => {
            const wasRunning = this.readAlongState.isRunning;
            this.cleanUpReadAlong();
            if (wasRunning && onEndCallback) {
                onEndCallback();
            }
        };

        // Chrome keep-alive to prevent 15s freeze
        this.readAlongState.keepAliveTimer = setInterval(() => {
            if (this.synth.speaking) {
                this.synth.pause();
                this.synth.resume();
            } else {
                clearInterval(this.readAlongState.keepAliveTimer);
            }
        }, 10000);

        this.synth.speak(utterance);
    }

    cleanUpReadAlong() {
        this.readAlongState.isRunning = false;
        if (this.readAlongState.pacerInterval) {
            clearInterval(this.readAlongState.pacerInterval);
            this.readAlongState.pacerInterval = null;
        }
        if (this.readAlongState.keepAliveTimer) {
            clearInterval(this.readAlongState.keepAliveTimer);
            this.readAlongState.keepAliveTimer = null;
        }
        this.readAlongState.utterance = null;
    }

    stopSpeaking() {
        this.cleanUpReadAlong();
        if (this.synth) {
            this.synth.cancel();
        }
    }

    // -------------------------------------------------------------
    // SYNTHETIC CHIMES & SOUND EFFECTS (WEB AUDIO API)
    // -------------------------------------------------------------

    playTick() {
        if (!this.soundEnabled) return;
        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.04);

        gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.04);
    }

    playWordChime() {
        if (!this.soundEnabled) return;
        // Throttle chime so rapid multi-words don't clash audio oscillators
        const now = Date.now();
        if (this.lastChimeTime && now - this.lastChimeTime < 130) return;
        this.lastChimeTime = now;

        this.init();
        if (!this.ctx) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(659.25, this.ctx.currentTime + 0.06);

        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);

        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.08);
    }

    playSuccessDing() {
        if (!this.soundEnabled) return;
        this.init();
        if (!this.ctx) return;

        const notes = [523.25, 659.25, 783.99, 1046.50];
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.08);

            gain.gain.setValueAtTime(0.15, this.ctx.currentTime + idx * 0.08);
            gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.08 + 0.25);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(this.ctx.currentTime + idx * 0.08);
            osc.stop(this.ctx.currentTime + idx * 0.08 + 0.25);
        });
    }

    playFanfare() {
        if (!this.soundEnabled) return;
        this.init();
        if (!this.ctx) return;

        const melody = [
            { f: 523.25, d: 0.12 },
            { f: 659.25, d: 0.12 },
            { f: 783.99, d: 0.12 },
            { f: 1046.50, d: 0.35 }
        ];

        let time = this.ctx.currentTime;
        melody.forEach(note => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(note.f, time);

            gain.gain.setValueAtTime(0.2, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + note.d);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start(time);
            osc.stop(time + note.d);
            time += note.d * 0.9;
        });
    }
}

window.audioManager = new AudioManager();
