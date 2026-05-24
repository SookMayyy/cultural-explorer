// js/data/guessRounds.js — "Guess My State" game clue sets

export const GUESS_ROUNDS = [
  {
    answer: 'penang',
    hints: [
      'I am an island state on the northwest coast.',
      'My capital city is a UNESCO World Heritage Site.',
      'I am called the "Food Capital of Malaysia"!',
    ],
    pointValues: [30, 20, 10],
    options: [
      { id: 'penang',   name: 'Penang',   icon: '🏝️' },
      { id: 'melaka',   name: 'Melaka',   icon: '🏰' },
      { id: 'kelantan', name: 'Kelantan', icon: '🎨' },
    ],
  },
  {
    answer: 'melaka',
    hints: [
      'I was once a famous trading port visited by merchants from all over the world.',
      'I have a Portuguese fort built in 1511.',
      'I am a UNESCO World Heritage city along with Penang!',
    ],
    pointValues: [30, 20, 10],
    options: [
      { id: 'melaka',   name: 'Melaka',   icon: '🏰' },
      { id: 'johor',    name: 'Johor',    icon: '🦁' },
      { id: 'selangor', name: 'Selangor', icon: '🌆' },
    ],
  },
  {
    answer: 'selangor',
    hints: [
      'I am the most developed state in Malaysia.',
      'I have a famous limestone hill with a Hindu temple inside.',
      'Millions of fireflies light up my mangrove trees at night!',
    ],
    pointValues: [30, 20, 10],
    options: [
      { id: 'penang',   name: 'Penang',   icon: '🏝️' },
      { id: 'selangor', name: 'Selangor', icon: '🌆' },
      { id: 'johor',    name: 'Johor',    icon: '🦁' },
    ],
  },
  {
    answer: 'johor',
    hints: [
      'I am the southernmost state in Peninsular Malaysia.',
      'I am connected to Singapore by two causeways.',
      'My laksa uses spaghetti noodles instead of rice noodles!',
    ],
    pointValues: [30, 20, 10],
    options: [
      { id: 'johor',    name: 'Johor',    icon: '🦁' },
      { id: 'melaka',   name: 'Melaka',   icon: '🏰' },
      { id: 'kelantan', name: 'Kelantan', icon: '🎨' },
    ],
  },
  {
    answer: 'kelantan',
    hints: [
      'I border Thailand in the northeast of Peninsular Malaysia.',
      'I am famous for my traditional Malay arts and crafts.',
      'My traditional kite design appears on Malaysia\'s 50 sen coin!',
    ],
    pointValues: [30, 20, 10],
    options: [
      { id: 'kelantan', name: 'Kelantan', icon: '🎨' },
      { id: 'sabah',    name: 'Sabah',    icon: '🏔️' },
      { id: 'penang',   name: 'Penang',   icon: '🏝️' },
    ],
  },
  {
    answer: 'sabah',
    hints: [
      'I am in the northern part of Borneo island.',
      'I am called the "Land Below the Wind".',
      'I have the highest mountain in Malaysia!',
    ],
    pointValues: [30, 20, 10],
    options: [
      { id: 'sarawak', name: 'Sarawak', icon: '🌿' },
      { id: 'sabah',   name: 'Sabah',   icon: '🏔️' },
      { id: 'johor',   name: 'Johor',   icon: '🦁' },
    ],
  },
  {
    answer: 'sarawak',
    hints: [
      'I am the largest state in Malaysia.',
      'I have over 40 different indigenous ethnic groups.',
      'I am called the "Land of the Hornbills"!',
    ],
    pointValues: [30, 20, 10],
    options: [
      { id: 'sabah',   name: 'Sabah',   icon: '🏔️' },
      { id: 'sarawak', name: 'Sarawak', icon: '🌿' },
      { id: 'melaka',  name: 'Melaka',  icon: '🏰' },
    ],
  },
];
