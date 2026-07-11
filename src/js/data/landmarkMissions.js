// js/data/landmarkMissions.js — Mission 3 (Help the Tourist) landmark content.
// ─────────────────────────────────────────────────────────────────────────────
// The Tourist mission is a guided TOUR: a run of spotlight cards (a real photo +
// spoken lines + a little "fun activity"), one per famous spot, then a
// story-framed "Guess My State!":
//   Round 1 — which state is this?  (the state's normal GUESS_ROUNDS clues)
//   Round 2 — Rimau says a tourist wants to visit "one more place"; the child
//             picks which spot the tourist means, from clues that echo what the
//             tour just taught. Lower grades choose from a few spots; higher
//             grades from all of them (difficulty scales the option count).
//
// Tour `text` reads like Rimau guiding the child stop-to-stop (a welcome, then
// "next / now / over here", then a wrap-up on the final stop), so hearing the
// lines in order feels like ONE tour, not loose captions. Each line keeps its
// `key` word inside it — mission.js highlights that word in the caption.
//
// Kedah's tour visits Langkawi's landmarks (all six photos shipped). Add more
// states by giving each a `tour` of the same shape.
// ─────────────────────────────────────────────────────────────────────────────

const K = '../assets/content/Kedah/';
const P = '../assets/content/Penang/';
const KL = '../assets/content/Kelantan/';
const S = '../assets/content/Sabah/';
const SW = '../assets/content/Sarawak/';
const SEL = '../assets/content/Selangor/';

export const LANDMARK_MISSIONS = {
  selangor: {
    place: 'Selangor',
    intro: 'Rimau is taking a tourist around Selangor, the state that wraps around Kuala Lumpur. Explore each place, then help the tourist choose where to go!',
    tour: [
      {
        id: 'batucaves', emoji: '⛰️', name: 'Batu Caves', image: SEL + 'batu_caves.jpg',
        text: 'Our first stop is Batu Caves — climb 272 rainbow steps to a temple inside the hill!', key: 'Batu Caves',
        hints: [
          'I want to climb colourful rainbow steps up a hill.',
          'There is a giant golden statue at the bottom.',
          'It is Batu Caves!',
        ],
      },
      {
        id: 'kualaselangor', emoji: '✨', name: 'Kuala Selangor Fireflies', image: SEL + 'firefly_kuala_selangor.jpg',
        text: 'Next, we ride a boat at night to watch thousands of fireflies light up the trees!', key: 'fireflies',
        hints: [
          'I want to see thousands of fireflies twinkling at night.',
          'I want to ride a quiet boat along a mangrove river.',
          'It is Kuala Selangor!',
        ],
      },
      // A "learn only" stop near Kuala Selangor — a tap-to-learn card, not a guess option.
      {
        id: 'bluetears', emoji: '🌊', name: '"Blue Tears"', image: SEL + 'blue_tears.jpg',
        text: 'Look closely — tiny sea creatures glow bright blue in the waves, like sparkling stars!', key: 'glow',
        learnOnly: true,
      },
      {
        id: 'monument', emoji: '🗿', name: 'National Monument', image: SEL + 'national_monument.jpg',
        text: 'Our last stop is the National Monument — a tall bronze statue honouring Malaysia\'s brave heroes.', key: 'monument',
        hints: [
          'I want to see a tall bronze statue of brave heroes.',
          'It is called Tugu Negara — the National Monument.',
          'It stands proudly at the edge of Kuala Lumpur!',
        ],
      },
    ],
  },
  sarawak: {
    place: 'Kuching',
    intro: 'Rimau is taking a tourist around Sarawak, the Land of the Hornbills. Explore each place, then help the tourist choose where to go!',
    tour: [
      {
        id: 'mulu', emoji: '⛰️', name: 'Gunung Mulu', image: SW + 'gunung_mulu.jpg',
        text: 'Welcome to Sarawak! First we explore Gunung Mulu\'s giant caves and a bridge in the treetops!', key: 'caves',
        hints: [
          'I want to explore giant caves inside a mountain.',
          'I want to walk a canopy bridge high in the treetops.',
          'It is Gunung Mulu National Park!',
        ],
      },
      {
        id: 'waterfront', emoji: '🐱', name: 'Kuching Waterfront', image: SW + 'kuching_waterfront.jpg',
        text: 'Next, we stroll along the pretty riverside to find Kuching\'s famous cat statues!', key: 'riverside',
        hints: [
          'I want to walk along a pretty riverside.',
          'I want to find the famous cat statues.',
          'It is the Kuching Waterfront!',
        ],
      },
      {
        id: 'bako', emoji: '🐒', name: 'Bako National Park', image: SW + 'bako_national_park.jpg',
        text: 'Now into Bako\'s forest to search for the funny long-nosed proboscis monkeys!', key: 'monkeys',
        hints: [
          'I want to spot monkeys with big, long noses.',
          'I want to hike through a coastal rainforest.',
          'It is Bako National Park!',
        ],
      },
      // A "learn only" stop — an extra tap-to-learn card that is NOT a guess option.
      {
        id: 'proboscis', emoji: '🐒', name: 'Proboscis Monkey', image: SW + 'proboscis_monkeys.png',
        text: 'See its big, funny nose? This special monkey lives only here on Borneo island!', key: 'nose',
        learnOnly: true,
      },
      {
        id: 'catmuseum', emoji: '🏛️', name: 'Cat Museum', image: SW + 'cat_musuem.jpg',
        text: 'Our last stop — "Kuching" means cat, so the city even has a whole museum about cats!', key: 'cat',
        hints: [
          'I want to see a museum all about cats.',
          '"Kuching" is the Malay word for this animal.',
          'It is the Kuching Cat Museum!',
        ],
      },
    ],
  },
  sabah: {
    place: 'Kota Kinabalu',
    intro: 'Rimau is taking a tourist around Sabah, the Land Below the Wind. Explore each place, then help the tourist choose where to go!',
    tour: [
      {
        id: 'kinabalu', emoji: '🏔️', name: 'Mount Kinabalu', image: S + 'mount_kinabalu.jpg',
        text: 'Welcome to Sabah! First, meet Mount Kinabalu — the highest mountain in all of Malaysia!', key: 'mountain',
        hints: [
          'I want to see the tallest mountain in Malaysia.',
          'Climbers wake up early to watch the sunrise from the top.',
          'It is Mount Kinabalu!',
        ],
      },
      {
        id: 'marimari', emoji: '🏡', name: 'Mari Mari Cultural Village', image: S + 'mari_mari_village.jpg',
        text: 'Next, the Mari Mari village shows how Sabah\'s tribes lived long, long ago.', key: 'village',
        hints: [
          'I want to visit old wooden tribal houses.',
          'I want to watch people start a fire using only bamboo.',
          'It is the Mari Mari Cultural Village!',
        ],
      },
      // Two "learn only" stops inside Mari Mari — extra tap-to-learn cards on the
      // tour that are NOT used as guess options (learnOnly is filtered out below).
      {
        id: 'firestarting', emoji: '🔥', name: 'Bamboo Fire-Starting', image: S + 'fire_starting.png',
        text: 'Watch closely — they can make fire with just bamboo, no matches at all!', key: 'fire',
        learnOnly: true,
      },
      {
        id: 'villagehouse', emoji: '🛖', name: 'Traditional Village House', image: S + 'village_house.jpg',
        text: 'Now step inside a traditional wooden house, built the old way with no nails.', key: 'house',
        learnOnly: true,
      },
      {
        id: 'dairyfarm', emoji: '🐄', name: 'Desa Dairy Farm, Kundasang', image: S + 'dairy_farm_kundasang.png',
        text: 'Over here, cows graze on green hills — people call this farm the "New Zealand of Sabah"!', key: 'farm',
        hints: [
          'I want to see cows on green rolling hills.',
          'It is nicknamed the "New Zealand of Sabah".',
          'It is the Desa Dairy Farm in Kundasang!',
        ],
      },
      {
        id: 'rafflesia', emoji: '🌺', name: 'Rafflesia Flower', image: S + 'rafflesia.jpg',
        text: 'Our last stop — the giant Rafflesia, the biggest flower in the whole world!', key: 'flower',
        hints: [
          'I want to find the biggest flower in the world.',
          'It is red with white spots — and smells quite stinky!',
          'It is the giant Rafflesia flower!',
        ],
      },
    ],
  },

  kelantan: {
    place: 'Kota Bharu',
    intro: 'Rimau is taking a tourist around Kota Bharu, Kelantan. Explore each place, then help the tourist choose where to go!',
    tour: [
      {
        id: 'perahukolek', emoji: '🛶', name: 'Perahu Kolek', image: KL + 'perahu_kolek.jpg',
        text: 'Welcome to Kota Bharu! First, these hand-painted fishing boats are floating works of art!', key: 'fishing boat',
        hints: [
          'I want to see colourful hand-painted wooden fishing boats.',
          'These boats are called "floating works of art".',
          'It is the Perahu Kolek!',
        ],
      },
      {
        id: 'streetart', emoji: '🎨', name: 'Street Art Kota Bharu', image: KL + 'street_art_kota_bahru.jpg',
        text: 'Next, let\'s hunt for the colourful street art hidden around the city walls!', key: 'street art',
        hints: [
          'I want to find colourful paintings on the city walls.',
          'I want to hunt for hidden murals around the streets.',
          "It is Kota Bharu's street art!",
        ],
      },
      {
        id: 'archway', emoji: '🏛️', name: 'Kota Sultan Ismail Petra Archway', image: KL + 'dataran_rehal.jpg',
        text: 'Now we walk under the grand archway that stands proudly in the middle of the city.', key: 'archway',
        hints: [
          'I want to see a big, grand archway gateway.',
          'It stands proudly in the middle of the city.',
          'It is the Kota Sultan Ismail Petra archway!',
        ],
      },
      {
        id: 'kraftangan', emoji: '🧵', name: 'Kampung Kraftangan', image: KL + 'kampung_kraftangan.png',
        text: 'Our last stop, Kampung Kraftangan, is where crafts like batik and songket are made by hand!', key: 'crafts',
        hints: [
          'I want to watch batik and songket being made by hand.',
          'I want to visit a village that showcases Malay crafts.',
          'It is Kampung Kraftangan — the Handicraft Village!',
        ],
      },
    ],
  },

  kedah: {
    place: 'Langkawi',
    intro: 'Rimau is taking a tourist around Langkawi. Explore each place, then help the tourist choose where to go!',
    // Each card: one SHORT line (spoken + shown, with `key` highlighted) plus the
    // tourist's `hints` used later in the guess round.
    tour: [
      {
        id: 'archipelago', emoji: '🏝️', name: 'Langkawi Archipelago', image: K + 'langkawi_background.png',
        text: 'Welcome to Langkawi — a beautiful island resting in the sparkling blue sea!', key: 'island',
        hints: [
          'I want to see a beautiful island surrounded by the sea.',
          'I want to explore islands with beaches and forests.',
          'It is the whole group of islands — the Langkawi Archipelago!',
        ],
      },
      {
        id: 'skycab', emoji: '🚡', name: 'Langkawi SkyCab', image: K + 'cable_car.jpg',
        text: 'First, ride the SkyCab cable car high above the green rainforest!', key: 'SkyCab',
        hints: [
          'I want to ride a cable car above the rainforest.',
          'I want mountain views from high in the air.',
          'It is the Langkawi SkyCab!',
        ],
      },
      {
        id: 'skybridge', emoji: '🌉', name: 'Langkawi Sky Bridge', image: K + 'langkawi_sky_bridge.avif',
        text: 'Next, walk the curved Sky Bridge, floating way up high in the clouds!', key: 'Sky Bridge',
        hints: [
          'I want to walk a curved bridge above the mountains.',
          "I want to feel like I'm walking in the clouds.",
          'It is the famous Sky Bridge!',
        ],
      },
      {
        id: 'eaglenest', emoji: '🦅', name: "Eagle's Nest SkyWalk", image: K + 'Eagle_nest_sky_walk.png',
        text: 'Over here, the Eagle\'s Nest SkyWalk is shaped just like a giant eagle!', key: 'eagle',
        hints: [
          'I want to stand on a walkway shaped like an eagle.',
          'I want big mountain views from a skywalk.',
          "It is the Eagle's Nest SkyWalk!",
        ],
      },
      {
        id: 'dataranlang', emoji: '🦅', name: 'Dataran Lang', image: K + 'eagle_square.avif',
        text: 'Now meet Dataran Lang — the giant eagle is Langkawi\'s proud symbol!', key: 'eagle',
        hints: [
          'I want to see the giant eagle statue.',
          "'Lang' means eagle in Malay.",
          'It is Dataran Lang — Eagle Square!',
        ],
      },
      {
        id: 'durianperangin', emoji: '💦', name: 'Durian Perangin Waterfall', image: K + 'durian_perangin_waterfall.png',
        text: 'Our last stop — a cool waterfall splashing down deep in the rainforest!', key: 'waterfall',
        hints: [
          'I want to walk a trail to a waterfall.',
          'I want to spot monkeys and birds in the forest.',
          'It is the Durian Perangin Waterfall!',
        ],
      },
    ],
  },

  penang: {
    place: 'George Town',
    intro: 'Rimau is taking a tourist around George Town. Explore each place, then help the tourist choose where to go!',
    // 📸 More Penang stops (Food Museum, Penang Hill) can be added as tour cards
    // once their photos are exported — today only George Town + Street Art ship.
    tour: [
      {
        id: 'georgetown', emoji: '🏛️', name: 'George Town', image: P + 'george_town.jpg',
        text: 'Welcome to George Town — Penang\'s historic old town, full of stories!', key: 'old town',
        hints: [
          'I want to explore an old town full of history.',
          'I want to see heritage shophouses and temples.',
          'It is George Town — Penang\'s capital!',
        ],
      },
      {
        id: 'bukitbendera', emoji: '🚠', name: 'Bukit Bendera', image: P + 'bukit_bendera.jpeg',
        text: 'Next, ride the funicular train up Bukit Bendera — Penang Hill — for cool air and big views!', key: 'Bukit Bendera',
        hints: [
          'I want to ride a train up a tall, cool hill.',
          'From the top I can see the whole city and the sea.',
          'It is Bukit Bendera — Penang Hill!',
        ],
      },
      {
        id: 'streetart', emoji: '🎨', name: 'George Town Street Art', image: P + 'street_art.jpg',
        text: 'Our last stop — hunt for the colourful street art hidden around the old lanes!', key: 'street art',
        hints: [
          'I want to find colourful paintings on the walls.',
          'I want to hunt for hidden street art around the lanes.',
          'It is George Town\'s famous street art!',
        ],
      },
    ],
  },
};

// The landmark mission for a state id, or null if none authored.
export function landmarkMissionFor(stateId) {
  return LANDMARK_MISSIONS[stateId] || null;
}

// The tour cards for a state (empty if none). Shape consumed by mission.js.
export function landmarkTourFor(stateId) {
  return LANDMARK_MISSIONS[stateId]?.tour || [];
}

// Build the Round-2 landmark-guess round in the shape guess.js expects:
// { kind, title, prompt, answer, hints, pointValues, options:[{id,name,icon}] }.
// A tourist "wants to go" to one spot (picked at random); its hints are the
// clues, and every toured spot is an option (guess.js trims by difficulty).
export function landmarkRoundFor(stateId) {
  // Only real landmarks are guessable — `learnOnly` tour cards (e.g. the Mari Mari
  // fire-starting / village-house tap-cards) are for learning, not for guessing.
  const spots = landmarkTourFor(stateId).filter(t => !t.learnOnly && t.hints);
  if (spots.length < 2) return null;
  const target = spots[Math.floor(Math.random() * spots.length)];
  return {
    kind:   'landmark',
    title:  'Where do I want to go?',
    prompt: 'Which place does the tourist want to visit? Wrong guesses unlock more clues!',
    answer: target.id,
    hints:  target.hints,
    pointValues: [20, 15, 10, 5].slice(0, target.hints.length),
    options: spots.map(t => ({ id: t.id, name: t.name, icon: t.emoji })),
  };
}
