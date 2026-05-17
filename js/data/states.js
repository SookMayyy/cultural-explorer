// js/data/states.js
// Complete cultural data for all 7 prototype states
 
const STATES_DATA = [
    {
      id: 'penang',
      name: 'Penang',
      icon: '🏝️',
      region: 'west',
      nickname: 'Pearl of the Orient',
      color: '#E67E22',
      bgColor: '#FEF9EF',
      story: "Penang is a multicultural state where Malay, Chinese, and Indian cultures blend beautifully. George Town, its capital, is a UNESCO World Heritage City filled with colourful street art, charming shophouses, and aromatic food stalls that make it one of Asia's greatest food destinations!",
      leo: "George Town was declared a UNESCO World Heritage City in 2008. That means the whole world recognises how special and historically important it is! It's also famous for its street art — paintings done right on the walls of old buildings!",
      dialectWord: 'Weh, sedap gila!',
      dialectMeaning: '"Hey, so delicious!" — a mix of Penang Malay and Hokkien',
      ethnics: 'Penang has a unique Peranakan (Baba-Nyonya) community — descendants of early Chinese traders who married local Malays and created a beautiful fusion culture with unique food, dress, and traditions.',
      cards: [
        { icon: '🚩', category: 'State Flag',        value: 'Blue, Black, Gold & White',   desc: 'Penang\'s flag has 8 stripes representing its 8 districts. The Penang tree (Areca catechu) is at the centre.' },
        { icon: '🍜', category: 'Famous Food',        value: 'Char Kway Teow',              desc: 'Flat rice noodles stir-fried on high fire with prawns, egg, cockles, and bean sprouts. A Penang breakfast icon!' },
        { icon: '🍲', category: 'Local Food 2',       value: 'Assam Laksa',                 desc: 'Sour and spicy noodle soup made with mackerel fish and tamarind — ranked one of the world\'s 50 best foods!' },
        { icon: '🕌', category: 'Landmark',           value: 'Fort Cornwallis',             desc: 'Built by the British East India Company in 1786. It is the oldest standing fort in Malaysia!' },
        { icon: '💃', category: 'Traditional Dance',  value: 'Joget Peranakan',             desc: 'A lively Peranakan dance that mixes Malay and Chinese movements, performed at weddings and festivals.' },
        { icon: '🎵', category: 'Traditional Song',   value: 'Rasa Sayang',                 desc: 'A famous Malay folk song from Penang that spread across Southeast Asia. Everyone in Malaysia knows it!' },
        { icon: '🎨', category: 'Traditional Craft',  value: 'Batik Painting',              desc: 'Beautiful fabric art using wax-resist dyeing. Each piece is hand-drawn and no two are ever exactly alike!' },
        { icon: '🌺', category: 'State Symbol',       value: 'Bunga Raya (Hibiscus)',       desc: 'Malaysia\'s national flower — the red Hibiscus. It represents courage, life, and rapid growth.' }
      ],
      dragPairs: [
        { food: '🍜 Char Kway Teow', state: 'Penang' },
        { food: '🍲 Assam Laksa',    state: 'Penang' }
      ],
      quizQuestion: { q: 'What is Penang\'s most famous street food dish?', opts: ['Char Kway Teow', 'Rendang', 'Laksa Sarawak', 'Nasi Kerabu'], ans: 0 }
    },
    {
      id: 'melaka',
      name: 'Melaka',
      icon: '🏰',
      region: 'west',
      nickname: 'Historic City of the Straits',
      color: '#8E44AD',
      bgColor: '#F5EEF8',
      story: "Melaka was once the most powerful trading port in all of Southeast Asia! Over 500 years ago, merchants from China, Arabia, India, and Europe all sailed here. Today, its colourful Peranakan shophouses and ancient forts are UNESCO World Heritage sites that attract visitors from all over the world.",
      leo: "The word 'Melaka' may have come from a tree called the Melaka tree. According to legend, a great prince was resting under this tree when he saw a mouse deer kick his dog — and he decided that was a sign to build his great city there!",
      dialectWord: 'Amacam?',
      dialectMeaning: '"How is it?" or "What do you think?" — from Baba Malay (Peranakan dialect)',
      ethnics: 'The Baba-Nyonya (Peranakan) community is especially famous in Melaka. Their culture blends Chinese and Malay traditions — from the spicy Nyonya cuisine to the colourful batik sarongs and beaded shoes.',
      cards: [
        { icon: '🚩', category: 'State Flag',        value: 'Red, White & Black with tree', desc: 'Melaka\'s flag features the Melaka tree — the tree under which the city was legendarily founded.' },
        { icon: '🍲', category: 'Famous Food',        value: 'Asam Pedas',                  desc: 'Sour and spicy fish stew cooked with tamarind juice — a true Melaka Malay specialty that warms the heart!' },
        { icon: '🍚', category: 'Local Food 2',       value: 'Chicken Rice Ball',           desc: 'Hainanese chicken rice served in round balls — a Melaka Chinese invention unique to this state!' },
        { icon: '🏰', category: 'Landmark',           value: 'A Famosa Fort',               desc: 'Built by the Portuguese in 1511 — over 500 years old! Only the Porta de Santiago gatehouse remains today.' },
        { icon: '💃', category: 'Traditional Dance',  value: 'Zapin',                       desc: 'An elegant court dance brought to Melaka by Arab traders centuries ago. Performed with graceful footwork.' },
        { icon: '🎵', category: 'Traditional Song',   value: 'Japin Melaka',                desc: 'A traditional song accompanying the Zapin dance, filled with poetic Arabic-influenced lyrics.' },
        { icon: '🎨', category: 'Traditional Craft',  value: 'Peranakan Tiles',             desc: 'Hand-painted ceramic tiles with floral and bird motifs, unique to the Baba-Nyonya culture of Melaka.' },
        { icon: '🐉', category: 'Cultural Icon',      value: 'Baba-Nyonya Heritage',        desc: 'The Baba-Nyonya Museum in Melaka preserves 400-year-old Peranakan antiques, costumes, and furniture.' }
      ],
      dragPairs: [
        { food: '🍲 Asam Pedas',       state: 'Melaka' },
        { food: '🍚 Chicken Rice Ball', state: 'Melaka' }
      ],
      quizQuestion: { q: 'A Famosa Fort in Melaka was built by which colonial power?', opts: ['Portuguese', 'British', 'Dutch', 'Japanese'], ans: 0 }
    },
    {
      id: 'selangor',
      name: 'Selangor',
      icon: '🌊',
      region: 'west',
      nickname: 'Home of the Royal Capital',
      color: '#1A5276',
      bgColor: '#EBF5FB',
      story: "Selangor is Malaysia's most developed and most populated state! It wraps around Kuala Lumpur and is home to Batu Caves, a spectacular Hindu shrine inside a giant limestone hill. The royal city of Shah Alam has one of the largest mosques in Southeast Asia — the beautiful Blue Mosque!",
      leo: "The Batu Caves has 272 steep rainbow-coloured steps leading to the main cave temple. Every year during Thaipusam, over a MILLION people visit in a single day — one of the world's biggest Hindu festivals!",
      dialectWord: 'Hang oiii!',
      dialectMeaning: '"Hey you!" — a casual Selangor Malay greeting among friends',
      ethnics: 'Selangor has a large Tamil community, especially in Klang. The Batu Caves is the world\'s largest Hindu shrine outside India, showing how deeply Tamil culture is woven into Selangor\'s identity.',
      cards: [
        { icon: '🚩', category: 'State Flag',        value: 'Red & Yellow stripes + Crescent', desc: 'Selangor\'s flag features red and yellow — the royal colours of the Selangor Sultanate.' },
        { icon: '🍢', category: 'Famous Food',        value: 'Satay Kajang',                    desc: 'Grilled skewered meat in a rich spice marinade, served with peanut sauce. Kajang is Malaysia\'s Satay capital!' },
        { icon: '🍜', category: 'Local Food 2',       value: 'Mee Rebus',                       desc: 'Yellow noodles in a thick sweet potato gravy, topped with egg, tofu, and lime. A Selangor street food favourite.' },
        { icon: '🦇', category: 'Landmark',           value: 'Batu Caves',                      desc: 'Massive limestone caves with a 272-step staircase and a 43-metre golden statue at the entrance.' },
        { icon: '💃', category: 'Traditional Dance',  value: 'Mak Yong',                        desc: 'An ancient Malay dance-drama listed by UNESCO, combining music, acting, singing, and storytelling.' },
        { icon: '🎵', category: 'Traditional Song',   value: 'Dendang Perantau',                desc: 'A melancholic folk song about a traveller far from home, popular across Selangor.' },
        { icon: '🎨', category: 'Traditional Craft',  value: 'Songket Weaving',                 desc: 'Luxurious handwoven fabric interlaced with real gold or silver threads — worn for royal occasions.' },
        { icon: '🕌', category: 'Cultural Icon',      value: 'Sultan Salahuddin Mosque',        desc: 'The Blue Mosque in Shah Alam — one of the largest mosques in Southeast Asia with a capacity of 24,000 worshippers.' }
      ],
      dragPairs: [
        { food: '🍢 Satay Kajang', state: 'Selangor' },
        { food: '🍜 Mee Rebus',    state: 'Selangor' }
      ],
      quizQuestion: { q: 'Famous Batu Caves in Selangor has how many colourful steps?', opts: ['272 steps', '100 steps', '400 steps', '50 steps'], ans: 0 }
    },
    {
      id: 'johor',
      name: 'Johor',
      icon: '👑',
      region: 'west',
      nickname: 'Land of the Royals',
      color: '#1E8449',
      bgColor: '#EAFAF1',
      story: "Johor sits at the very southern tip of Peninsular Malaysia, just across the Causeway from Singapore! It is the home state of the Malaysian royal family. Johor is famous for its stunning beaches, the Legoland theme park, and its very unique Johor-style laksa made with spaghetti noodles!",
      leo: "Johor and Singapore are connected by the Causeway — one of the world's busiest land border crossings with over 350,000 people crossing EVERY SINGLE DAY. That's like the entire population of a small city!",
      dialectWord: 'Tengah buat apa tu?',
      dialectMeaning: '"What are you doing there?" — typical Johor Malay, slightly formal and warm',
      ethnics: 'Johor has a large Javanese community whose ancestors came from Java, Indonesia. They brought the Kuda Kepang dance — a Javanese trance performance with woven bamboo hobby horses.',
      cards: [
        { icon: '🚩', category: 'State Flag',        value: 'Blue & Red with Royal Crest',    desc: 'Johor\'s blue and red flag with the royal crescent and star represents the Johor Sultanate\'s long royal history.' },
        { icon: '🍜', category: 'Famous Food',        value: 'Laksa Johor',                    desc: 'Malaysia\'s MOST UNIQUE laksa — made with spaghetti noodles instead of rice noodles, in a rich coconut fish gravy!' },
        { icon: '🍱', category: 'Local Food 2',       value: 'Mee Bandung',                    desc: 'Yellow noodles in a thick orange prawn-based broth — a Johor Bahru specialty with bold flavours.' },
        { icon: '🏯', category: 'Landmark',           value: 'Istana Besar (Royal Palace)',    desc: 'The grand royal palace of the Johor Sultanate, now serving as a royal museum open to the public.' },
        { icon: '💃', category: 'Traditional Dance',  value: 'Kuda Kepang',                    desc: 'A Javanese-influenced trance dance where performers ride flat woven bamboo horse figures — mesmerising and mysterious!' },
        { icon: '🎵', category: 'Traditional Song',   value: 'Lancang Kuning',                 desc: 'A traditional Johor folk song about a beautiful golden royal boat sailing majestically down the river.' },
        { icon: '🎨', category: 'Traditional Craft',  value: 'Kain Pelikat Weaving',           desc: 'Traditional checked sarong fabric — a cultural staple worn throughout Johor, especially at royal ceremonies.' },
        { icon: '🎪', category: 'Cultural Festival',  value: 'Hari Hol Almarhum Sultan',       desc: 'Annual remembrance day for past Johor Sultans — a solemn royal ceremony unique to Johor.' }
      ],
      dragPairs: [
        { food: '🍜 Laksa Johor',  state: 'Johor' },
        { food: '🍱 Mee Bandung',  state: 'Johor' }
      ],
      quizQuestion: { q: 'Johor\'s famous laksa is unique because it uses which noodle?', opts: ['Spaghetti', 'Rice noodles', 'Glass noodles', 'Egg noodles'], ans: 0 }
    },
    {
      id: 'kelantan',
      name: 'Kelantan',
      icon: '🎪',
      region: 'west',
      nickname: 'Heartland of Malay Culture',
      color: '#C0392B',
      bgColor: '#FDEDEC',
      story: "Kelantan is the heartland of traditional Malay culture! Here you will discover beautiful wayang kulit shadow puppet shows, magnificent Wau Bulan (Moon Kites), and the energetic Dikir Barat choral performance. Kelantan people are very proud of their traditions and keep them alive through festivals and performances every week!",
      leo: "The Wau Bulan (Moon Kite) from Kelantan is SO important that it appears on Malaysia's 50-sen coin! Some Wau kites are as TALL AS A PERSON. They fly so high you can barely see them, and they make a humming sound from a special bow attached to them!",
      dialectWord: 'Gapo tu?',
      dialectMeaning: '"What is that?" — Kelantanese dialect sounds very different from standard Malay!',
      ethnics: 'Kelantan has a small but vibrant Siamese (Thai) community in the northern villages. Some mosques here blend Malay and Thai architectural styles, and Thai Buddhist temples can be found alongside Malay kampung houses.',
      cards: [
        { icon: '🚩', category: 'State Flag',        value: 'Red with White Crescent & Star',   desc: 'Kelantan\'s simple red flag with a white crescent and star is one of the most recognisable state flags in Malaysia.' },
        { icon: '🍗', category: 'Famous Food',        value: 'Ayam Percik',                      desc: 'Grilled chicken generously basted with a fragrant coconut milk and spice marinade. Smoky, creamy, and delicious!' },
        { icon: '🍚', category: 'Local Food 2',       value: 'Nasi Kerabu',                      desc: 'Blue rice (coloured by butterfly pea flowers) served with fish, herbs, and salted egg — beautiful and delicious!' },
        { icon: '🏛️', category: 'Landmark',           value: 'Gelanggang Seni',                  desc: 'Kelantan\'s Cultural Centre where you can watch wayang kulit, rebab music, top-spinning, and kite flying — FREE!' },
        { icon: '💃', category: 'Traditional Dance',  value: 'Mak Yong',                         desc: 'An ancient UNESCO-recognised Malay dance-drama that combines theatre, music, and spiritual storytelling.' },
        { icon: '🎵', category: 'Traditional Song',   value: 'Dikir Barat',                      desc: 'Teams of singers clap and sway while performing witty call-and-response songs — think of it as a cultural rap battle!' },
        { icon: '🪁', category: 'Traditional Craft',  value: 'Wau Bulan (Moon Kite)',            desc: 'Giant decorative kites handmade from bamboo and paper, with crescent moon shapes. Some are 2 metres tall!' },
        { icon: '🎭', category: 'Cultural Art',       value: 'Wayang Kulit',                     desc: 'Shadow puppet theatre where intricate leather puppets tell epic Hindu-Malay stories behind a lit screen.' }
      ],
      dragPairs: [
        { food: '🍗 Ayam Percik', state: 'Kelantan' },
        { food: '🍚 Nasi Kerabu',  state: 'Kelantan' }
      ],
      quizQuestion: { q: 'Which traditional kite from Kelantan appears on Malaysia\'s 50-sen coin?', opts: ['Wau Bulan', 'Wau Kuching', 'Layang-Layang', 'Wau Merak'], ans: 0 }
    },
    {
      id: 'sabah',
      name: 'Sabah',
      icon: '🦧',
      region: 'east',
      nickname: 'Land Below the Wind',
      color: '#117A65',
      bgColor: '#E8F8F5',
      story: "Sabah is called the 'Land Below the Wind' because it lies just south of the typhoon belt — meaning it stays safe from dangerous storms! Sabah is home to the Kadazan-Dusun people, Mount Kinabalu (Southeast Asia's highest peak!), the famous Orang Utan sanctuary in Sepilok, and the magical firefly river tours!",
      leo: "Mount Kinabalu is 4,095 metres tall — imagine stacking about 13,000 of you on top of each other! It\'s the highest peak in Southeast Asia AND a UNESCO World Heritage site. Every year, thousands of people try to climb to the very top!",
      dialectWord: 'Bah!',
      dialectMeaning: '"OK!" / "Alright!" / "Sure!" / "Yes!" — Sabahans use this one word for almost everything!',
      ethnics: 'Sabah has over 30 indigenous ethnic groups! The Kadazan-Dusun are the largest — they celebrate Kaamatan, the harvest festival, every May. The Bajau people are expert horsemen AND sea nomads, skilled in both land and sea life.',
      cards: [
        { icon: '🚩', category: 'State Flag',        value: 'Blue, Black & White + Kinabalu',   desc: 'Sabah\'s flag shows the silhouette of the sacred Mount Kinabalu in the centre — the heart of the state.' },
        { icon: '🦀', category: 'Famous Food',        value: 'Hinava',                            desc: 'Raw fish marinated in lime juice, ginger, chilli, and bitter gourd — a fresh and zingy Kadazan-Dusun dish!' },
        { icon: '🌊', category: 'Local Food 2',       value: 'Sinangak (Seafood)',               desc: 'Fresh seafood cooked in bamboo — a traditional Bajau method of steaming fish with coconut milk and herbs.' },
        { icon: '⛰️', category: 'Landmark',           value: 'Mount Kinabalu',                   desc: 'Southeast Asia\'s highest peak at 4,095m! Surrounded by a UNESCO national park with thousands of plant species.' },
        { icon: '💃', category: 'Traditional Dance',  value: 'Sumazau',                          desc: 'The graceful traditional dance of the Kadazan-Dusun people — arms spread like a hornbill bird in flight!' },
        { icon: '🎵', category: 'Traditional Song',   value: 'Kaamatan Harvest Song',            desc: 'Sung during the rice harvest festival (Kaamatan) to thank the Rice Spirit (Bambazon) and celebrate abundance.' },
        { icon: '🧺', category: 'Traditional Craft',  value: 'Tanak Bamboo Weaving',            desc: 'Beautiful baskets and mats woven from bamboo and rattan by Sabah\'s indigenous communities.' },
        { icon: '🦧', category: 'Wildlife Icon',      value: 'Orang Utan Sanctuary',             desc: 'Sepilok Orang Utan Rehabilitation Centre cares for rescued orang utans and teaches them to live wild again.' }
      ],
      dragPairs: [
        { food: '🦀 Hinava',  state: 'Sabah' },
        { food: '🌊 Sinangak', state: 'Sabah' }
      ],
      quizQuestion: { q: 'What is the highest mountain in Southeast Asia, found in Sabah?', opts: ['Mount Kinabalu', 'Mount Tahan', 'Mount Mulu', 'Mount Ophir'], ans: 0 }
    },
    {
      id: 'sarawak',
      name: 'Sarawak',
      icon: '🦜',
      region: 'east',
      nickname: 'Land of the Hornbills',
      color: '#1A5276',
      bgColor: '#EBF5FB',
      story: "Sarawak is the BIGGEST state in Malaysia — larger than all of Peninsular Malaysia combined! It is home to many amazing indigenous communities including the brave Iban, the artistic Bidayuh, and the river-dwelling Orang Ulu. They live in incredible longhouses deep in one of the world's oldest rainforests!",
      leo: "A traditional Iban longhouse can stretch over 100 metres long and be home to HUNDREDS of people from many families — like a whole village all living under one giant roof! Some longhouses have over 50 'doors' (family units) all connected in one row.",
      dialectWord: 'Agi idup agi ngelaban!',
      dialectMeaning: '"While there is life, keep fighting!" — the famous Iban battle cry and motivational proverb',
      ethnics: 'The Iban are Sarawak\'s largest indigenous group and are famous as former headhunters-turned-hospitable hosts! The Penan people are forest nomads who know every plant and animal in the ancient rainforest. The Chinese Foochow community built the town of Sibu.',
      cards: [
        { icon: '🚩', category: 'State Flag',        value: 'Yellow, Black & Red + Hornbill',   desc: 'Sarawak\'s flag features a yellow star (Bintang Timur) and Rhinoceros Hornbill — the symbol of the state.' },
        { icon: '🍲', category: 'Famous Food',        value: 'Laksa Sarawak',                    desc: 'A rich coconut-and-sambal broth with vermicelli, prawns, and egg. Voted one of the WORLD\'S GREATEST BREAKFASTS!' },
        { icon: '🎋', category: 'Local Food 2',       value: 'Manok Pansoh',                     desc: 'Chicken with lemongrass and ginger cooked INSIDE a bamboo tube over an open fire — smoky and incredibly fragrant!' },
        { icon: '🦇', category: 'Landmark',           value: 'Mulu Caves',                       desc: 'One of the world\'s largest cave systems and a UNESCO site. Home to millions of bats that stream out at sunset!' },
        { icon: '💃', category: 'Traditional Dance',  value: 'Ngajat',                           desc: 'The powerful war dance of the Iban people, performed with feather headdresses and traditional shields.' },
        { icon: '🎵', category: 'Traditional Song',   value: 'Gawai Harvest Song',               desc: 'Sung during Gawai Dayak to thank the gods for the rice harvest. Accompanied by traditional sape lute music.' },
        { icon: '🧵', category: 'Traditional Craft',  value: 'Pua Kumbu Weaving',               desc: 'Sacred handwoven Iban textiles — each intricate pattern tells a spiritual story and takes months to complete!' },
        { icon: '🎪', category: 'Cultural Festival',  value: 'Gawai Dayak',                      desc: 'Sarawak\'s biggest indigenous festival on June 1st — celebrating the rice harvest with music, dance, and feasting!' }
      ],
      dragPairs: [
        { food: '🍲 Laksa Sarawak', state: 'Sarawak' },
        { food: '🎋 Manok Pansoh',  state: 'Sarawak' }
      ],
      quizQuestion: { q: 'What is the name of the famous Iban harvest festival in Sarawak?', opts: ['Gawai Dayak', 'Kaamatan', 'Thaipusam', 'Wesak Day'], ans: 0 }
    }
  ];