// js/data/costumeMissions.js — Mission 2 (Help the Dancer) costume content.
// ─────────────────────────────────────────────────────────────────────────────
// The Dancer mission now teaches TRADITIONAL COSTUME the same "learn before you
// play" way the Chef mission teaches food: a big real photo with glowing spots,
// each naming one garment out loud, THEN the Word Scramble game — where the words
// the child unscrambles are the very garment names they just discovered. That
// tight Discover → Play loop is what makes the scramble genuinely educational
// (they rebuild a word whose meaning they were just shown + told), rather than a
// disconnected spelling puzzle.
//
// Only Kedah ships a costume photo today (kedah_cinta_sayang.jpg — the Cinta
// Sayang dancers). States without one fall back to the tap-cards Discover +
// their derived Word Scramble words, exactly as before.
// ─────────────────────────────────────────────────────────────────────────────

export const COSTUME_MISSIONS = {
  kedah: {
    // The photo (kedah_cinta_sayang.jpg) shows a MALE Cinta Sayang dancer, and the
    // hotspots/scramble teach men's garments (songkok, Baju Melayu, samping,
    // selendang) — so the mission is honestly named the dance costume it shows, not
    // "Baju Kedah" (the women's outfit, taught separately in the narrative card).
    costumeName: 'Cinta Sayang dance costume',
    danceName: 'Cinta Sayang',
    image: '../assets/content/Kedah/kedah_cinta_sayang.jpg',

    // Interactive-spotlight Discover. {x,y} are PERCENTAGES of the photo
    // (x: 0=left→100=right, y: 0=top→100=bottom) placed on each garment in the
    // image. `text` is spoken now (Web Speech) + shown as the caption with `key`
    // highlighted; `vo` selects a future recorded clip. `word/hint/desc/emoji`
    // feed the Word Scramble so the game tests exactly what was taught here.
    spotlight: {
      intro: "Meet the Cinta Sayang dancers of Kedah! Tap the glowing spots to learn what they wear.",
      hotspots: [
        {
          x: 18, y: 32, vo: 'kedah_costume_1', key: 'songkok',
          text: 'On his head is a songkok — a soft black cap Malay men wear for special dances.',
          word: 'SONGKOK', hint: 'A cap worn on the head', emoji: '🧢',
          desc: 'The songkok is a black cap worn by Malay men at ceremonies and traditional dances.',
        },
        {
          x: 43, y: 55, vo: 'kedah_costume_2', key: 'Baju Melayu',
          text: 'This red top is the Baju Melayu — the traditional outfit for Malay men.',
          word: 'MELAYU', hint: "Baju ___ — the men's outfit", emoji: '👕',
          desc: 'Baju Melayu is the traditional shirt-and-trousers outfit worn by Malay men.',
        },
        {
          x: 75, y: 64, vo: 'kedah_costume_3', key: 'samping',
          text: 'Around his waist is a samping — a short woven sarong worn over the trousers.',
          word: 'SAMPING', hint: 'A short sarong at the waist', emoji: '🩳',
          desc: 'The samping is a short songket sarong wrapped around a man\'s waist over his trousers.',
        },
        {
          x: 56, y: 47, vo: 'kedah_costume_4', key: 'selendang',
          text: 'The dancers hold a selendang — a long scarf that flows as they move.',
          word: 'SELENDANG', hint: 'A long dancing scarf', emoji: '🧣',
          desc: 'A selendang is a long shawl or scarf the dancers wave gracefully while they dance.',
        },
      ],
      transition: "Now you know their costume — let's play the word game!",
    },
  },

  kelantan: {
    costumeName: 'royal Kelantan dress',
    danceName: 'Cik Siti Wan Kembang',
    image: '../assets/content/Kelantan/cik_siti_wan_kembang.png',
    // The royal dress inspired by Cik Siti Wan Kembang, a legendary 17th-century
    // warrior queen of Kelantan. Tune the {x,y} onto each garment in the photo
    // (top→bottom: crown, head shawl, torso wrap, waist sarong). The scramble
    // words are these garment names.
    spotlight: {
      intro: "Meet Cik Siti Wan Kembang, a warrior queen of Kelantan! Tap the glowing spots to learn what she wears.",
      hotspots: [
        {
          x: 55, y: 5, vo: 'kelantan_costume_1', key: 'Gandik',
          text: 'On her head is the Gandik — a crown made of gold and precious stones.',
          word: 'GANDIK', hint: 'A golden crown', emoji: '👑',
          desc: 'The Gandik is a royal crown made of gold and precious stones.',
        },
        {
          x: 55, y: 52, vo: 'kelantan_costume_2', key: 'Kain Kelubung',
          text: 'The Kain Kelubung is a shawl covering the head, shoulders, hands and back.',
          word: 'KELUBUNG', hint: 'A covering shawl (Kain ___)', emoji: '🧕',
          desc: 'The Kain Kelubung is a long shawl draped over the head, shoulders and back.',
        },
        {
          x: 48, y: 32, vo: 'kelantan_costume_3', key: 'Kain Kemban',
          text: 'The Kain Kemban is a cloth wrapped around the torso, folded and pinned.',
          word: 'KEMBAN', hint: 'Cloth wrapped round the torso (Kain ___)', emoji: '👘',
          desc: 'The Kain Kemban is a cloth wrapped around the torso, its edges folded and pinned.',
        },
        {
          x: 49, y: 58, vo: 'kelantan_costume_4', key: 'Kain Sarong',
          text: 'The Kain Sarong is a sarong wrapped around the waist.',
          word: 'SARONG', hint: 'Wrapped round the waist (Kain ___)', emoji: '👗',
          desc: 'The Kain Sarong is a length of cloth wrapped around the waist.',
        },
      ],
      transition: "Now you know the royal costume — let's play the word game!",
    },
  },

  selangor: {
    costumeName: 'traditional Malay dress',
    danceName: 'Traditional Malay Dress',
    image: '../assets/content/Selangor/traditional_costume_selangor.png',
    // Selangor's traditional Malay dress — a man (left) in royal-yellow Baju Melayu
    // and a woman (right) in Baju Kurung. Hotspots sit on each garment; the scramble
    // words are these garment names.
    // ⚠️ Garment names inferred from the photo + standard Malay dress — verify against
    // the uploaded Selangor notes if specific local terms differ.
    spotlight: {
      intro: "Meet a Selangor family in their traditional dress! Tap the glowing spots to learn what they wear.",
      hotspots: [
        {
          x: 41, y: 5, vo: 'selangor_costume_1', key: 'songkok',
          text: 'On the man\'s head is a songkok — a soft cap Malay men wear for special days.',
          word: 'SONGKOK', hint: 'The cap on the head', emoji: '🧢',
          desc: 'The songkok is a cap worn by Malay men at ceremonies and celebrations.',
        },
        {
          x: 45, y: 50, vo: 'selangor_costume_2', key: 'samping',
          text: 'Around his waist is a samping — a short woven cloth worn over the Baju Melayu.',
          word: 'SAMPING', hint: 'A short cloth at the waist', emoji: '🩳',
          desc: 'The samping is a short woven songket cloth wrapped around a man\'s waist.',
        },
        {
          x: 60, y: 34, vo: 'selangor_costume_3', key: 'selendang',
          text: 'The lady wears a selendang — a long shawl draped over her shoulder.',
          word: 'SELENDANG', hint: 'A long shoulder shawl', emoji: '🧣',
          desc: 'A selendang is a long shawl worn over the shoulder with the Baju Kurung.',
        },
        {
          x: 58, y: 72, vo: 'selangor_costume_4', key: 'Baju Kurung',
          text: 'Her long, flowing outfit is the Baju Kurung.',
          word: 'KURUNG', hint: "The woman's outfit (Baju ___)", emoji: '👗',
          desc: 'The Baju Kurung is a long, loose blouse-and-skirt outfit worn by Malay women.',
        },
      ],
      transition: "Now you know the traditional dress — let's play the word game!",
    },
  },

  sabah: {
    costumeName: 'Kadazan Penampang costume',
    danceName: 'Kadazan Penampang',
    image: '../assets/content/Sabah/kadazan_penampang.jpg',
    // The Kadazan Penampang costume of Sabah — a woman (left) and a man (right)
    // in black velvet with red-and-gold trim. Hotspots sit on each garment in the
    // photo. The scramble words are these garment names.
    spotlight: {
      intro: "Meet the Kadazan Penampang of Sabah! Tap the glowing spots to learn what they wear.",
      hotspots: [
        {
          x: 57, y: 9, vo: 'sabah_costume_1', key: 'Siga',
          text: 'On the man\'s head is the Siga — a hand-woven cloth folded into a cap.',
          word: 'SIGA', hint: "The man's woven head cloth", emoji: '🧣',
          desc: 'The Siga is a hand-woven cloth the Kadazan men fold and wear on their heads.',
        },
        {
          x: 48, y: 35, vo: 'sabah_costume_2', key: 'Sinuangga',
          text: 'The woman wears a Sinuangga — a short, sleeveless black velvet top.',
          word: 'SINUANGGA', hint: "The woman's sleeveless velvet top", emoji: '👚',
          desc: 'The Sinuangga is a short, sleeveless black velvet blouse worn by Kadazan women.',
        },
        {
          x: 48, y: 76, vo: 'sabah_costume_3', key: 'Gonob',
          text: 'Her long wrap-around skirt is called the Gonob.',
          word: 'GONOB', hint: "The woman's long wrap-skirt", emoji: '👗',
          desc: 'The Gonob is a long, straight wrap-around skirt worn by Kadazan women.',
        },
        {
          x: 55, y: 40, vo: 'sabah_costume_4', key: 'Gaung',
          text: 'The man wears the Gaung — a black velvet jacket with gold trim.',
          word: 'GAUNG', hint: "The man's velvet jacket", emoji: '🧥',
          desc: 'The Gaung is the black velvet jacket, trimmed with gold, worn by Kadazan men.',
        },
        {
          x: 58, y: 78, vo: 'sabah_costume_5', key: 'Souva',
          text: 'His matching long trousers are called the Souva.',
          word: 'SOUVA', hint: "The man's long trousers", emoji: '👖',
          desc: 'The Souva are the long black trousers worn by Kadazan men with the Gaung.',
        },
      ],
      transition: "Now you know their costume — let's play the word game!",
    },
  },

  sarawak: {
    costumeName: 'Ngepan Iban',
    danceName: 'Ngepan Iban',
    image: '../assets/content/Sarawak/ngepan.png',
    // Ngepan is the traditional dress of the Iban women of Sarawak. Hotspots sit on
    // each part in the photo (top→bottom: silver headdress, beaded collar, coin
    // belt, woven skirt). The scramble words are these garment names.
    spotlight: {
      intro: "Meet an Iban lady in her Ngepan dress from Sarawak! Tap the glowing spots to learn what she wears.",
      hotspots: [
        {
          x: 50, y: 10, vo: 'sarawak_costume_1', key: 'Sugu Tinggi',
          text: 'On her head is the Sugu Tinggi — a tall, shining silver headdress.',
          word: 'SUGU', hint: 'The tall silver headdress', emoji: '👑',
          desc: 'The Sugu Tinggi is a tall, shining silver headdress worn by Iban women.',
        },
        {
          x: 53, y: 35, vo: 'sarawak_costume_2', key: 'Marik Empang',
          text: 'The Marik Empang is a colourful beaded collar worn over the shoulders.',
          word: 'MARIK', hint: 'The beaded shoulder collar', emoji: '📿',
          desc: 'The Marik Empang is a colourful beaded collar draped over the shoulders.',
        },
        {
          x: 50, y: 58, vo: 'sarawak_costume_3', key: 'Rawai',
          text: 'Around her waist is the Rawai — shiny belts made of real coins.',
          word: 'RAWAI', hint: 'The shiny coin belt', emoji: '🪙',
          desc: 'The Rawai are shiny belts made of real coins, worn around the waist.',
        },
        {
          x: 50, y: 78, vo: 'sarawak_costume_4', key: 'Kain Kebat',
          text: 'Her skirt is the Kain Kebat — a handmade woven cloth.',
          word: 'KEBAT', hint: 'The woven skirt (Kain ___)', emoji: '👗',
          desc: 'The Kain Kebat is a handmade, traditionally woven skirt.',
        },
      ],
      transition: "Now you know the Ngepan — let's play the word game!",
    },
  },

  penang: {
    costumeName: 'Nyonya Kebaya',
    danceName: 'Baba Nyonya Kebaya',
    image: '../assets/content/Penang/baba_nyonya_kebaya.png',
    // Baba Nyonya Kebaya — a blend of Chinese and Malay traditional dress. Tune
    // the {x,y} onto each garment in the photo (top→bottom: blouse, brooches,
    // skirt, shoes). The scramble words are these garment names.
    spotlight: {
      intro: "Meet the Baba Nyonya of Penang! Tap the glowing spots to learn what they wear.",
      hotspots: [
        {
          x: 45, y: 25, vo: 'penang_costume_1', key: 'Kebaya',
          text: 'This blouse is the Kebaya — its cloth has beautiful flower patterns sewn in.',
          word: 'KEBAYA', hint: 'The flowery blouse', emoji: '👚',
          desc: 'The Kebaya is a fitted blouse with lovely embroidered flower patterns.',
        },
        {
          x: 50, y: 42, vo: 'penang_costume_2', key: 'Kerongsang',
          text: 'These brooches are the Kerongsang — they hold the blouse together instead of buttons.',
          word: 'KERONGSANG', hint: 'Brooches instead of buttons', emoji: '📌',
          desc: 'Kerongsang are linked brooches that fasten the front of the Kebaya.',
        },
        {
          x: 50, y: 72, vo: 'penang_costume_3', key: 'sarong',
          text: 'The skirt is a sarong — a colourful wrap-around with floral or batik prints.',
          word: 'SARONG', hint: 'A wrap-around skirt', emoji: '👗',
          desc: 'The sarong is a colourful wrap-around skirt with floral or batik prints.',
        },
        {
          x: 60, y: 82, vo: 'penang_costume_4', key: 'Kasut Manek',
          text: 'On her feet are Kasut Manek — slippers covered in tiny colourful glass beads.',
          word: 'MANEK', hint: 'Beaded slippers (Kasut ___)', emoji: '👡',
          desc: 'Kasut Manek are handmade slippers covered in colourful glass beads.',
        },
      ],
      transition: "Now you know the Baba Nyonya costume — let's play the word game!",
    },
  },
};

// The costume mission for a state id, or null if none authored.
export function costumeMissionFor(stateId) {
  return COSTUME_MISSIONS[stateId] || null;
}

// The Word Scramble word list for a state's costume mission, derived from the
// spotlight hotspots so the game tests exactly the garments just taught. Shape
// matches scrambleWordsFor(): { answer, hint, desc, emoji }. Empty if none.
export function costumeWordsFor(stateId) {
  const mission = COSTUME_MISSIONS[stateId];
  if (!mission) return [];
  return mission.spotlight.hotspots
    .filter(h => h.word)
    .map(h => ({
      answer: h.word.toUpperCase(),
      hint:   h.hint,
      desc:   h.desc,
      emoji:  h.emoji || '👗',
    }));
}
