// Update public/js/avatarRenderer.js - Add animation support

getSVGDefs: () => {
  return `
    <defs>
      <linearGradient id="spellGradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#9b59b6;stop-opacity:0.7" />
        <stop offset="100%" style="stop-color:#3498db;stop-opacity:0.3" />
      </linearGradient>
      <radialGradient id="glowGradient" cx="50%" cy="50%" r="50%">
        <stop offset="0%" style="stop-color:#ffeb3b;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#ff9800;stop-opacity:0" />
      </radialGradient>
    </defs>
  `;
}

const avatarRenderer = {
  generateSVG: (character, size = 300, options = {}) => {
    const { animated = true, animationType = 'idle' } = options;
    const appearance = character.appearance || character;
    
    const skinColor = appearance.skinColor || '#fdd5b1';
    const hairColor = appearance.hairColor || '#3d2817';
    const hairStyle = appearance.hairStyle || 'short';
    const eyeColor = appearance.eyeColor || '#4a90e2';
    const bodyType = appearance.bodyType || 'average';
    const armor = appearance.armor || 'leather';
    const armorColor = appearance.armorColor || '#8b4513';
    const weapon = appearance.weapon || 'sword';
    const accessory = appearance.accessory || 'none';

    const scale = size / 300;
    const isAnimated = animated;
    const animationClass = isAnimated ? 'character-animated' : '';

    return `
      <svg width="${size}" height="${size}" viewBox="0 0 300 300" style="border: 3px solid #667eea; border-radius: 10px; background: #e8f4f8;" class="${animationClass}">
        ${avatarRenderer.getAccessoryBackground(accessory, armorColor, isAnimated)}
        ${avatarRenderer.getBody(armor, armorColor, bodyType, isAnimated)}
        ${avatarRenderer.getArms(skinColor)}
        ${avatarRenderer.getLegs()}
        ${avatarRenderer.getHead(skinColor, hairColor, hairStyle, eyeColor, isAnimated)}
        ${avatarRenderer.getWeapon(weapon, isAnimated)}
        ${avatarRenderer.getAccessoryForeground(accessory, isAnimated)}
        ${avatarRenderer.getAnimationEffects(character, animationType)}
      </svg>
    `;
  },

  getAccessoryBackground: (accessory, armorColor, isAnimated) => {
    if (accessory === 'cape') {
      const animationClass = isAnimated ? 'cape-animated' : '';
      return `
        <path class="${animationClass}" d="M 120 140 Q 80 180 90 250 L 110 250 Q 110 170 150 150 Q 190 170 190 250 L 210 250 Q 220 180 180 140"
          fill="${armorColor}" opacity="0.7" />
      `;
    }
    return '';
  },

  getBody: (armor, armorColor, bodyType, isAnimated) => {
    let bodyWidth = 80;
    let bodyHeight = 90;
    
    if (bodyType === 'slim') {
      bodyWidth = 70;
      bodyHeight = 85;
    } else if (bodyType === 'muscular') {
      bodyWidth = 90;
      bodyHeight = 100;
    }
    
    const x = 150 - (bodyWidth / 2);
    const y = 150;

    switch(armor) {
      case 'plate':
        return `
          <rect x="${x}" y="${y}" width="${bodyWidth}" height="${bodyHeight}" fill="${armorColor}" rx="5" />
          <circle cx="${x + 20}" cy="${y + 15}" r="3" fill="#888" />
          <circle cx="${x + 40}" cy="${y + 15}" r="3" fill="#888" />
          <circle cx="${x + 60}" cy="${y + 15}" r="3" fill="#888" />
          <rect x="${x + 35}" y="${y + 30}" width="10" height="40" fill="#666" />
        `;
      case 'leather':
        return `
          <rect x="${x}" y="${y}" width="${bodyWidth}" height="${bodyHeight}" fill="${armorColor}" rx="10" />
          <path d="M ${x + 10} ${y + 10} L ${x + bodyWidth - 10} ${y + 10} M ${x + 10} ${y + 30} L ${x + bodyWidth - 10} ${y + 30} M ${x + 10} ${y + 50} L ${x + bodyWidth - 10} ${y + 50}" 
            stroke="#5d4037" stroke-width="2" opacity="0.3" />
        `;
      case 'robe':
        const spellClass = isAnimated ? 'spell-animated' : '';
        return `
          <path d="M ${x} ${y} L ${x - 20} ${y + 90} L ${x + 20} ${y + 90} L ${x + 40} ${y + 10} L ${x + 80} ${y + 90} L ${x + 100} ${y + 90} L ${x + 80} ${y} Z"
            fill="${armorColor}" />
          <rect x="${x + 20}" y="${y}" width="${bodyWidth - 40}" height="10" fill="#f4d03f" />
          ${isAnimated ? `<circle class="${spellClass}" cx="${x + 40}" cy="${y + 40}" r="20" fill="url(#spellGradient)" opacity="0.3" />` : ''}
        `;
      case 'chain':
        return `
          <rect x="${x}" y="${y}" width="${bodyWidth}" height="${bodyHeight}" fill="${armorColor}" />
          ${[...Array(8)].map((_, i) => 
            [...Array(6)].map((_, j) => 
              `<circle cx="${x + 10 + j * 12}" cy="${y + 10 + i * 11}" r="3" fill="none" stroke="#888" stroke-width="1" />`
            ).join('')
          ).join('')}
        `;
      default:
        return `<rect x="${x}" y="${y}" width="${bodyWidth}" height="${bodyHeight}" fill="${armorColor}" rx="10" />`;
    }
  },

  getArms: (skinColor) => {
    return `
      <rect x="85" y="155" width="25" height="70" fill="${skinColor}" rx="8" />
      <rect x="190" y="155" width="25" height="70" fill="${skinColor}" rx="8" />
    `;
  },

  getLegs: () => {
    return `
      <rect x="120" y="240" width="30" height="50" fill="#3e2723" rx="5" />
      <rect x="150" y="240" width="30" height="50" fill="#3e2723" rx="5" />
    `;
  },

  getHead: (skinColor, hairColor, hairStyle, eyeColor, isAnimated) => {
    let hair = '';
    const hairAnimation = hairStyle === 'long' && isAnimated ? 'long-hair-animated' : '';
    
    switch(hairStyle) {
      case 'short':
        hair = `<ellipse class="${hairAnimation}" cx="150" cy="85" rx="42" ry="30" fill="${hairColor}" />`;
        break;
      case 'long':
        hair = `
          <ellipse class="${hairAnimation}" cx="150" cy="85" rx="42" ry="30" fill="${hairColor}" />
          <rect class="${hairAnimation}" x="108" y="100" width="84" height="60" fill="${hairColor}" rx="10" />
        `;
        break;
      case 'mohawk':
        hair = `<rect x="140" y="60" width="20" height="40" fill="${hairColor}" />`;
        break;
      default:
        // bald - no hair
    }

    const eyeAnimation = isAnimated ? 'eye-animated' : '';

    return `
      <ellipse cx="150" cy="110" rx="40" ry="45" fill="${skinColor}" />
      ${hair}
      <g class="${eyeAnimation}">
        <circle cx="135" cy="110" r="5" fill="${eyeColor}" />
        <circle cx="165" cy="110" r="5" fill="${eyeColor}" />
      </g>
      <circle cx="137" cy="109" r="2" fill="black" />
      <circle cx="167" cy="109" r="2" fill="black" />
      <path d="M 140 125 Q 150 130 160 125" stroke="#000" stroke-width="2" fill="none" />
    `;
  },

  getWeapon: (weapon, isAnimated) => {
    const weaponAnimation = isAnimated ? 'weapon-animated' : '';
    
    switch(weapon) {
      case 'sword':
        return `
          <g class="${weaponAnimation}">
            <rect x="70" y="180" width="8" height="60" fill="#c0c0c0" rx="1" />
            <rect x="66" y="175" width="16" height="8" fill="#8b4513" rx="2" />
          </g>
        `;
      case 'axe':
        return `
          <g class="${weaponAnimation}">
            <rect x="70" y="200" width="8" height="50" fill="#8b4513" rx="1" />
            <path d="M 62 190 L 80 190 L 85 205 L 75 210 L 62 205 Z" fill="#666" />
          </g>
        `;
      case 'staff':
        return `
          <g class="${weaponAnimation}">
            <rect x="72" y="160" width="6" height="90" fill="#8b4513" rx="2" />
            <circle class="${isAnimated ? 'spell-animated' : ''}" cx="75" cy="155" r="8" fill="#9b59b6" />
          </g>
        `;
      case 'bow':
        return `
          <g class="${weaponAnimation}">
            <path d="M 70 180 Q 65 210 70 240" stroke="#8b4513" stroke-width="4" fill="none" />
            <line x1="70" y1="185" x2="70" y2="235" stroke="#ddd" stroke-width="1" />
            <path d="M 68 210 L 85 210" stroke="#8b4513" stroke-width="2" />
          </g>
        `;
      default:
        return '';
    }
  },

  getAccessoryForeground: (accessory, isAnimated) => {
    if (accessory === 'crown') {
      return `
        <path d="M 120 75 L 125 85 L 135 80 L 150 85 L 165 80 L 175 85 L 180 75 L 180 90 L 120 90 Z"
          fill="#f4d03f" stroke="#d4af37" stroke-width="2" />
        <circle cx="135" cy="78" r="3" fill="#e74c3c" />
        <circle cx="150" cy="78" r="3" fill="#e74c3c" />
        <circle cx="165" cy="78" r="3" fill="#e74c3c" />
      `;
    }
    if (accessory === 'scarf') {
      const scarfAnimation = isAnimated ? 'cape-animated' : '';
      return `
        <g class="${scarfAnimation}">
          <rect x="130" y="140" width="40" height="15" fill="#e74c3c" rx="3" />
          <path d="M 170 147 L 185 160 L 180 170 L 175 165" fill="#e74c3c" />
        </g>
      `;
    }
    return '';
  },

  getAnimationEffects: (character, animationType) => {
    if (animationType === 'attack') {
      return `
        <defs>
          <linearGradient id="sparkleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#ffeb3b;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#ff9800;stop-opacity:0" />
          </linearGradient>
        </defs>
        ${[...Array(5)].map((_, i) => `
          <circle class="sparkle" cx="${Math.random() * 300}" cy="${Math.random() * 300}" r="${Math.random() * 5 + 2}" 
                  fill="url(#sparkleGradient)" style="animation-delay: ${i * 0.1}s;" />
        `).join('')}
      `;
    }
    return '';
  },

  // New method to trigger specific animations
  triggerAnimation: (containerId, animationType) => {
    const container = document.getElementById(containerId);
    if (!container) return;

    const svg = container.querySelector('svg');
    if (!svg) return;

    // Add animation class
    svg.classList.add(`${animationType}-animation`);

    // Remove after animation completes
    setTimeout(() => {
      svg.classList.remove(`${animationType}-animation`);
    }, 1000);
  },

  // Method to create animation controls
  createAnimationControls: (containerId) => {
    return `
      <div class="animation-controls">
        <button class="animation-btn" onclick="toggleAnimations('${containerId}')">
          🎭 Toggle Animations
        </button>
        <div style="display: flex; gap: 5px; margin-top: 10px;">
          <button class="btn" onclick="triggerAnimation('${containerId}', 'attack')" style="padding: 5px 10px; font-size: 12px;">
            ⚔️ Attack
          </button>
          <button class="btn" onclick="triggerAnimation('${containerId}', 'cast')" style="padding: 5px 10px; font-size: 12px;">
            ✨ Cast
          </button>
          <button class="btn" onclick="triggerAnimation('${containerId}', 'victory')" style="padding: 5px 10px; font-size: 12px;">
            🎉 Victory
          </button>
        </div>
      </div>
    `;
  }
};

// Make it available globally
window.avatarRenderer = avatarRenderer;

// Animation control functions
window.toggleAnimations = (containerId) => {
  const container = document.getElementById(containerId);
  if (!container) return;

  const svg = container.querySelector('svg');
  if (!svg) return;

  const btn = document.querySelector('.animation-btn');
  
  if (svg.classList.contains('character-animated')) {
    svg.classList.remove('character-animated');
    svg.querySelectorAll('.eye-animated, .weapon-animated, .cape-animated, .long-hair-animated, .spell-animated').forEach(el => {
      el.style.animationPlayState = 'paused';
    });
    btn.classList.remove('running');
    btn.classList.add('paused');
  } else {
    svg.classList.add('character-animated');
    svg.querySelectorAll('.eye-animated, .weapon-animated, .cape-animated, .long-hair-animated, .spell-animated').forEach(el => {
      el.style.animationPlayState = 'running';
    });
    btn.classList.remove('paused');
    btn.classList.add('running');
  }
};

window.triggerAnimation = (containerId, animationType) => {
  const container = document.getElementById(containerId);
  if (!container) return;

  const svg = container.querySelector('svg');
  if (!svg) return;

  switch(animationType) {
    case 'attack':
      svg.classList.add('attack-swing');
      // Create attack effects
      for (let i = 0; i < 3; i++) {
        setTimeout(() => {
          createSparkle(svg, Math.random() * 300, Math.random() * 300);
        }, i * 100);
      }
      setTimeout(() => svg.classList.remove('attack-swing'), 500);
      break;
      
    case 'cast':
      svg.classList.add('cast-spell');
      // Create magic circle effect
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', '150');
      circle.setAttribute('cy', '150');
      circle.setAttribute('r', '0');
      circle.setAttribute('fill', 'none');
      circle.setAttribute('stroke', '#9b59b6');
      circle.setAttribute('stroke-width', '3');
      circle.setAttribute('opacity', '0.7');
      svg.appendChild(circle);
      
      // Animate circle
      let radius = 0;
      const interval = setInterval(() => {
        radius += 5;
        circle.setAttribute('r', radius);
        circle.setAttribute('opacity', 0.7 - (radius / 100));
        if (radius > 100) {
          clearInterval(interval);
          svg.removeChild(circle);
        }
      }, 16);
      
      setTimeout(() => svg.classList.remove('cast-spell'), 1000);
      break;
      
    case 'victory':
      svg.classList.add('victory-dance');
      // Create confetti effect
      for (let i = 0; i < 10; i++) {
        setTimeout(() => {
          createSparkle(svg, 150, 50, '#ffeb3b');
        }, i * 100);
      }
      setTimeout(() => svg.classList.remove('victory-dance'), 2000);
      break;
  }
};

function createSparkle(svg, x, y, color = '#ffeb3b') {
  const sparkle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  sparkle.setAttribute('cx', x);
  sparkle.setAttribute('cy', y);
  sparkle.setAttribute('r', '5');
  sparkle.setAttribute('fill', color);
  sparkle.setAttribute('opacity', '0.8');
  sparkle.classList.add('sparkle');
  svg.appendChild(sparkle);
  
  // Remove sparkle after animation
  setTimeout(() => {
    if (sparkle.parentNode) {
      sparkle.parentNode.removeChild(sparkle);
    }
  }, 1000);
}