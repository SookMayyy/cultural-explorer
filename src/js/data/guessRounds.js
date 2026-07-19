// js/data/guessRounds.js — "Guess My State" game clue sets
//
// Each round has 4 ordered clues (geography → food/culture → landmark → specific
// fact) and 5 answer options (the correct state + 4 decoys, shuffled at render).
// Every clue is grounded in what the app already taught: a state's `story` /
// narrative cards (states.js) and its mission Discover spotlights (foodMissions,
// costumeMissions, landmarkMissions, festivalMissions) — so a child who explored
// that state can answer from what they just saw, not outside trivia.
//
// Clue 1 shows first (worth 20). A WRONG guess greys out that option AND reveals
// the next clue, so the child keeps trying with more help: worth steps down
// 20 → 15 → 10 → 5. Earlier correct guess = more points.
//
// `image` is OPTIONAL — a real photo the child already saw in that state's
// mission, shown once every clue has been revealed (a last "does this match?"
// visual check). Rounds without an `image` behave exactly as before.

export const GUESS_ROUNDS = [
  {
    answer: 'kedah',
    hints: [
      'I am a state in the far northwest of Malaysia, right next to the Thai border.',
      'I am the "Rice Bowl of Malaysia", covered in golden paddy fields.',
      'My famous Langkawi Sky Bridge hangs high above the sea!',
      'My main city is Alor Setar, and my women wear the elegant Baju Kedah.',
    ],
    pointValues: [20, 15, 10, 5],
    options: [
      { id: 'kedah',    name: 'Kedah',    icon: '🌾' },
      { id: 'penang',   name: 'Penang',   icon: '🏝️' },
      { id: 'kelantan', name: 'Kelantan', icon: '🎨' },
      { id: 'selangor', name: 'Selangor', icon: '🌆' },
      { id: 'sabah',    name: 'Sabah',    icon: '🏔️' },
    ],
  },
  {
    answer: 'penang',
    hints: [
      'I am an island state on the northwest coast of Malaysia.',
      'I am called the "Food Capital of Malaysia"!',
      'My capital city, George Town, is a UNESCO World Heritage Site.',
      'My Char Kway Teow is cooked in a super-hot wok — in under 2 minutes flat!',
    ],
    pointValues: [20, 15, 10, 5],
    options: [
      { id: 'penang',   name: 'Penang',   icon: '🏝️' },
      { id: 'selangor', name: 'Selangor', icon: '🌆' },
      { id: 'kedah',    name: 'Kedah',    icon: '🌾' },
      { id: 'kelantan', name: 'Kelantan', icon: '🎨' },
      { id: 'sarawak',  name: 'Sarawak',  icon: '🌿' },
    ],
  },
  {
    answer: 'selangor',
    hints: [
      'I am the most developed state in Malaysia.',
      'My town of Kajang is famous for grilled satay.',
      'I have a famous limestone hill with a temple inside — Batu Caves.',
      'I wrap right around the country\'s capital city, Kuala Lumpur.',
    ],
    pointValues: [20, 15, 10, 5],
    options: [
      { id: 'selangor', name: 'Selangor', icon: '🌆' },
      { id: 'penang',   name: 'Penang',   icon: '🏝️' },
      { id: 'kedah',    name: 'Kedah',    icon: '🌾' },
      { id: 'kelantan', name: 'Kelantan', icon: '🎨' },
      { id: 'sabah',    name: 'Sabah',    icon: '🏔️' },
    ],
  },
  {
    answer: 'kelantan',
    hints: [
      'I border Thailand in the northeast of Peninsular Malaysia.',
      'I am known as the "Cradle of Malay Culture" for my rich arts and crafts.',
      'My shadow-puppet show, Wayang Kulit, can last all night — from dusk to dawn!',
      'My traditional kite design, the Wau Bulan, appears on Malaysia\'s 50 sen coin!',
    ],
    pointValues: [20, 15, 10, 5],
    // A photo the child already saw in the Kelantan festival mission — a last
    // visual check once every clue is revealed.
    image: '../assets/content/Kelantan/wayang_kulit.jpg',
    options: [
      { id: 'kelantan', name: 'Kelantan', icon: '🎨' },
      { id: 'penang',   name: 'Penang',   icon: '🏝️' },
      { id: 'kedah',    name: 'Kedah',    icon: '🌾' },
      { id: 'sabah',    name: 'Sabah',    icon: '🏔️' },
      { id: 'sarawak',  name: 'Sarawak',  icon: '🌿' },
    ],
  },
  {
    answer: 'sabah',
    hints: [
      'I am in the northern part of Borneo island, called the "Land Below the Wind".',
      'My famous salad, Hinava, is "cooked" by sour lime juice — no fire needed!',
      'I have the highest mountain in Malaysia — Mount Kinabalu!',
      'My largest people, the Kadazandusun, dance the graceful Sumazau at the Pesta Kaamatan harvest festival.',
    ],
    pointValues: [20, 15, 10, 5],
    // A photo the child already saw in the Sabah tourist mission — a last
    // visual check once every clue is revealed.
    image: '../assets/content/Sabah/mount_kinabalu.jpg',
    options: [
      { id: 'sabah',    name: 'Sabah',    icon: '🏔️' },
      { id: 'sarawak',  name: 'Sarawak',  icon: '🌿' },
      { id: 'kedah',    name: 'Kedah',    icon: '🌾' },
      { id: 'kelantan', name: 'Kelantan', icon: '🎨' },
      { id: 'penang',   name: 'Penang',   icon: '🏝️' },
    ],
  },
  {
    answer: 'sarawak',
    hints: [
      'I am called the "Land of the Hornbills" — the largest state in Malaysia, on Borneo island.',
      'I am home to over 40 indigenous groups — the largest is the Iban, famous for long wooden longhouses.',
      'I have the largest cave system in the world, inside Gunung Mulu National Park!',
      'My capital city, Kuching, means "cat" in Malay.',
    ],
    pointValues: [20, 15, 10, 5],
    options: [
      { id: 'sarawak',  name: 'Sarawak',  icon: '🌿' },
      { id: 'sabah',    name: 'Sabah',    icon: '🏔️' },
      { id: 'selangor', name: 'Selangor', icon: '🌆' },
      { id: 'penang',   name: 'Penang',   icon: '🏝️' },
      { id: 'kelantan', name: 'Kelantan', icon: '🎨' },
    ],
  },
];
