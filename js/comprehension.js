/**
 * Reading Comprehension Module for ReadFluently
 * Supports English and French with curated and dynamically generated questions.
 */

class ComprehensionManager {
    constructor() {
        this.currentQuestions = [];
        this.userAnswers = [];
        this.currentStoryTitle = "";
        this.onComplete = null;
    }

    startQuiz(storyOrText, title, containerElement, onCompleteCallback) {
        this.currentStoryTitle = title || (window.i18n && window.i18n.getLang() === 'fr' ? "Ton aventure de lecture" : "Your Reading Adventure");
        this.onComplete = onCompleteCallback;
        this.userAnswers = [];

        if (storyOrText && storyOrText.questions && storyOrText.questions.length > 0) {
            this.currentQuestions = storyOrText.questions;
        } else {
            const rawText = typeof storyOrText === 'string' ? storyOrText : (storyOrText.text || "");
            this.currentQuestions = this.generateQuestionsFromText(rawText);
        }

        this.renderQuiz(containerElement);
    }

    generateQuestionsFromText(text) {
        const isFr = window.i18n && window.i18n.getLang() === 'fr';
        const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 15);
        const questions = [];

        if (sentences.length === 0) {
            if (isFr) {
                return [{
                    question: "As-tu aimé lire ce texte à voix haute aujourd'hui ?",
                    options: ["Oui, c'était passionnant !", "Oui, et j'ai lu vite !", "Je progresse chaque jour !"],
                    correctIndex: 0,
                    explanation: "Bravo pour ton entraînement de lecture à voix haute !"
                }];
            }
            return [{
                question: "Did you enjoy reading this story aloud today?",
                options: ["Yes, it was wonderful!", "Yes, and I read fast!", "I am getting better every day!"],
                correctIndex: 0,
                explanation: "Great job practicing your reading aloud!"
            }];
        }

        const first = sentences[0];
        const previewFirst = first.length > 70 ? first.substring(0, 68) + '...' : first;

        if (isFr) {
            // French questions
            questions.push({
                question: "Comment commence cette histoire ?",
                options: [
                    previewFirst,
                    "Une journée banale où rien de spécial ne s'est passé.",
                    "Tous les personnages sont allés dormir immédiatement."
                ],
                correctIndex: 0,
                explanation: "L'histoire a débuté par : " + previewFirst
            });

            if (sentences.length >= 3) {
                const midIndex = Math.floor(sentences.length / 2);
                const midSentence = sentences[midIndex];
                const previewMid = midSentence.length > 70 ? midSentence.substring(0, 68) + '...' : midSentence;
                questions.push({
                    question: "Que se passe-t-il au milieu de ce que tu as lu ?",
                    options: [
                        "Une voiture est passée très vite.",
                        previewMid,
                        "Tout le monde a décidé de rentrer chez soi."
                    ],
                    correctIndex: 1,
                    explanation: "Moment clé au milieu : " + previewMid
                });
            }

            const lastSentence = sentences[sentences.length - 1];
            const previewLast = lastSentence.length > 70 ? lastSentence.substring(0, 68) + '...' : lastSentence;
            questions.push({
                question: "Comment se termine ce passage de lecture ?",
                options: [
                    "Tout est resté un grand mystère sans réponse.",
                    "L'histoire a recommencé depuis le tout début.",
                    previewLast
                ],
                correctIndex: 2,
                explanation: "Le passage s'est conclu par : " + previewLast
            });
        } else {
            // English questions
            questions.push({
                question: "How does the story begin?",
                options: [
                    previewFirst,
                    "A quiet day where nothing special happened.",
                    "The characters went to sleep immediately."
                ],
                correctIndex: 0,
                explanation: "The story began with: " + previewFirst
            });

            if (sentences.length >= 3) {
                const midIndex = Math.floor(sentences.length / 2);
                const midSentence = sentences[midIndex];
                const previewMid = midSentence.length > 70 ? midSentence.substring(0, 68) + '...' : midSentence;
                questions.push({
                    question: "What happened in the middle of what you read?",
                    options: [
                        "A fast car drove by quickly.",
                        previewMid,
                        "Everyone decided to go home early."
                    ],
                    correctIndex: 1,
                    explanation: "Key event in the middle: " + previewMid
                });
            }

            const lastSentence = sentences[sentences.length - 1];
            const previewLast = lastSentence.length > 70 ? lastSentence.substring(0, 68) + '...' : lastSentence;
            questions.push({
                question: "How does this reading selection wrap up or end?",
                options: [
                    "Everything remained a total mystery.",
                    "They started over from the very beginning.",
                    previewLast
                ],
                correctIndex: 2,
                explanation: "The selection concluded with: " + previewLast
            });
        }

        return questions.slice(0, 3);
    }

    renderQuiz(container) {
        if (!container) return;

        const isFr = window.i18n && window.i18n.getLang() === 'fr';
        const badgeText = isFr ? "🧠 Contrôle de compréhension" : "🧠 Comprehension Check";
        const subtitleText = isFr ? "Réponds à ces quelques questions pour voir ce que tu as compris !" : "Answer these quick questions to see how well you understood the story!";
        const qPrefix = isFr ? "Question" : "Question";
        const ofWord = isFr ? "sur" : "of";
        const checkBtnText = isFr ? "Vérifier mes réponses ✨" : "Check My Answers ✨";

        let html = `
            <div class="quiz-container">
                <div class="quiz-header">
                    <span class="quiz-badge">${badgeText}</span>
                    <h3 class="quiz-title">${this.escapeHtml(this.currentStoryTitle)}</h3>
                    <p class="quiz-subtitle">${subtitleText}</p>
                </div>
                <div class="quiz-questions-list">
        `;

        this.currentQuestions.forEach((q, qIdx) => {
            html += `
                <div class="quiz-card" data-q-index="${qIdx}" id="quiz-card-${qIdx}">
                    <div class="quiz-q-num">${qPrefix} ${qIdx + 1} ${ofWord} ${this.currentQuestions.length}</div>
                    <div class="quiz-q-text">${this.escapeHtml(q.question)}</div>
                    <div class="quiz-options-grid">
            `;

            q.options.forEach((opt, optIdx) => {
                html += `
                    <button type="button" class="quiz-opt-btn" data-q-idx="${qIdx}" data-opt-idx="${optIdx}" onclick="comprehensionManager.selectOption(${qIdx}, ${optIdx})">
                        <span class="opt-letter">${String.fromCharCode(65 + optIdx)}</span>
                        <span class="opt-text">${this.escapeHtml(opt)}</span>
                    </button>
                `;
            });

            html += `
                    </div>
                    <div class="quiz-feedback hidden" id="quiz-feedback-${qIdx}"></div>
                </div>
            `;
        });

        html += `
                </div>
                <div class="quiz-footer">
                    <button type="button" id="btn-submit-quiz" class="btn-primary-large" onclick="comprehensionManager.submitQuiz()" disabled>
                        <span>${checkBtnText}</span>
                    </button>
                </div>
            </div>
        `;

        container.innerHTML = html;
    }

    selectOption(qIdx, optIdx) {
        this.userAnswers[qIdx] = optIdx;

        const card = document.getElementById(`quiz-card-${qIdx}`);
        if (card) {
            card.querySelectorAll('.quiz-opt-btn').forEach(btn => btn.classList.remove('selected'));
            const selectedBtn = card.querySelector(`[data-opt-idx="${optIdx}"]`);
            if (selectedBtn) selectedBtn.classList.add('selected');
        }

        if (window.audioManager) {
            window.audioManager.playTick();
        }

        const allAnswered = this.currentQuestions.every((_, idx) => this.userAnswers[idx] !== undefined);
        const submitBtn = document.getElementById('btn-submit-quiz');
        if (submitBtn) {
            submitBtn.disabled = !allAnswered;
        }
    }

    submitQuiz() {
        const isFr = window.i18n && window.i18n.getLang() === 'fr';
        let correctCount = 0;

        this.currentQuestions.forEach((q, qIdx) => {
            const card = document.getElementById(`quiz-card-${qIdx}`);
            const feedbackEl = document.getElementById(`quiz-feedback-${qIdx}`);
            const userChoice = this.userAnswers[qIdx];
            const isCorrect = userChoice === q.correctIndex;

            if (isCorrect) correctCount++;

            if (card) {
                const buttons = card.querySelectorAll('.quiz-opt-btn');
                buttons.forEach((btn, bIdx) => {
                    btn.disabled = true;
                    if (bIdx === q.correctIndex) {
                        btn.classList.add('correct');
                    } else if (bIdx === userChoice && !isCorrect) {
                        btn.classList.add('incorrect');
                    }
                });
            }

            if (feedbackEl) {
                feedbackEl.classList.remove('hidden');
                if (isFr) {
                    feedbackEl.innerHTML = isCorrect
                        ? `<div class="feedback-good">🎉 <strong>Bravo !</strong> C'est la bonne réponse ! ${this.escapeHtml(q.explanation || '')}</div>`
                        : `<div class="feedback-bad">💡 <strong>Presque !</strong> La bonne réponse était : <em>${this.escapeHtml(q.options[q.correctIndex])}</em></div>`;
                } else {
                    feedbackEl.innerHTML = isCorrect
                        ? `<div class="feedback-good">🎉 <strong>Super!</strong> That is correct! ${this.escapeHtml(q.explanation || '')}</div>`
                        : `<div class="feedback-bad">💡 <strong>Almost!</strong> The right answer was: <em>${this.escapeHtml(q.options[q.correctIndex])}</em></div>`;
                }
            }
        });

        const scorePercent = Math.round((correctCount / this.currentQuestions.length) * 100);

        if (scorePercent === 100 && window.audioManager) {
            window.audioManager.playSuccessDing();
        }

        const submitBtn = document.getElementById('btn-submit-quiz');
        if (submitBtn) {
            submitBtn.style.display = 'none';
        }

        const quizFooter = document.querySelector('.quiz-footer');
        if (quizFooter) {
            const stars = scorePercent === 100 ? '⭐⭐⭐' : scorePercent >= 66 ? '⭐⭐' : '⭐';
            const resultBox = document.createElement('div');
            resultBox.className = 'quiz-final-score-card';
            const scoreLabel = isFr ? `${scorePercent}% Score de compréhension !` : `${scorePercent}% Comprehension Score!`;
            const finishBtnLabel = isFr ? "Voir le rapport & enregistrer 🏆" : "View Reading Report & Save 🏆";
            
            resultBox.innerHTML = `
                <div class="score-stars">${stars}</div>
                <div class="score-percent">${scoreLabel}</div>
                <p class="score-msg">${this.getKidEncouragement(scorePercent, isFr)}</p>
                <button type="button" class="btn-primary-large" onclick="comprehensionManager.finishQuiz(${scorePercent}, ${correctCount}, ${this.currentQuestions.length})">
                    <span>${finishBtnLabel}</span>
                </button>
            `;
            quizFooter.appendChild(resultBox);
        }
    }

    getKidEncouragement(percent, isFr) {
        if (isFr) {
            if (percent === 100) return "🌟 Compréhension parfaite ! Tu as une mémoire de lecture formidable !";
            if (percent >= 66) return "👍 Bravo ! Tu as retenu presque tous les détails importants !";
            return "🌱 Bon entraînement ! Plus tu t'entraînes, plus ta compréhension grandit !";
        }
        if (percent === 100) return "🌟 Perfect comprehension! You have an incredible reading brain!";
        if (percent >= 66) return "👍 Great job! You caught almost all the important details!";
        return "🌱 Good practice! Every time you read, your comprehension grows stronger!";
    }

    finishQuiz(scorePercent, correct, total) {
        if (this.onComplete) {
            this.onComplete({
                scorePercent,
                correct,
                total
            });
        }
    }

    escapeHtml(str) {
        if (!str) return "";
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }
}

window.comprehensionManager = new ComprehensionManager();
