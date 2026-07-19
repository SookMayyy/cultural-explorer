// js/data/foodMissions.js — Mission 1 (Help the Chef) food content per state.
// ─────────────────────────────────────────────────────────────────────────────
// Each state's famous dish, the real ingredients that go into it (taught in the
// Learn carousel AND the correct answers in the "cook the dish" mini-game), plus
// a few obviously-wrong distractor ingredients the player must NOT add.
//
// Dishes are drawn from each state's Food card in states.js (Sabah's is Hinava,
// the Kadazandusun fresh-fish salad).
// ─────────────────────────────────────────────────────────────────────────────

export const FOOD_MISSIONS = {
  penang: {
    dish: 'Char Kway Teow', dishEmoji: '🍜',
    image: '../assets/content/Penang/char_kway_teow.jpg',
    intro: "Penang's famous smoky stir-fried flat noodles. Add the right ingredients to the hot wok!",
    // Interactive-spotlight Discover on the real Char Kway Teow photo. {x,y} are
    // PERCENTAGES of the image — tune each glow onto its topping in the photo.
    spotlight: {
      intro: "I need your help cooking Char Kway Teow! Tap the glowing spots to learn about it.",
      hotspots: [
        { x: 52, y: 52, vo: 'penang_food_1', key: 'prawns',          text: 'Fresh prawns add a sweet, juicy seafood taste.' },
        { x: 62, y: 60, vo: 'penang_food_2', key: 'cockles',         text: 'Tiny cockles — see-hum — are a classic Penang topping.' },
        { x: 58, y: 35, vo: 'penang_food_3', key: 'Chinese sausage', text: 'Slices of Chinese sausage (lap cheong) add a sweet, smoky taste.' },
        { x: 40, y: 40, vo: 'penang_food_4', key: 'bean sprouts',    text: 'Crunchy bean sprouts add a fresh, crisp bite.' },
        { x: 40, y: 70, vo: 'penang_food_5', key: 'pork lard',       text: 'A little pork lard gives the smoky "wok hei" flavour.' },
      ],
      transition: "Now you know Char Kway Teow — let's cook it together!",
    },
    // Real ingredient photos under src/assets/content/Penang/.
    ingredients: [
      { name: 'Pork Lard',       emoji: '🥓', image: '../assets/content/Penang/pork_lard.png',       blurb: 'A little pork lard gives the smoky "wok hei" flavour.' },
      { name: 'Prawns',          emoji: '🦐', image: '../assets/content/Penang/shrimp.png',          blurb: 'Fresh prawns add a sweet, juicy seafood taste.' },
      { name: 'Cockles',         emoji: '🐚', image: '../assets/content/Penang/cockles.png',         blurb: 'Tiny cockles (see-hum) are a classic Penang topping.' },
      { name: 'Bean Sprouts',    emoji: '🌱', image: '../assets/content/Penang/bean_sprout.png',     blurb: 'Crunchy bean sprouts add freshness and bite.' },
      { name: 'Chinese Sausage', emoji: '🌭', image: '../assets/content/Penang/chinese_sausage.png', blurb: 'Sweet Chinese sausage (lap cheong) adds a smoky taste.' },
    ],
    // Wrong ingredient options for the cook game come from crossStateIngredientPool()
    // below — real photos borrowed from the OTHER states' dishes, picked at random.
  },

  selangor: {
    dish: 'Satay Kajang', dishEmoji: '🍢',
    image: '../assets/content/Selangor/satay_kajang.jpg',
    intro: "Kajang town's famous grilled meat skewers! Add the right things to the plate.",
    // Interactive-spotlight Discover on the real Satay Kajang photo. {x,y} are
    // PERCENTAGES of the image — tuned onto each part of the dish.
    spotlight: {
      intro: "I need your help serving Satay Kajang! Tap the glowing spots to learn about it.",
      hotspots: [
        { x: 35, y: 45, vo: 'selangor_food_1', key: 'marinated meat', text: 'Little skewers of meat are marinated in spices, then grilled over charcoal.' },
        { x: 72, y: 22, vo: 'selangor_food_2', key: 'peanut sauce',   text: 'The satay is dipped in a sweet, nutty peanut sauce.' },
        { x: 66, y: 58, vo: 'selangor_food_3', key: 'ketupat',        text: 'Ketupat are little rice cakes that soak up the tasty sauce.' },
        { x: 40, y: 78, vo: 'selangor_food_4', key: 'cucumber',       text: 'Fresh cucumber cools down your mouth between bites.' },
        { x: 58, y: 82, vo: 'selangor_food_5', key: 'red onion',      text: 'Slices of red onion add a sweet, sharp crunch.' },
      ],
      transition: "Now you know Satay Kajang — let's serve it together!",
    },
    // Real ingredient photos under src/assets/content/Selangor/.
    ingredients: [
      { name: 'Marinated Meat', emoji: '🍢', image: '../assets/content/Selangor/meat_marinade.png', blurb: 'Meat marinated in spices and grilled on skewers.' },
      { name: 'Peanut Sauce',   emoji: '🥜', image: '../assets/content/Selangor/peanut_sauce.png',  blurb: 'Sweet, nutty sauce for dipping the satay.' },
      { name: 'Ketupat',        emoji: '🍚', image: '../assets/content/Selangor/ketupat.png',       blurb: 'Little rice cakes that soak up the sauce.' },
      { name: 'Cucumber',       emoji: '🥒', image: '../assets/content/Selangor/cucumber.png',      blurb: 'Fresh cucumber cools down the spice.' },
      { name: 'Red Onion',      emoji: '🧅', image: '../assets/content/Selangor/red_onion.png',     blurb: 'Sweet, sharp red onion slices add crunch.' },
    ],
    // Wrong ingredient options for the cook game come from crossStateIngredientPool()
    // below — real photos borrowed from the OTHER states' dishes, picked at random.
  },

  kelantan: {
    dish: 'Nasi Kerabu', dishEmoji: '🍚',
    image: '../assets/content/Kelantan/nasi_kerabu.png',
    intro: "Kelantan's famous dish with naturally blue rice! Add the right ingredients to the plate.",
    // Interactive-spotlight Discover on the real Nasi Kerabu photo. {x,y} are
    // PERCENTAGES of the image — tune each glow onto its topping in the photo.
    spotlight: {
      intro: "I need your help making Nasi Kerabu! Tap the glowing spots to learn about it.",
      hotspots: [
        { x: 48, y: 56, vo: 'kelantan_food_1', key: 'blue rice',       text: 'The rice is blue! It is coloured with butterfly-pea flowers — no paint at all.' },
        { x: 40, y: 60, vo: 'kelantan_food_2', key: 'grilled chicken', text: 'Nasi Kerabu is served with grilled chicken or fish on the side.' },
        { x: 52, y: 45, vo: 'kelantan_food_3', key: 'bunga telang',   text: 'These blue butterfly-pea flowers (bunga telang) give the rice its colour.' },
        { x: 38, y: 40, vo: 'kelantan_food_4', key: 'salted egg',      text: 'A salted egg adds a savoury, salty kick to every bite.' },
        { x: 50, y: 30, vo: 'kelantan_food_5', key: 'keropok',         text: 'Crunchy prawn crackers (keropok) go on the side for extra crunch.' },
      ],
      transition: "Now you know Nasi Kerabu — let's make it together!",
    },
    // Real ingredient photos under src/assets/content/Kelantan/.
    ingredients: [
      { name: 'Blue Rice',       emoji: '🍚', image: '../assets/content/Kelantan/blue_rice.png',      blurb: 'Rice turned blue by butterfly-pea flowers — amazing!' },
      { name: 'Grilled Chicken', emoji: '🍗', image: '../assets/content/Kelantan/grilled_chicken.png', blurb: 'Grilled chicken (or fish) is the classic protein topping.' },
      { name: 'Butterfly Pea',   emoji: '🌸', image: '../assets/content/Kelantan/butterfly_pea.png',   blurb: 'The blue flower (bunga telang) that colours the rice.' },
      { name: 'Salted Egg',      emoji: '🥚', image: '../assets/content/Kelantan/salted_egg.png',      blurb: 'Salted egg adds a savoury, salty kick.' },
      { name: 'Prawn Cracker',   emoji: '🍤', image: '../assets/content/Kelantan/prawn_cracker.png',   blurb: 'Crunchy keropok on the side adds a lovely crunch.' },
    ],
    // Wrong ingredient options for the cook game come from crossStateIngredientPool()
    // below — real photos borrowed from the OTHER states' dishes, picked at random.
  },

  kedah: {
    dish: 'Laksa Kedah', dishEmoji: '🍜',
    image: '../assets/content/Kedah/kedah_laksa.png',
    intro: 'A tangy northern fish laksa. Add the right ingredients to the rich gravy!',
    // Interactive-spotlight Discover (the signature "learn before you play" step).
    // Tap each glowing spot on the real Laksa photo — one short spoken sentence
    // each. {x,y} are PERCENTAGES of the image (x: 0=left→100=right, y: 0=top→
    // 100=bottom); tune them so each glow sits on that ingredient in the photo.
    // `vo` selects a future recorded clip; `text` is spoken now via Web Speech +
    // shown as the caption.
    spotlight: {
      intro: "I need your help cooking Laksa Kedah! Tap the glowing spots to learn about it.",
      // `key` is the ingredient word highlighted inside the caption.
      hotspots: [
        { x: 42, y: 62, vo: 'kedah_food_1', key: 'rice noodles', text: 'These are soft rice noodles — they soak up the tangy gravy.' },
        { x: 58, y: 44, vo: 'kedah_food_2', key: 'mackerel fish', text: 'The thick gravy is made from mashed mackerel fish.' },
        { x: 24, y: 32, vo: 'kedah_food_3', key: 'Mint leaves', text: 'Mint leaves give Laksa Kedah its fragrant taste!' },
        { x: 75, y: 50, vo: 'kedah_food_4', key: 'cucumber', text: 'Cool cucumber slices balance out the spicy, sour gravy.' },
        { x: 34, y: 18, vo: 'kedah_food_5', key: 'lime', text: 'A squeeze of fresh lime adds a bright, zesty taste on top!' },
      ],
      transition: "Now you know Laksa Kedah — let's cook it together!",
    },
    // Real ingredient photos (src/assets/content/Kedah/) — the cook game and the
    // Learn carousel show these instead of emoji. "Lime" matches the spotlight
    // (hotspot 5) and the uploaded lime.png.
    ingredients: [
      { name: 'Rice Noodles', emoji: '🍜', image: '../assets/content/Kedah/rice_noodles.png',    blurb: 'Soft, thick rice noodles soak up the tangy gravy.' },
      { name: 'Mackerel',     emoji: '🐟', image: '../assets/content/Kedah/markerel_fish.png',   blurb: 'Mashed mackerel makes the gravy rich and fishy-tasty.' },
      { name: 'Lime',         emoji: '🍋', image: '../assets/content/Kedah/lime.png',            blurb: 'A squeeze of fresh lime adds a bright, zesty taste.' },
      { name: 'Cucumber',     emoji: '🥒', image: '../assets/content/Kedah/cucumber_slices.png', blurb: 'Cool cucumber slices add a fresh crunch on top.' },
      { name: 'Mint Leaves',  emoji: '🌿', image: '../assets/content/Kedah/mint_leaf.png',       blurb: 'Fresh mint (daun kesum) makes it smell wonderful.' },
    ],
    // Wrong ingredient options for the cook game come from crossStateIngredientPool()
    // below — real photos borrowed from the OTHER states' dishes, picked at random.
  },

  sabah: {
    dish: 'Hinava', dishEmoji: '🥗',
    image: '../assets/content/Sabah/hinava.png',
    intro: "Sabah's famous Kadazandusun fresh-fish salad — no cooking with fire! Add the right ingredients to the plate.",
    // Interactive-spotlight Discover on the real Hinava photo. {x,y} are
    // PERCENTAGES of the image — tuned onto each ingredient in the salad.
    spotlight: {
      intro: "I need your help making Hinava! Tap the glowing spots to learn about it.",
      hotspots: [
        { x: 35, y: 58, vo: 'sabah_food_1', key: 'fresh fish',  text: 'Hinava starts with fresh raw fish, cut into small pieces.' },
        { x: 32, y: 27, vo: 'sabah_food_2', key: 'lime juice',  text: 'Sour lime juice "cooks" the fish without any fire at all!' },
        { x: 64, y: 62, vo: 'sabah_food_3', key: 'onion',       text: 'Thin onion slices add a sweet, crunchy taste.' },
        { x: 58, y: 35, vo: 'sabah_food_4', key: 'chili',       text: 'Tiny chili padi gives Hinava a little spicy kick.' },
        { x: 50, y: 65, vo: 'sabah_food_5', key: 'ginger',      text: 'Fresh ginger makes the salad smell wonderful.' },
      ],
      transition: "Now you know Hinava — let's make it together!",
    },
    // Real ingredient photos under src/assets/content/Sabah/.
    ingredients: [
      { name: 'Fresh Fish', emoji: '🐟', image: '../assets/content/Sabah/fresh_fish.png', blurb: 'Fresh raw fish is the star — no cooking with fire!' },
      { name: 'Lime Juice', emoji: '🍋', image: '../assets/content/Sabah/lime_juice.png', blurb: 'Sour lime juice "cooks" the fish all by itself.' },
      { name: 'Onion',      emoji: '🧅', image: '../assets/content/Sabah/onion.png',      blurb: 'Thin onion slices add a sweet, crunchy taste.' },
      { name: 'Chili Padi', emoji: '🌶️', image: '../assets/content/Sabah/chili_padi.png', blurb: 'Tiny chili padi adds a little spicy kick.' },
      { name: 'Ginger',     emoji: '🫚', image: '../assets/content/Sabah/ginger.png',     blurb: 'Fresh ginger makes the salad smell wonderful.' },
    ],
    // Wrong ingredient options for the cook game come from crossStateIngredientPool()
    // below — real photos borrowed from the OTHER states' dishes, picked at random.
  },

  sarawak: {
    dish: 'Kolo Mee', dishEmoji: '🍜',
    image: '../assets/content/Sarawak/kolo_mee.png',
    intro: "Sarawak's favourite springy egg noodles, tossed dry and served with soup on the side. Add the right toppings!",
    // Interactive-spotlight Discover on the real Kolo Mee photo. {x,y} are
    // PERCENTAGES of the image — tuned onto each part of the dish.
    spotlight: {
      intro: "Kolo Mee is the one of the famous food in Sarawak! Tap the glowing spots to learn about it.",
      hotspots: [
        { x: 40, y: 62, vo: 'sarawak_food_1', key: 'egg noodles',  text: 'Springy egg noodles are tossed dry — not in soup — so they stay bouncy.' },
        { x: 40, y: 42, vo: 'sarawak_food_2', key: 'minced pork',  text: 'Tasty minced pork is sprinkled over the noodles.' },
        { x: 50, y: 40, vo: 'sarawak_food_3', key: 'fried onions', text: 'Crispy fried onions add a lovely crunch and smell.' },
        { x: 25, y: 30, vo: 'sarawak_food_4', key: 'soup',         text: 'A bowl of clear soup is served on the side to sip.' },
        { x: 68, y: 27, vo: 'sarawak_food_5', key: 'soy sauce',    text: 'A little soy sauce makes the noodles savoury and dark.' },
      ],
      transition: "Now you know Kolo Mee — let's make it together!",
    },
    // Real ingredient photos under src/assets/content/Sarawak/.
    ingredients: [
      { name: 'Egg Noodles',  emoji: '🍜', image: '../assets/content/Sarawak/springy_egg_noodles.png', blurb: 'Springy egg noodles tossed dry — the star of Kolo Mee.' },
      { name: 'Minced Pork',  emoji: '🥩', image: '../assets/content/Sarawak/minced_pork.png',         blurb: 'Savoury minced pork sprinkled over the top.' },
      { name: 'Fried Onions', emoji: '🧅', image: '../assets/content/Sarawak/fried_onion.png',         blurb: 'Crispy fried onions add crunch and aroma.' },
      { name: 'Soup',         emoji: '🍲', image: '../assets/content/Sarawak/soup.png',                blurb: 'Clear soup served on the side to sip.' },
      { name: 'Soy Sauce',    emoji: '🍶', image: '../assets/content/Sarawak/soy_source.png',          blurb: 'A dash of soy sauce makes it savoury.' },
    ],
    // Wrong ingredient options for the cook game come from crossStateIngredientPool()
    // below — real photos borrowed from the OTHER states' dishes, picked at random.
  },
};

// Returns the food mission for a state id, or null if none authored.
export function foodMissionFor(stateId) {
  return FOOD_MISSIONS[stateId] || null;
}

// Cross-state wrong-ingredient pool for the "cook the dish" mini-game. Instead
// of a couple of hand-authored joke items (Cheese, Apple…), the wrong options
// are REAL ingredient photos borrowed from every OTHER state's dish — e.g.
// Kelantan's Butterfly Pea can show up as a wrong ingredient in Sabah's Hinava.
// mission.js shuffles this pool and slices it down to paramsFor('cook').distractors
// each time the mission is played, so the wrong options differ from run to run.
//
// Any ingredient whose name exactly matches (case-insensitive) one of the
// CURRENT state's own correct ingredients is excluded, so a "wrong" option can
// never accidentally also be a correct one for that dish (e.g. Kedah and
// Selangor both have a "Cucumber" — Kedah's pool skips Selangor's Cucumber
// and vice versa). Also de-duplicated by name (Kedah's and Selangor's
// "Cucumber" would otherwise both land in a third state's pool), so the tray
// never shows two differently-pictured options with the same label.
export function crossStateIngredientPool(stateId) {
  const ownNames = new Set(
    (FOOD_MISSIONS[stateId]?.ingredients || []).map(i => i.name.toLowerCase())
  );
  const seen = new Set();
  const pool = [];
  for (const [id, mission] of Object.entries(FOOD_MISSIONS)) {
    if (id === stateId) continue;
    for (const ing of mission.ingredients) {
      const key = ing.name.toLowerCase();
      if (ownNames.has(key) || seen.has(key)) continue;
      seen.add(key);
      pool.push({ name: ing.name, emoji: ing.emoji, image: ing.image || null });
    }
  }
  return pool;
}
