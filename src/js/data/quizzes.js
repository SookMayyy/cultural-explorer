// js/data/quizzes.js — Standalone MCQ bank (used by full Quiz screen)
// ─────────────────────────────────────────────────────────────────────────────
// Every question is grounded in something the app already taught for that
// state: a narrative card's `desc`/`funFact` (states.js) or a mission Discover
// spotlight's `text`/`key` (foodMissions/costumeMissions/landmarkMissions/
// festivalMissions.js) — so a child who explored the state can answer from
// what they just saw, read, or heard.
//
// Each question: exactly 4 options, exactly 1 correct (`ans` 0–3), a short
// kid-friendly `explain`, and a `difficulty` (easy/medium/hard — lets the
// "harder after 2 correct" adaptive rule step up). Some also carry an OPTIONAL
// `image` pointing at a real photo already shown in that state's mission
// (quiz.js displays it above the question when present) — used here for
// ingredient / costume / festival recognition questions that quiz.js doesn't
// already auto-generate (it auto-builds a dish photo Q and a landmark photo Q
// from foodMissions/landmarkMissions, so this file adds DIFFERENT pictures).
// ─────────────────────────────────────────────────────────────────────────────

export const QUIZ_QUESTIONS = [

  // ── Penang ──────────────────────────────────────────────────────────────────
  {
    id: 'penang-q1', stateId: 'penang', difficulty: 'easy',
    q: 'What noodle dish is Penang most famous for?',
    opts: ['Nasi Lemak', 'Mee Goreng', 'Char Kway Teow', 'Wonton Mee'],
    ans: 2,
    explain: 'Penang\'s Char Kway Teow is world-famous! Flat rice noodles stir-fried with prawns, eggs, and bean sprouts over high heat.',
  },
  {
    id: 'penang-q2', stateId: 'penang', difficulty: 'easy',
    q: 'Which city in Penang is a UNESCO World Heritage Site?',
    opts: ['Butterworth', 'Georgetown', 'Ipoh', 'Taiping'],
    ans: 1,
    explain: 'Georgetown is the capital of Penang and a UNESCO World Heritage Site, famous for its colourful street art and old shophouses!',
  },
  {
    id: 'penang-q3', stateId: 'penang', difficulty: 'easy',
    q: 'What is Penang\'s famous nickname?',
    opts: ['Land Below the Wind', 'Pearl of the Orient', 'Garden City', 'City of Lights'],
    ans: 1,
    explain: 'Penang is known as the "Pearl of the Orient" because of its beauty and rich history!',
  },
  {
    id: 'penang-q4', stateId: 'penang', difficulty: 'medium',
    q: 'About how much can a Thaipusam kavadi weigh?',
    opts: ['5 kg', '30 kg', '100 kg', '500 kg'],
    ans: 1,
    explain: 'A kavadi can weigh up to 30 kg — decorated with flowers, peacock feathers, and lights, and carried as an act of devotion!',
  },
  {
    id: 'penang-q5', stateId: 'penang', difficulty: 'medium',
    q: 'What tiny shellfish topping is this, a classic Char Kway Teow ingredient?',
    image: '../assets/content/Penang/cockles.png',
    opts: ['Cockles', 'Clams', 'Mussels', 'Oysters'],
    ans: 0,
    explain: 'Tiny cockles — see-hum — are a classic Penang topping in Char Kway Teow!',
  },
  {
    id: 'penang-q6', stateId: 'penang', difficulty: 'hard',
    q: 'In Penang Hokkien, what does the borrowed Malay word "sabun" mean?',
    opts: ['Bread', 'Soap', 'Chicken', 'Medicine'],
    ans: 1,
    explain: 'Penang Hokkien borrows many Malay words — like "sabun" for soap and "roti" for bread!',
  },
  {
    id: 'penang-q7', stateId: 'penang', difficulty: 'hard',
    q: 'What is this traditional Penang outfit called?',
    image: '../assets/content/Penang/baba_nyonya_kebaya.png',
    opts: ['Kebaya', 'Baju Kurung', 'Cheongsam', 'Sari'],
    ans: 0,
    explain: 'The Kebaya is a fitted blouse worn by the Baba Nyonya community, decorated with beautiful embroidered flower patterns!',
  },
  {
    id: 'penang-q8', stateId: 'penang', difficulty: 'easy',
    q: 'How do visitors get to the top of Bukit Bendera (Penang Hill)?',
    image: '../assets/content/Penang/bukit_bendera.jpeg',
    opts: ['A funicular train', 'A boat', 'A submarine', 'A hot-air balloon'],
    ans: 0,
    explain: 'Bukit Bendera — Penang Hill — is reached by a funicular train that climbs steeply up for cool air and big views!',
  },

  // ── Selangor ────────────────────────────────────────────────────────────────
  {
    id: 'selangor-q1', stateId: 'selangor', difficulty: 'easy',
    q: 'How many steps lead up to the Batu Caves temple?',
    opts: ['100', '200', '272', '300'],
    ans: 2,
    explain: 'There are exactly 272 colourful steps leading up to the main temple at Batu Caves in Selangor!',
  },
  {
    id: 'selangor-q2', stateId: 'selangor', difficulty: 'easy',
    q: 'Which major city does Selangor wrap all the way around?',
    opts: ['Kuala Lumpur', 'Johor Bahru', 'Ipoh', 'Georgetown'],
    ans: 0,
    explain: 'Selangor wraps right around Kuala Lumpur, Malaysia\'s capital city!',
  },
  {
    id: 'selangor-q3', stateId: 'selangor', difficulty: 'medium',
    q: 'What amazing natural light show can you see in Selangor\'s mangroves at night?',
    opts: ['Glowing mushrooms', 'Fireflies', 'Shooting stars', 'Lanterns'],
    ans: 1,
    explain: 'Thousands of fireflies light up the mangrove trees along the Selangor River like tiny twinkling lights!',
  },
  {
    id: 'selangor-q4', stateId: 'selangor', difficulty: 'medium',
    q: 'What is Satay Kajang dipped in?',
    image: '../assets/content/Selangor/peanut_sauce.png',
    opts: ['Peanut Sauce', 'Chili Sauce', 'Soy Sauce', 'Tomato Sauce'],
    ans: 0,
    explain: 'Kajang satay is served with a sweet, nutty peanut sauce for dipping!',
  },
  {
    id: 'selangor-q5', stateId: 'selangor', difficulty: 'medium',
    q: 'This leaf-skirt dance is performed at which Selangor festival?',
    image: '../assets/content/Selangor/mayin_jo_oh.jpg',
    opts: ['Hari Moyang', 'Pesta Kaamatan', 'Gawai Dayak', 'Thaipusam'],
    ans: 0,
    explain: 'The Main Jo-oh dance is performed by the sea during Hari Moyang, the Mah Meri ancestor festival!',
  },
  {
    id: 'selangor-q6', stateId: 'selangor', difficulty: 'hard',
    q: 'Who performs the Main Jo-oh dance during Hari Moyang?',
    opts: ['The Mah Meri people', 'The Iban people', 'The Kadazan people', 'The Chinese community'],
    ans: 0,
    explain: 'The Main Jo-oh is danced by the Mah Meri people of Carey Island to thank their ancestors by the sea.',
  },

  // ── Kelantan ────────────────────────────────────────────────────────────────
  {
    id: 'kelantan-q2', stateId: 'kelantan', difficulty: 'medium',
    q: 'What is "Wayang Kulit"?',
    image: '../assets/content/Kelantan/wayang_kulit.jpg',
    opts: ['A type of kite', 'A shadow puppet show', 'A dance style', 'A type of batik'],
    ans: 1,
    explain: 'Wayang Kulit is a traditional shadow puppet show where a skilled puppeteer tells ancient stories using leather puppets behind a lit screen!',
  },
  {
    id: 'kelantan-q3', stateId: 'kelantan', difficulty: 'easy',
    q: 'Which country does Kelantan border in the north?',
    opts: ['Indonesia', 'Thailand', 'Singapore', 'Brunei'],
    ans: 1,
    explain: 'Kelantan is in the northeast of Peninsular Malaysia and shares a border with Thailand!',
  },
  {
    id: 'kelantan-q4', stateId: 'kelantan', difficulty: 'medium',
    q: 'This blue flower colours Nasi Kerabu\'s rice. What is it called?',
    image: '../assets/content/Kelantan/butterfly_pea.png',
    opts: ['Butterfly Pea', 'Hibiscus', 'Rose', 'Jasmine'],
    ans: 0,
    explain: 'Butterfly-pea flowers (bunga telang) give Nasi Kerabu its natural blue colour — no artificial dye at all!',
  },
  {
    id: 'kelantan-q5', stateId: 'kelantan', difficulty: 'hard',
    q: 'Kelantan\'s royal costume, inspired by a legendary warrior queen, is called?',
    opts: ['Cik Siti Wan Kembang', 'Ngepan', 'Baju Kedah', 'Kebaya'],
    ans: 0,
    explain: 'The Cik Siti Wan Kembang costume is inspired by a legendary 17th-century warrior queen of Kelantan!',
  },
  {
    id: 'kelantan-q6', stateId: 'kelantan', difficulty: 'hard',
    q: 'What is Kelantan\'s traditional fabric art, made with wax and dye, called?',
    opts: ['Batik', 'Songket', 'Ngajat', 'Ikat'],
    ans: 0,
    explain: 'Batik Kelantan uses wax and dye to make beautiful floral patterns — recognised by UNESCO as a cultural treasure in 2009!',
  },

  // ── Kedah ───────────────────────────────────────────────────────────────────
  {
    id: 'kedah-q1', stateId: 'kedah', difficulty: 'easy',
    q: 'What is the name of Kedah\'s traditional opening dance?',
    opts: ['Cinta Sayang', 'Zapin', 'Joget', 'Sumazau'],
    ans: 0,
    explain: 'Cinta Sayang is a traditional Malay dance from Kedah, often performed to open important events!',
  },
  {
    id: 'kedah-q2', stateId: 'kedah', difficulty: 'easy',
    q: 'Which famous sky bridge is found in Kedah\'s Langkawi?',
    opts: ['Langkawi Sky Bridge', 'Penang Bridge', 'Saloma Bridge', 'Second Link'],
    ans: 0,
    explain: 'The Langkawi Sky Bridge sits high on Gunung Mat Cincang, about 700 m above the sea!',
  },
  {
    id: 'kedah-q3', stateId: 'kedah', difficulty: 'easy',
    q: 'What is the traditional women\'s costume of Kedah called?',
    opts: ['Baju Kedah', 'Cheongsam', 'Saree', 'Baju Melayu'],
    ans: 0,
    explain: 'Baju Kedah is a short hip-length tunic with three-quarter sleeves, worn with a matching skirt and a silver belt.',
  },
  {
    id: 'kedah-q4', stateId: 'kedah', difficulty: 'easy',
    q: 'What is the main city (capital) of Kedah?',
    opts: ['Alor Setar', 'Kota Bharu', 'Ipoh', 'Kuantan'],
    ans: 0,
    explain: 'Alor Setar is the capital city of Kedah, in the northwest of Malaysia.',
  },
  {
    id: 'kedah-q5', stateId: 'kedah', difficulty: 'medium',
    q: 'This fresh herb makes Laksa Kedah smell wonderful. What is it?',
    image: '../assets/content/Kedah/mint_leaf.png',
    opts: ['Mint Leaves', 'Basil', 'Coriander', 'Parsley'],
    ans: 0,
    explain: 'Fresh mint (daun kesum) gives Laksa Kedah its lovely fragrant taste!',
  },
  {
    id: 'kedah-q6', stateId: 'kedah', difficulty: 'easy',
    q: 'What dance are these Kedah dancers performing?',
    image: '../assets/content/Kedah/kedah_cinta_sayang.jpg',
    opts: ['Cinta Sayang', 'Zapin', 'Ngajat', 'Sumazau'],
    ans: 0,
    explain: 'Cinta Sayang is Kedah\'s favourite opening dance, performed at important celebrations!',
  },
  {
    id: 'kedah-q7', stateId: 'kedah', difficulty: 'hard',
    q: 'Why is Kedah nicknamed "Jelapang Padi"?',
    opts: ['It grows most of Malaysia\'s rice', 'It has the most padi museums', 'It exports the most rice bowls', 'It has the biggest granary building'],
    ans: 0,
    explain: '"Jelapang Padi" means Rice Bowl — Kedah\'s wide, golden paddy fields grow much of the country\'s rice!',
  },

  // ── Sabah ───────────────────────────────────────────────────────────────────
  {
    id: 'sabah-q1', stateId: 'sabah', difficulty: 'easy',
    q: 'What is the height of Mount Kinabalu?',
    opts: ['2,000 metres', '3,000 metres', '4,095 metres', '5,000 metres'],
    ans: 2,
    explain: 'Mount Kinabalu is 4,095 metres above sea level — the highest mountain in Malaysia and a UNESCO World Heritage Site!',
  },
  {
    id: 'sabah-q2', stateId: 'sabah', difficulty: 'easy',
    q: 'What is Sabah\'s well-known nickname?',
    opts: ['Land of the Hornbills', 'Land Below the Wind', 'Pearl of the Orient', 'Garden City'],
    ans: 1,
    explain: 'Sabah is called the "Land Below the Wind" because it sits just below the typhoon belt!',
  },
  {
    id: 'sabah-q3', stateId: 'sabah', difficulty: 'medium',
    q: 'What ingredient "cooks" the fish in Hinava without any fire at all?',
    image: '../assets/content/Sabah/lime_juice.png',
    opts: ['Lime Juice', 'Vinegar', 'Hot Water', 'Soy Sauce'],
    ans: 0,
    explain: 'Sour lime juice "cooks" the raw fish in Hinava all by itself — that\'s why it\'s sometimes called the "sushi of Sabah"!',
  },
  {
    id: 'sabah-q4', stateId: 'sabah', difficulty: 'medium',
    q: 'The Sumazau dance is performed at which Sabah festival?',
    image: '../assets/content/Sabah/sumazau_dance.png',
    opts: ['Pesta Kaamatan', 'Gawai Dayak', 'Hari Moyang', 'Thaipusam'],
    ans: 0,
    explain: 'Dancers spread their arms like a bird during the Sumazau, danced at Pesta Kaamatan — the Kadazandusun harvest festival!',
  },
  {
    id: 'sabah-q5', stateId: 'sabah', difficulty: 'medium',
    q: 'Why does the giant Rafflesia flower smell so bad?',
    opts: ['To attract flies for pollination', 'To scare away visitors', 'Because it is rotting', 'To keep away the rain'],
    ans: 0,
    explain: 'The Rafflesia\'s stinky, rotten-meat smell attracts flies to help it make seeds!',
  },
  {
    id: 'sabah-q6', stateId: 'sabah', difficulty: 'hard',
    q: 'In Kadazandusun belief, who is Bambaazon, honoured during Pesta Kaamatan?',
    opts: ['The spirit of the rice', 'A legendary queen', 'A mountain god', 'A sea creature'],
    ans: 0,
    explain: 'Pesta Kaamatan gives thanks to Bambaazon, the spirit of the rice harvest, with music, dance, and a beauty parade.',
  },

  // ── Sarawak ─────────────────────────────────────────────────────────────────
  {
    id: 'sarawak-q1', stateId: 'sarawak', difficulty: 'easy',
    q: 'Why is Sarawak called the "Land of the Hornbills"?',
    opts: ['People wear horns', 'The hornbill bird is its symbol', 'Mountains look like horns', 'Horns are made there'],
    ans: 1,
    explain: 'The Rhinoceros Hornbill is Sarawak\'s state bird and symbol — that\'s why it\'s called the Land of the Hornbills!',
  },
  {
    id: 'sarawak-q2', stateId: 'sarawak', difficulty: 'medium',
    q: "What flies out of Gunung Mulu's caves in their millions every evening?",
    opts: ['Bats', 'Hornbills', 'Butterflies', 'Bees'],
    ans: 0,
    explain: 'Every evening, millions of bats stream out of the giant caves at Gunung Mulu in a spectacular show!',
  },
  {
    id: 'sarawak-q3', stateId: 'sarawak', difficulty: 'easy',
    q: 'How does Sarawak compare in size to other Malaysian states?',
    opts: ['It is the smallest', 'It is the largest', 'It is the highest', 'It is the newest'],
    ans: 1,
    explain: 'Sarawak is the largest state in Malaysia by land area — bigger than any other state!',
  },
  {
    id: 'sarawak-q4', stateId: 'sarawak', difficulty: 'medium',
    q: 'What crispy topping is sprinkled on Kolo Mee?',
    image: '../assets/content/Sarawak/fried_onion.png',
    opts: ['Fried Onions', 'Fried Garlic', 'Peanuts', 'Sesame Seeds'],
    ans: 0,
    explain: 'Crispy fried onions add a lovely crunch and aroma to Sarawak\'s favourite noodle dish, Kolo Mee!',
  },
  {
    id: 'sarawak-q5', stateId: 'sarawak', difficulty: 'medium',
    q: 'What is the traditional dress of Iban women called?',
    image: '../assets/content/Sarawak/ngepan.png',
    opts: ['Ngepan', 'Baju Kedah', 'Kebaya', 'Sinuangga'],
    ans: 0,
    explain: 'Ngepan is the traditional dress of Iban women, with a tall silver headdress and shiny coin belts!',
  },
  {
    id: 'sarawak-q6', stateId: 'sarawak', difficulty: 'hard',
    q: 'What is Gawai Dayak celebrated for?',
    opts: ['Thanking for the rice harvest', 'Welcoming the new year', 'A wedding tradition', 'A fishing festival'],
    ans: 0,
    explain: 'Gawai Dayak, held every June, gives thanks for the rice harvest with decorated longhouses, dancing, and games!',
  },
];
