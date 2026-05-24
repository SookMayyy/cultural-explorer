// js/pages/teacherPage.js — Teacher dashboard

import { navigate, renderTopbar } from '../app.js';
import Storage from '../utils/storage.js';
import { STATES_DATA } from '../data/states.js';

// Demo data — replaced by real API in Phase 2
const DEMO_CLASS = {
  pin:      '123456',
  name:     'Year 5 Bestari',
  students: [
    { name: 'Ahmad Rifqi',   stamps: ['penang','melaka','selangor'], points: 130 },
    { name: 'Siti Nurul',    stamps: ['penang','kelantan'],          points: 80  },
    { name: 'Raj Kumar',     stamps: ['penang','melaka','johor','selangor'], points: 170 },
    { name: 'Priya Devi',    stamps: ['penang'],                     points: 40  },
    { name: 'Hafiz Izzat',   stamps: ['penang','melaka'],            points: 90  },
    { name: 'Mei Ling',      stamps: [],                             points: 10  },
  ],
};

const TeacherPage = {
  render(screen) {
    renderTopbar({ title: 'Teacher Dashboard', showBack: true, backTarget: 'login' });

    const stateCompletionPct = STATES_DATA.map(state => {
      const done = DEMO_CLASS.students.filter(s => s.stamps.includes(state.id)).length;
      return { state, pct: Math.round((done / DEMO_CLASS.students.length) * 100) };
    });

    screen.innerHTML = `
      <div class="teacher-screen">

        <!-- Hero -->
        <div class="teacher-hero">
          <div class="teacher-hero-content">
            <span class="teacher-icon">🏫</span>
            <div>
              <h2 class="teacher-class-name">${DEMO_CLASS.name}</h2>
              <p class="teacher-subtitle">${DEMO_CLASS.students.length} students</p>
            </div>
          </div>
          <div class="demo-warning">
            ⚠️ Demo data — connect backend for live data
          </div>
        </div>

        <!-- Class PIN -->
        <div class="class-pin-card card">
          <div class="pin-card-top">
            <span class="pin-card-label">Class PIN</span>
            <button class="pin-copy-btn" id="copy-pin">📋 Copy</button>
          </div>
          <div class="pin-display" id="class-pin-display">${DEMO_CLASS.pin}</div>
          <p class="pin-hint">Share this PIN with students to join your class</p>
        </div>

        <!-- Class overview stats -->
        <div class="teacher-stats-row">
          <div class="teacher-stat">
            <span class="tstat-val">${DEMO_CLASS.students.length}</span>
            <span class="tstat-label">Students</span>
          </div>
          <div class="teacher-stat">
            <span class="tstat-val">${Math.round(DEMO_CLASS.students.reduce((a,s) => a + s.points, 0) / DEMO_CLASS.students.length)}</span>
            <span class="tstat-label">Avg. Points</span>
          </div>
          <div class="teacher-stat">
            <span class="tstat-val">${Math.round(DEMO_CLASS.students.reduce((a,s) => a + s.stamps.length, 0) / DEMO_CLASS.students.length * 10) / 10}</span>
            <span class="tstat-label">Avg. Stamps</span>
          </div>
        </div>

        <!-- Student roster -->
        <div class="teacher-section">
          <h3 class="teacher-section-heading">Student Roster</h3>
          <div class="roster-table">
            <div class="roster-header">
              <span>Name</span>
              <span>Stamps</span>
              <span>Points</span>
            </div>
            ${DEMO_CLASS.students.map(student => `
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
            `).join('')}
          </div>
        </div>

        <!-- State completion breakdown -->
        <div class="teacher-section">
          <h3 class="teacher-section-heading">State Completion</h3>
          ${stateCompletionPct.map(({state, pct}) => `
          <div class="state-agg-row">
            <span class="state-agg-emoji">${state.emoji}</span>
            <span class="state-agg-name">${state.name}</span>
            <div class="progress-track state-agg-bar">
              <div class="progress-fill" style="width:${pct}%; background:${state.color}"></div>
            </div>
            <span class="state-agg-pct">${pct}%</span>
          </div>
          `).join('')}
        </div>

        <!-- Export -->
        <div class="teacher-section">
          <button class="btn-primary teacher-export-btn" id="teacher-export">
            📥 Export Report (CSV)
          </button>
          <button class="btn-ghost" id="teacher-logout">Log out</button>
        </div>

      </div>
    `;
  },

  init(screen) {
    screen.querySelector('#copy-pin')?.addEventListener('click', () => {
      const pin = DEMO_CLASS.pin;
      navigator.clipboard?.writeText(pin).then(() => {
        const btn = screen.querySelector('#copy-pin');
        if (btn) { btn.textContent = '✅ Copied!'; setTimeout(() => btn.textContent = '📋 Copy', 2000); }
      });
    });

    screen.querySelector('#teacher-export')?.addEventListener('click', () => {
      const rows = [
        ['Name', 'Stamps', 'Points'],
        ...DEMO_CLASS.students.map(s => [s.name, s.stamps.length, s.points]),
      ];
      const csv  = rows.map(r => r.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url; a.download = 'class-report.csv'; a.click();
      URL.revokeObjectURL(url);
    });

    screen.querySelector('#teacher-logout')?.addEventListener('click', () => {
      Storage.clearSession();
      navigate('home');
    });
  },
};

export default TeacherPage;
