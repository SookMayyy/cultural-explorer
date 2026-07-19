// js/data/states.js — Cultural data for all 6 states in CP2 scope

export const STATES_DATA = [
  {
    id: 'penang',
    name: 'Pulau Pinang',
    emoji: '<img src="../assets/flags/penang-flag.png" alt="Penang Icon">',
    color: '#E67E22',
    colorLight: '#FEF0DC',
    region: 'west',
    tagline: 'Pearl of the Orient',
    // 📸 Entry background (narrative scene + mission-flow backdrop, like Kedah).
    entryBg: '../assets/content/Penang/penang_background.png',
    story: `Penang is a beautiful island state on the northwest coast of Malaysia. It is famous for its amazing mix of cultures — Malay, Chinese, Indian, and more! George Town, the capital, is a UNESCO World Heritage Site full of colourful street art and old shophouses. Penang is also known as the "Food Capital of Malaysia" because of its delicious street food!`,
    dialectWord: { word: 'Laksa', meaning: 'A sour, tangy fish noodle soup unique to Penang', pronunciation: 'lak-sah' },
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
        title: 'George Town Heritage',
        desc: 'George Town is the capital city of Penang. Its old town is a UNESCO World Heritage Site with beautiful old buildings, colourful street art, and mix of Malay, Chinese, Indian, and European cultures!',
        funFact: 'George Town is one of only two UNESCO World Heritage cities in Malaysia — the other is Melaka!',
        mascotLine: 'George Town is like a living museum! Every street has a story to tell.',
        // 📸 IMAGE NEEDED: penang-georgetown.png
        // Export from Figma → Cards/Penang/Landmark — George Town heritage street illustration
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
      {
        id: 'penang-4',
        category: 'Dialect',
        icon: '💬',
        title: 'Penang Hokkien',
        desc: 'People in Penang speak a special dialect called Penang Hokkien. It mixes Hokkien Chinese with Malay and English words, so it sounds different from Chinese spoken anywhere else in the world!',
        funFact: 'Penang Hokkien borrows many Malay words — like "sabun" for soap and "roti" for bread!',
        mascotLine: 'Penang Hokkien is like a language smoothie — so many flavours mixed into one!',
        // 📸 IMAGE NEEDED: penang-hokkien.png
        // Export from Figma → Cards/Penang/Dialect — Penang Hokkien speech-bubble illustration
        image: null,
      },
    ],
    // Curated drag-match pairs for the "Match the Culture!" activity — one
    // real photo per category (food / costume / landmark / festival), matched
    // to a short kid-friendly description. `icon` is only the <img onerror>
    // text fallback if a photo fails to load.
    dragPairs: [
      { image: '../assets/content/Penang/char_kway_teow.jpg', icon: '🍜', label: 'Char Kway Teow', match: 'The traditional food — smoky fried noodles' },
      { image: '../assets/content/Penang/baba_nyonya_kebaya.png', icon: '👘', label: 'Baba Nyonya Kebaya', match: 'The traditional costume' },
      { image: '../assets/content/Penang/george_town.jpg', icon: '🏛️', label: 'George Town', match: 'A famous place to visit' },
      { image: '../assets/content/Penang/thaipusam_festival.jpg', icon: '🎆', label: 'Thaipusam', match: 'A special celebration' },
    ],
    quizQuestion: {
      q: 'What is Penang famous for?',
      opts: ['Its cold mountains', 'Its amazing street food', 'Its coconut farms', 'Its gold mines'],
      ans: 1,
      explain: 'Penang is called the "Food Capital of Malaysia" for its delicious street food like Char Kway Teow, Laksa, and Nasi Kandar!',
    },
  },

  {
    id: 'selangor',
    name: 'Selangor',
    emoji: '<img src="../assets/flags/selangor-flag.png" alt="Selangor Icon">',
    color: '#1A5276',
    colorLight: '#EBF5FB',
    region: 'west',
    tagline: 'State of Harmony',
    // Entry scene + Rimau's spoken intro on the narrative screen.
    entryBg: '../assets/content/Selangor/batu_caves.jpg',
    entryDialogue: [
      'Selamat datang to Selangor — the State of Harmony!',
      'Selangor wraps around Kuala Lumpur and is full of famous places and yummy food',
      'Ready to taste, dance, and explore what makes Selangor so special?',
      "Let's go!"
    ],
    story: `Selangor is the most developed state in Malaysia and it wraps right around the capital city, Kuala Lumpur. It is home to the towering Batu Caves temple, the glowing fireflies and "blue tears" of Kuala Selangor, and the famous grilled Satay Kajang. The Mah Meri people of Carey Island still celebrate the Hari Moyang festival with the Main Jo-oh dance. Shah Alam is the capital city.`,
    dialectWord: { word: 'Shah Alam', meaning: 'Capital city of Selangor, meaning "realm of the king"', pronunciation: 'shah ah-lam' },
    cards: [
      {
        id: 'selangor-1',
        category: 'Landmark',
        icon: '⛰️',
        title: 'Batu Caves',
        desc: 'Batu Caves is a famous temple built inside a huge limestone hill. There are 272 colourful steps leading up to the main cave, and a giant golden statue stands at the entrance. Cheeky monkeys often play on the steps!',
        funFact: 'The golden statue at Batu Caves is 42.7 metres tall — as tall as a 14-storey building!',
        mascotLine: 'Climbing those 272 rainbow steps is a workout, but the view at the top is amazing!',
        image: '../assets/content/Selangor/batu_caves.jpg',
      },
      {
        id: 'selangor-2',
        category: 'Food',
        icon: '🍢',
        title: 'Satay Kajang',
        desc: 'Kajang town in Selangor is famous for satay — little skewers of meat marinated in spices and grilled over a charcoal fire. It is served with a sweet peanut sauce, ketupat (rice cakes), cucumber, and red onion.',
        funFact: 'Kajang is nicknamed the "Satay Town" — people drive from all over just to eat satay here!',
        mascotLine: 'Grilled satay dipped in peanut sauce — the smell alone makes my tummy rumble!',
        image: '../assets/content/Selangor/satay_kajang.jpg',
      },
      {
        id: 'selangor-3',
        category: 'Festival',
        icon: '🎭',
        title: 'Hari Moyang',
        desc: 'Hari Moyang is the ancestor festival of the Mah Meri people who live on Carey Island in Selangor. They give thanks to their ancestors by the sea with offerings, wood-carved masks, and the special Main Jo-oh dance.',
        funFact: 'The Mah Meri are famous wood carvers — their ancestor masks and sculptures have won international awards!',
        mascotLine: 'Dancing by the sea to thank the ancestors — Hari Moyang is a very special tradition!',
        image: '../assets/content/Selangor/hari_moyang.jpg',
      },
      {
        id: 'selangor-4',
        category: 'Costume',
        icon: '👘',
        title: 'Traditional Malay Dress',
        desc: 'For special days, Selangor Malays wear traditional dress. Men wear the Baju Melayu with a songkok cap and a woven samping around the waist, while women wear the flowing Baju Kurung with a selendang shawl.',
        funFact: 'Selangor\'s royal colour is yellow, so you will often see the traditional costumes in bright royal yellow!',
        mascotLine: 'The royal-yellow Baju Melayu and Baju Kurung look so smart and elegant!',
        image: '../assets/content/Selangor/traditional_costume_selangor.png',
      },
      {
        id: 'selangor-5',
        category: 'Nature',
        icon: '✨',
        title: 'Kuala Selangor',
        desc: 'At Kuala Selangor, thousands of fireflies light up the mangrove trees at night like a living Christmas tree. Along the coast you can also see "blue tears" — tiny sea creatures that glow bright blue in the dark water!',
        funFact: 'The fireflies at Kuala Selangor blink their lights all together at the same time — like tiny fairy lights!',
        mascotLine: 'Glowing fireflies and blue sparkling waves — Kuala Selangor at night is pure magic!',
        image: '../assets/content/Selangor/blue_tears.jpg',
      },
      {
        id: 'selangor-6',
        category: 'Landmark',
        icon: '🗿',
        title: 'National Monument',
        desc: 'The National Monument (Tugu Negara) stands in Kuala Lumpur, at the edge of Selangor. It is a tall bronze statue that honours the brave people who protected Malaysia. It is one of the largest bronze statues in the world.',
        funFact: 'The National Monument was designed by the same sculptor who made the famous Iwo Jima memorial in the USA!',
        mascotLine: 'The National Monument reminds us to be thankful for our peaceful country.',
        image: '../assets/content/Selangor/national_monument.jpg',
      },
      {
        id: 'selangor-7',
        category: 'Tradition',
        icon: '💃',
        title: 'Main Jo-oh Dance',
        desc: 'The Main Jo-oh is a graceful dance of the Mah Meri people, performed during the Hari Moyang festival. Dancers in skirts made of woven leaves move gently to the beat of drums and gongs to honour their ancestors.',
        funFact: 'The dancers wear costumes woven from nipah and coconut leaves — everything comes from the forest around them!',
        mascotLine: 'Dancing in leaf skirts by the sea — the Main Jo-oh is so graceful to watch!',
        image: '../assets/content/Selangor/mayin_jo_oh.jpg',
      },
    ],
    dragPairs: [
      { image: '../assets/content/Selangor/satay_kajang.jpg', icon: '🍢', label: 'Satay Kajang', match: 'The traditional food — grilled meat skewers' },
      { image: '../assets/content/Selangor/traditional_costume_selangor.png', icon: '👘', label: 'Traditional Malay Dress', match: 'The traditional costume' },
      { image: '../assets/content/Selangor/batu_caves.jpg', icon: '⛰️', label: 'Batu Caves', match: 'A famous place to visit' },
      { image: '../assets/content/Selangor/mayin_jo_oh.jpg', icon: '🎭', label: 'Hari Moyang', match: 'A special celebration' },
    ],
    quizQuestion: {
      q: 'How many steps lead up to the Batu Caves temple?',
      opts: ['100 steps', '200 steps', '272 steps', '350 steps'],
      ans: 2,
      explain: 'There are 272 colourful steps leading up to the main cave temple at Batu Caves!',
      image: '../assets/content/Selangor/batu_caves.jpg',
    },
  },

  {
    id: 'kelantan',
    name: 'Kelantan',
    emoji: '<img src="../assets/flags/kelantan-flag.png" alt="Kelantan Icon">',
    color: '#C0392B',
    colorLight: '#FDEDEC',
    region: 'west',
    tagline: 'The Cradle of Malay Culture',
    // Entry scene + Rimau's spoken intro on the narrative screen (3 lines shown).
    entryBg: '../assets/content/Kelantan/perahu_kolek.jpg',
    entryDialogue: [
      'Selamat datang to Kelantan — the Cradle of Malay Culture!',
      'Kelantan is famous for shadow puppets, royal costumes, and beautiful crafts',
      'Ready to taste, dance, and explore what makes Kelantan so special?',
      "Let's go!"
    ],
    story: `Kelantan is a state on the northeast coast of Malaysia, bordering Thailand. It is known as "The Cradle of Malay Culture" for its rich arts and crafts. Kelantan is famous for Wayang Kulit (shadow puppets), the royal Cik Siti Wan Kembang costume, colourful Perahu Kolek fishing boats, and the naturally blue Nasi Kerabu. Kota Bharu is the capital city.`,
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
        // A traditional performance art, not a festival — labelled 'Art' so the
        // badge and copy are honest (it's iconic Kelantan culture either way).
        category: 'Art',
        icon: '🎭',
        title: 'Wayang Kulit',
        desc: 'Wayang Kulit is a traditional shadow-puppet performance. A skilled puppeteer called a "Tok Dalang" moves flat leather puppets behind a lit screen to tell stories from Malay folklore. A bright lamp turns the puppets into moving shadows, and the music is played live!',
        funFact: 'A single Wayang Kulit performance can last from dusk until dawn — the whole night!',
        mascotLine: 'The shadow puppets look magical dancing on the screen — the stories come alive!',
        image: '../assets/content/Kelantan/wayang_kulit.jpg',
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
      {
        id: 'kelantan-4',
        category: 'Food',
        icon: '🍚',
        title: 'Nasi Kerabu',
        desc: 'Nasi Kerabu is a famous Kelantan dish where the rice is naturally blue! It is served with grilled chicken or fish, fresh herbs, salted egg, prawn crackers, and a spicy sauce. It is as healthy as it is colourful.',
        funFact: 'The blue colour comes from real butterfly-pea flowers called "bunga telang" — no artificial colouring at all!',
        mascotLine: 'Blue rice?! Kelantan\'s Nasi Kerabu is as tasty as it is colourful!',
        image: '../assets/content/Kelantan/nasi_kerabu.png',
      },
      {
        id: 'kelantan-5',
        category: 'Costume',
        icon: '👑',
        title: 'Cik Siti Wan Kembang',
        desc: 'The Cik Siti Wan Kembang attire is a royal costume inspired by a legendary 17th-century warrior queen of Kelantan. It has the Kain Kemban wrapped around the torso, a Kain Kelubung shawl, a Kain Sarong at the waist, and the Gandik — a golden crown.',
        funFact: 'Cik Siti Wan Kembang was said to ride into battle on horseback with an army of women warriors!',
        mascotLine: 'A queen who was also a warrior — and her golden crown sparkles like the stars!',
        image: '../assets/content/Kelantan/cik_siti_wan_kembang.png',
      },
      {
        id: 'kelantan-6',
        category: 'Landmark',
        icon: '🛶',
        title: 'Perahu Kolek',
        desc: 'Perahu Kolek are traditional wooden fishing boats from Kelantan. Local fishermen hand-paint them with beautiful colourful designs, so people call them "floating works of art"! You can also find street art and craft villages around Kota Bharu.',
        funFact: 'Each fisherman paints his own boat, so no two Perahu Kolek look exactly the same!',
        mascotLine: 'These boats are so colourful — they really are floating works of art!',
        image: '../assets/content/Kelantan/perahu_kolek.jpg',
      },
    ],
    dragPairs: [
      { image: '../assets/content/Kelantan/nasi_kerabu.png', icon: '🍚', label: 'Nasi Kerabu', match: 'The traditional food — blue rice dish' },
      { image: '../assets/content/Kelantan/cik_siti_wan_kembang.png', icon: '👑', label: 'Cik Siti Wan Kembang', match: 'The traditional costume' },
      { image: '../assets/content/Kelantan/perahu_kolek.jpg', icon: '🛶', label: 'Perahu Kolek', match: 'A famous place to visit' },
      { image: '../assets/content/Kelantan/wayang_kulit.jpg', icon: '🎭', label: 'Wayang Kulit', match: 'A special celebration' },
    ],
    quizQuestion: {
      q: 'What are Kelantan\'s colourful hand-painted fishing boats called?',
      opts: ['Perahu Kolek', 'Wayang Kulit', 'Nasi Kerabu', 'Cik Siti Wan Kembang'],
      ans: 0,
      explain: 'Perahu Kolek are Kelantan\'s hand-painted wooden fishing boats — people call them "floating works of art"!',
      image: '../assets/content/Kelantan/perahu_kolek.jpg',
    },
  },

  {
    id: 'kedah',
    name: 'Kedah',
    emoji: '<img src="../assets/flags/kedah-flag.png" alt="Kedah Icon">',
    color: '#B7950B',
    colorLight: '#FBF6E3',
    region: 'west',
    tagline: 'Rice Bowl of Malaysia',
    // 📸 Entry background provided: assets/content/Kedah/kedah_entry_background..avif
    entryBg: '../assets/content/Kedah/kedah_entry_background.avif',
    // Rimau's spoken intro on the entry screen (3 lines: greeting → story → CTA).
    entryDialogue: [
      'Selamat datang to Kedah — the Rice Bowl of Malaysia!',
      'People here grow lots of rice in the beautiful paddy fields',
      "Ready to taste, dance, and explore what makes Kedah so special?",
      "Let's go!"
    ],
    story: `Kedah is a state in the northwest of Malaysia, bordering Thailand. It is known as the "Jelapang Padi" — the Rice Bowl of Malaysia — because its wide, green paddy fields grow much of the country's rice! Kedah is one of the oldest states, with the ancient Bujang Valley civilisation. Alor Setar is the capital city.`,
    dialectWord: { word: 'Hang', meaning: 'means "you" in the Kedah dialect (loghat Kedah)', pronunciation: 'hahng' },
    cards: [
      {
        id: 'kedah-1',
        category: 'Food',
        icon: '🍜',
        title: 'Kedah Laksa',
        desc: 'Kedah Laksa is a northern-style laksa with a rich, spicy and tangy fish broth poured over soft rice noodles, served with flaky fish and a medley of fresh vegetables. Locals love it any time of day!',
        funFact: 'Kedah is also famous for sweet treats — Kek Lapis Kedah (a layered cake with beautiful patterns) and Pulut Kuning (turmeric glutinous rice served at celebrations)!',
        mascotLine: 'Mmm, Kedah Laksa! Sour, spicy, and so fresh — let\'s cook a bowl!',
        image: '../assets/content/Kedah/kedah_laksa.png',
      },
      {
        id: 'kedah-2',
        category: 'Landmark',
        icon: '🌉',
        title: 'Langkawi Sky Bridge',
        desc: 'The Langkawi Sky Bridge is a curved walking bridge high up on Gunung Mat Cincang in the Langkawi Archipelago. It hangs about 700 metres above sea level with breathtaking views of islands and the sea!',
        funFact: 'Langkawi is a group of 99 islands and is a UNESCO Global Geopark — full of ancient rainforests and legends!',
        mascotLine: 'Wah, walking on a bridge in the clouds — hold on tight and enjoy the view!',
        image: null,
      },
      {
        id: 'kedah-3',
        category: 'Tradition',
        icon: '💃',
        title: 'Cinta Sayang Dance',
        desc: 'Cinta Sayang is a traditional Malay dance that comes from Kedah. It is a favourite opening dance performed at important events and celebrations across the state.',
        funFact: 'Long ago, fishermen and farmers danced Cinta Sayang during the paddy harvest to entertain themselves after a hard day\'s work!',
        mascotLine: 'Can you feel the rhythm? Let\'s dance the Cinta Sayang together!',
        image: null,
      },
      {
        id: 'kedah-4',
        category: 'Costume',
        icon: '👗',
        title: 'Baju Kedah',
        desc: 'Baju Kedah is a women\'s costume with a short hip-length tunic and three-quarter sleeves, worn with a matching skirt folded on one side. It is paired with a batik sarong or kain pelekat and a silver belt.',
        funFact: 'The blouse is often made of thin cloth like floral cotton or soft voile, so the pretty silver belt shows through!',
        mascotLine: 'Baju Kedah looks so elegant — perfect for the Cinta Sayang dance!',
        image: null,
      },
      {
        id: 'kedah-5',
        category: 'Festival',
        icon: '🌾',
        title: 'Kedah Paddy Festival',
        desc: 'The Kedah Paddy Festival, usually held in November, is a lively celebration that honours the state\'s rice harvest with music, dancing, and delicious food.',
        funFact: 'Kedah is the "Rice Bowl of Malaysia" — its golden paddy fields grow much of the rice the whole country eats!',
        mascotLine: 'Harvest time in Kedah means music, dance, and a big thank-you for the rice!',
        image: null,
      },
    ],
    // ⚠️ Kedah ships no dedicated women's Baju Kedah costume photo yet — the
    // costume slot reuses the Cinta Sayang dance photo (kedah_cinta_sayang.jpg,
    // a male dancer), so it's honestly labelled the "Cinta Sayang costume" here.
    // Swap in a real Baju Kedah photo + label if/when one is added.
    dragPairs: [
      { image: '../assets/content/Kedah/kedah_laksa.png', icon: '🍜', label: 'Kedah Laksa', match: 'The traditional food — tangy fish laksa' },
      { image: '../assets/content/Kedah/kedah_cinta_sayang.jpg', icon: '👗', label: 'Cinta Sayang costume', match: 'The traditional costume' },
      { image: '../assets/content/Kedah/langkawi_sky_bridge.avif', icon: '🌉', label: 'Langkawi Sky Bridge', match: 'A famous place to visit' },
      { image: '../assets/content/Kedah/kedah_entry_background.avif', icon: '🌾', label: 'Kedah Paddy Festival', match: 'A special celebration' },
    ],
    quizQuestion: {
      q: 'Why is Kedah called the "Rice Bowl of Malaysia"?',
      opts: ['It makes the most bowls', 'It grows most of the rice', 'It is shaped like a bowl', 'It has the most restaurants'],
      ans: 1,
      explain: 'Kedah is called "Jelapang Padi" — the Rice Bowl of Malaysia — because its huge paddy fields grow much of the country\'s rice!',
      image: '../assets/content/Kedah/kedah_entry_background.avif',
    },
  },

  {
    id: 'sabah',
    name: 'Sabah',
    emoji: '<img src="../assets/flags/sabah-flag.png" alt="Sabah Icon">',
    color: '#117A65',
    colorLight: '#E8F8F5',
    region: 'east',
    tagline: 'Land Below the Wind',
    // Entry scene + Rimau's spoken intro on the narrative screen.
    entryBg: '../assets/content/Sabah/mount_kinabalu.jpg',
    entryDialogue: [
      'Selamat datang to Sabah — the Land Below the Wind!',
      'Sabah has over 40 ethnic groups, the tallest mountain in Malaysia, and amazing nature',
      'Ready to taste, dance, and explore what makes Sabah so special?',
      "Let's go!"
    ],
    story: `Sabah is on the island of Borneo, in the east of Malaysia. It is called the "Land Below the Wind" because it sits just below the typhoon belt. Sabah has over 40 ethnic groups — the largest is the Kadazandusun — each with their own beliefs and traditions. It is famous for Mount Kinabalu (the highest peak in Malaysia), the fresh-fish salad Hinava, the graceful Sumazau dance at Pesta Kaamatan, and the world's biggest flower, the Rafflesia. Kota Kinabalu is the capital city.`,
    dialectWord: { word: 'Kadazandusun', meaning: 'The largest indigenous ethnic group in Sabah', pronunciation: 'ka-da-zan-doo-sun' },
    cards: [
      {
        id: 'sabah-1',
        category: 'Landmark',
        icon: '🏔️',
        title: 'Mount Kinabalu',
        desc: 'Mount Kinabalu is the highest mountain in Malaysia at 4,095 metres above sea level! It is a UNESCO World Heritage Site. Climbers wake up very early to reach the top and watch the sunrise above the clouds.',
        funFact: 'Mount Kinabalu is one of the youngest non-volcanic mountains in the world — it is still growing a little bit every year!',
        mascotLine: 'Imagine standing on the highest mountain in Malaysia — you can touch the clouds!',
        image: '../assets/content/Sabah/mount_kinabalu.jpg',
      },
      {
        id: 'sabah-2',
        category: 'Food',
        icon: '🥗',
        title: 'Hinava',
        desc: 'Hinava is a traditional fresh-fish salad from the Kadazandusun people. Small pieces of raw fish are mixed with lime juice, onion, chili padi, and ginger. The sour lime juice "cooks" the fish without any fire!',
        funFact: 'Hinava is sometimes called the "sushi of Sabah" because the fish is served fresh and raw!',
        mascotLine: 'A salad where lime juice cooks the fish — no fire needed. So clever!',
        image: '../assets/content/Sabah/hinava.png',
      },
      {
        id: 'sabah-3',
        category: 'Festival',
        icon: '🎉',
        title: 'Pesta Kaamatan',
        desc: 'Pesta Kaamatan is the harvest festival of the Kadazandusun people, celebrated in May to thank Bambaazon, the spirit of the rice. It is full of music, the graceful Sumazau dance, and the Unduk Ngadau beauty parade.',
        funFact: 'In the Sumazau dance, dancers spread their arms and move gently like a bird flying in the sky!',
        mascotLine: 'Kaamatan is a big thank-you to nature for the rice harvest — what a joyful festival!',
        image: '../assets/content/Sabah/sumazau_dance.png',
      },
      {
        id: 'sabah-4',
        category: 'Costume',
        icon: '👘',
        title: 'Kadazan Penampang',
        desc: 'The Kadazan Penampang costume is made of black velvet with red-and-gold trim. Women wear a sleeveless top (Sinuangga) and a long skirt (Gonob) with a silver coin belt, while men wear a jacket (Gaung), trousers (Souva), and a woven head cloth (Siga).',
        funFact: 'The woman\'s belt is made from rows of real silver coins — it jingles softly when she dances!',
        mascotLine: 'The Kadazan costumes sparkle with gold — perfect for the Sumazau dance!',
        image: '../assets/content/Sabah/kadazan_penampang.jpg',
      },
      {
        id: 'sabah-5',
        category: 'Landmark',
        icon: '🏡',
        title: 'Mari Mari Cultural Village',
        desc: 'Mari Mari Cultural Village shows how Sabah\'s tribes lived long ago. You can visit traditional wooden ethnic houses and watch people start a fire using only bamboo — one of the old ways of cooking!',
        funFact: 'Nearby, the Desa Dairy Farm in Kundasang has green hills and cows — people call it the "New Zealand of Sabah"!',
        mascotLine: 'Making fire with just bamboo? The old ways are amazing to watch!',
        image: '../assets/content/Sabah/mari_mari_village.jpg',
      },
      {
        id: 'sabah-6',
        category: 'Nature',
        icon: '🌺',
        title: 'Rafflesia',
        desc: 'The Rafflesia is the biggest flower in the whole world — it can grow as wide as a car tyre! It is red with white spots and blooms deep in the Sabah rainforest. Visitors can learn about it at the Rafflesia Information Centre.',
        funFact: 'The Rafflesia smells like rotten meat — that stinky smell attracts flies to help it make seeds!',
        mascotLine: 'The biggest flower in the world grows right here in Sabah — but pooh, it\'s stinky!',
        image: '../assets/content/Sabah/rafflesia.jpg',
      },
      {
        id: 'sabah-7',
        category: 'Tradition',
        icon: '👸',
        title: 'Unduk Ngadau',
        desc: 'Unduk Ngadau is a special beauty parade held during Pesta Kaamatan. Young women wear their finest traditional costumes and are honoured in memory of Huminodun, a kind girl from Kadazandusun folklore who gave her life so rice would grow.',
        funFact: 'The name "Unduk Ngadau" means "girl crowned by the midday sun" — the crowning happens at the brightest time of day!',
        mascotLine: 'The Unduk Ngadau costumes are so beautiful — it\'s a parade to remember a kind-hearted girl!',
        image: '../assets/content/Sabah/unduk_ngadu.png',
      },
    ],
    dragPairs: [
      { image: '../assets/content/Sabah/hinava.png', icon: '🥗', label: 'Hinava', match: 'The traditional food — fresh-fish salad' },
      { image: '../assets/content/Sabah/kadazan_penampang.jpg', icon: '👘', label: 'Kadazan Penampang', match: 'The traditional costume' },
      { image: '../assets/content/Sabah/mount_kinabalu.jpg', icon: '🏔️', label: 'Mount Kinabalu', match: 'A famous place to visit' },
      { image: '../assets/content/Sabah/sumazau_dance.png', icon: '💃', label: 'Pesta Kaamatan', match: 'A special celebration' },
    ],
    quizQuestion: {
      q: 'What is Mount Kinabalu famous for?',
      opts: ['Being the oldest volcano', 'Being the highest mountain in Malaysia', 'Being underwater', 'Being made of gold'],
      ans: 1,
      explain: 'Mount Kinabalu is 4,095 metres high — the highest mountain in Malaysia and a UNESCO World Heritage Site!',
      image: '../assets/content/Sabah/mount_kinabalu.jpg',
    },
  },

  {
    id: 'sarawak',
    name: 'Sarawak',
    emoji: '<img src="../assets/flags/sarawak-flag.png" alt="Sarawak Icon">',
    color: '#1A5276',
    colorLight: '#EBF5FB',
    region: 'east',
    tagline: 'Land of the Hornbills',
    // Entry scene + Rimau's spoken intro on the narrative screen.
    entryBg: '../assets/content/Sarawak/kuching_waterfront.jpg',
    entryDialogue: [
      'Selamat datang to Sarawak — the Land of the Hornbills!',
      'Sarawak is the biggest state, with giant caves, longhouses, and the Iban people',
      'Ready to taste, dance, and explore what makes Sarawak so special?',
      "Let's go!"
    ],
    story: `Sarawak is the largest state in Malaysia, on the island of Borneo. It is called the "Land of the Hornbills" because the magnificent hornbill bird is its symbol. Sarawak is home to over 40 indigenous groups — the largest is the Iban — famous for long wooden longhouses. It has the giant caves of Gunung Mulu, the tasty dry noodles called Kolo Mee, the colourful Ngepan costume, and the lively Gawai Dayak harvest festival. Kuching, which means "cat", is the capital city.`,
    dialectWord: { word: 'Iban', meaning: 'The largest indigenous ethnic group in Sarawak', pronunciation: 'ee-ban' },
    cards: [
      {
        id: 'sarawak-1',
        category: 'Landmark',
        icon: '⛰️',
        title: 'Gunung Mulu',
        desc: 'Gunung Mulu National Park has the largest cave system in the world! You can explore giant caves and walk on a canopy bridge high up in the treetops. Every evening, millions of bats fly out of the caves in a spectacular show.',
        funFact: 'The Sarawak Chamber inside Mulu is so big it could fit 40 jumbo jets — the world\'s largest cave chamber!',
        mascotLine: 'Millions of bats flying out at sunset look like a giant dark river in the sky!',
        image: '../assets/content/Sarawak/gunung_mulu.jpg',
      },
      {
        id: 'sarawak-2',
        category: 'Food',
        icon: '🍜',
        title: 'Kolo Mee',
        desc: 'Kolo Mee is Sarawak\'s favourite noodle dish. Springy egg noodles are tossed dry (not in soup!) and topped with minced pork and crispy fried onions, with a bowl of clear soup and soy sauce on the side.',
        funFact: 'Some people eat Kolo Mee for breakfast every single day — it is that popular in Sarawak!',
        mascotLine: 'Dry, springy noodles with crispy onions on top — Kolo Mee is so tasty!',
        image: '../assets/content/Sarawak/kolo_mee.png',
      },
      {
        id: 'sarawak-3',
        category: 'Festival',
        icon: '🎉',
        title: 'Gawai Dayak',
        desc: 'Gawai Dayak is the harvest festival of the Dayak people, held every June to give thanks for the rice harvest. Families decorate their longhouses, perform the Ngajat dance, and enjoy traditional games together.',
        funFact: 'Gawai greetings sound like "Gayu Guru, Gerai Nyamai" — a wish for long life, health and happiness!',
        mascotLine: 'Decorated longhouses, dancing and games — Gawai Dayak is a joyful harvest party!',
        image: '../assets/content/Sarawak/decorate_longhouse.png',
      },
      {
        id: 'sarawak-4',
        category: 'Costume',
        icon: '👘',
        title: 'Ngepan Iban',
        desc: 'Ngepan is the traditional dress of the Iban women. It has the Sugu Tinggi (a tall silver headdress), the Marik Empang (a beaded shoulder collar), the Rawai (shiny coin belts), and the Kain Kebat (a handwoven skirt).',
        funFact: 'The Sugu Tinggi headdress is made of real silver and shines brightly under the light!',
        mascotLine: 'The Ngepan sparkles with silver and beads — so beautiful for the Ngajat dance!',
        image: '../assets/content/Sarawak/ngepan.png',
      },
      {
        id: 'sarawak-5',
        category: 'Landmark',
        icon: '🐱',
        title: 'Kuching, the Cat City',
        desc: 'Kuching is the capital of Sarawak, and its name means "cat" in Malay! The city is full of cat statues and even has a whole Cat Museum. You can also stroll along the pretty Kuching Waterfront by the river.',
        funFact: 'Kuching\'s Cat Museum has over 2,000 cat items — one of the only museums in the world all about cats!',
        mascotLine: 'A city named "cat", with cat statues everywhere — Kuching is purr-fect!',
        image: '../assets/content/Sarawak/cat_musuem.jpg',
      },
      {
        id: 'sarawak-6',
        category: 'Wildlife',
        icon: '🐒',
        title: 'Proboscis Monkey',
        desc: 'The proboscis monkey has a big, funny nose and a round belly. It lives only on the island of Borneo and can be spotted in Bako National Park near Kuching. It is a strong swimmer and loves the mangrove forests.',
        funFact: 'The male proboscis monkey\'s huge nose helps make his call louder — the bigger the nose, the louder the honk!',
        mascotLine: 'What a funny long nose — the proboscis monkey lives only here on Borneo!',
        image: '../assets/content/Sarawak/proboscis_monkeys.png',
      },
      {
        id: 'sarawak-7',
        category: 'Tradition',
        icon: '💃',
        title: 'Ngajat Dance',
        desc: 'The Ngajat is a proud warrior dance of the Iban people, performed at Gawai Dayak and to welcome guests. Dancers wear tall headdresses decorated with hornbill feathers and move gracefully to the beat of drums and gongs.',
        funFact: 'Long ago, Iban warriors danced the Ngajat before heading off on a journey — today it is a dance of welcome and celebration!',
        mascotLine: 'The Ngajat dancers move like proud hornbills — what a graceful, powerful dance!',
        image: '../assets/content/Sarawak/ngajat_dance.jpg',
      },
      {
        id: 'sarawak-8',
        category: 'Tradition',
        icon: '🎯',
        title: 'Blowpipe (Sumpit)',
        desc: 'The blowpipe, or "sumpit", is a long wooden tube used by Borneo\'s people to hunt in the rainforest. At Gawai Dayak, there are blowpipe competitions where people show off their aim by blowing darts at a target.',
        funFact: 'A skilled hunter can blow a dart accurately over 30 metres — that is longer than a swimming pool!',
        mascotLine: 'Aim, breathe, and puff — the blowpipe takes a steady hand and sharp eyes!',
        image: '../assets/content/Sarawak/blowpipe.jpg',
      },
    ],
    dragPairs: [
      { image: '../assets/content/Sarawak/kolo_mee.png', icon: '🍜', label: 'Kolo Mee', match: 'The traditional food — dry egg noodles' },
      { image: '../assets/content/Sarawak/ngepan.png', icon: '👘', label: 'Ngepan Iban', match: 'The traditional costume' },
      { image: '../assets/content/Sarawak/gunung_mulu.jpg', icon: '⛰️', label: 'Gunung Mulu', match: 'A famous place to visit' },
      { image: '../assets/content/Sarawak/ngajat_dance.jpg', icon: '💃', label: 'Gawai Dayak', match: 'A special celebration' },
    ],
    quizQuestion: {
      q: 'What does the city name "Kuching" mean?',
      opts: ['Cat', 'River', 'Mountain', 'Hornbill'],
      ans: 0,
      explain: 'Kuching is Sarawak\'s capital, and its name means "cat" — the city even has a whole Cat Museum!',
      image: '../assets/content/Sarawak/cat_musuem.jpg',
    },
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

// Per-state stamp illustrations (uploaded under assets/content/<State>/). Paths
// keep the exact folder/file casing so they also resolve on case-sensitive hosts.
const STAMP_FILES = {
  penang:   'Penang/penang_stamp.png',
  selangor: 'Selangor/selangor_stamp.png',
  kelantan: 'Kelantan/kelantan_stamp.png',
  kedah:    'Kedah/Kedah_stamp.png',
  sabah:    'Sabah/sabah_stamp.png',
  sarawak:  'Sarawak/sarawak_stamp.png',
};

// Relative path (from src/views/) to a state's stamp image, or null if none.
export function stampImgFor(stateId) {
  return STAMP_FILES[stateId] ? `../assets/content/${STAMP_FILES[stateId]}` : null;
}

// Single source of truth for "how many states does the app ship?" — every
// counter and "N states" label should read this rather than hardcode a number
// (the app has been written as "13"/"7"/"6" in different places before).
export const STATE_COUNT = STATES_DATA.length;

export function getState(id) {
  return STATES_DATA.find(s => s.id === id) || null;
}

export function unlockedStates(progress = {}) {
  // Free exploration: every state is open from the start — nothing is gated.
  // (Historically East Malaysia unlocked only after all 5 West states; that
  // gate was removed so children can explore any state whenever they like.)
  return STATES_DATA.slice();
}

export function nextRecommended(progress = {}) {
  const unlocked = unlockedStates(progress);
  return unlocked.find(s => !progress[s.id]?.quiz) || null;
}
