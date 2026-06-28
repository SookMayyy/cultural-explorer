// js/data/mascots.js — the single mascot, with art slots + emoji fallback.
//
// Rimau (tiger cub) is the one guide across the whole app (West and East).
// Three uploaded poses live in assets/characters/:
//   idle  — calm standing pose (default / neutral)
//   happy — arms up, big smile (correct answers, greetings)
//   cheer — fist-pump celebration (passing a quiz, finishing a state)
// `emoji` is the fallback shown until the art file loads. Paths are relative to
// the views/ pages.

import { assetImg } from '../utils/assetImg.js';

export const MASCOTS = {
  rimau: {
    name:  'Rimau',
    emoji: '🐯',
    img:   '../assets/characters/rimau_idle.png',   // default (back-compat)
    poses: {
      idle:  '../assets/characters/rimau_idle.png',
      happy: '../assets/characters/rimau_happy.png',
      cheer: '../assets/characters/rimau_cheer.png',
    },
  },
};

export function getMascot(id) {
  return MASCOTS[id] || MASCOTS.rimau;
}

// Resolve a pose path, falling back to the idle art if the pose is unknown.
export function mascotPose(pose = 'idle', id = 'rimau') {
  const m = getMascot(id);
  return (m.poses && m.poses[pose]) || m.img;
}

// Render a mascot figure into `el` as an art slot (emoji fallback until the
// PNG loads). Use this the first time you populate a figure container.
export function renderMascot(el, pose = 'idle', id = 'rimau') {
  if (!el) return;
  const m = getMascot(id);
  el.innerHTML = assetImg(mascotPose(pose, id), m.emoji, { alt: m.name });
}

// Swap an already-rendered figure to a different pose without a reload flash —
// just changes the <img> src. Falls back to a full render if not yet built.
export function setMascotPose(el, pose = 'idle', id = 'rimau') {
  if (!el) return;
  const img = el.querySelector('.img-slot__img');
  if (img) img.src = mascotPose(pose, id);
  else renderMascot(el, pose, id);
}
