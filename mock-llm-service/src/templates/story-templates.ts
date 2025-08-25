import { StoryTemplate } from '../types';

export const storyTemplates: StoryTemplate[] = [
  {
    id: 'campaign-init',
    type: 'campaign_initialization',
    templates: [
      'Welcome to the realm of {region}, where {theme} awaits brave adventurers. The {setting} stretches before you, filled with {adjectives} possibilities and {danger_level} challenges.',
      'In the {era} of {world_name}, a new chapter begins. Your party stands at the crossroads of {location}, where {plot_hook} will test your mettle and forge your legend.',
      'The {season} winds carry whispers of {adventure_type} through {landscape}. As you gather in {meeting_place}, the weight of destiny settles upon your shoulders.'
    ],
    variables: ['region', 'theme', 'setting', 'adjectives', 'danger_level', 'era', 'world_name', 'location', 'plot_hook', 'adventure_type', 'landscape', 'meeting_place', 'season']
  },
  {
    id: 'combat-encounter',
    type: 'combat_encounter',
    templates: [
      'The {enemy_type} emerges from the {terrain}, its {appearance} glinting in the {lighting}. {combat_description} fills the air as battle is joined.',
      'Shadows shift in the {environment}, revealing {number} {enemy_name} with {weapon_type} drawn. The tension is palpable as {combat_setup} unfolds.',
      'A {size} {creature_type} crashes through the {obstacle}, its {aggressive_behavior} making its intentions clear. {battle_atmosphere} surrounds you.'
    ],
    variables: ['enemy_type', 'terrain', 'appearance', 'lighting', 'combat_description', 'environment', 'number', 'enemy_name', 'weapon_type', 'combat_setup', 'size', 'creature_type', 'obstacle', 'aggressive_behavior', 'battle_atmosphere']
  },
  {
    id: 'npc-interaction',
    type: 'npc_interaction',
    templates: [
      'The {npc_type} {npc_name} approaches with {demeanor}, their {appearance} suggesting {background_hint}. {greeting} reveals their {personality_trait}.',
      'In the {location}, you encounter {npc_name}, a {npc_description} whose {mannerism} speaks of {experience_level}. {dialogue_opener} begins your conversation.',
      'The {npc_role} {npc_name} studies you with {expression}, their {clothing} marking them as {social_status}. {interaction_hook} draws them into conversation.'
    ],
    variables: ['npc_type', 'npc_name', 'demeanor', 'appearance', 'background_hint', 'greeting', 'personality_trait', 'location', 'npc_description', 'mannerism', 'experience_level', 'dialogue_opener', 'npc_role', 'expression', 'clothing', 'social_status', 'interaction_hook']
  },
  {
    id: 'location-description',
    type: 'location_description',
    templates: [
      'The {location_type} sprawls before you, its {architectural_style} speaking of {historical_period}. {atmospheric_detail} creates an {mood} that {sensory_effect}.',
      'Ancient {structure_material} walls rise from the {ground_type}, their {construction_quality} telling tales of {builder_identity}. {environmental_feature} adds to the {ambiance}.',
      'You find yourself in a {landscape_type} where {natural_feature} dominates the horizon. The {weather_condition} and {time_of_day} combine to create a {scene_description}.'
    ],
    variables: ['location_type', 'architectural_style', 'historical_period', 'atmospheric_detail', 'mood', 'sensory_effect', 'structure_material', 'ground_type', 'construction_quality', 'builder_identity', 'environmental_feature', 'ambiance', 'landscape_type', 'natural_feature', 'weather_condition', 'time_of_day', 'scene_description']
  },
  {
    id: 'skill-check-result',
    type: 'skill_check_result',
    templates: [
      'Your {skill_name} expertise proves {success_level} as you {action_description}. The {outcome_detail} reveals {discovery_or_consequence}.',
      'With {skill_name} precision, you {action_result}, leading to {immediate_effect}. This {skill_impact} opens up {new_opportunity}.',
      'The {skill_name} attempt {success_indicator}, and you {result_description}. This {skill_outcome} provides {valuable_information}.'
    ],
    variables: ['skill_name', 'success_level', 'action_description', 'outcome_detail', 'discovery_or_consequence', 'precision', 'action_result', 'immediate_effect', 'skill_impact', 'new_opportunity', 'success_indicator', 'result_description', 'skill_outcome', 'valuable_information']
  }
];

export const storyVariables = {
  region: ['the Forgotten Realms', 'Eberron', 'Ravenloft', 'Dragonlance', 'Greyhawk', 'the Sword Coast', 'the Underdark', 'the Feywild'],
  theme: ['ancient magic', 'political intrigue', 'survival horror', 'epic fantasy', 'mystery and investigation', 'war and conquest', 'exploration and discovery'],
  setting: ['mystical forests', 'ancient ruins', 'bustling cities', 'desolate wastelands', 'frozen mountains', 'sweltering deserts', 'misty swamps'],
  adjectives: ['endless', 'mysterious', 'dangerous', 'beautiful', 'treacherous', 'enchanting', 'forbidding', 'wondrous'],
  danger_level: ['deadly', 'challenging', 'moderate', 'minimal', 'extreme'],
  era: ['Age of Heroes', 'Time of Troubles', 'Era of Discovery', 'Age of Legends', 'Time of Reckoning'],
  world_name: ['Faerûn', 'Khorvaire', 'Barovia', 'Krynn', 'Oerth', 'Toril'],
  location: ['a crossroads', 'an ancient temple', 'a bustling tavern', 'a mysterious tower', 'a sacred grove'],
  plot_hook: ['a missing artifact', 'a mysterious prophecy', 'a dark conspiracy', 'an ancient curse', 'a war brewing'],
  adventure_type: ['heroic quests', 'dangerous missions', 'mysterious investigations', 'epic battles', 'treasure hunts'],
  landscape: ['rolling hills', 'dense forests', 'rocky mountains', 'sandy beaches', 'misty valleys'],
  meeting_place: ['a cozy inn', 'a grand hall', 'a secret hideout', 'a sacred temple', 'a bustling marketplace'],
  season: ['spring', 'summer', 'autumn', 'winter'],
  enemy_type: ['goblin', 'orc', 'dragon', 'undead', 'bandit', 'monster', 'beast'],
  terrain: ['shadows', 'undergrowth', 'ruins', 'caves', 'tunnels', 'forest'],
  appearance: ['eyes', 'claws', 'armor', 'weapons', 'scales', 'fur'],
  lighting: ['dim torchlight', 'bright sunlight', 'moonlight', 'magical glow', 'darkness'],
  combat_description: ['The clash of steel', 'The roar of battle', 'The tension of combat', 'The thrill of the fight'],
  environment: ['darkness', 'mist', 'shadows', 'undergrowth', 'ruins'],
  number: ['three', 'five', 'seven', 'a dozen', 'countless'],
  enemy_name: ['goblins', 'orcs', 'bandits', 'skeletons', 'wolves'],
  weapon_type: ['swords', 'axes', 'bows', 'claws', 'magic'],
  combat_setup: ['the battle begins', 'combat erupts', 'the fight commences', 'violence breaks out'],
  size: ['massive', 'huge', 'large', 'medium', 'small'],
  creature_type: ['beast', 'monster', 'dragon', 'giant', 'elemental'],
  obstacle: ['trees', 'rocks', 'walls', 'debris', 'vegetation'],
  aggressive_behavior: ['roaring defiance', 'snarling threats', 'charging forward', 'preparing to strike'],
  battle_atmosphere: ['The air crackles with tension', 'The ground trembles with power', 'The very air seems to pulse with energy'],
  npc_type: ['merchant', 'guard', 'wizard', 'priest', 'noble', 'peasant'],
  npc_name: ['Aldric', 'Thorin', 'Elara', 'Grimtooth', 'Seraphina', 'Marcus'],
  demeanor: ['cautiously', 'confidently', 'nervously', 'proudly', 'humbly'],
  background_hint: ['years of experience', 'noble birth', 'humble origins', 'mysterious past', 'recent arrival'],
  greeting: ['Their warm smile', 'Their cautious nod', 'Their enthusiastic wave', 'Their formal bow'],
  personality_trait: ['generous nature', 'suspicious mind', 'curious spirit', 'stoic resolve'],
  npc_location: ['tavern', 'market', 'temple', 'castle', 'village square'],
  npc_description: ['wise elder', 'young apprentice', 'seasoned warrior', 'skilled craftsman'],
  mannerism: ['confident stride', 'nervous fidgeting', 'regal bearing', 'humble posture'],
  experience_level: ['decades of wisdom', 'youthful enthusiasm', 'battle-hardened skill', 'master craftsmanship'],
  dialogue_opener: ['A friendly greeting', 'A curious question', 'A formal introduction', 'A casual remark'],
  npc_role: ['shopkeeper', 'guard captain', 'village elder', 'traveling merchant', 'local guide'],
  expression: ['curious interest', 'professional assessment', 'friendly welcome', 'cautious evaluation'],
  clothing: ['fine robes', 'practical armor', 'travel-worn garments', 'noble attire'],
  social_status: ['wealthy merchant', 'respected leader', 'humble worker', 'noble personage'],
  interaction_hook: ['Their knowledge of the area', 'Their recent experiences', 'Their local connections', 'Their unique perspective'],
  location_type: ['castle', 'temple', 'tower', 'dungeon', 'village', 'city'],
  architectural_style: ['Gothic spires', 'Romanesque arches', 'Elven elegance', 'Dwarven solidity', 'Human practicality'],
  historical_period: ['ancient times', 'recent construction', 'forgotten ages', 'modern era'],
  atmospheric_detail: ['Flickering torchlight', 'Ancient stonework', 'Mystical symbols', 'Weathered surfaces'],
  mood: ['mysterious atmosphere', 'reverent silence', 'oppressive darkness', 'welcoming warmth'],
  sensory_effect: ['awakens your imagination', 'heightens your senses', 'fills you with wonder', 'chills your spine'],
  structure_material: ['stone', 'wood', 'metal', 'crystal', 'bone'],
  ground_type: ['rocky soil', 'sandy earth', 'hard stone', 'soft moss'],
  construction_quality: ['masterful craftsmanship', 'crude but effective work', 'ancient but enduring', 'recent and solid'],
  builder_identity: ['ancient civilizations', 'skilled artisans', 'mystical beings', 'practical builders'],
  environmental_feature: ['Natural light filtering through', 'Ancient magic lingering in', 'Weather-worn surfaces showing', 'Fresh construction revealing'],
  ambiance: ['mysterious atmosphere', 'reverent mood', 'oppressive feeling', 'welcoming environment'],
  landscape_type: ['mountain range', 'dense forest', 'rolling plains', 'rocky coastline', 'desert expanse'],
  natural_feature: ['towering peaks', 'ancient trees', 'rolling hills', 'rocky cliffs', 'sand dunes'],
  weather_condition: ['clear skies', 'stormy weather', 'misty conditions', 'bright sunshine', 'overcast gloom'],
  time_of_day: ['dawn', 'midday', 'dusk', 'night', 'twilight'],
  scene_description: ['breathtaking vista', 'serene landscape', 'dramatic panorama', 'peaceful setting'],
  skill_name: ['Perception', 'Investigation', 'Athletics', 'Stealth', 'Persuasion', 'Arcana'],
  success_level: ['invaluable', 'crucial', 'helpful', 'essential', 'decisive'],
  action_description: ['spot the hidden detail', 'uncover the truth', 'overcome the obstacle', 'remain undetected', 'convince the NPC'],
  outcome_detail: ['careful observation', 'thorough investigation', 'physical prowess', 'stealthy movement', 'charismatic appeal'],
  discovery_or_consequence: ['a hidden passage', 'valuable information', 'a clear path forward', 'successful infiltration', 'cooperation from others'],
  precision: ['meticulous', 'careful', 'skilled', 'expert', 'masterful'],
  action_result: ['achieve your goal', 'find what you seek', 'overcome the challenge', 'succeed in your task'],
  immediate_effect: ['immediate progress', 'clear advantage', 'successful outcome', 'positive result'],
  skill_impact: ['demonstrates your expertise', 'proves your capability', 'shows your skill', 'highlights your ability'],
  new_opportunity: ['new possibilities', 'additional options', 'further progress', 'greater success'],
  success_indicator: ['succeeds admirably', 'proves successful', 'achieves the goal', 'meets the challenge'],
  result_description: ['accomplish the task', 'find the solution', 'overcome the obstacle', 'achieve success'],
  skill_outcome: ['demonstrates your mastery', 'proves your competence', 'shows your expertise', 'highlights your skill'],
  valuable_information: ['crucial details', 'important insights', 'key knowledge', 'essential facts']
};
