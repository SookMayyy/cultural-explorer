// js/router.js
// Simple SPA router — shows/hides screens and delegates rendering to views

const Router = (() => {
    let current = null;
  
    const VIEWS = {
      home:      HomeView,
      map:       MapView,
      narrative: NarrativeView,
      quiz:      QuizView,
      guess:     GuessView,
      stampbook: StampBookView,
      reward:    RewardView,
      dashboard: DashboardView
    };
  
    function go(screenId, params = {}) {
      // Hide all screens
      document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  
      const screen = document.getElementById('screen-' + screenId);
      if (!screen) { console.warn('Unknown screen:', screenId); return; }
  
      const view = VIEWS[screenId];
      if (view) view.render(screen, params);
  
      screen.classList.add('active');
      current = screenId;
  
      // Wire all [data-nav] buttons inside this screen
      screen.querySelectorAll('[data-nav]').forEach(btn => {
        btn.addEventListener('click', () => {
          const target = btn.dataset.nav;
          const stateParam = btn.dataset.state || null;
          go(target, stateParam ? { stateId: stateParam } : {});
        });
      });
    }
  
    function getCurrent() { return current; }
  
    return { go, getCurrent };
  })();