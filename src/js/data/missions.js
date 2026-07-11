// js/data/missions.js — derives a state's 4 explore-the-state missions.
//
// Each state's Mission Hub shows the same four roles, but each launches one of
// the existing mini-games for THAT state (so no per-state mission content is
// hardcoded — it all flows from states.js). Missions unlock sequentially and
// completion is tracked in Storage (see Storage.getMissions / completeMission).
//
//   Mission             Mini-game            Related card category
//   ──────────────────  ───────────────────  ─────────────────────
//   1. Cook It Up!          Drag & Match       Food
//   2. Dress in Tradition!  Word Scramble      Costume / Tradition
//   3. Go Exploring!        Guess the State    Landmark
//   4. Join the Festival!   Quiz               (the state's quizQuestion)

import { getState } from './states.js';
import { foodMissionFor, crossStateIngredientPool } from './foodMissions.js';
import { costumeMissionFor } from './costumeMissions.js';
import { landmarkTourFor } from './landmarkMissions.js';
import { festivalMissionFor } from './festivalMissions.js';

// 📸 IMAGE NEEDED: assets/images/missions/{id}.png — circular mission portraits
// (Rimau as chef / a dancer / a tour guide / a festival throne). Emoji for now.
const TEMPLATES = [
  { id: 'chef',     num: 1, title: 'Cook It Up!',      subtitle: 'Explore the famous food',      icon: '👨‍🍳', page: 'activity.html', category: 'Food'     },
  { id: 'dancer',   num: 2, title: 'Dress in Tradition!', subtitle: 'Explore the traditional costume', icon: '👗', page: 'scramble.html', category: 'Costume'  },
  { id: 'tourist',  num: 3, title: 'Go Exploring!',    subtitle: 'Explore the famous places',    icon: '🧭',   page: 'guess.html',    category: 'Landmark' },
  { id: 'festival', num: 4, title: 'Join the Festival!', subtitle: 'Celebrate all you explored',  icon: '🎉',   page: 'quiz.html',     category: null       },
];

// Returns the 4 missions for a state (accepts a state id or a state object).
// The hub row now opens the MISSION FLOW page (Discover → Learn → game →
// Reward → Complete) rather than jumping straight into the mini-game.
export function missionsFor(stateRef) {
  const state = typeof stateRef === 'string' ? getState(stateRef) : stateRef;
  if (!state) return [];
  return TEMPLATES.map(t => ({
    ...t,
    href: `mission.html?state=${state.id}&mission=${t.id}`,
  }));
}

export const MISSION_COUNT = TEMPLATES.length;

// ─────────────────────────────────────────────────────────────────────────────
//  MISSION FLOW CONTENT
//  Derives the Discover / Learn / Reward copy for one mission from the state's
//  existing card data — so every one of the 7 states works with no per-state
//  authoring. The Laksa-Kedah screenshot is the template; we swap in each
//  state's real dish / landmark / festival.
// ─────────────────────────────────────────────────────────────────────────────

// Which card category themes each mission's Discover hero + its play-button label.
const FLOW_THEME = {
  chef:     { category: 'Food',     play: '🍳 Start Cooking!'      },
  dancer:   { category: 'Tradition', play: '👗 Explore the Costume!' },
  tourist:  { category: 'Landmark', play: '🧭 Guide the Tourist!'  },
  festival: { category: 'Festival', play: '🏆 Take the Challenge!'  },
};

// Mission 2-4 reward lines are keyed by mission id (NOT derived from `hero`,
// which can land on the wrong-category card — e.g. the costume mission falling
// back to a Food card and saying "You're now a Char Kway Teow expert!"). Each
// mission gets its own topic-appropriate, kid-friendly congratulation line.
const REWARD_LINES = {
  dancer:   'You learned all about the traditional costume! 👗',
  tourist:  "You're a great tour guide now! 🗺️",
  festival: "You're a festival superstar! 🎉",
};

// Points awarded once per mission on the Reward screen. Four missions per state
// ⇒ a fully-explored state is worth exactly 100 points (4 × 25). This mission
// bonus is the ONLY point source in the mission flow — the mini-games suppress
// their own scoring when launched from a mission (see from=mission guards).
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

  // Every state has (at most) ONE piece of music — its festival/traditional
  // track. Previously this only played under the Festival mission; now it
  // loops softly as the backing track for ALL FOUR missions of a state, so
  // Cook/Dress/Explore/Festival all feel like they're happening in the same
  // place. mission.js starts it (low volume, looping, mute-aware) and voice.js
  // ducks it under narration — see utils/music.js `duck()`/`unduck()`.
  const stateAudio = festivalMissionFor(state.id)?.audio || null;

  const base = {
    id:    tpl.id,
    num:   tpl.num,
    title: tpl.title,
    completeLine: 'Terima kasih! You\'re the best helper!',
  };

  // ── Mission 1 · HELP THE CHEF — food / cuisine flow ──────────────────────────
  // Discover the dish → Learn its ingredients → cook it (inline drag-into-pot
  // game) → congrats. Driven by the per-state food data.
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

        // Interactive-spotlight Discover (present only when the food data ships
        // hotspots — Kedah today). When set, mission.js runs the spotlight as the
        // opening step instead of the tap-cards Discover, then goes straight to
        // the game (Discover → Play). heroImage is reused as the spotlight image.
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
          // Full cross-state candidate pool (real ingredient photos from every
          // OTHER state's dish); mission.js shuffles + trims it to the
          // difficulty's distractor count each time the mission is played.
          distractors: crossStateIngredientPool(state.id),
        },

        // Reward = congratulations (no sticker / stamp)
        reward: {
          bonus:   MISSION_BONUS,
          line:    `You cooked ${food.dish}!`,
          congrats: 'You\'re a master chef! 🎉',
        },
      };
    }
  }

  // ── Missions 2-4 · generic flow (still launch the existing mini-game pages) ──
  const hero = cards.find(c => c.category === theme.category) || cards[0] || null;
  const catLabel = theme.category ? ` (${theme.category.toUpperCase()})` : '';

  // Interactive-spotlight Discover for the non-food missions. When the state
  // ships a real photo, we run the spotlight (big photo, tap each feature to
  // hear its name) then hand off to that mission's mini-game; otherwise the
  // tap-cards Discover is used. Each source gates on its own `image`, so a
  // mission stays on the fallback until its photo is added.
  //   Dancer   → costume photo   → Word Scramble (words = the taught garments)
  //   Tourist  → guided photo tour → Guess My State (state, then which spot)
  //   Festival → festival photo   → Quiz
  let spotlight   = null;
  let heroImage   = null;
  let customItems = null;
  let tour        = null;
  let costumeData = null;
  if (missionId === 'dancer') {
    costumeData = costumeMissionFor(state.id);
    if (costumeData?.image) {
      // introKey highlights the dance/subject name (e.g. "Cinta Sayang") in the
      // spotlight's intro caption — the costume itself is named in the title.
      spotlight = { image: costumeData.image, introKey: costumeData.danceName, ...costumeData.spotlight };
      heroImage = costumeData.image;
    }
  } else if (missionId === 'tourist') {
    // Tourist is a guided TOUR of the state's famous spots — a run of photo
    // cards (mission.js plays it as the opening step), then the guess game.
    const t = landmarkTourFor(state.id);
    if (t.length) {
      tour      = t;
      heroImage = t[0].image || null;
    }
  } else if (missionId === 'festival') {
    const festival = festivalMissionFor(state.id);
    if (festival?.spotlight?.cards?.length) {
      // Festival taught as a SEQUENCE of image cards shown in the spotlight card
      // stage (e.g. Penang Thaipusam, Kelantan Wayang Kulit), then the quiz.
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
    heroEmoji:     (missionId === 'dancer' && costumeData?.image) ? '👗' : (hero ? hero.icon : '🏞️'),
    heroImage,
    heroDesc:      hero ? hero.desc : (state.story || ''),
    mascotLine:    hero?.mascotLine || `There's so much to discover in ${state.name} — let's go explore!`,
    // Tourist supplies its own landmark cards; other missions list the state cards.
    items: customItems || cards.map(c => ({ emoji: c.icon, label: c.title, blurb: c.funFact || c.desc || '' })),

    // Present only when the state ships a costume photo; mission.js then opens
    // the spotlight as the first step and Continue launches the game below.
    spotlight,

    // Present for the Tourist mission — a run of photo cards played first.
    tour,

    // Looping background music for the whole mission (state's festival track,
    // shared across all four missions — see stateAudio above).
    audio: stateAudio,

    playLabel: theme.play || 'Start the Game!',
    gameHref:  `${tpl.page}?state=${state.id}&from=mission&mission=${tpl.id}`,

    reward: {
      bonus:    MISSION_BONUS,
      line:     REWARD_LINES[missionId] || (hero ? `You're now a ${hero.title} expert!` : 'Great work!'),
      congrats: 'Well done, explorer! 🎉',
    },
  };
}
