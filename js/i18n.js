/**
 * Internationalization (i18n) Engine for ReadFluently
 * Supports English (en) and French (fr)
 */

const I18N_TRANSLATIONS = {
    en: {
        // App header
        brandTitle: "ReadFluently",
        brandSubtitle: "Interactive Reading Speed Trainer for Kids",
        tabReading: "📖 Reading Room",
        tabProgress: "📊 My Progress",
        tabProfiles: "👤 Profiles & Files",

        // Accessibility & Reading Tools Bar
        readingTools: "⚙️ Reading Tools:",
        fontSizeLabel: "Font Size:",
        fontSizeSmall: "Small",
        fontSizeNormal: "Normal",
        fontSizeLarge: "Large (A+)",
        fontSizeXLarge: "Extra Large (A++)",
        dyslexiaFontLabel: "Dyslexia-Friendly Font",
        readingRulerLabel: "Reading Ruler Guide 📏",
        soundEffectsLabel: "Sound Effects 🔔",
        voiceSelectLabel: "Voice:",
        voiceTestBtn: "🔊 Test Voice",

        // Reading Room Input Modes
        modeLibrary: "📚 Story Library",
        modePaste: "📄 Paste Text",
        modeUpload: "📑 Upload PDF / Document",

        // Paste panel
        pasteTitlePlaceholder: "Story Title (e.g., My Favorite Dino Adventure)",
        pasteTextPlaceholder: "Paste reading practice text or chapter here...",
        btnLoadPasted: "Load Into Reading Room ✨",

        // Upload panel
        pdfDropTitle: "Upload a PDF or Text Document",
        pdfDropDesc: "Drag and drop any children's book PDF or homework file, or click to browse",
        btnChoosePdf: "Choose PDF File",

        // Reading Stage
        loadingStory: "Loading Story...",
        wordsCountSuffix: "words",
        wpmGoalSuffix: "WPM Goal",
        btnListenStory: "🔊 Listen to Story",
        btnStopListening: "⏹️ Stop Listening",
        btnReset: "🔄 Reset",
        btnFinishQuiz: "🏁 Finish & Quiz",

        // Live Speed Dashboard
        mascotDefault: "Click the green microphone and read aloud. I'll highlight the words as you say them!",
        mascotListening: "I'm listening to your voice! Read clearly and have fun!",
        mascotPaused: "Take your time! Click the mic whenever you're ready to continue.",
        mascotError: "Please allow microphone access in your browser bar!",
        wpmUnitLabel: "Words / Min (WPM)",
        micReady: "Microphone ready",
        micListening: "Microphone is listening...",
        micPaused: "Paused. Click microphone to resume!",
        btnStartReading: "🎙️ Start Reading Aloud",
        btnPauseMic: "⏸️ Pause Mic",

        // Speed Tiers
        tierTurtle: "🐢 Steady Turtle",
        tierBunny: "🐰 Fast Bunny!",
        tierCheetah: "🐆 Speedy Cheetah!",
        tierRocket: "🚀 Rocket Reader!",
        wordsReadLabel: "Words:",
        timerLabel: "Time:",

        // Quiz
        quizBadge: "🧠 Comprehension Check",
        quizSubtitle: "Answer these quick questions to see how well you understood the story!",
        questionPrefix: "Question",
        ofWord: "of",
        btnCheckAnswers: "Check My Answers ✨",
        btnViewReport: "View Reading Report & Save 🏆",
        quizPerfect: "🌟 Perfect comprehension! You have an incredible reading brain!",
        quizGood: "👍 Great job! You caught almost all the important details!",
        quizPractice: "🌱 Good practice! Every time you read, your comprehension grows stronger!",

        // Final Celebration Modal
        summaryTitle: "Reading Adventure Complete!",
        summaryGreatJob: "Outstanding reading,",
        sumSpeedLabel: "Reading Speed",
        sumSpeedUnit: "Words Per Minute",
        sumCompLabel: "Comprehension",
        sumWordsLabel: "Words Read",
        sumWordsUnit: "total words",
        sumTimeLabel: "Read Time",
        sumTimeUnit: "active time",
        newBadgesTitle: "🎖️ NEW BADGES UNLOCKED!",
        textFileNotice: "📁 Your progress has been saved directly to your profile text records!",
        btnDownloadTxt: "💾 Download Updated Profile Text File (.txt)",
        btnViewDashboard: "📊 View Full Progress Dashboard",
        btnReadAnother: "📖 Read Another Story",

        // Progress Dashboard
        readingProgressTitle: "'s Reading Progress",
        goalLabel: "Reading Speed Goal:",
        statAvgWpm: "Average WPM",
        statTopWpm: "Highest WPM",
        statTotalWords: "Total Words Read",
        statAvgComp: "Comprehension Avg",
        statTotalTime: "Total Read Time",
        chartWpmTitle: "📈 Reading Speed (WPM) Over Time",
        chartWpmTarget: "Target Reference Included",
        chartCompTitle: "🎯 Comprehension & Accuracy Metrics",
        badgesTitle: "🏆 Reading Badges & Achievements",
        historyTitle: "📜 Reading Session History",
        tableDate: "Date & Time",
        tableTitle: "Story Title",
        tableWords: "Words",
        tableTime: "Time",
        tableSpeed: "Speed (WPM)",
        tableComp: "Comprehension",
        tableAcc: "Accuracy",

        // Profiles & Text Files
        textBannerTitle: "100% Lightweight Text File Storage — No Database Overloads!",
        textBannerDesc: "User profiles, WPM progress, and comprehension logs are saved directly in standard text files (.txt). You can download them, print them out, or import them onto any computer!",
        existingProfilesTitle: "👥 Existing Reader Profiles",
        createProfileTitle: "✨ Create New Reader Profile",
        childNameLabel: "Child's Name:",
        childNamePlaceholder: "e.g. Maya or Sam",
        chooseAvatarLabel: "Choose Reader Avatar:",
        gradeLabel: "Grade / Age Level:",
        targetWpmLabel: "Target Speed Goal (WPM):",
        btnCreateProfile: "Create Reader Profile 🌟",
        textBackupsTitle: "💾 Text File Backups & Transfer",
        textBackupsDesc: "Easily import and export your reading logs without any database setup.",
        btnDownloadActiveTxt: "📥 Download Active Profile as .txt File",
        btnSaveDirectDisk: "💾 Save Directly to Computer (1-Click)",
        btnDownloadAllArchive: "📦 Download All Profiles Archive (.txt)",
        btnImportTxt: "📂 Import Profile from .txt or .json File",
        switchProfileBtn: "Switch to Profile",
        exportTxtBtn: "💾 Export Text File",
        viewFileBtn: "📄 View File",
        rawPreviewTitle: "📄 Text File Preview:",
        rawPreviewDesc: "This plain text file is saved directly on your computer. Parents and teachers can open it in Notepad or print it anytime!",
        closeBtn: "Close",

        // Voice test phrase
        voiceTestSentence: "Hello! I am ready to read stories with you today!"
    },

    fr: {
        // App header
        brandTitle: "ReadFluently",
        brandSubtitle: "Entraîneur interactif de vitesse de lecture pour enfants",
        tabReading: "📖 Salle de lecture",
        tabProgress: "📊 Mes progrès",
        tabProfiles: "👤 Profils & Fichiers",

        // Accessibility & Reading Tools Bar
        readingTools: "⚙️ Outils de lecture :",
        fontSizeLabel: "Taille police :",
        fontSizeSmall: "Petite",
        fontSizeNormal: "Normale",
        fontSizeLarge: "Grande (A+)",
        fontSizeXLarge: "Très grande (A++)",
        dyslexiaFontLabel: "Police adaptée dyslexie",
        readingRulerLabel: "Règle de lecture 📏",
        soundEffectsLabel: "Effets sonores 🔔",
        voiceSelectLabel: "Voix :",
        voiceTestBtn: "🔊 Tester la voix",

        // Reading Room Input Modes
        modeLibrary: "📚 Bibliothèque",
        modePaste: "📄 Coller un texte",
        modeUpload: "📑 Importer PDF / Document",

        // Paste panel
        pasteTitlePlaceholder: "Titre de l'histoire (ex. Mon aventure préférée)",
        pasteTextPlaceholder: "Collez le texte d'entraînement à la lecture ou un chapitre ici...",
        btnLoadPasted: "Charger dans la salle de lecture ✨",

        // Upload panel
        pdfDropTitle: "Importer un document PDF ou Texte",
        pdfDropDesc: "Glissez-déposez le PDF d'un livre d'enfant ou un devoir, ou cliquez pour parcourir",
        btnChoosePdf: "Choisir un fichier PDF",

        // Reading Stage
        loadingStory: "Chargement de l'histoire...",
        wordsCountSuffix: "mots",
        wpmGoalSuffix: "Objectif MPM",
        btnListenStory: "🔊 Écouter l'histoire",
        btnStopListening: "⏹️ Arrêter l'écoute",
        btnReset: "🔄 Recommencer",
        btnFinishQuiz: "🏁 Terminer & Quiz",

        // Live Speed Dashboard
        mascotDefault: "Clique sur le micro vert et lis à voix haute. Je surlignerai les mots au fur et à mesure !",
        mascotListening: "J'écoute ta voix ! Lis clairement et amuse-toi !",
        mascotPaused: "Prends ton temps ! Clique sur le micro quand tu es prêt à continuer.",
        mascotError: "Merci d'autoriser l'accès au microphone dans la barre de ton navigateur !",
        wpmUnitLabel: "Mots / Min (MPM)",
        micReady: "Microphone prêt",
        micListening: "Le micro écoute...",
        micPaused: "En pause. Clique sur le micro pour reprendre !",
        btnStartReading: "🎙️ Commencer la lecture à voix haute",
        btnPauseMic: "⏸️ Mettre en pause",

        // Speed Tiers
        tierTurtle: "🐢 Tortue tranquille",
        tierBunny: "🐰 Lapin rapide !",
        tierCheetah: "🐆 Guépard agile !",
        tierRocket: "🚀 Lecteur fusée !",
        wordsReadLabel: "Mots :",
        timerLabel: "Temps :",

        // Quiz
        quizBadge: "🧠 Contrôle de compréhension",
        quizSubtitle: "Réponds à ces quelques questions pour vérifier ce que tu as compris de l'histoire !",
        questionPrefix: "Question",
        ofWord: "sur",
        btnCheckAnswers: "Vérifier mes réponses ✨",
        btnViewReport: "Voir le rapport de lecture & enregistrer 🏆",
        quizPerfect: "🌟 Compréhension parfaite ! Tu as une mémoire de lecture formidable !",
        quizGood: "👍 Bravo ! Tu as retenu presque tous les détails importants !",
        quizPractice: "🌱 Bon entraînement ! Plus tu lis, plus ta compréhension grandit !",

        // Final Celebration Modal
        summaryTitle: "Aventure de lecture terminée !",
        summaryGreatJob: "Lecture remarquable,",
        sumSpeedLabel: "Vitesse de lecture",
        sumSpeedUnit: "Mots par minute (MPM)",
        sumCompLabel: "Compréhension",
        sumWordsLabel: "Mots lus",
        sumWordsUnit: "mots au total",
        sumTimeLabel: "Temps de lecture",
        sumTimeUnit: "temps actif",
        newBadgesTitle: "🎖️ NOUVEAUX BADGES DÉBLOQUÉS !",
        textFileNotice: "📁 Ta progression a été sauvegardée directement dans tes fichiers texte !",
        btnDownloadTxt: "💾 Télécharger le fichier texte mis à jour (.txt)",
        btnViewDashboard: "📊 Voir le tableau de bord des progrès",
        btnReadAnother: "📖 Lire une autre histoire",

        // Progress Dashboard
        readingProgressTitle: " : Progrès de lecture",
        goalLabel: "Objectif de vitesse :",
        statAvgWpm: "MPM moyen",
        statTopWpm: "MPM record",
        statTotalWords: "Mots lus au total",
        statAvgComp: "Compréhension moy.",
        statTotalTime: "Temps total de lecture",
        chartWpmTitle: "📈 Vitesse de lecture (MPM) dans le temps",
        chartWpmTarget: "Ligne d'objectif incluse",
        chartCompTitle: "🎯 Mesures de compréhension & d'exactitude",
        badgesTitle: "🏆 Badges & Trophées de lecture",
        historyTitle: "📜 Historique des sessions de lecture",
        tableDate: "Date & Heure",
        tableTitle: "Titre de l'histoire",
        tableWords: "Mots",
        tableTime: "Temps",
        tableSpeed: "Vitesse (MPM)",
        tableComp: "Compréhension",
        tableAcc: "Exactitude",

        // Profiles & Text Files
        textBannerTitle: "Stockage 100% fichiers texte légers — Sans surcharge de base de données !",
        textBannerDesc: "Les profils utilisateurs, la vitesse MPM et les résultats de compréhension sont enregistrés dans des fichiers texte (.txt). Vous pouvez les télécharger, les imprimer ou les ouvrir sur n'importe quel ordinateur !",
        existingProfilesTitle: "👥 Profils lecteurs existants",
        createProfileTitle: "✨ Créer un nouveau profil lecteur",
        childNameLabel: "Prénom de l'enfant :",
        childNamePlaceholder: "ex. Léa ou Thomas",
        chooseAvatarLabel: "Choisir un avatar lecteur :",
        gradeLabel: "Classe / Niveau d'âge :",
        targetWpmLabel: "Objectif de vitesse (MPM) :",
        btnCreateProfile: "Créer le profil lecteur 🌟",
        textBackupsTitle: "💾 Sauvegardes & Transfert par fichiers texte",
        textBackupsDesc: "Importez et exportez vos journaux de lecture simplement sans aucune base de données.",
        btnDownloadActiveTxt: "📥 Télécharger le profil actif (.txt)",
        btnSaveDirectDisk: "💾 Enregistrer directement sur l'ordinateur (1-Clic)",
        btnDownloadAllArchive: "📦 Télécharger l'archive complète des profils (.txt)",
        btnImportTxt: "📂 Importer un profil (.txt ou .json)",
        switchProfileBtn: "Passer à ce profil",
        exportTxtBtn: "💾 Exporter fichier texte",
        viewFileBtn: "📄 Voir le fichier",
        rawPreviewTitle: "📄 Aperçu du fichier texte :",
        rawPreviewDesc: "Ce fichier texte brut est enregistré sur votre ordinateur. Parents et enseignants peuvent l'ouvrir dans le Bloc-notes ou l'imprimer !",
        closeBtn: "Fermer",

        // Voice test phrase
        voiceTestSentence: "Bonjour ! Je suis prêt à lire des histoires avec toi aujourd'hui !"
    }
};

class I18nManager {
    constructor() {
        this.currentLang = localStorage.getItem('rf_language') || 'en';
        if (this.currentLang !== 'en' && this.currentLang !== 'fr') {
            this.currentLang = 'en';
        }
    }

    getLang() {
        return this.currentLang;
    }

    setLang(lang) {
        if (lang === 'en' || lang === 'fr') {
            this.currentLang = lang;
            localStorage.setItem('rf_language', lang);
            this.applyTranslations();
            
            // Notify components
            if (window.audioManager) {
                window.audioManager.setLanguage(lang);
            }
            if (window.app && window.app.speechEngine) {
                window.app.speechEngine.setLanguage(lang);
            }
            if (window.app) {
                window.app.onLanguageChanged(lang);
            }
        }
    }

    toggleLang() {
        const nextLang = this.currentLang === 'en' ? 'fr' : 'en';
        this.setLang(nextLang);
        return nextLang;
    }

    t(key) {
        const dict = I18N_TRANSLATIONS[this.currentLang] || I18N_TRANSLATIONS.en;
        return dict[key] !== undefined ? dict[key] : (I18N_TRANSLATIONS.en[key] || key);
    }

    applyTranslations() {
        document.documentElement.lang = this.currentLang;

        // Translate all elements with data-i18n attribute
        document.querySelectorAll('[data-i18n]').forEach(el => {
            const key = el.getAttribute('data-i18n');
            const translation = this.t(key);
            if (translation) {
                el.textContent = translation;
            }
        });

        // Translate placeholders
        document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
            const key = el.getAttribute('data-i18n-placeholder');
            const translation = this.t(key);
            if (translation) {
                el.placeholder = translation;
            }
        });

        // Update language toggle button visual
        const langToggleBtn = document.getElementById('btn-lang-toggle');
        if (langToggleBtn) {
            if (this.currentLang === 'fr') {
                langToggleBtn.innerHTML = `<span>🇫🇷 Français</span> <span class="lang-switch-sub">(EN)</span>`;
            } else {
                langToggleBtn.innerHTML = `<span>🇬🇧 English</span> <span class="lang-switch-sub">(FR)</span>`;
            }
        }
    }
}

window.i18n = new I18nManager();
