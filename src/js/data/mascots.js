/* mascots.js — the single mascot, with art slots + emoji fallback */

// Rimau (tiger cub) guides the whole app. Poses: idle / happy / cheer / wave;
// `emoji` is the fallback until the art loads.

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
      wave:  '../assets/characters/rimau_wave.png',
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

// Render a mascot figure into `el` as an art slot (first time you populate it).
export function renderMascot(el, pose = 'idle', id = 'rimau') {
  if (!el) return;
  const m = getMascot(id);
  el.innerHTML = assetImg(mascotPose(pose, id), m.emoji, { alt: m.name });
}

// Swap an already-rendered figure to a different pose (just changes the <img> src).
export function setMascotPose(el, pose = 'idle', id = 'rimau') {
  if (!el) return;
  const img = el.querySelector('.img-slot__img');
  if (img) img.src = mascotPose(pose, id);
  else renderMascot(el, pose, id);
}
