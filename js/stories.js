/**
 * Built-in Children's Reading Library
 * Contains both English and French stories with curated comprehension questions.
 */
const STORY_LIBRARY = [
    // -------------------------------------------------------------
    // ENGLISH STORIES
    // -------------------------------------------------------------
    {
        id: "story_en_1",
        lang: "en",
        title: "The Magic Fox and the Moon",
        level: "Level 1 (Early Reader)",
        grade: "Grades 1 - 2",
        icon: "🦊",
        targetWpmDefault: 60,
        text: `Pip the little orange fox loved looking at the night sky. One night, the silver moon looked like a smiling slice of melon. 

Pip ran through the tall whispering grass. He jumped onto a big mossy stone and tried to touch the moon with his paw. 

"You are too high up, moon!" whispered Pip. 

Suddenly, a tiny blue butterfly landed on his nose. The butterfly had glowing wings that lit up the dark forest path. 

"I cannot reach the moon," Pip said with a soft sigh. 

"You do not need to reach it to enjoy its beautiful light," whispered the butterfly. 

Pip smiled, curled up in his cozy moss nest, and fell into a sweet, peaceful sleep under the starry glow.`,
        questions: [
            {
                question: "What animal was Pip in the story?",
                options: ["A little orange fox", "A playful puppy", "A wise owl", "A fast bunny"],
                correctIndex: 0,
                explanation: "Pip is introduced as a little orange fox who loves the night sky!"
            },
            {
                question: "What landed on Pip's nose?",
                options: ["A shiny raindrop", "A tiny blue butterfly", "A red ladybug", "A falling leaf"],
                correctIndex: 1,
                explanation: "A tiny blue butterfly with glowing wings landed right on Pip's nose!"
            },
            {
                question: "What lesson did Pip learn from the butterfly?",
                options: [
                    "To jump higher next time",
                    "You do not need to touch the moon to enjoy its light",
                    "To hide inside a cave",
                    "To chase after the butterflies"
                ],
                correctIndex: 1,
                explanation: "The butterfly taught Pip that we can enjoy the moon's beauty without having to touch it."
            }
        ]
    },
    {
        id: "story_en_2",
        lang: "en",
        title: "The Brave Little Astronaut",
        level: "Level 2 (Confident Reader)",
        grade: "Grades 2 - 3",
        icon: "🚀",
        targetWpmDefault: 80,
        text: `Leo was a curious boy who dreamed of exploring the deep mysteries of outer space. Every evening before bedtime, he gazed through his brass telescope at the craters on the silver moon. 

One Saturday afternoon, Leo decided to build his own rocket ship. He gathered three large cardboard boxes, two rolls of shiny aluminum foil, and a bunch of colorful plastic bottle caps for buttons. 

He slipped on his white bicycle helmet, climbed into the cockpit, and counted down: "Three, two, one, blastoff!" 

With a joyful leap of imagination, his spaceship zoomed past fluffy white clouds and high above the blue oceans of Earth. Outside his window, sparkling comets zipped by like fireworks. In the distance, he spotted the red dust of planet Mars and the giant swirling rings of Saturn. 

Leo realized that with curiosity and the power of reading, anyone can travel anywhere in the galaxy. When his father came in to tuck him in, Leo whispered with a big grin, "Tomorrow, I am landing on Neptune!"`,
        questions: [
            {
                question: "What materials did Leo use to build his rocket ship?",
                options: [
                    "Steel pipes and wooden boards",
                    "Cardboard boxes, aluminum foil, and bottle caps",
                    "Plastic blocks and sticky glue",
                    "Old bicycle parts and wire"
                ],
                correctIndex: 1,
                explanation: "Leo built his rocket out of cardboard boxes, shiny foil, and bottle cap buttons!"
            },
            {
                question: "What planets and sights did Leo see in his imagination?",
                options: [
                    "Comets, the red dust of Mars, and the rings of Saturn",
                    "Only the dark ocean",
                    "Flying cars and high skyscrapers",
                    "A giant submarine underwater"
                ],
                correctIndex: 0,
                explanation: "Leo saw comets zipping by, planet Mars, and the swirling rings of Saturn."
            },
            {
                question: "What did Leo realize about reading and curiosity?",
                options: [
                    "They help you travel anywhere in the galaxy",
                    "They are only useful for science tests",
                    "They make you feel sleepy",
                    "They only work during the daytime"
                ],
                correctIndex: 0,
                explanation: "Leo discovered that curiosity and reading can take your mind to any world in the universe!"
            }
        ]
    },
    {
        id: "story_en_3",
        lang: "en",
        title: "The Mystery of the Whispering Tree",
        level: "Level 2 (Intermediate)",
        grade: "Grades 3 - 4",
        icon: "🌳",
        targetWpmDefault: 95,
        text: `Deep inside Whisperwood Forest stood an ancient oak tree with thick emerald leaves and roots that curled like sleeping dragons. The village children claimed that whenever an autumn breeze swept through the valley, the tree would whisper gentle secrets to whoever listened closely.

Maya, an eager ten year old with a notebook in her backpack, wanted to solve the mystery. Armed with a magnifying glass and a warm scarf, she walked down the winding trail. 

As she sat quietly beneath the giant branches, she closed her eyes and waited. Soon, the wind picked up. "Huuuush... shiiver... tee-chee..." the tree seemed to say. 

Maya smiled, opened her eyes, and looked up into the canopy. The mystery was solved! Tucked safely inside a hollow knot in the trunk was a family of five baby barn owls, fluffing their downy feathers and chattering softly to each other. 

Instead of magical words, the oak tree was sheltering new life. Maya sketched the baby owls in her notebook, promising to keep their secret safe forever.`,
        questions: [
            {
                question: "Why did Maya go into the Whisperwood Forest?",
                options: [
                    "To collect firewood for the winter",
                    "To solve the mystery of the tree's whispers",
                    "To look for lost treasure",
                    "To play hide and seek with her friends"
                ],
                correctIndex: 1,
                explanation: "Maya brought her notebook and magnifying glass to discover why the tree seemed to whisper."
            },
            {
                question: "What was actually making the whispering sounds?",
                options: [
                    "A hidden radio speaker",
                    "A family of five baby barn owls chattering",
                    "Dry autumn leaves rubbing on the ground",
                    "A rushing stream of mountain water"
                ],
                correctIndex: 1,
                explanation: "Five baby barn owls in a hollow knot were making the soft chattering sounds."
            },
            {
                question: "What did Maya promise to do after discovering the owls?",
                options: [
                    "Bring them home as pets",
                    "Keep their secret home safe forever",
                    "Cut down the ancient oak tree",
                    "Tell the entire village immediately"
                ],
                correctIndex: 1,
                explanation: "Maya sketched the owls and promised to keep their nesting spot safe."
            }
        ]
    },
    {
        id: "story_en_4",
        lang: "en",
        title: "Kira and the Secret Reef",
        level: "Level 3 (Advanced)",
        grade: "Grades 4 - 6",
        icon: "🐬",
        targetWpmDefault: 110,
        text: `Kira adjusted her yellow diving mask and pushed off from the wooden dock into the turquoise waters of Coral Bay. The marine sanctuary had been protected by local scientists for over twenty years, allowing rare and vibrant creatures to flourish undisturbed.

Gliding smoothly through the water, Kira spotted a shimmering school of striped clownfish dancing around a garden of violet sea anemones. Beneath a ledge of pink coral, a wise old sea turtle swam by at a slow, graceful pace, undisturbed by her presence. 

Suddenly, a silver flash caught Kira's attention. A young bottlenose dolphin circled her curiously, clicking and whistling in short rhythmic bursts. Kira knew from her marine biology books that dolphins use echolocation to navigate and communicate underwater. 

The dolphin nudged a floating plastic bottle with its snout, tilting its head toward Kira. She swam forward, carefully grabbed the discarded plastic, and tucked it into her mesh trash bag. 

With a joyful leap, the dolphin twirled through the water as if expressing its heartfelt gratitude. Kira smiled behind her mask. Keeping the oceans clean wasn't just a duty for scientists—it was a responsibility that belonged to every person on Earth.`,
        questions: [
            {
                question: "How long had the Coral Bay marine sanctuary been protected?",
                options: ["Over twenty years", "Five years", "One hundred years", "Six months"],
                correctIndex: 0,
                explanation: "The story mentions Coral Bay had been protected by local scientists for over twenty years."
            },
            {
                question: "What did the young dolphin show to Kira?",
                options: [
                    "A sunken treasure chest",
                    "A discarded plastic bottle floating in the reef",
                    "A school of rare jellyfish",
                    "A dangerous shark swimming nearby"
                ],
                correctIndex: 1,
                explanation: "The dolphin nudged a floating plastic bottle so Kira could safely collect it."
            },
            {
                question: "What main message does this story share?",
                options: [
                    "Only marine scientists should visit the ocean",
                    "Dolphins are afraid of human swimmers",
                    "Protecting the ocean is everyone's responsibility",
                    "Anemones are too dangerous to look at"
                ],
                correctIndex: 2,
                explanation: "Kira realized that keeping oceans clean and safe is a duty for everyone on Earth."
            }
        ]
    },

    // -------------------------------------------------------------
    // FRENCH STORIES (HISTOIRES EN FRANÇAIS)
    // -------------------------------------------------------------
    {
        id: "story_fr_1",
        lang: "fr",
        title: "Pip le Renard et la Lune",
        level: "Niveau 1 (Lecteur débutant)",
        grade: "CP - CE1",
        icon: "🦊",
        targetWpmDefault: 55,
        text: `Pip le petit renard roux adorait regarder le ciel nocturne. Ce soir, la lune d'argent ressemblait à une belle tranche de melon souriant.

Pip courait à travers les hautes herbes fraîches. Il bondit sur une grosse pierre moussue et tenta de toucher la lune du bout de sa patte.

"Tu es bien trop haute, jolie lune !" murmura Pip en soupirant.

Soudain, un minuscule papillon bleu se posa doucement sur son museau. Ses ailes scintillantes brillaient comme une veilleuse dans la forêt endormie.

"Je n'arriverai jamais à toucher la lune," dit Pip avec tristesse.

"Tu n'as pas besoin de la toucher pour profiter de sa douce lumière," chuchota le papillon.

Pip sourit, s'enroula dans son nid de mousse douillet, et s'endormit paisiblement sous la bienveillance des étoiles.`,
        questions: [
            {
                question: "Quel animal est Pip dans cette histoire ?",
                options: ["Un petit renard roux", "Un chiot joueur", "Un hibou sage", "Un lapin rapide"],
                correctIndex: 0,
                explanation: "Pip est présenté dès la première ligne comme un petit renard roux !"
            },
            {
                question: "Qu'est-ce qui s'est posé sur le museau de Pip ?",
                options: ["Une goutte de pluie", "Un minuscule papillon bleu", "Une coccinelle rouge", "Une feuille d'automne"],
                correctIndex: 1,
                explanation: "Un minuscule papillon bleu aux ailes lumineuses s'est posé sur son museau."
            },
            {
                question: "Quelle leçon le papillon donne-t-il à Pip ?",
                options: [
                    "Qu'il faut sauter plus haut la prochaine fois",
                    "Qu'on n'a pas besoin de toucher la lune pour apprécier sa lumière",
                    "Qu'il vaut mieux se cacher dans une grotte",
                    "Qu'il faut attraper tous les papillons"
                ],
                correctIndex: 1,
                explanation: "Le papillon lui rappelle qu'on peut admirer la beauté des choses sans vouloir les attraper."
            }
        ]
    },
    {
        id: "story_fr_2",
        lang: "fr",
        title: "Le Brave Petit Astronaute",
        level: "Niveau 2 (Lecteur confiant)",
        grade: "CE1 - CE2",
        icon: "🚀",
        targetWpmDefault: 75,
        text: `Léo était un jeune garçon passionné par les mystères de l'espace infini. Chaque soir avant de s'endormir, il contemplait les cratères lunaires avec sa petite lunette astronomique en cuivre.

Un samedi après-midi, Léo décida de construire sa propre fusée spatiale. Il réunit trois grands cartons d'emballage, deux rouleaux de papier d'aluminium brillant et une poignée de bouchons multicolores pour fabriquer le tableau de bord.

Il enfila son casque de vélo blanc, s'installa aux commandes et commença le compte à rebours : "Trois, deux, un, allumage !"

Dans un formidable élan d'imagination, sa navette traversa les nuages cotonneux et dépassa l'atmosphère terrestre. À travers le hublot, des comètes scintillantes filaient à toute allure. Au loin, il reconnut les teintes rouges de la planète Mars et les majestueux anneaux dorés de Saturne.

Léo comprit qu'avec de la curiosité et le plaisir de lire, on peut voyager dans l'univers tout entier. Quand son papa vint lui souhaiter bonne nuit, Léo murmura avec fierté : "Demain, j'atterris sur Neptune !"`,
        questions: [
            {
                question: "Avec quels objets Léo a-t-il fabriqué sa fusée ?",
                options: [
                    "Des tuyaux en métal et des planches de bois",
                    "Des cartons, du papier d'aluminium et des bouchons",
                    "Des briques en plastique et de la colle forte",
                    "De vieilles pièces de bicyclette"
                ],
                correctIndex: 1,
                explanation: "Léo a utilisé trois cartons, du papier aluminium brillant et des bouchons colorés !"
            },
            {
                question: "Quelles planètes et merveilles Léo a-t-il observées ?",
                options: [
                    "Des comètes, les sables de Mars et les anneaux de Saturne",
                    "Uniquement l'océan dans la nuit",
                    "Des voitures volantes en ville",
                    "Un sous-marin géant sous l'eau"
                ],
                correctIndex: 0,
                explanation: "Léo a admiré des comètes scintillantes, Mars la rouge et les anneaux de Saturne."
            },
            {
                question: "Qu'a compris Léo grâce à son imagination et à la lecture ?",
                options: [
                    "Qu'on peut voyager partout dans l'univers",
                    "Que lire sert uniquement pour les devoirs",
                    "Que l'espace fait très peur",
                    "Qu'il faut rester enfermé dans sa chambre"
                ],
                correctIndex: 0,
                explanation: "Léo a réalisé que la curiosité et la lecture permettent de voyager vers n'importe quel monde !"
            }
        ]
    },
    {
        id: "story_fr_3",
        lang: "fr",
        title: "Le Mystère de l'Arbre Chuchoteur",
        level: "Niveau 2 (Intermédiaire)",
        grade: "CE2 - CM1",
        icon: "🌳",
        targetWpmDefault: 90,
        text: `Au cœur de la forêt des Murmures se dressait un chêne séculaire aux racines noueuses semblables à des dragons endormis. Les enfants du village racontaient que dès qu'un vent d'automne traversait le vallon, l'arbre confiait de mystérieux secrets à ceux qui savaient écouter.

Maya, une fillette de neuf ans curieuse et observatrice, voulut percer ce mystère. Munie d'une loupe et d'un carnet de dessin dans son sac à dos, elle marcha sur le sentier bordé de fougères.

Assise au pied du géant de bois, elle ferma les yeux et attendit en silence. Bientôt, une brise fraîche fit frémir le feuillage. "Chhh... frou-frou... cui-cui..." semblait chuchoter le tronc.

Maya ouvrit les yeux et leva la tête vers les branches maîtresses. Le mystère était enfin éclairci ! Cachée dans le creux confortable du tronc, une nichée de cinq petites chouettes effraies ébouriffaient leur duvet blanc en piaillant doucement.

Loin d'être un arbre magique, le vieux chêne protégeait simplement une nouvelle vie. Maya dessina les oisillons sur son carnet, promettant de garder leur secret précieusement.`,
        questions: [
            {
                question: "Pourquoi Maya se rend-elle dans la forêt des Murmures ?",
                options: [
                    "Pour ramasser du bois de chauffage",
                    "Pour percer le mystère des chuchotements de l'arbre",
                    "Pour chercher un trésor caché",
                    "Pour jouer à cache-cache"
                ],
                correctIndex: 1,
                explanation: "Maya voulait découvrir pourquoi les villageois disaient que le vieux chêne chuchotait."
            },
            {
                question: "D'où provenaient en réalité les bruits de chuchotement ?",
                options: [
                    "D'un haut-parleur dissimulé",
                    "D'une nichée de cinq bébés chouettes effraies",
                    "Des feuilles sèches balayées par le vent",
                    "D'un ruisseau de montagne"
                ],
                correctIndex: 1,
                explanation: "Cinq petites chouettes effraies nichées dans le creux du tronc faisaient ces petits bruits !"
            },
            {
                question: "Que promet Maya après sa découverte ?",
                options: [
                    "D'adopter les chouettes chez elle",
                    "De garder le secret du nid pour les protéger",
                    "D'abattre l'arbre",
                    "D'amener tous ses camarades dès le lendemain"
                ],
                correctIndex: 1,
                explanation: "Maya a promis de protéger le secret de la nichée pour ne pas déranger les oiseaux."
            }
        ]
    },
    {
        id: "story_fr_4",
        lang: "fr",
        title: "Kira et le Récif Secret",
        level: "Niveau 3 (Lecteur avancé)",
        grade: "CM1 - CM2",
        icon: "🐬",
        targetWpmDefault: 105,
        text: `Kira ajusta son masque de plongée jaune vif et plongea depuis le ponton de bois dans les eaux turquoise de la Baie de Corail. Cette réserve maritime protégée par les scientifiques depuis plus de vingt ans abritait des espèces sous-marines d'une rare diversité.

Nageant avec fluidité, Kira observa un banc scintillant de poissons-clowns ondulant au milieu d'un massif d'anémones violettes. Sous une arche de corail rose, une tortue marine centenaire glissait paisiblement sans prêter attention à sa présence.

Soudain, un éclair argenté attira le regard de la jeune fille. Un jeune dauphin à bec court tournoyait autour d'elle, émettant de petits sifflements mélodieux. Kira savait par ses lectures que les cétacés utilisent l'écholocalisation pour communiquer et s'orienter dans les profondeurs.

Le dauphin poussa délicatement du museau une bouteille en plastique qui flottait entre deux eaux, orientant sa tête vers Kira. Comprenant aussitôt le signal, elle s'approcha, ramassa le déchet flottant et le glissa dans son filet de collecte.

D'un bond gracieux, le dauphin effectua une vrille spectaculaire comme pour exprimer sa reconnaissance. Kira sourit derrière son masque. Prendre soin des océans n'était pas seulement la tâche des chercheurs : c'était une mission partagée par tous les enfants du monde.`,
        questions: [
            {
                question: "Depuis combien de temps la réserve de Corail était-elle protégée ?",
                options: ["Depuis plus de vingt ans", "Depuis cinq ans", "Depuis un siècle", "Depuis six mois"],
                correctIndex: 0,
                explanation: "Le texte précise que la Baie de Corail est protégée par les scientifiques depuis plus de vingt ans."
            },
            {
                question: "Qu'est-ce que le jeune dauphin a montré à Kira ?",
                options: [
                    "Un coffre de pirate enfoui dans le sable",
                    "Une bouteille en plastique polluant le récif",
                    "Un banc de méduses dangereuses",
                    "Un requin nageant au loin"
                ],
                correctIndex: 1,
                explanation: "Le dauphin a poussé une bouteille en plastique du museau pour que Kira la ramasse."
            },
            {
                question: "Quel est le message essentiel de cette histoire ?",
                options: [
                    "Seuls les biologistes marins doivent s'approcher de la mer",
                    "Les dauphins ont peur des humains",
                    "Protéger la propreté des océans est la responsabilité de chacun",
                    "Les anémones sont trop fragiles pour être admirées"
                ],
                correctIndex: 2,
                explanation: "Kira a compris que la protection des mers est un devoir qui appartient à chaque citoyen."
            }
        ]
    }
];

window.STORY_LIBRARY = STORY_LIBRARY;
