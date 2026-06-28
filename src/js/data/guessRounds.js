// js/data/guessRounds.js — "Guess My State" game clue sets
//
// Each round has 4 ordered clues (geography → food/culture → landmark → specific
// fact) and 5 answer options (the correct state + 4 decoys, shuffled at render).
// Clue 1 shows first (worth 20). A WRONG guess greys out that option AND reveals
// the next clue, so the child keeps trying with more help: worth steps down
// 20 → 15 → 10 → 5. Earlier correct guess = more points.

export const GUESS_ROUNDS = [
  {
    answer: 'penang',
    hints: [
      'I am an island state on the northwest coast of Malaysia.',
      'I am called the "Food Capital of Malaysia"!',
      'My capital city is a UNESCO World Heritage Site.',
      'I am joined to the mainland by one of the longest bridges in Southeast Asia.',
    ],
    pointValues: [20, 15, 10, 5],
    options: [
      { id: 'penang',   name: 'Penang',   icon: '🏝️' },
      { id: 'melaka',   name: 'Melaka',   icon: '🏰' },
      { id: 'selangor', name: 'Selangor', icon: '🌆' },
      { id: 'johor',    name: 'Johor',    icon: '🦁' },
      { id: 'kelantan', name: 'Kelantan', icon: '🎨' },
    ],
  },
  {
    answer: 'melaka',
    hints: [
      'I was once a famous trading port visited by merchants from all over the world.',
      'My Nyonya food blends Chinese and Malay cooking.',
      'I have a Portuguese fort built in 1511.',
      'A bright red Dutch building, the Stadthuys, stands in my town square.',
    ],
    pointValues: [20, 15, 10, 5],
    options: [
      { id: 'melaka',   name: 'Melaka',   icon: '🏰' },
      { id: 'penang',   name: 'Penang',   icon: '🏝️' },
      { id: 'selangor', name: 'Selangor', icon: '🌆' },
      { id: 'johor',    name: 'Johor',    icon: '🦁' },
      { id: 'sarawak',  name: 'Sarawak',  icon: '🌿' },
    ],
  },
  {
    answer: 'selangor',
    hints: [
      'I am the most developed state in Malaysia.',
      'My town of Klang is the home of Bak Kut Teh.',
      'I have a famous limestone hill with a Hindu temple inside.',
      'I wrap right around the country\'s capital city, Kuala Lumpur.',
    ],
    pointValues: [20, 15, 10, 5],
    options: [
      { id: 'selangor', name: 'Selangor', icon: '🌆' },
      { id: 'penang',   name: 'Penang',   icon: '🏝️' },
      { id: 'melaka',   name: 'Melaka',   icon: '🏰' },
      { id: 'johor',    name: 'Johor',    icon: '🦁' },
      { id: 'kelantan', name: 'Kelantan', icon: '🎨' },
    ],
  },
  {
    answer: 'johor',
    hints: [
      'I am the southernmost state in Peninsular Malaysia.',
      'My laksa uses spaghetti noodles instead of rice noodles!',
      'I have a famous beach resort called Desaru.',
      'I am connected to Singapore by two causeways.',
    ],
    pointValues: [20, 15, 10, 5],
    options: [
      { id: 'johor',    name: 'Johor',    icon: '🦁' },
      { id: 'melaka',   name: 'Melaka',   icon: '🏰' },
      { id: 'selangor', name: 'Selangor', icon: '🌆' },
      { id: 'kelantan', name: 'Kelantan', icon: '🎨' },
      { id: 'penang',   name: 'Penang',   icon: '🏝️' },
    ],
  },
  {
    answer: 'kelantan',
    hints: [
      'I border Thailand in the northeast of Peninsular Malaysia.',
      'I am famous for my traditional Malay arts and crafts.',
      'My shadow-puppet show, Wayang Kulit, can last all night.',
      'My traditional kite design appears on Malaysia\'s 50 sen coin!',
    ],
    pointValues: [20, 15, 10, 5],
    options: [
      { id: 'kelantan', name: 'Kelantan', icon: '🎨' },
      { id: 'penang',   name: 'Penang',   icon: '🏝️' },
      { id: 'johor',    name: 'Johor',    icon: '🦁' },
      { id: 'sabah',    name: 'Sabah',    icon: '🏔️' },
      { id: 'melaka',   name: 'Melaka',   icon: '🏰' },
    ],
  },
  {
    answer: 'sabah',
    hints: [
      'I am in the northern part of Borneo island.',
      'I am called the "Land Below the Wind".',
      'I have the highest mountain in Malaysia!',
      'Wild orangutans live in my rainforests.',
    ],
    pointValues: [20, 15, 10, 5],
    options: [
      { id: 'sabah',    name: 'Sabah',    icon: '🏔️' },
      { id: 'sarawak',  name: 'Sarawak',  icon: '🌿' },
      { id: 'johor',    name: 'Johor',    icon: '🦁' },
      { id: 'kelantan', name: 'Kelantan', icon: '🎨' },
      { id: 'penang',   name: 'Penang',   icon: '🏝️' },
    ],
  },
  {
    answer: 'sarawak',
    hints: [
      'I am the largest state in Malaysia.',
      'I have over 40 different indigenous ethnic groups.',
      'I am called the "Land of the Hornbills"!',
      'My capital city, Kuching, means "cat" in Malay.',
    ],
    pointValues: [20, 15, 10, 5],
    options: [
      { id: 'sarawak',  name: 'Sarawak',  icon: '🌿' },
      { id: 'sabah',    name: 'Sabah',    icon: '🏔️' },
      { id: 'melaka',   name: 'Melaka',   icon: '🏰' },
      { id: 'selangor', name: 'Selangor', icon: '🌆' },
      { id: 'penang',   name: 'Penang',   icon: '🏝️' },
    ],
  },
];
