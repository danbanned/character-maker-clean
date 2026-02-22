// Create a new file: helpers/avatarRenderer.js
const avatarRenderer = {
  generateSVG: (character, size = 300) => {
    const appearance = {
      skinColor: character.skinColor || '#fdd5b1',
      hairColor: character.hairColor || '#3d2817',
      hairStyle: character.hairStyle || 'short',
      eyeColor: character.eyeColor || '#4a90e2',
      bodyType: character.bodyType || 'average',
      armor: character.armor || 'leather',
      armorColor: character.armorColor || '#8b4513',
      weapon: character.weapon || 'sword',
      accessory: character.accessory || 'none'
    };

    return `
      <svg width="${size}" height="${size}" viewBox="0 0 300 300" style="border: 3px solid #667eea; border-radius: 10px; background: #e8f4f8;">
        ${avatarRenderer.getAccessoryBackground(appearance)}
        ${avatarRenderer.getBody(appearance)}
        ${avatarRenderer.getArms(appearance)}
        ${avatarRenderer.getLegs()}
        ${avatarRenderer.getHead(appearance)}
        ${avatarRenderer.getWeapon(appearance)}
        ${avatarRenderer.getAccessoryForeground(appearance)}
      </svg>
    `;
  },

  getAccessoryBackground: (app) => {
    if (app.accessory === 'cape') {
      return `
        <path d="M 120 140 Q 80 180 90 250 L 110 250 Q 110 170 150 150 Q 190 170 190 250 L 210 250 Q 220 180 180 140"
          fill="${app.armorColor}" opacity="0.7" />
      `;
    }
    return '';
  },

  getBody: (app) => {
    let body = '';
    switch(app.armor) {
      case 'plate':
        body = `
          <rect x="110" y="150" width="80" height="90" fill="${app.armorColor}" rx="5" />
          <circle cx="130" cy="165" r="3" fill="#888" />
          <circle cx="150" cy="165" r="3" fill="#888" />
          <circle cx="170" cy="165" r="3" fill="#888" />
          <rect x="145" y="180" width="10" height="40" fill="#666" />
        `;
        break;
      case 'leather':
        body = `
          <rect x="110" y="150" width="80" height="90" fill="${app.armorColor}" rx="10" />
          <path d="M 120 160 L 180 160 M 120 180 L 180 180 M 120 200 L 180 200" 
            stroke="#5d4037" strokeWidth="2" opacity="0.3" />
        `;
        break;
      case 'robe':
        body = `
          <path d="M 110 150 L 90 240 L 120 240 L 150 160 L 180 240 L 210 240 L 190 150 Z"
            fill="${app.armorColor}" />
          <rect x="130" y="150" width="40" height="10" fill="#f4d03f" />
        `;
        break;
      case 'chain':
        body = `
          <rect x="110" y="150" width="80" height="90" fill="${app.armorColor}" />
          ${[...Array(8)].map((_, i) => 
            [...Array(6)].map((_, j) => 
              `<circle cx="${120 + j * 12}" cy="${160 + i * 11}" r="3" fill="none" stroke="#888" stroke-width="1" />`
            ).join('')
          ).join('')}
        `;
        break;
      default:
        body = `<rect x="110" y="150" width="80" height="90" fill="${app.armorColor}" rx="10" />`;
    }
    return body;
  },

  getArms: (app) => {
    return `
      <rect x="85" y="155" width="25" height="70" fill="${app.skinColor}" rx="8" />
      <rect x="190" y="155" width="25" height="70" fill="${app.skinColor}" rx="8" />
    `;
  },

  getLegs: () => {
    return `
      <rect x="120" y="240" width="30" height="50" fill="#3e2723" rx="5" />
      <rect x="150" y="240" width="30" height="50" fill="#3e2723" rx="5" />
    `;
  },

  getHead: (app) => {
    let hair = '';
    switch(app.hairStyle) {
      case 'short':
        hair = `<ellipse cx="150" cy="85" rx="42" ry="30" fill="${app.hairColor}" />`;
        break;
      case 'long':
        hair = `
          <ellipse cx="150" cy="85" rx="42" ry="30" fill="${app.hairColor}" />
          <rect x="108" y="100" width="84" height="60" fill="${app.hairColor}" rx="10" />
        `;
        break;
      case 'mohawk':
        hair = `<rect x="140" y="60" width="20" height="40" fill="${app.hairColor}" />`;
        break;
      default:
        // bald - no hair
    }

    return `
      <ellipse cx="150" cy="110" rx="40" ry="45" fill="${app.skinColor}" />
      ${hair}
      <circle cx="135" cy="110" r="5" fill="${app.eyeColor}" />
      <circle cx="165" cy="110" r="5" fill="${app.eyeColor}" />
      <circle cx="137" cy="109" r="2" fill="black" />
      <circle cx="167" cy="109" r="2" fill="black" />
      <path d="M 140 125 Q 150 130 160 125" stroke="#000" stroke-width="2" fill="none" />
    `;
  },

  getWeapon: (app) => {
    switch(app.weapon) {
      case 'sword':
        return `
          <rect x="70" y="180" width="8" height="60" fill="#c0c0c0" rx="1" />
          <rect x="66" y="175" width="16" height="8" fill="#8b4513" rx="2" />
        `;
      case 'axe':
        return `
          <rect x="70" y="200" width="8" height="50" fill="#8b4513" rx="1" />
          <path d="M 62 190 L 80 190 L 85 205 L 75 210 L 62 205 Z" fill="#666" />
        `;
      case 'staff':
        return `
          <rect x="72" y="160" width="6" height="90" fill="#8b4513" rx="2" />
          <circle cx="75" cy="155" r="8" fill="#9b59b6" />
        `;
      case 'bow':
        return `
          <path d="M 70 180 Q 65 210 70 240" stroke="#8b4513" stroke-width="4" fill="none" />
          <line x1="70" y1="185" x2="70" y2="235" stroke="#ddd" stroke-width="1" />
          <path d="M 68 210 L 85 210" stroke="#8b4513" stroke-width="2" />
        `;
      default:
        return '';
    }
  },

  getAccessoryForeground: (app) => {
    if (app.accessory === 'crown') {
      return `
        <path d="M 120 75 L 125 85 L 135 80 L 150 85 L 165 80 L 175 85 L 180 75 L 180 90 L 120 90 Z"
          fill="#f4d03f" stroke="#d4af37" stroke-width="2" />
        <circle cx="135" cy="78" r="3" fill="#e74c3c" />
        <circle cx="150" cy="78" r="3" fill="#e74c3c" />
        <circle cx="165" cy="78" r="3" fill="#e74c3c" />
      `;
    }
    if (app.accessory === 'scarf') {
      return `
        <rect x="130" y="140" width="40" height="15" fill="#e74c3c" rx="3" />
        <path d="M 170 147 L 185 160 L 180 170 L 175 165" fill="#e74c3c" />
      `;
    }
    return '';
  }
};

module.exports = avatarRenderer;