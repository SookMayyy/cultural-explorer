/* festivalMissions.js — Mission 4 (Festival Challenge) content per state */

// Teaches a state's signature festival, then runs the Quiz. The game runs from
// the state's quiz data, so this file supplies only the Discover spotlight, which
// turns on only when `image` is a real file (missions.js gates on festival.image).

export const FESTIVAL_MISSIONS = {
  selangor: {
    festival: 'Hari Moyang',
    image: '../assets/content/Selangor/mayin_jo_oh.jpg',
    // Mah Meri festival music. Loops during the Discover + quiz; respects the app mute.
    audio: '../assets/content/Selangor/hari_moyang.mp3',
    // Hari Moyang — the Mah Meri ancestor festival on Carey Island, shown through
    // the Main Jo-oh dance by the sea. {x,y} are percentages of the scene: the
    // leaf-skirt dancers, the "Moyang" ancestor figure covered in leaves, and the
    // seaside setting where offerings are made.
    spotlight: {
      intro: "It's Hari Moyang — the Mah Meri ancestor festival! Tap the glowing spots to explore.",
      hotspots: [
        {
          x: 22, y: 50, vo: 'selangor_festival_1', key: 'Main Jo-oh',
          text: 'The dancers in leaf skirts are doing the Main Jo-oh dance.',
        },
        {
          x: 53, y: 52, vo: 'selangor_festival_2', key: 'Moyang',
          text: 'The figure covered in leaves is the Moyang — an ancestor spirit.',
        },
        {
          x: 80, y: 28, vo: 'selangor_festival_3', key: 'Hari Moyang',
          text: 'Hari Moyang is held by the orang Asli to thank the ancestors for keeping everyone safe.',
        },
      ],
      transition: "Now you know Hari Moyang — let's take the quiz!",
    },
  },

  sarawak: {
    festival: 'Gawai Dayak',
    image: '../assets/content/Sarawak/ngajat_dance.jpg',
    // Gendang Rayah — the drum-and-gong music the Ngajat is danced to. Loops during
    // the Discover + quiz; respects the app mute.
    audio: '../assets/content/Sarawak/gendang_rayah.mp3',
    // Gawai Dayak — the Dayak harvest festival, shown through the Ngajat dance.
    // {x,y} are percentages of the stage scene: the warrior Ngajat dance, the
    // feather headdresses, and the wider harvest celebration.
    spotlight: {
      intro: "It's Gawai Dayak — Sarawak's harvest festival! Tap the glowing spots to explore.",
      hotspots: [
        {
          x: 48, y: 62, vo: 'sarawak_festival_1', key: 'Ngajat',
          text: 'The Ngajat is a proud warrior dance performed at Gawai Dayak.',
        },
        {
          x: 25, y: 48, vo: 'sarawak_festival_2', key: 'feathers',
          text: 'The dancers wear tall headdresses decorated with hornbill feathers.',
        },
        {
          x: 60, y: 30, vo: 'sarawak_festival_3', key: 'harvest',
          text: 'Gawai Dayak is a big thank-you for the rice harvest, held every June.',
        },
      ],
      transition: "Now you know Gawai Dayak — let's take the quiz!",
    },
  },

  sabah: {
    festival: 'Pesta Kaamatan',
    image: '../assets/content/Sabah/sumazau_dance.png',
    // Rentak Sumazau — the slow, steady gong beat the Sumazau is danced to. Loops
    // during the Discover + quiz; respects the app mute.
    audio: '../assets/content/Sabah/rentak_sumazau.mp3',
    // Pesta Kaamatan — the Kadazandusun harvest festival, shown here through the
    // Sumazau dance. {x,y} are percentages of the scene: the outspread arms (the
    // bird-like Sumazau), the black-and-gold costume + woven hat, and the wider
    // celebration that thanks the rice spirit.
    spotlight: {
      intro: "It's Pesta Kaamatan — Sabah's harvest festival! Tap the glowing spots to explore.",
      hotspots: [
        {
          x: 60, y: 32, vo: 'sabah_festival_1', key: 'Sumazau',
          text: 'The dancers spread their arms and float like a bird — that is the Sumazau dance!',
        },
        {
          x: 40, y: 42, vo: 'sabah_festival_2', key: 'costume',
          text: 'They wear black velvet costumes with gold trim and a woven hat.',
        },
        {
          x: 50, y: 25, vo: 'sabah_festival_3', key: 'harvest',
          text: 'Kaamatan is a big thank-you to Bambaazon, the spirit of the rice harvest.',
        },
      ],
      transition: "Now you know Pesta Kaamatan — let's take the quiz!",
    },
  },

  kelantan: {
    festival: 'Wayang Kulit',
    image: '../assets/content/Kelantan/wayang_kulit.jpg',
    // Wayang Kulit taught as a sequence of image CARDS (shown in the spotlight card
    // stage, no hotspots): what it is → how the lamp makes moving shadows → the
    // puppet characters that tell the Malay folklore stories → then the quiz.
    spotlight: {
      cards: [
        {
          image: '../assets/content/Kelantan/wayang_kulit.jpg', name: 'Wayang Kulit',
          vo: 'kelantan_festival_1', key: 'Wayang Kulit',
          text: "Wayang Kulit is Kelantan's traditional shadow-puppet show.",
        },
        {
          image: '../assets/content/Kelantan/wayang_kulit_bts.png', name: 'Moving Shadows',
          vo: 'kelantan_festival_2', key: 'moving shadows',
          text: 'A bright lamp behind the screen turns the puppets into moving shadows.',
        },
        {
          image: '../assets/content/Kelantan/wayang_puppet.png', name: 'The Puppets',
          vo: 'kelantan_festival_3', key: 'Malay folklore',
          text: 'These shadow puppets are the characters used to tell stories from Malay folklore.',
        },
      ],
    },
  },

  kedah: {
    festival: 'Kedah Paddy Festival',
    image: '../assets/content/Kedah/kedah_entry_background.avif',
    // Cinta Sayang music plays softly under the festival (harvest festivals in
    // Kedah are celebrated with music and dancing). Loops during the Discover
    // and the quiz; respects the app mute.
    audio: '../assets/content/Kedah/kedah_dance_music.mp3',

    // {x,y} are percentages of the scene: the golden paddy fields (foreground),
    // the kampung house (right), and Gunung Jerai (mountains behind).
    spotlight: {
      intro: "It's the Kedah Paddy Festival — a big thank-you for the rice harvest! Tap the glowing spots to explore.",
      hotspots: [
        {
          x: 48, y: 66, vo: 'kedah_festival_1', key: 'Rice Bowl',
          text: 'These golden paddy fields grow much of Malaysia\'s rice — that\'s why Kedah is the Rice Bowl!',
        },
        {
          x: 76, y: 41, vo: 'kedah_festival_2', key: 'kampung',
          text: 'Farmers live in wooden kampung houses like this, right beside their paddy fields.',
        },
        {
          x: 33, y: 16, vo: 'kedah_festival_3', key: 'Gunung Jerai',
          text: 'Behind the fields stands Gunung Jerai, Kedah\'s tall and famous mountain.',
        },
      ],
      transition: "Now you know the Paddy Festival — let's take the quiz!",
    },
  },

  penang: {
    festival: 'Thaipusam',
    image: '../assets/content/Penang/thaipusam_festival.jpg',
    // Devotional music plays softly under Thaipusam; loops during Discover + quiz.
    audio: '../assets/content/Penang/thaipusam_music.mp3',
    // Thaipusam taught as a sequence of image CARDS shown in the spotlight card
    // stage (each photo in the card + a line below + Next), so the kavadi and the
    // vel are shown up close in their own card, then the quiz.
    spotlight: {
      cards: [
        {
          image: '../assets/content/Penang/thaipusam_festival.jpg', name: 'Thaipusam',
          vo: 'penang_festival_1', key: 'Thaipusam',
          text: "Thaipusam is Penang's best-loved Hindu festival, full of colour and thanks.",
        },
        {
          image: '../assets/content/Penang/thaipusam_festival_2.jpg', name: 'A Grand Celebration',
          vo: 'penang_festival_2', key: 'colourful clothes',
          text: 'Many people wear bright, colourful clothes and gather for a special celebration.',
        },
        {
          image: '../assets/content/Penang/kavadi.png', name: 'The Kavadi',
          vo: 'penang_festival_3', key: 'kavadi',
          text: 'Some people carry a beautifully decorated frame called a kavadi to say thank you.',
        },
        {
          image: '../assets/content/Penang/vel.jpg', name: 'The Vel',
          vo: 'penang_festival_4', key: 'vel',
          text: 'A vel is a small, sharp metal spear — a special symbol you see at Thaipusam.',
        },
      ],
    },
  },
};

// The festival mission for a state id, or null if none authored.
export function festivalMissionFor(stateId) {
  return FESTIVAL_MISSIONS[stateId] || null;
}
