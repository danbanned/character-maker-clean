// server.js
const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { PrismaClient } = require('@prisma/client');
const path = require('path');
const avatarRenderer = require('./helpers/avatarRenderer');
const prisma = new PrismaClient();
const app = express();

const expressLayouts = require('express-ejs-layouts');

app.set('view engine', 'ejs');
app.use(expressLayouts);
app.set('layout', 'layout'); // uses views/layout.ejs


// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.use(session({
  secret: 'character-maker-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

app.use(flash());

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.messages = req.flash();
  next();
});

// Set view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));



// Auth middleware
const isAuthenticated = (req, res, next) => {
  if (req.session.userId) {
    next();
  } else {
    res.redirect('/login');
  }
};

const isAdmin = (req, res, next) => {
  if (req.session.role === 'ADMIN') {
    next();
  } else {
    res.status(403).send('Access denied');
  }
};

app.use((req, res, next) => {
  res.locals.avatarRenderer = avatarRenderer;
  next();
});

const rateLimit = require('express-rate-limit');

// Limit login attempts: max 5 per 15 minutes
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { error: 'Too many login attempts, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Limit password reset requests: max 3 per hour
const forgotLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3,
  message: { error: 'Too many password reset requests, try again later' },
});

// Routes
app.get('/', (req, res) => {
  res.render('index', { user: req.session.user });
});

app.get('/login', (req, res) => {
  res.render('login', { messages: req.flash() });
});

app.post('/login', 
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  async (req, res) => {
    console.log('LOGIN POST HIT');
    console.log(req.body);
    const errors = validationResult(req);

   if (!errors.isEmpty()) {
  req.flash('error', 'Invalid email or password');
  return res.redirect('/dashboard');
}

    try {
      const user = await prisma.user.findUnique({
        where: { email: req.body.email }
      });

      if (!user) {
        req.flash('error', 'Invalid credentials');
        return res.redirect('/login');
      }

      const validPassword = await bcrypt.compare(req.body.password, user.password);
      if (!validPassword) {
        req.flash('error', 'Invalid credentials');
        return res.redirect('/login');
      }

      req.session.userId = user.id;
      req.session.email = user.email;
      req.session.role = user.role;
      req.session.user = { id: user.id, email: user.email, role: user.role };

      res.redirect('/dashboard');
    } catch (error) {
      console.error(error);
      res.status(500).send('Server error');
    }
});
app.get('/register', (req, res) => {
  res.render('register', { messages: req.flash() });
});

app.post(
  '/register',
  body('email')
    .isEmail()
    .normalizeEmail(),

  body('password')
    .isLength({ min: 8 }).withMessage('must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('must contain an uppercase letter')
    .matches(/[a-z]/).withMessage('must contain a lowercase letter')
    .matches(/\d/).withMessage('must contain a number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('must contain a special character'),

  async (req, res) => {
    const errors = validationResult(req);

    // 1️⃣ Input validation (cheap → first)
    if (!errors.isEmpty()) {
      return res.status(400).render('register', {
        errors: errors.array(),
      });
    }

    const { email, password } = req.body;

    try {
      // 2️⃣ Business rule: unique email
      const existingUser = await prisma.user.findUnique({
        where: { email },
      });

      if (existingUser) {
        req.flash('error', 'Email already registered');
        return res.redirect('/register');
      }

      // 3️⃣ Security: hash ONLY the raw password
      const hashedPassword = await bcrypt.hash(password, 10);

      // 4️⃣ Persistence
      await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          role: 'USER', // roles should never be inferred from user input
        },
      });

      // 5️⃣ UX response
      req.flash('success', 'Registration successful! Please login.');
      res.redirect('/login');

    } catch (error) {
      console.error(error);
      res.status(500).send('Server error');
    }
  }
);


// Add to server.js
app.post('/character/update-stats', isAuthenticated, async (req, res) => {
  try {
    const character = await prisma.character.update({
      where: { 
        id: req.body.characterId,
        userId: req.session.userId 
      },
      data: {
        strength: req.body.stats.strength,
        dexterity: req.body.stats.dexterity,
        constitution: req.body.stats.constitution,
        intelligence: req.body.stats.intelligence,
        wisdom: req.body.stats.wisdom,
        charisma: req.body.stats.charisma,
        aiNotes: req.body.aiNotes
      }
    });

    res.json({ success: true, character });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/dashboard', isAuthenticated, async (req, res) => {
  try {


    const characters = await prisma.character.findMany({
      where: { userId: req.session.userId },
      orderBy: { createdAt: 'desc' }
    });

    // 2. Get all characters for the global leaderboard
    const allCharacters = await prisma.character.findMany({
      include: { user: { select: { email: true } } } // optional, if you need owner info
    });

    // 3. Compute a score for each character
    const scored = allCharacters.map(char => {
      const statsTotal = 
        (char.strength || 0) +
        (char.dexterity || 0) +
        (char.constitution || 0) +
        (char.intelligence || 0) +
        (char.wisdom || 0) +
        (char.charisma || 0);
      const score = statsTotal + (char.level || 1) * 10; // example formula
      return { ...char, score };
    });

    // 4. Sort descending and take top 3
    const topCharacters = scored.sort((a, b) => b.score - a.score).slice(0, 3);



    res.render('dashboard', { 
      user: req.session.user, 
      characters: characters,   // <-- existing user characters
      topCharacters: topCharacters,   // <-- new data for podium
      messages: req.flash() 
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

app.get('/character/create', isAuthenticated, (req, res) => {
  res.render('character-create', { 
    user: req.session.user,
    messages: req.flash() 
  });
});

// Simulated AI Features
const simulateAI = {
  generateBackstory: (character) => {
    const races = {
      'Human': 'adaptable and versatile',
      'Elf': 'graceful and long-lived',
      'Dwarf': 'sturdy and traditional',
      'Halfling': 'lucky and cheerful',
      'Orc': 'strong and tribal'
    };
    
    const classes = {
      'Warrior': 'mighty warrior',
      'Mage': 'wise spellcaster',
      'Rogue': 'stealthy trickster',
      'Cleric': 'devout healer',
      'Ranger': 'nature-bound hunter'
    };

    const traits = [
      'brave and determined',
      'mysterious past',
      'seeking redemption',
      'on a great quest',
      'hiding a secret',
      'blessed by fate',
      'cursed by magic'
    ];

    const randomTrait = traits[Math.floor(Math.random() * traits.length)];
    
    return `${character.name} is a ${races[character.race] || 'unique'} ${character.race} who became a ${classes[character.class] || 'skilled'} ${character.class}. Known to be ${randomTrait}, they embark on adventures across the land.`;
  },

  suggestName: (race, charClass) => {
    const nameSuggestions = {
      'Human': ['Aric', 'Bryn', 'Cael', 'Dane', 'Eris'],
      'Elf': ['Elara', 'Faelen', 'Galad', 'Ithil', 'Lorien'],
      'Dwarf': ['Borin', 'Durin', 'Gimli', 'Thrain', 'Ulfgar'],
      'Halfling': ['Bilbo', 'Frodo', 'Pippin', 'Samwise', 'Merry'],
      'Orc': ['Grom', 'Karg', 'Mog', 'Thrak', 'Urzog']
    };

    const raceNames = nameSuggestions[race] || ['Unknown'];
    return raceNames[Math.floor(Math.random() * raceNames.length)];
  },

  analyzeStats: (stats) => {
    const total = Object.values(stats).reduce((a, b) => a + b, 0);
    if (total > 80) return 'Exceptional potential';
    if (total > 65) return 'Above average abilities';
    if (total > 50) return 'Average capabilities';
    return 'Could use improvement';
  }
};

app.post('/character/create', isAuthenticated, async (req, res) => {
  try {
    const character = await prisma.character.create({
      data: {
        name: req.body.name,
        race: req.body.race,
        class: req.body.class,
        level: parseInt(req.body.level) || 1,
        strength: parseInt(req.body.strength) || 10,
        dexterity: parseInt(req.body.dexterity) || 10,
        constitution: parseInt(req.body.constitution) || 10,
        intelligence: parseInt(req.body.intelligence) || 10,
        wisdom: parseInt(req.body.wisdom) || 10,
        charisma: parseInt(req.body.charisma) || 10,
        // Appearance fields
        skinColor: req.body.skinColor || "#fdd5b1",
        hairColor: req.body.hairColor || "#3d2817",
        hairStyle: req.body.hairStyle || "short",
        eyeColor: req.body.eyeColor || "#4a90e2",
        bodyType: req.body.bodyType || "average",
        armor: req.body.armor || "leather",
        armorColor: req.body.armorColor || "#8b4513",
        weapon: req.body.weapon || "sword",
        accessory: req.body.accessory || "none",
        userId: req.session.userId
      }
    });

    req.flash('success', 'Character created successfully!');
    res.redirect('/dashboard');
  } catch (error) {
    console.error(error);
    req.flash('error', 'Error creating character');
    res.redirect('/character/create');
  }
});


// Add new route for randomizing appearance
app.post('/character/randomize-appearance', isAuthenticated, (req, res) => {
  const skinColors = ['#fdd5b1', '#f1c27d', '#e0ac69', '#c68642', '#8d5524'];
  const hairColors = ['#000000', '#3d2817', '#8b4513', '#daa520', '#ffffff'];
  const hairStyles = ['short', 'long', 'bald', 'mohawk'];
  const eyeColors = ['#4a90e2', '#2ecc71', '#8b4513', '#95a5a6'];
  const bodyTypes = ['slim', 'average', 'muscular'];
  const armors = ['leather', 'plate', 'robe', 'chain'];
  const armorColors = ['#8b4513', '#4a4a4a', '#2c3e50', '#c0392b'];
  const weapons = ['sword', 'axe', 'staff', 'bow'];
  const accessories = ['none', 'cape', 'crown', 'scarf'];

  const randomAppearance = {
    skinColor: skinColors[Math.floor(Math.random() * skinColors.length)],
    hairColor: hairColors[Math.floor(Math.random() * hairColors.length)],
    hairStyle: hairStyles[Math.floor(Math.random() * hairStyles.length)],
    eyeColor: eyeColors[Math.floor(Math.random() * eyeColors.length)],
    bodyType: bodyTypes[Math.floor(Math.random() * bodyTypes.length)],
    armor: armors[Math.floor(Math.random() * armors.length)],
    armorColor: armorColors[Math.floor(Math.random() * armorColors.length)],
    weapon: weapons[Math.floor(Math.random() * weapons.length)],
    accessory: accessories[Math.floor(Math.random() * accessories.length)]
  };

  res.json(randomAppearance);
});


// AI Features Endpoints
app.post('/ai/generate-backstory', isAuthenticated, async (req, res) => {
  try {
    const { characterId } = req.body;
    if (!characterId) {
      return res.status(400).json({ error: 'characterId is required' });
    }

    const character = await prisma.character.findUnique({
      where: { id: characterId, userId: req.session.userId }
    });

    if (!character) {
      return res.status(404).json({ error: 'Character not found' });
    }

    const backstory = simulateAI.generateBackstory(character);

    await prisma.character.update({
      where: { id: character.id },
      data: {
        backstory,
        aiNotes: `AI-generated on ${new Date().toLocaleDateString()}`
      }
    });

    res.json({ success: true, backstory });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.post('/ai/suggest-name', isAuthenticated, (req, res) => {
  const { race, charClass } = req.body;
  const name = simulateAI.suggestName(race, charClass);
  res.json({ success: true, name });
});

app.get('/character/:id', isAuthenticated, async (req, res) => {
  try {
    const character = await prisma.character.findFirst({
      where: { 
        id: req.params.id,
        userId: req.session.userId 
      }
    });

    if (!character) {
      req.flash('error', 'Character not found');
      return res.redirect('/dashboard');
    }

    // Simulate AI analysis
    const stats = {
      strength: character.strength,
      dexterity: character.dexterity,
      constitution: character.constitution,
      intelligence: character.intelligence,
      wisdom: character.wisdom,
      charisma: character.charisma
    };
    
    const aiAnalysis = simulateAI.analyzeStats(stats);

    res.render('character-view', {
      user: req.session.user,
      character,
      aiAnalysis
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

app.get('/admin', isAuthenticated, isAdmin, async (req, res) => {
  try {
    const allCharacters = await prisma.character.findMany({
      include: { user: { select: { email: true } } },
      orderBy: { createdAt: 'desc' }
    });

    const users = await prisma.user.findMany({
      select: { id: true, email: true, role: true, createdAt: true }
    });

    res.render('admin', {
      user: req.session.user,
      characters: allCharacters,
      users,
      messages: req.flash()
    });
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});