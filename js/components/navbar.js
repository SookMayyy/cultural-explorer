// js/components/navbar.js

const Navbar = {
  items: [
    { id: 'home',      icon: '🏠', label: 'Home'      },
    { id: 'map',       icon: '🗺️', label: 'Map'       },
    { id: 'stampbook', icon: '📚', label: 'Stamps'    },
    { id: 'quiz',      icon: '❓', label: 'Quiz'      },
    { id: 'guess',     icon: '🎯', label: 'Guess!'    },
    { id: 'dashboard', icon: '📊', label: 'Dashboard' }
  ],

  render(activeId) {
    return `
      <nav class="navbar">
        ${this.items.map(item => `
          <button class="navbar__btn ${item.id === activeId ? 'active' : ''}" data-nav="${item.id}">
            <span class="navbar__icon">${item.icon}</span>
            ${item.label}
          </button>`).join('')}
      </nav>`;
  }
};