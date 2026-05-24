// js/data/states.js — Cultural data for all 7 states in CP2 scope

export const STATES_DATA = [
  {
    id: 'penang',
    name: 'Pulau Pinang',
    emoji: '🏝️',
    color: '#E67E22',
    colorLight: '#FEF0DC',
    region: 'west',
    tagline: 'Pearl of the Orient',
    story: `Penang is a beautiful island state on the northwest coast of Malaysia. It is famous for its amazing mix of cultures — Malay, Chinese, Indian, and more! Georgetown, the capital, is a UNESCO World Heritage Site full of colourful street art and old shophouses. Penang is also known as the "Food Capital of Malaysia" because of its delicious street food!`,
    dialectWord: { word: 'Laksa', meaning: 'Spicy noodle soup unique to Penang', pronunciation: 'lak-sah' },
    cards: [
      {
        id: 'penang-1',
        category: 'Food',
        icon: '🍜',
        title: 'Char Kway Teow',
        desc: 'Penang Char Kway Teow is a famous stir-fried flat noodle dish cooked in a super-hot wok. It has prawns, cockles, eggs, and bean sprouts. The smoky "wok hei" flavour makes it extra special!',
        funFact: 'A great plate of Char Kway Teow is cooked in less than 2 minutes over very high heat!',
        mascotLine: 'Wah! This Char Kway Teow smells so good! Can you smell the smoky wok?',
        // 📸 IMAGE NEEDED: penang-char-kway-teow.png
        // Export from Figma → Cards/Penang/Food — illustration of stir-fried flat noodles
        image: null,
      },
      {
        id: 'penang-2',
        category: 'Landmark',
        icon: '🕌',
        title: 'Georgetown Heritage',
        desc: 'Georgetown is the capital city of Penang. Its old town is a UNESCO World Heritage Site with beautiful old buildings, colourful street art, and mix of Malay, Chinese, Indian, and European cultures!',
        funFact: 'Georgetown is one of only two UNESCO World Heritage cities in Malaysia — the other is Melaka!',
        mascotLine: 'Georgetown is like a living museum! Every street has a story to tell.',
        // 📸 IMAGE NEEDED: penang-georgetown.png
        // Export from Figma → Cards/Penang/Landmark — Georgetown heritage street illustration
        image: null,
      },
      {
        id: 'penang-3',
        category: 'Festival',
        icon: '🎆',
        title: 'Thaipusam',
        desc: 'Thaipusam is a big Hindu festival celebrated in Penang every year. Devotees carry heavy "kavadi" (decorated frames) as an act of devotion to Lord Murugan. It is a colourful and amazing event!',
        funFact: 'The kavadi can weigh up to 30 kg and is decorated with flowers, peacock feathers, and lights!',
        mascotLine: 'Thaipusam shows how strong and brave people can be in their faith!',
        // 📸 IMAGE NEEDED: penang-thaipusam.png
        // Export from Figma → Cards/Penang/Festival — Thaipusam kavadi carrier illustration
        image: null,
      },
    ],
    quizQuestion: {
      q: 'What is Penang famous for?',
      opts: ['Its cold mountains', 'Its amazing street food', 'Its coconut farms', 'Its gold mines'],
      ans: 1,
      explain: 'Penang is called the "Food Capital of Malaysia" for its delicious street food like Char Kway Teow, Laksa, and Nasi Kandar!',
    },
  },

  {
    id: 'melaka',
    name: 'Melaka',
    emoji: '🏰',
    color: '#8E44AD',
    colorLight: '#F5EBF9',
    region: 'west',
    tagline: 'Historic City of Malaysia',
    story: `Melaka (also spelled Malacca) is one of Malaysia's most historic states. It was once a powerful trading port where merchants from China, India, Arabia, and Europe came to trade! Melaka became a UNESCO World Heritage Site along with Georgetown, Penang. The famous Jonker Street is full of antiques, food, and culture!`,
    dialectWord: { word: 'Nyonya', meaning: 'A female descendant of Chinese-Malay heritage (Peranakan)', pronunciation: 'nyoh-nyah' },
    cards: [
      {
        id: 'melaka-1',
        category: 'Food',
        icon: '🍱',
        title: 'Nyonya Cuisine',
        desc: 'Nyonya food is a special blend of Chinese and Malay cooking traditions. It uses coconut milk, lemongrass, and spices to create unique dishes like Ayam Pongteh (chicken stew) and Nyonya Laksa.',
        funFact: 'Nyonya cooking has been passed down for hundreds of years within Peranakan families!',
        mascotLine: 'Nyonya food is like a delicious hug from two cultures at once!',
        // 📸 IMAGE NEEDED: melaka-nyonya-food.png
        // Export from Figma → Cards/Melaka/Food — Nyonya cuisine illustration
        image: null,
      },
      {
        id: 'melaka-2',
        category: 'Landmark',
        icon: '⛵',
        title: 'A Famosa Fort',
        desc: 'A Famosa is an old Portuguese fort built in 1511. It is one of the oldest surviving European architectural remains in Asia! Only a small gate called "Porta de Santiago" remains today.',
        funFact: 'A Famosa was almost completely destroyed in 1807 but British officer Stamford Raffles saved it!',
        mascotLine: 'This fort survived for over 500 years! Imagine all the history it has seen!',
        // 📸 IMAGE NEEDED: melaka-famosa.png
        // Export from Figma → Cards/Melaka/Landmark — A Famosa fort gate illustration
        image: null,
      },
      {
        id: 'melaka-3',
        category: 'Heritage',
        icon: '🎭',
        title: 'Baba Nyonya Culture',
        desc: 'The Baba Nyonya (Peranakan) people are descendants of Chinese traders who married local Malays. They developed their own unique language, food, clothing, and traditions that blend Chinese and Malay cultures.',
        funFact: 'Nyonya kebaya (traditional dress) is beautifully embroidered and is considered a work of art!',
        mascotLine: 'The Baba Nyonya culture shows how two cultures can blend into something beautiful!',
        // 📸 IMAGE NEEDED: melaka-baba-nyonya.png
        // Export from Figma → Cards/Melaka/Heritage — Peranakan culture illustration
        image: null,
      },
    ],
    quizQuestion: {
      q: 'What is Melaka famous for?',
      opts: ['Skyscrapers', 'Historic trading port', 'Tea plantations', 'Coral reefs'],
      ans: 1,
      explain: 'Melaka was once a powerful trading port! Ships from China, India, Arabia, and Europe came to trade there centuries ago.',
    },
  },

  {
    id: 'selangor',
    name: 'Selangor',
    emoji: '🌆',
    color: '#1A5276',
    colorLight: '#EBF5FB',
    region: 'west',
    tagline: 'State of Harmony',
    story: `Selangor is the most developed state in Malaysia and surrounds the capital city Kuala Lumpur. It is home to many factories, shopping malls, and universities. The famous Batu Caves temple is here! Selangor is also known for its fireflies at Kuala Selangor and its delicious seafood.`,
    dialectWord: { word: 'Shah Alam', meaning: 'Capital city of Selangor, meaning "realm of the king"', pronunciation: 'shah ah-lam' },
    cards: [
      {
        id: 'selangor-1',
        category: 'Landmark',
        icon: '⛰️',
        title: 'Batu Caves',
        desc: 'Batu Caves is a famous Hindu temple built inside a huge limestone hill. There are 272 colourful steps leading up to the main cave temple. A giant golden statue of Lord Murugan stands at the entrance!',
        funFact: 'The golden statue of Lord Murugan at Batu Caves is 42.7 metres tall — as tall as a 14-storey building!',
        mascotLine: 'Climbing those 272 steps is quite a workout, but the view at the top is amazing!',
        // 📸 IMAGE NEEDED: selangor-batu-caves.png
        // Export from Figma → Cards/Selangor/Landmark — Batu Caves with golden statue
        image: null,
      },
      {
        id: 'selangor-2',
        category: 'Nature',
        icon: '✨',
        title: 'Kuala Selangor Fireflies',
        desc: 'At Kampung Kuantan in Kuala Selangor, thousands of fireflies light up the mangrove trees at night. It looks like a living Christmas tree! You can see them by riding a small boat along the river.',
        funFact: 'The fireflies at Kuala Selangor synchronise their flashes — they all blink at the same time!',
        mascotLine: 'Imagine thousands of tiny lights twinkling in the dark trees — magical!',
        // 📸 IMAGE NEEDED: selangor-fireflies.png
        // Export from Figma → Cards/Selangor/Nature — fireflies in mangrove trees
        image: null,
      },
      {
        id: 'selangor-3',
        category: 'Food',
        icon: '🦀',
        title: 'Klang Bak Kut Teh',
        desc: 'Bak Kut Teh is a famous pork rib soup from Klang, Selangor. The ribs are slow-cooked in a broth of herbs and spices for hours until they are tender and flavourful. It is best eaten with rice and fried dough sticks!',
        funFact: 'Klang is considered the "home" of Bak Kut Teh — people travel from all over Malaysia just to eat it here!',
        mascotLine: 'The soup is cooked for hours — that is why it tastes so rich and special!',
        // 📸 IMAGE NEEDED: selangor-bak-kut-teh.png
        // Export from Figma → Cards/Selangor/Food — Bak Kut Teh soup illustration
        image: null,
      },
    ],
    quizQuestion: {
      q: 'How many steps lead up to the Batu Caves temple?',
      opts: ['100 steps', '200 steps', '272 steps', '350 steps'],
      ans: 2,
      explain: 'There are 272 colourful steps leading up to the main cave temple at Batu Caves!',
    },
  },

  {
    id: 'johor',
    name: 'Johor',
    emoji: '🦁',
    color: '#1E8449',
    colorLight: '#EAFAF1',
    region: 'west',
    tagline: 'Southern Gateway',
    story: `Johor is the southernmost state in Peninsular Malaysia. It is connected to Singapore by two causeways! Johor Bahru is a vibrant city full of shopping and food. Johor is famous for its beautiful beaches at Desaru and Mersing, as well as its unique Johor dishes like Laksa Johor.`,
    dialectWord: { word: 'Mee Bandung', meaning: 'Noodles in a rich prawn and beef broth, unique to Johor', pronunciation: 'mee ban-doong' },
    cards: [
      {
        id: 'johor-1',
        category: 'Food',
        icon: '🍝',
        title: 'Laksa Johor',
        desc: 'Laksa Johor is different from other laksa because it uses spaghetti-style noodles instead of rice noodles! The broth is thick and rich, made with fish, coconut milk, and spices. It is a unique dish you can only find in Johor.',
        funFact: 'Laksa Johor is traditionally served at royal events and weddings in Johor!',
        mascotLine: 'Spaghetti in a Malaysian laksa? Yes! That is what makes Johor special!',
        // 📸 IMAGE NEEDED: johor-laksa.png
        // Export from Figma → Cards/Johor/Food — Laksa Johor illustration
        image: null,
      },
      {
        id: 'johor-2',
        category: 'Landmark',
        icon: '🏯',
        title: 'Istana Bukit Serene',
        desc: 'Istana Bukit Serene is the official palace of the Sultan of Johor. It sits on a beautiful hill by the Straits of Johor. The palace has beautiful grounds with a golf course and is surrounded by lush gardens.',
        funFact: 'The Sultan of Johor is known as the "King of Johor" and the state has its own royal family with a rich history!',
        mascotLine: 'Johor has a proud royal history — the sultan\'s palace is a symbol of that!',
        // 📸 IMAGE NEEDED: johor-palace.png
        // Export from Figma → Cards/Johor/Landmark — Johor royal palace illustration
        image: null,
      },
      {
        id: 'johor-3',
        category: 'Nature',
        icon: '🏖️',
        title: 'Desaru Beach',
        desc: 'Desaru Beach in Johor is one of the most popular beach resorts in Malaysia. The long stretch of white sand, clear blue sea, and water sports activities make it a favourite holiday spot for families!',
        funFact: 'Desaru Beach is about 100 km from Johor Bahru and is known for its beautiful sunrise views!',
        mascotLine: 'A perfect beach day with white sand and blue sea — that\'s Desaru for you!',
        // 📸 IMAGE NEEDED: johor-desaru.png
        // Export from Figma → Cards/Johor/Nature — Desaru beach illustration
        image: null,
      },
    ],
    quizQuestion: {
      q: 'What makes Laksa Johor different from other laksa?',
      opts: ['It has no spice', 'It uses spaghetti noodles', 'It is served cold', 'It has no coconut milk'],
      ans: 1,
      explain: 'Laksa Johor uses spaghetti-style noodles instead of the usual rice noodles — that makes it unique!',
    },
  },

  {
    id: 'kelantan',
    name: 'Kelantan',
    emoji: '🎨',
    color: '#C0392B',
    colorLight: '#FDEDEC',
    region: 'west',
    tagline: 'Land of Lightning',
    story: `Kelantan is a state on the northeast coast of Malaysia, bordering Thailand. It is known for its rich Malay culture, arts, and crafts. The people here are famous for their traditional art forms like Wayang Kulit (shadow puppets), Wau (kite flying), and Batik fabric. Kota Bharu is the capital city.`,
    dialectWord: { word: 'Wau', meaning: 'Traditional Malay kite, often large and beautifully decorated', pronunciation: 'wow' },
    cards: [
      {
        id: 'kelantan-1',
        category: 'Art',
        icon: '🪁',
        title: 'Wau (Kite Flying)',
        desc: 'Wau is the traditional Malay kite from Kelantan. These kites are huge, beautifully decorated, and can be as big as 3 metres! They make a special humming sound when they fly high in the sky.',
        funFact: 'The Wau Bulan (moon kite) is so iconic that it appears on the Malaysian 50 sen coin!',
        mascotLine: 'A kite this big and beautiful flying in the sky — it must look like a giant bird!',
        // 📸 IMAGE NEEDED: kelantan-wau.png
        // Export from Figma → Cards/Kelantan/Art — traditional Wau kite illustration
        image: null,
      },
      {
        id: 'kelantan-2',
        category: 'Art',
        icon: '🎭',
        title: 'Wayang Kulit',
        desc: 'Wayang Kulit is a traditional shadow puppet show. A skilled puppeteer called a "Tok Dalang" uses flat leather puppets behind a lit screen to tell stories from ancient Hindu epics like Ramayana. The music is played live!',
        funFact: 'A single Wayang Kulit performance can last from dusk until dawn — the whole night!',
        mascotLine: 'The shadow puppets look magical dancing on the screen — the stories come alive!',
        // 📸 IMAGE NEEDED: kelantan-wayang-kulit.png
        // Export from Figma → Cards/Kelantan/Art — shadow puppet performance illustration
        image: null,
      },
      {
        id: 'kelantan-3',
        category: 'Craft',
        icon: '🧵',
        title: 'Batik Kelantan',
        desc: 'Batik is a traditional fabric art where patterns are made using wax and dye. Kelantan is famous for its hand-drawn "Batik Lukis" with beautiful floral and nature designs. Batik clothing is worn at festivals and formal events.',
        funFact: 'Malaysian Batik was recognised by UNESCO as an Intangible Cultural Heritage in 2009!',
        mascotLine: 'Every batik pattern tells a story — it\'s like wearing a beautiful piece of art!',
        // 📸 IMAGE NEEDED: kelantan-batik.png
        // Export from Figma → Cards/Kelantan/Craft — batik fabric pattern illustration
        image: null,
      },
    ],
    quizQuestion: {
      q: 'What is a "Wau"?',
      opts: ['A type of dance', 'A traditional kite', 'A musical instrument', 'A cooking method'],
      ans: 1,
      explain: 'Wau is the traditional Malay kite from Kelantan. The Wau Bulan design even appears on Malaysia\'s 50 sen coin!',
    },
  },

  {
    id: 'sabah',
    name: 'Sabah',
    emoji: '🏔️',
    color: '#117A65',
    colorLight: '#E8F8F5',
    region: 'east',
    tagline: 'Land Below the Wind',
    story: `Sabah is located in the northern part of Borneo island. It is called the "Land Below the Wind" because it sits just below the typhoon belt. Sabah is famous for its stunning natural beauty — Mount Kinabalu is the highest peak in Malaysia! Sabah also has amazing wildlife like orangutans, pygmy elephants, and proboscis monkeys.`,
    dialectWord: { word: 'Kadazan-Dusun', meaning: 'The largest indigenous ethnic group in Sabah', pronunciation: 'ka-da-zan doo-sun' },
    cards: [
      {
        id: 'sabah-1',
        category: 'Nature',
        icon: '🏔️',
        title: 'Mount Kinabalu',
        desc: 'Mount Kinabalu is the highest mountain in Malaysia at 4,095 metres above sea level! It is a popular hiking destination and is a UNESCO World Heritage Site. On a clear day, you can see the sea from the summit!',
        funFact: 'Mount Kinabalu is one of the youngest non-volcanic mountains in the world — it is still growing!',
        mascotLine: 'Imagine standing on the highest mountain in Malaysia — you can touch the clouds!',
        // 📸 IMAGE NEEDED: sabah-kinabalu.png
        // Export from Figma → Cards/Sabah/Nature — Mount Kinabalu mountain illustration
        image: null,
      },
      {
        id: 'sabah-2',
        category: 'Wildlife',
        icon: '🦧',
        title: 'Borneo Orangutan',
        desc: 'Sabah is one of the last places on Earth where wild orangutans live. These gentle apes share 97% of their DNA with humans! The Sepilok Orangutan Rehabilitation Centre helps orphaned orangutans learn to survive in the wild again.',
        funFact: 'Orangutan means "person of the forest" in Malay — orangu (person) + utan (forest/wild)!',
        mascotLine: 'Orangutans are like our forest cousins — we must protect them!',
        // 📸 IMAGE NEEDED: sabah-orangutan.png
        // Export from Figma → Cards/Sabah/Wildlife — Borneo orangutan illustration
        image: null,
      },
      {
        id: 'sabah-3',
        category: 'Festival',
        icon: '🎉',
        title: 'Kaamatan Festival',
        desc: 'Kaamatan is the harvest festival of the Kadazan-Dusun people, celebrated at the end of May every year. It is a time to thank the rice spirit (Bambazon) for a good harvest. The festival includes traditional music, dance, and food!',
        funFact: 'During Kaamatan, a special rice wine called "Tapai" is made from fermented rice — a traditional drink!',
        mascotLine: 'Kaamatan is about being grateful for nature\'s gifts — what a beautiful tradition!',
        // 📸 IMAGE NEEDED: sabah-kaamatan.png
        // Export from Figma → Cards/Sabah/Festival — Kaamatan harvest festival illustration
        image: null,
      },
    ],
    quizQuestion: {
      q: 'What is Mount Kinabalu famous for?',
      opts: ['Being the oldest volcano', 'Being the highest mountain in Malaysia', 'Being underwater', 'Being made of gold'],
      ans: 1,
      explain: 'Mount Kinabalu is 4,095 metres high — the highest mountain in Malaysia and a UNESCO World Heritage Site!',
    },
  },

  {
    id: 'sarawak',
    name: 'Sarawak',
    emoji: '🌿',
    color: '#1A5276',
    colorLight: '#EBF5FB',
    region: 'east',
    tagline: 'Land of the Hornbills',
    story: `Sarawak is the largest state in Malaysia, located on the island of Borneo. It is called the "Land of the Hornbills" because the magnificent hornbill bird is its symbol. Sarawak has amazing rainforests, ancient caves, and over 40 different indigenous ethnic groups with their own unique cultures!`,
    dialectWord: { word: 'Iban', meaning: 'The largest indigenous ethnic group in Sarawak', pronunciation: 'ee-ban' },
    cards: [
      {
        id: 'sarawak-1',
        category: 'Wildlife',
        icon: '🦜',
        title: 'Rhinoceros Hornbill',
        desc: 'The Rhinoceros Hornbill is Sarawak\'s state bird. It is a large, beautiful bird with a curved "casque" on its beak that looks like a horn. It plays an important role in Iban culture and legends. Seeing one in the wild is very special!',
        funFact: 'Hornbills mate for life and the female seals herself inside a tree hole to lay eggs — only a small opening remains for the male to pass her food!',
        mascotLine: 'Wak here is a hornbill just like this! The casque on my beak is my pride!',
        // 📸 IMAGE NEEDED: sarawak-hornbill.png
        // Export from Figma → Cards/Sarawak/Wildlife — Rhinoceros Hornbill illustration
        image: null,
      },
      {
        id: 'sarawak-2',
        category: 'Heritage',
        icon: '🏡',
        title: 'Iban Longhouse',
        desc: 'The Iban people are famous for their longhouses — very long wooden houses built on stilts that can house up to 50 families! Everyone lives together in one giant connected house. Visitors are always welcomed with traditional Iban hospitality.',
        funFact: 'Some Iban longhouses are over 300 metres long — longer than three football fields!',
        mascotLine: 'Imagine living in a house with 50 families — it\'s like a village under one roof!',
        // 📸 IMAGE NEEDED: sarawak-longhouse.png
        // Export from Figma → Cards/Sarawak/Heritage — Iban longhouse illustration
        image: null,
      },
      {
        id: 'sarawak-3',
        category: 'Nature',
        icon: '🕯️',
        title: 'Mulu Caves',
        desc: 'Gunung Mulu National Park has the largest cave system in the world! The Sarawak Chamber inside is so big, it can fit 40 Boeing 747 aircraft! Every evening, millions of bats fly out of the caves in a spectacular show.',
        funFact: 'The Sarawak Chamber is 600 metres long, 415 metres wide, and 80 metres high — the world\'s largest cave chamber!',
        mascotLine: 'Millions of bats flying out at sunset looks like a giant dark river in the sky!',
        // 📸 IMAGE NEEDED: sarawak-mulu.png
        // Export from Figma → Cards/Sarawak/Nature — Mulu caves illustration
        image: null,
      },
    ],
    quizQuestion: {
      q: 'Why is Sarawak called the "Land of the Hornbills"?',
      opts: ['It has the most horns', 'The hornbill bird is its symbol', 'Its mountains look like horns', 'Horns are made there'],
      ans: 1,
      explain: 'The Rhinoceros Hornbill is Sarawak\'s state bird and symbol — that\'s why Sarawak is called the Land of the Hornbills!',
    },
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

export function getState(id) {
  return STATES_DATA.find(s => s.id === id) || null;
}

export function unlockedStates(progress = {}) {
  const westDone = STATES_DATA
    .filter(s => s.region === 'west')
    .filter(s => progress[s.id]?.quiz === true).length;
  const eastUnlocked = westDone >= 5;

  return STATES_DATA.filter(s => {
    if (s.region === 'west') return true;
    return eastUnlocked;
  });
}

export function nextRecommended(progress = {}) {
  const unlocked = unlockedStates(progress);
  return unlocked.find(s => !progress[s.id]?.quiz) || null;
}
