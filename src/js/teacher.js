// js/teacher.js — teacher dashboard

import Storage from './utils/storage.js';
import { renderTopbar, requireAuth } from './ui.js';
import { STATES_DATA } from './data/states.js';

const session = requireAuth();
if (session && session.type !== 'teacher') window.location.href = 'map.html';

renderTopbar({ title: 'Teacher Dashboard', showBack: true, backHref: 'home.html' });

// Demo data — replaced by real API in Phase 2
const DEMO = {
  pin:      '123456',
  name:     'Year 5 Bestari',
  students: [
    { name: 'Ahmad Rifqi',  stamps: ['penang','selangor','kedah'],            points: 130 },
    { name: 'Siti Nurul',   stamps: ['penang','kelantan'],                    points: 80  },
    { name: 'Raj Kumar',    stamps: ['penang','selangor','kelantan','sabah'], points: 170 },
    { name: 'Priya Devi',   stamps: ['penang'],                              points: 40  },
    { name: 'Hafiz Izzat',  stamps: ['penang','selangor'],                    points: 90  },
    { name: 'Mei Ling',     stamps: [],                                      points: 10  },
  ],
};

// Header
document.getElementById('class-name').textContent  = DEMO.name;
document.getElementById('class-size').textContent  = `${DEMO.students.length} students`;
document.getElementById('class-pin').textContent   = DEMO.pin;

// Stats
const avgPts    = Math.round(DEMO.students.reduce((a,s) => a + s.points, 0) / DEMO.students.length);
const avgStamps = (DEMO.students.reduce((a,s) => a + s.stamps.length, 0) / DEMO.students.length).toFixed(1);
document.getElementById('tstat-students').textContent   = DEMO.students.length;
document.getElementById('tstat-avg-pts').textContent    = avgPts;
document.getElementById('tstat-avg-stamps').textContent = avgStamps;

// Roster
document.getElementById('roster-rows').innerHTML = DEMO.students.map(student => `
  <div class="roster-row">
    <span class="roster-name">${student.name}</span>
    <div class="roster-stamps">
      ${STATES_DATA.map(state => `
        <span class="roster-dot ${student.stamps.includes(state.id) ? 'done' : ''}"
              title="${state.name}"></span>
      `).join('')}
    </div>
    <span class="roster-points">${student.points} ⭐</span>
  </div>
`).join('');

// State completion
document.getElementById('state-agg-list').innerHTML = STATES_DATA.map(state => {
  const done = DEMO.students.filter(s => s.stamps.includes(state.id)).length;
  const pct  = Math.round((done / DEMO.students.length) * 100);
  return `
    <div class="state-agg-row">
      <span class="state-agg-emoji">${state.emoji}</span>
      <span class="state-agg-name">${state.name}</span>
      <div class="progress-track state-agg-bar">
        <div class="progress-fill" style="width:${pct}%; background:${state.color}"></div>
      </div>
      <span class="state-agg-pct">${pct}%</span>
    </div>
  `;
}).join('');

// Copy PIN
document.getElementById('copy-pin')?.addEventListener('click', () => {
  navigator.clipboard?.writeText(DEMO.pin).then(() => {
    const btn = document.getElementById('copy-pin');
    btn.textContent = '✅ Copied!';
    setTimeout(() => btn.textContent = '📋 Copy', 2000);
  });
});

// CSV export
document.getElementById('teacher-export')?.addEventListener('click', () => {
  const rows = [
    ['Name', 'Stamps', 'Points'],
    ...DEMO.students.map(s => [s.name, s.stamps.length, s.points]),
  ];
  const csv  = rows.map(r => r.join(',')).join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a'); a.href = url; a.download = 'class-report.csv'; a.click();
  URL.revokeObjectURL(url);
});

// Logout
document.getElementById('teacher-logout')?.addEventListener('click', () => {
  Storage.clearSession();
  window.location.href = 'home.html';
});
