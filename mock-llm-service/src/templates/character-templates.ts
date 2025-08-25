import { CharacterTemplate } from '../types';

export const characterTemplates: CharacterTemplate[] = [
  {
    id: 'human-fighter',
    race: 'Human',
    class: 'Fighter',
    personality: [
      'Brave and determined, always ready to face danger head-on',
      'Loyal to friends and committed to protecting the innocent',
      'Practical and straightforward, preferring action over words',
      'Disciplined and focused, with a strong sense of duty',
      'Adaptable and resourceful, able to handle any situation'
    ],
    background: [
      'Former soldier who left the army to seek adventure',
      'Guard from a small village who protected their community',
      'Mercenary who fought in various conflicts across the realm',
      'Noble\'s child trained in combat from an early age',
      'Commoner who learned to fight to protect their family'
    ]
  },
  {
    id: 'elf-wizard',
    race: 'Elf',
    class: 'Wizard',
    personality: [
      'Wise and contemplative, always seeking knowledge',
      'Patient and methodical, taking time to understand problems',
      'Curious about the world and eager to explore its mysteries',
      'Reserved but friendly, valuing deep conversations',
      'Respectful of tradition while embracing new discoveries'
    ],
    background: [
      'Student of an ancient magical academy in the elven forests',
      'Researcher who discovered ancient spellbooks in ruins',
      'Apprentice to a powerful archmage who taught them the arcane arts',
      'Self-taught spellcaster who learned through experimentation',
      'Keeper of elven magical traditions passed down through generations'
    ]
  },
  {
    id: 'dwarf-cleric',
    race: 'Dwarf',
    class: 'Cleric',
    personality: [
      'Stalwart and unwavering in their faith and convictions',
      'Generous and caring, always ready to help those in need',
      'Traditional and respectful of ancient customs and rituals',
      'Practical and down-to-earth, with a strong work ethic',
      'Loyal to their community and protective of their friends'
    ],
    background: [
      'Priest of a dwarven temple who serves their community',
      'Healer who learned divine magic to help the sick and injured',
      'Warrior-priest who fights for their deity\'s cause',
      'Scholar who studies ancient religious texts and traditions',
      'Missionary who travels to spread their faith and help others'
    ]
  },
  {
    id: 'halfling-rogue',
    race: 'Halfling',
    class: 'Rogue',
    personality: [
      'Quick-witted and clever, always thinking on their feet',
      'Curious and adventurous, eager to explore new places',
      'Friendly and sociable, making friends wherever they go',
      'Resourceful and adaptable, finding solutions in any situation',
      'Light-hearted and optimistic, bringing joy to others'
    ],
    background: [
      'Street urchin who learned to survive in a big city',
      'Traveling merchant who picked up various useful skills',
      'Entertainer who learned sleight of hand and acrobatics',
      'Scout for a merchant caravan who explored dangerous routes',
      'Member of a halfling community who learned traditional skills'
    ]
  },
  {
    id: 'dragonborn-paladin',
    race: 'Dragonborn',
    class: 'Paladin',
    personality: [
      'Noble and honorable, always striving to do what is right',
      'Courageous and fearless, facing evil without hesitation',
      'Compassionate and just, treating all with fairness and respect',
      'Disciplined and focused, maintaining high standards of conduct',
      'Inspiring and charismatic, leading others by example'
    ],
    background: [
      'Knight of a holy order dedicated to fighting evil',
      'Guardian of a sacred temple who protects the faithful',
      'Warrior who received divine powers after a spiritual awakening',
      'Noble who swore an oath to serve justice and protect the innocent',
      'Former soldier who found faith and became a holy warrior'
    ]
  },
  {
    id: 'tiefling-warlock',
    race: 'Tiefling',
    class: 'Warlock',
    personality: [
      'Mysterious and enigmatic, with hidden depths and secrets',
      'Intense and passionate, feeling emotions deeply',
      'Independent and self-reliant, trusting few but loyal to those they choose',
      'Ambitious and determined, pursuing their goals with single-minded focus',
      'Complex and misunderstood, often judged by their appearance'
    ],
    background: [
      'Scholar who made a pact with a powerful entity for knowledge',
      'Survivor who gained powers to escape a dangerous situation',
      'Seeker who discovered ancient secrets and made a bargain',
      'Outcast who found acceptance and power through a pact',
      'Adventurer who gained abilities to protect themselves and others'
    ]
  }
];

export const characterVariables = {
  races: ['Human', 'Elf', 'Dwarf', 'Halfling', 'Dragonborn', 'Tiefling', 'Half-Elf', 'Half-Orc', 'Gnome', 'Goliath'],
  classes: ['Fighter', 'Wizard', 'Cleric', 'Rogue', 'Paladin', 'Warlock', 'Ranger', 'Bard', 'Monk', 'Druid', 'Sorcerer', 'Barbarian'],
  backgrounds: ['Acolyte', 'Criminal', 'Folk Hero', 'Noble', 'Sage', 'Soldier', 'Urchin', 'Entertainer', 'Guild Artisan', 'Hermit', 'Outlander'],
  personality_traits: [
    'Brave and courageous in the face of danger',
    'Wise and contemplative, always seeking knowledge',
    'Loyal and trustworthy, a true friend',
    'Curious and adventurous, eager to explore',
    'Generous and kind-hearted, always helping others',
    'Clever and quick-witted, thinking on their feet',
    'Disciplined and focused, maintaining high standards',
    'Creative and imaginative, seeing possibilities others miss',
    'Resilient and determined, never giving up',
    'Empathetic and understanding, connecting with others'
  ],
  ideals: [
    'Justice - treating all fairly and protecting the innocent',
    'Knowledge - seeking truth and understanding',
    'Freedom - ensuring others can live as they choose',
    'Protection - defending those who cannot defend themselves',
    'Beauty - creating and preserving what is beautiful',
    'Honor - living by a strict moral code',
    'Community - working together for the common good',
    'Change - embracing new ideas and experiences',
    'Tradition - respecting and preserving ancient ways',
    'Independence - relying on oneself and one\'s abilities'
  ],
  bonds: [
    'Family - protecting and supporting loved ones',
    'Community - serving and defending their home',
    'Mentor - honoring the teachings of a wise guide',
    'Deity - serving and spreading their faith',
    'Companion - standing by a trusted friend',
    'Cause - fighting for a greater purpose',
    'Place - protecting a sacred or important location',
    'Object - guarding a powerful or meaningful item',
    'Knowledge - preserving and sharing important information',
    'Promise - fulfilling a vow or commitment'
  ],
  flaws: [
    'Pride - believing they are always right',
    'Greed - wanting more than they need',
    'Anger - losing control when provoked',
    'Distrust - suspecting others\' motives',
    'Impulsiveness - acting without thinking',
    'Arrogance - looking down on others',
    'Cowardice - avoiding dangerous situations',
    'Stubbornness - refusing to change their mind',
    'Recklessness - taking unnecessary risks',
    'Secrecy - keeping important information hidden'
  ]
};
