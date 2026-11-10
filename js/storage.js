/**
 * Storage Manager for ReadFluently
 * 
 * Manages user profiles and reading progress exclusively through TEXT FILES
 * and local memory caching (NO DATABASE REQUIRED).
 */

const BADGES_CATALOG = [
    { id: "badge_first_read", title: "First Reader", icon: "⭐", desc: "Completed your very first reading story!" },
    { id: "badge_speed_50", title: "Steady Turtle", icon: "🐢", desc: "Reached 50+ Words Per Minute!" },
    { id: "badge_speed_60", title: "Speed Explorer", icon: "🚀", desc: "Reached 60+ Words Per Minute!" },
    { id: "badge_speed_75", title: "Fast Bunny", icon: "🐰", desc: "Reached 75+ Words Per Minute!" },
    { id: "badge_speed_90", title: "Cheetah Speed", icon: "🐆", desc: "Reached 90+ Words Per Minute!" },
    { id: "badge_speed_100", title: "Rocket Reader", icon: "⚡", desc: "Reached 100+ Words Per Minute!" },
    { id: "badge_comprehension_100", title: "Comprehension Ace", icon: "🎯", desc: "Scored 100% on reading comprehension!" },
    { id: "badge_words_250", title: "Word Explorer", icon: "📚", desc: "Read over 250 words!" },
    { id: "badge_words_500", title: "500 Words Master", icon: "🏆", desc: "Read over 500 words!" },
    { id: "badge_words_1000", title: "Legendary Bookworm", icon: "👑", desc: "Read over 1,000 words!" },
    { id: "badge_sessions_5", title: "High Five Reader", icon: "✋", desc: "Completed 5 reading sessions!" },
    { id: "badge_perfect_accuracy", title: "Sharp Speaker", icon: "🎙️", desc: "Achieved 95%+ speech accuracy!" }
];

class StorageManager {
    constructor() {
        this.STORAGE_KEY = 'read_fluently_profiles';
        this.ACTIVE_PROFILE_KEY = 'read_fluently_active_id';
        this.profiles = [];
        this.activeProfileId = null;
        this.fileHandle = null; // Optional FileSystemFileHandle for live file sync
    }

    init() {
        this.loadFromLocal();
        if (this.profiles.length === 0) {
            this.createDefaultLeoProfile();
        }
        if (!this.activeProfileId || !this.getProfile(this.activeProfileId)) {
            this.activeProfileId = this.profiles[0].id;
            this.saveToLocal();
        }
    }

    createDefaultLeoProfile() {
        const defaultProfile = {
            id: "profile_leo_default",
            name: "Leo",
            avatar: "🦁",
            avatarName: "Brave Lion",
            grade: "Grade 2",
            targetWPM: 75,
            createdDate: "2026-11-01T14:00:00.000Z",
            lastActive: new Date().toISOString(),
            badges: [
                "badge_first_read",
                "badge_speed_60",
                "badge_speed_75",
                "badge_comprehension_100",
                "badge_words_500"
            ],
            sessions: [
                {
                    id: "sess_01",
                    date: "2026-11-01T14:20:00.000Z",
                    title: "The Magic Tree Fox",
                    wordCount: 95,
                    durationSeconds: 92,
                    wpm: 62,
                    accuracy: 92,
                    comprehensionScore: 100,
                    comprehensionQuestions: 3,
                    comprehensionCorrect: 3
                },
                {
                    id: "sess_02",
                    date: "2026-11-03T16:10:00.000Z",
                    title: "Space Adventure",
                    wordCount: 130,
                    durationSeconds: 118,
                    wpm: 66,
                    accuracy: 94,
                    comprehensionScore: 100,
                    comprehensionQuestions: 3,
                    comprehensionCorrect: 3
                },
                {
                    id: "sess_03",
                    date: "2026-11-05T15:45:00.000Z",
                    title: "The Lost Puppy",
                    wordCount: 112,
                    durationSeconds: 100,
                    wpm: 67,
                    accuracy: 93,
                    comprehensionScore: 67,
                    comprehensionQuestions: 3,
                    comprehensionCorrect: 2
                },
                {
                    id: "sess_04",
                    date: "2026-11-07T10:15:00.000Z",
                    title: "The Friendly Whale",
                    wordCount: 145,
                    durationSeconds: 122,
                    wpm: 71,
                    accuracy: 96,
                    comprehensionScore: 100,
                    comprehensionQuestions: 3,
                    comprehensionCorrect: 3
                },
                {
                    id: "sess_05",
                    date: "2026-11-09T10:30:00.000Z",
                    title: "The Secret Garden",
                    wordCount: 160,
                    durationSeconds: 123,
                    wpm: 78,
                    accuracy: 97,
                    comprehensionScore: 100,
                    comprehensionQuestions: 3,
                    comprehensionCorrect: 3
                }
            ]
        };
        this.profiles = [defaultProfile];
        this.activeProfileId = defaultProfile.id;
        this.saveToLocal();
    }

    loadFromLocal() {
        try {
            const raw = localStorage.getItem(this.STORAGE_KEY);
            if (raw) {
                this.profiles = JSON.parse(raw);
            }
            this.activeProfileId = localStorage.getItem(this.ACTIVE_PROFILE_KEY);
        } catch (e) {
            console.error('Error loading profiles from localStorage:', e);
            this.profiles = [];
        }
    }

    saveToLocal() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.profiles));
            if (this.activeProfileId) {
                localStorage.setItem(this.ACTIVE_PROFILE_KEY, this.activeProfileId);
            }
        } catch (e) {
            console.error('Error saving profiles to localStorage:', e);
        }
    }

    getAllProfiles() {
        return this.profiles;
    }

    getActiveProfile() {
        return this.profiles.find(p => p.id === this.activeProfileId) || this.profiles[0] || null;
    }

    setActiveProfile(id) {
        if (this.profiles.some(p => p.id === id)) {
            this.activeProfileId = id;
            this.saveToLocal();
            return true;
        }
        return false;
    }

    createProfile({ name, avatar, avatarName, grade, targetWPM }) {
        const id = 'profile_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);
        const newProfile = {
            id,
            name: name.trim() || "Young Reader",
            avatar: avatar || "🦉",
            avatarName: avatarName || "Wise Owl",
            grade: grade || "Grade 2",
            targetWPM: parseInt(targetWPM, 10) || 70,
            createdDate: new Date().toISOString(),
            lastActive: new Date().toISOString(),
            badges: [],
            sessions: []
        };
        this.profiles.push(newProfile);
        this.activeProfileId = id;
        this.saveToLocal();
        return newProfile;
    }

    updateProfile(id, updates) {
        const profile = this.getProfile(id);
        if (profile) {
            Object.assign(profile, updates);
            this.saveToLocal();
            return profile;
        }
        return null;
    }

    deleteProfile(id) {
        if (this.profiles.length <= 1) {
            return false; // keep at least one profile
        }
        this.profiles = this.profiles.filter(p => p.id !== id);
        if (this.activeProfileId === id) {
            this.activeProfileId = this.profiles[0].id;
        }
        this.saveToLocal();
        return true;
    }

    getProfile(id) {
        return this.profiles.find(p => p.id === id) || null;
    }

    // Add session record to the active profile
    recordSession(sessionData) {
        const profile = this.getActiveProfile();
        if (!profile) return null;

        const session = {
            id: 'sess_' + Date.now(),
            date: new Date().toISOString(),
            title: sessionData.title || "Reading Session",
            wordCount: sessionData.wordCount || 0,
            durationSeconds: sessionData.durationSeconds || 0,
            wpm: sessionData.wpm || 0,
            accuracy: sessionData.accuracy || 100,
            comprehensionScore: sessionData.comprehensionScore !== undefined ? sessionData.comprehensionScore : 100,
            comprehensionQuestions: sessionData.comprehensionQuestions || 0,
            comprehensionCorrect: sessionData.comprehensionCorrect || 0
        };

        if (!profile.sessions) profile.sessions = [];
        profile.sessions.push(session);
        profile.lastActive = new Date().toISOString();

        // Check & unlock any new badges
        const newlyEarnedBadges = this.checkBadges(profile, session);

        this.saveToLocal();
        return { session, newlyEarnedBadges };
    }

    checkBadges(profile, lastSession) {
        if (!profile.badges) profile.badges = [];
        const earned = [];

        const addBadge = (bId) => {
            if (!profile.badges.includes(bId)) {
                profile.badges.push(bId);
                const badgeInfo = BADGES_CATALOG.find(b => b.id === bId);
                if (badgeInfo) earned.push(badgeInfo);
            }
        };

        const totalWords = profile.sessions.reduce((sum, s) => sum + (s.wordCount || 0), 0);
        const count = profile.sessions.length;

        // First session
        if (count >= 1) addBadge("badge_first_read");

        // Speed badges
        if (lastSession.wpm >= 50) addBadge("badge_speed_50");
        if (lastSession.wpm >= 60) addBadge("badge_speed_60");
        if (lastSession.wpm >= 75) addBadge("badge_speed_75");
        if (lastSession.wpm >= 90) addBadge("badge_speed_90");
        if (lastSession.wpm >= 100) addBadge("badge_speed_100");

        // Comprehension badge
        if (lastSession.comprehensionScore === 100) addBadge("badge_comprehension_100");

        // Word count milestones
        if (totalWords >= 250) addBadge("badge_words_250");
        if (totalWords >= 500) addBadge("badge_words_500");
        if (totalWords >= 1000) addBadge("badge_words_1000");

        // Session count milestone
        if (count >= 5) addBadge("badge_sessions_5");

        // Accuracy badge
        if (lastSession.accuracy >= 95 && lastSession.wordCount >= 30) addBadge("badge_perfect_accuracy");

        return earned;
    }

    // Compute aggregate statistics for a profile
    getProfileStats(profile) {
        if (!profile || !profile.sessions || profile.sessions.length === 0) {
            return {
                sessionCount: 0,
                totalWords: 0,
                avgWpm: 0,
                topWpm: 0,
                avgComprehension: 0,
                avgAccuracy: 0,
                totalTimeSeconds: 0
            };
        }

        const sessions = profile.sessions;
        const totalWords = sessions.reduce((acc, s) => acc + (s.wordCount || 0), 0);
        const totalWpm = sessions.reduce((acc, s) => acc + (s.wpm || 0), 0);
        const topWpm = sessions.reduce((max, s) => Math.max(max, s.wpm || 0), 0);
        const totalComp = sessions.reduce((acc, s) => acc + (s.comprehensionScore || 0), 0);
        const totalAcc = sessions.reduce((acc, s) => acc + (s.accuracy || 100), 0);
        const totalTime = sessions.reduce((acc, s) => acc + (s.durationSeconds || 0), 0);

        return {
            sessionCount: sessions.length,
            totalWords,
            avgWpm: Math.round(totalWpm / sessions.length),
            topWpm,
            avgComprehension: Math.round(totalComp / sessions.length),
            avgAccuracy: Math.round(totalAcc / sessions.length),
            totalTimeSeconds: totalTime
        };
    }

    // -------------------------------------------------------------
    // TEXT FILE GENERATION & PARSING (NO DATABASE)
    // -------------------------------------------------------------

    /**
     * Serializes a profile into a beautiful, human-readable TEXT FILE (.txt)
     * containing both an easy-to-read printable log AND an embedded JSON payload
     * so it can be re-imported seamlessly anywhere.
     */
    serializeProfileToText(profile) {
        const stats = this.getProfileStats(profile);
        const createdDate = new Date(profile.createdDate || Date.now()).toLocaleDateString();
        const lastActive = new Date(profile.lastActive || Date.now()).toLocaleString();
        const mins = Math.floor(stats.totalTimeSeconds / 60);
        const secs = stats.totalTimeSeconds % 60;

        let txt = `============================================================\n`;
        txt += `READ FLUENTLY - CHILD READING PROGRESS FILE\n`;
        txt += `============================================================\n`;
        txt += `Child Name    : ${profile.name}\n`;
        txt += `Avatar        : ${profile.avatar} ${profile.avatarName || ''}\n`;
        txt += `Grade / Level : ${profile.grade}\n`;
        txt += `Target WPM    : ${profile.targetWPM} WPM\n`;
        txt += `Date Created  : ${createdDate}\n`;
        txt += `Last Active   : ${lastActive}\n\n`;

        txt += `------------------------------------------------------------\n`;
        txt += `SUMMARY METRICS\n`;
        txt += `------------------------------------------------------------\n`;
        txt += `Total Sessions Completed : ${stats.sessionCount}\n`;
        txt += `Total Words Read         : ${stats.totalWords.toLocaleString()} words\n`;
        txt += `Average Reading Speed    : ${stats.avgWpm} WPM\n`;
        txt += `Highest Speed Recorded   : ${stats.topWpm} WPM\n`;
        txt += `Average Comprehension    : ${stats.avgComprehension}%\n`;
        txt += `Average Word Accuracy    : ${stats.avgAccuracy}%\n`;
        txt += `Total Reading Time       : ${mins} minutes ${secs} seconds\n\n`;

        txt += `------------------------------------------------------------\n`;
        txt += `SESSION HISTORY LOG\n`;
        txt += `------------------------------------------------------------\n`;
        if (profile.sessions && profile.sessions.length > 0) {
            profile.sessions.slice(-20).forEach(s => {
                const dt = new Date(s.date).toISOString().replace('T', ' ').substr(0, 16);
                const sMins = Math.floor(s.durationSeconds / 60);
                const sSecs = s.durationSeconds % 60;
                const timeStr = `${sMins}m ${sSecs < 10 ? '0' : ''}${sSecs}s`;
                txt += `[${dt}] Story: ${(s.title || 'Practice').padEnd(22)} | Words: ${String(s.wordCount).padEnd(4)} | Time: ${timeStr.padEnd(7)} | Speed: ${String(s.wpm).padEnd(3)} WPM | Accuracy: ${s.accuracy}% | Comprehension: ${s.comprehensionScore}%\n`;
            });
        } else {
            txt += `(No reading sessions recorded yet)\n`;
        }
        txt += `\n`;

        txt += `------------------------------------------------------------\n`;
        txt += `EARNED BADGES & ACHIEVEMENTS\n`;
        txt += `------------------------------------------------------------\n`;
        if (profile.badges && profile.badges.length > 0) {
            profile.badges.forEach(bId => {
                const b = BADGES_CATALOG.find(cat => cat.id === bId);
                if (b) {
                    txt += `[${b.icon}] ${(b.title).padEnd(20)}: ${b.desc}\n`;
                }
            });
        } else {
            txt += `(Complete reading adventures to unlock badges!)\n`;
        }
        txt += `\n`;

        txt += `============================================================\n`;
        txt += `APPLICATION DATA PAYLOAD (READ FLUENTLY RE-IMPORT DATA)\n`;
        txt += `============================================================\n`;
        txt += `DATA_PAYLOAD_START\n`;
        txt += JSON.stringify(profile, null, 2);
        txt += `\nDATA_PAYLOAD_END\n`;
        txt += `============================================================\n`;

        return txt;
    }

    /**
     * Parses a text file content into a profile object.
     * Extracts either the embedded DATA_PAYLOAD block or falls back to parsing JSON / header lines.
     */
    parseProfileFromText(text) {
        if (!text || typeof text !== 'string') {
            throw new Error('Invalid text file content.');
        }

        // 1. Try finding DATA_PAYLOAD block
        const startMarker = 'DATA_PAYLOAD_START';
        const endMarker = 'DATA_PAYLOAD_END';
        const startIdx = text.indexOf(startMarker);
        const endIdx = text.indexOf(endMarker);

        if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
            const jsonStr = text.substring(startIdx + startMarker.length, endIdx).trim();
            try {
                const parsed = JSON.parse(jsonStr);
                if (parsed.name) {
                    return parsed;
                }
            } catch (err) {
                console.warn('Payload JSON parse failed, trying direct fallback...', err);
            }
        }

        // 2. Try parsing entire text as raw JSON
        try {
            const rawJson = JSON.parse(text.trim());
            if (rawJson.name) return rawJson;
        } catch (e) {
            // Not pure JSON
        }

        // 3. Fallback: Parse human-readable lines
        const lines = text.split('\n');
        const profile = {
            id: 'profile_' + Date.now(),
            name: 'Imported Reader',
            avatar: '🦉',
            avatarName: 'Wise Owl',
            grade: 'Grade 2',
            targetWPM: 70,
            createdDate: new Date().toISOString(),
            lastActive: new Date().toISOString(),
            badges: [],
            sessions: []
        };

        lines.forEach(line => {
            const [key, ...rest] = line.split(':');
            if (key && rest.length > 0) {
                const val = rest.join(':').trim();
                const k = key.trim().toLowerCase();
                if (k.includes('child name')) profile.name = val;
                if (k.includes('grade')) profile.grade = val;
                if (k.includes('target wpm')) {
                    const num = parseInt(val, 10);
                    if (!isNaN(num)) profile.targetWPM = num;
                }
                if (k.includes('avatar')) {
                    const parts = val.split(' ');
                    if (parts.length > 0) profile.avatar = parts[0];
                }
            }
        });

        return profile;
    }

    /**
     * Download the active profile as a formatted .txt file onto the user's computer.
     */
    downloadProfileTextFile(profile = null) {
        const p = profile || this.getActiveProfile();
        if (!p) return;

        const textContent = this.serializeProfileToText(p);
        const safeName = p.name.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();
        const filename = `${safeName}_reading_profile.txt`;

        const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Export all profiles in a single archive text file
     */
    downloadAllProfilesTextArchive() {
        let content = `============================================================\n`;
        content += `READ FLUENTLY - ALL PROFILES TEXT BACKUP ARCHIVE\n`;
        content += `Created: ${new Date().toLocaleString()}\n`;
        content += `Total Profiles: ${this.profiles.length}\n`;
        content += `============================================================\n\n`;

        content += `ARCHIVE_PAYLOAD_START\n`;
        content += JSON.stringify({
            exportDate: new Date().toISOString(),
            profiles: this.profiles,
            activeProfileId: this.activeProfileId
        }, null, 2);
        content += `\nARCHIVE_PAYLOAD_END\n`;

        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `read_fluently_all_profiles_backup.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    /**
     * Import a text file from a File object
     */
    async importFromTextFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const text = e.target.result;
                    // Check if archive backup
                    if (text.includes('ARCHIVE_PAYLOAD_START')) {
                        const start = text.indexOf('ARCHIVE_PAYLOAD_START') + 'ARCHIVE_PAYLOAD_START'.length;
                        const end = text.indexOf('ARCHIVE_PAYLOAD_END');
                        const data = JSON.parse(text.substring(start, end).trim());
                        if (data.profiles && Array.isArray(data.profiles)) {
                            this.profiles = data.profiles;
                            this.activeProfileId = data.activeProfileId || data.profiles[0].id;
                            this.saveToLocal();
                            resolve({ type: 'archive', count: data.profiles.length });
                            return;
                        }
                    }

                    // Otherwise parse single profile
                    const importedProfile = this.parseProfileFromText(text);
                    // Check if already exists; if so, update, else push
                    const existingIdx = this.profiles.findIndex(p => p.id === importedProfile.id || p.name.toLowerCase() === importedProfile.name.toLowerCase());
                    if (existingIdx !== -1) {
                        this.profiles[existingIdx] = importedProfile;
                    } else {
                        if (!importedProfile.id) importedProfile.id = 'profile_' + Date.now();
                        this.profiles.push(importedProfile);
                    }
                    this.activeProfileId = importedProfile.id;
                    this.saveToLocal();
                    resolve({ type: 'profile', profile: importedProfile });
                } catch (err) {
                    reject(err);
                }
            };
            reader.onerror = () => reject(new Error('Failed to read file.'));
            reader.readAsText(file);
        });
    }

    /**
     * File System Access API: Save directly to a local text file with 1-click
     */
    async saveDirectlyToDisk(profile = null) {
        const p = profile || this.getActiveProfile();
        if (!p) return false;

        const textContent = this.serializeProfileToText(p);
        const safeName = p.name.replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();

        if ('showSaveFilePicker' in window) {
            try {
                const handle = await window.showSaveFilePicker({
                    suggestedName: `${safeName}_reading_profile.txt`,
                    types: [{
                        description: 'Text Documents (*.txt)',
                        accept: { 'text/plain': ['.txt'] }
                    }]
                });
                const writable = await handle.createWritable();
                await writable.write(textContent);
                await writable.close();
                return true;
            } catch (err) {
                if (err.name !== 'AbortError') {
                    console.warn('Direct file save picker error, falling back to download:', err);
                    this.downloadProfileTextFile(p);
                }
                return false;
            }
        } else {
            this.downloadProfileTextFile(p);
            return true;
        }
    }
}

window.storageManager = new StorageManager();
window.BADGES_CATALOG = BADGES_CATALOG;
