/* missions.js — derives a state's 4 explore-the-state missions */

// The same four roles per state, each launching one mini-game for THAT state
// (no per-state authoring — it flows from states.js). Missions unlock sequentially:
//   1. Cook It Up! (Food) · 2. Dress in Tradition! (Costume) ·
//   3. Go Exploring! (Landmark) · 4. Join the Festival! (Quiz)

import { getState } from './states.js';
import { foodMissionFor, crossStateIngredientPool } from './foodMissions.js';
import { costumeMissionFor } from './costumeMissions.js';
import { landmarkTourFor } from './landmarkMissions.js';
import { festivalMissionFor } from './festivalMissions.js';

// 📸 IMAGE NEEDED: assets/images/missions/{id}.png — mission portraits (emoji for now).
const TEMPLATES = [
  { id: 'chef',     num: 1, title: 'Cook It Up!',      subtitle: 'Explore the famous food',      icon: '👨‍🍳', page: 'activity.html', category: 'Food'     },
  { id: 'dancer',   num: 2, title: 'Dress in Tradition!', subtitle: 'Explore the traditional costume', icon: '👗', page: 'scramble.html', category: 'Costume'  },
  { id: 'tourist',  num: 3, title: 'Go Exploring!',    subtitle: 'Explore the famous places',    icon: '🧭',   page: 'guess.html',    category: 'Landmark' },
  { id: 'festival', num: 4, title: 'Join the Festival!', subtitle: 'Celebrate all you explored',  icon: '🎉',   page: 'quiz.html',     category: null       },
];

// The 4 missions for a state (id or object). Each row opens the mission flow page.
export function missionsFor(stateRef) {
  const state = typeof stateRef === 'string' ? getState(stateRef) : stateRef;
  if (!state) return [];
  return TEMPLATES.map(t => ({
    ...t,
    href: `mission.html?state=${state.id}&mission=${t.id}`,
  }));
}

export const MISSION_COUNT = TEMPLATES.length;

/* Mission flow content — Discover/Learn/Reward copy derived from card data */

// Which card category themes each mission's Discover hero + its play-button label.
const FLOW_THEME = {
  chef:     { category: 'Food',     play: 'Start Cooking!'      },
  dancer:   { category: 'Tradition', play: 'Explore the Costume!' },
  tourist:  { category: 'Landmark', play: 'Guide the Tourist!'  },
  festival: { category: 'Festival', play: 'Take the Challenge!'  },
};

// Reward lines keyed by mission id (not derived from `hero`, which can land on
// the wrong-category card and give a mismatched line).
const REWARD_LINES = {
  dancer:   'You learned all about the traditional costume!',
  tourist:  "You're a great tour guide now!",
  festival: "You're a festival superstar!",
};

// Points per mission (4 × 25 = 100 per state). The only point source in the flow —
// the mini-games suppress their own scoring when launched from a mission.
const MISSION_BONUS = 25;
export { MISSION_BONUS };

// Build the full flow object for one mission of one state.
export function missionFlow(stateRef, missionId) {
  const state = typeof stateRef === 'string' ? getState(stateRef) : stateRef;
  if (!state) return null;
  const tpl = TEMPLATES.find(t => t.id === missionId);
  if (!tpl) return null;

  const theme = FLOW_THEME[missionId] || {};
  const cards = state.cards || [];

  // The state's single festival/traditional track, looped softly under all four
  // missions. mission.js starts it; voice.js ducks it under narration.
  const stateAudio = festivalMissionFor(state.id)?.audio || null;

  const base = {
    id:    tpl.id,
    num:   tpl.num,
    title: tpl.title,
    completeLine: 'Terima kasih! You\'re the best helper!',
  };

  /* Mission 1 · Help the Chef — food flow (discover → learn → cook → congrats) */
  if (missionId === 'chef') {
    const food = foodMissionFor(state.id);
    if (food) {
      return {
        ...base,
        badge: `MISSION ${tpl.num}: ${tpl.title.toUpperCase()} (FOOD)`,

        // Discover the dish
        discoverTitle: `This is ${food.dish}!`,
        discoverSub:   'Tap the ingredients to learn more.',
        heroEmoji:     food.dishEmoji,
        heroImage:     food.image || null,
        heroDesc:      food.intro,
        mascotLine:    'I need your help! Let\'s cook a famous dish together!',

        // Looping background music for the whole mission (state's festival track).
        audio: stateAudio,

        // Interactive-spotlight Discover, present only when the food data ships
        // hotspots. When set, mission.js runs it instead of the tap-cards Discover.
        spotlight: food.spotlight && food.image
          ? { image: food.image, ...food.spotlight }
          : null,

        // Learn the ingredients (carousel) — carry the photo through for the card.
        items: food.ingredients.map(i => ({ emoji: i.emoji, image: i.image || null, label: i.name, blurb: i.blurb })),

        // Inline "cook the dish" mini-game (no separate page)
        playLabel: theme.play,
        game: {
          type:        'cook',
          dish:        food.dish,
          dishEmoji:   food.dishEmoji,
          prompt:      `Drag the correct ingredients into the ${food.dish}!`,
          correct:     food.ingredients.map(i => ({ name: i.name, emoji: i.emoji, image: i.image || null })),
          // Cross-state candidate pool; mission.js shuffles + trims it per difficulty.
          distractors: crossStateIngredientPool(state.id),
        },

        // Reward = congratulations (no sticker / stamp)
        reward: {
          bonus:   MISSION_BONUS,
          line:    `You cooked ${food.dish}!`,
          congrats: 'You\'re a master chef!',
        },
      };
    }
  }

  /* Missions 2-4 · generic flow (launch the existing mini-game pages) */
  const hero = cards.find(c => c.category === theme.category) || cards[0] || null;
  const catLabel = theme.category ? ` (${theme.category.toUpperCase()})` : '';

  // Interactive-spotlight Discover when the state ships a photo, else tap-cards.
  //   Dancer → costume photo → Word Scramble · Tourist → photo tour → Guess ·
  //   Festival → festival photo → Quiz. Each gates on its own `image`.
  let spotlight   = null;
  let heroImage   = null;
  let customItems = null;
  let tour        = null;
  let costumeData = null;
  if (missionId === 'dancer') {
    costumeData = costumeMissionFor(state.id);
    if (costumeData?.image) {
      // introKey highlights the dance/subject name in the intro caption.
      spotlight = { image: costumeData.image, introKey: costumeData.danceName, ...costumeData.spotlight };
      heroImage = costumeData.image;
    }
  } else if (missionId === 'tourist') {
    // Tourist is a guided tour of the state's famous spots, then the guess game.
    const t = landmarkTourFor(state.id);
    if (t.length) {
      tour      = t;
      heroImage = t[0].image || null;
    }
  } else if (missionId === 'festival') {
    const festival = festivalMissionFor(state.id);
    if (festival?.spotlight?.cards?.length) {
      // Festival taught as a sequence of image cards, then the quiz.
      spotlight = { ...festival.spotlight, image: festival.spotlight.cards[0].image };
      heroImage = festival.spotlight.cards[0].image;
    } else if (festival?.image) {
      spotlight = { image: festival.image, ...festival.spotlight };
      heroImage = festival.image;
    }
  }

  return {
    ...base,
    badge: `MISSION ${tpl.num}: ${tpl.title.toUpperCase()}${catLabel}`,

    discoverTitle: missionId === 'tourist'
      ? `Famous Places in ${state.name}!`
      : (missionId === 'dancer' && costumeData?.costumeName)
        ? `This is the ${costumeData.costumeName}!`
        : (hero ? `This is ${hero.title}!` : `Explore ${state.name}!`),
    discoverSub:   missionId === 'tourist'
      ? 'Tap each place to learn about it — a tourist will need your help next!'
      : 'Tap the cards to learn more.',
    // Fallback icon when the hero photo is missing: the mission's own hub icon.
    heroEmoji:     tpl.icon,
    heroImage,
    heroDesc:      hero ? hero.desc : (state.story || ''),
    mascotLine:    hero?.mascotLine || `There's so much to discover in ${state.name} — let's go explore!`,
    // Tourist supplies its own landmark cards; other missions list the state cards.
    items: customItems || cards.map(c => ({ emoji: c.icon, label: c.title, blurb: c.funFact || c.desc || '' })),

    spotlight,   // present only when the state ships a photo
    tour,        // present for the Tourist mission (photo cards first)
    audio: stateAudio,

    playLabel: theme.play || 'Start the Game!',
    gameHref:  `${tpl.page}?state=${state.id}&from=mission&mission=${tpl.id}`,

    reward: {
      bonus:    MISSION_BONUS,
      line:     REWARD_LINES[missionId] || (hero ? `You're now a ${hero.title} expert!` : 'Great work!'),
      congrats: 'Well done, explorer!',
    },
  };
}
