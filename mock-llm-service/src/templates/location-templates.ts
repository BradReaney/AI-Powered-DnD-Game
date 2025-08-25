import { LocationTemplate } from '../types';

export const locationTemplates: LocationTemplate[] = [
    {
        id: 'dungeon',
        type: 'dungeon',
        descriptions: [
            'A dark and foreboding underground complex carved from ancient stone. The air is thick with the scent of decay and the distant sound of dripping water echoes through the corridors.',
            'Ancient ruins buried deep beneath the earth, their walls covered in mysterious runes and their chambers filled with forgotten treasures and deadly traps.',
            'A natural cave system that has been expanded and modified by various inhabitants over the centuries, creating a labyrinth of tunnels and chambers.',
            'A massive underground fortress built by a long-forgotten civilization, its halls echoing with the whispers of history and the promise of untold riches.'
        ],
        features: [
            'Ancient stone walls covered in mysterious runes',
            'Trickling water and damp, musty air',
            'Hidden passages and secret doors',
            'Treasure chests and ancient artifacts',
            'Deadly traps and dangerous creatures',
            'Flickering torchlight and magical illumination',
            'Collapsed ceilings and unstable floors',
            'Underground streams and pools'
        ]
    },
    {
        id: 'town',
        type: 'settlement',
        descriptions: [
            'A bustling market town where merchants from across the realm gather to trade goods and share news. The streets are alive with activity and the air is filled with the sounds of commerce.',
            'A quiet village nestled in a peaceful valley, where the residents live simple lives tending to their farms and caring for their families.',
            'A frontier settlement built on the edge of civilization, where brave pioneers work to tame the wilderness and establish a new home.',
            'A prosperous city with grand architecture and busy streets, where people from all walks of life come together to pursue their dreams and ambitions.'
        ],
        features: [
            'Market squares and trading posts',
            'Inns and taverns for travelers',
            'Temples and places of worship',
            'Guard posts and defensive walls',
            'Craft shops and workshops',
            'Residential areas and homes',
            'Public squares and gathering places',
            'Stables and transportation services'
        ]
    },
    {
        id: 'forest',
        type: 'wilderness',
        descriptions: [
            'A dense forest where ancient trees tower overhead, their branches creating a natural canopy that filters the sunlight into dappled patterns on the forest floor.',
            'A mystical woodland where the trees seem to whisper secrets and the air is thick with magical energy that tingles on your skin.',
            'A dark and dangerous forest where shadows move between the trees and the sounds of unknown creatures echo through the night.',
            'A peaceful grove where the trees are spaced widely apart, allowing sunlight to reach the ground and creating a beautiful, open woodland setting.'
        ],
        features: [
            'Ancient trees with thick trunks and spreading branches',
            'Dense undergrowth and tangled vegetation',
            'Hidden clearings and secret groves',
            'Wildlife and forest creatures',
            'Natural paths and animal trails',
            'Streams and small ponds',
            'Rock formations and natural landmarks',
            'Mystical sites and sacred places'
        ]
    },
    {
        id: 'castle',
        type: 'castle',
        descriptions: [
            'A magnificent stone fortress that rises majestically from the landscape, its towers reaching toward the sky and its walls standing as a testament to the power and wealth of its builders.',
            'An ancient castle that has stood for centuries, its weathered stones telling stories of countless battles and the rise and fall of many rulers.',
            'A grand palace that combines defensive strength with architectural beauty, featuring ornate decorations and luxurious accommodations for its noble inhabitants.',
            'A strategic stronghold built to control important trade routes or defend against invasion, its design focused on military effectiveness rather than aesthetic appeal.'
        ],
        features: [
            'High stone walls and defensive towers',
            'Grand halls and throne rooms',
            'Armories and training grounds',
            'Stables and storage facilities',
            'Chapels and religious spaces',
            'Living quarters and guest rooms',
            'Courtyards and gardens',
            'Secret passages and hidden rooms'
        ]
    },
    {
        id: 'temple',
        type: 'temple',
        descriptions: [
            'A sacred building dedicated to the worship of divine beings, its architecture designed to inspire awe and reverence in all who enter its hallowed halls.',
            'An ancient shrine that has been a place of pilgrimage for generations, where the faithful come to seek guidance and offer prayers to their deities.',
            'A grand cathedral with soaring arches and stained glass windows, where the power of the divine is celebrated through elaborate ceremonies and rituals.',
            'A simple chapel built with love and devotion, where the local community gathers to give thanks and seek comfort in times of need.'
        ],
        features: [
            'Altars and sacred spaces',
            'Religious symbols and artwork',
            'Prayer rooms and meditation areas',
            'Libraries of sacred texts',
            'Living quarters for clergy',
            'Courtyards and gardens',
            'Bell towers and spires',
            'Burial grounds and memorials'
        ]
    },
    {
        id: 'tavern',
        type: 'shop',
        descriptions: [
            'A cozy inn where travelers can find a warm meal, a comfortable bed, and the latest news from across the realm. The common room is filled with the sounds of conversation and laughter.',
            'A rowdy tavern where locals and visitors gather to drink, gamble, and share stories. The air is thick with the smell of ale and the sound of music.',
            'An elegant establishment that caters to wealthy merchants and nobles, offering fine dining and luxurious accommodations in a sophisticated atmosphere.',
            'A simple alehouse that serves as the social center of a small community, where everyone knows each other and the atmosphere is warm and welcoming.'
        ],
        features: [
            'Common rooms for dining and socializing',
            'Private dining areas and meeting rooms',
            'Guest rooms and sleeping quarters',
            'Kitchens and food preparation areas',
            'Storage cellars for food and drink',
            'Stables for horses and other mounts',
            'Gaming tables and entertainment areas',
            'Meeting spaces for business and social gatherings'
        ]
    }
];

export const locationVariables = {
    types: ['dungeon', 'settlement', 'wilderness', 'landmark', 'shop', 'tavern', 'temple', 'castle', 'other'],
    importance: ['minor', 'moderate', 'major', 'critical'],
    climates: ['temperate', 'cold', 'hot', 'arid', 'tropical', 'subarctic', 'desert', 'mountain'],
    terrains: ['forest', 'mountain', 'plains', 'swamp', 'desert', 'coastal', 'urban', 'underground', 'aquatic', 'aerial'],
    lighting: ['bright daylight', 'dim twilight', 'dark night', 'artificial light', 'magical illumination', 'natural shadows'],
    weather: ['clear skies', 'cloudy', 'rainy', 'stormy', 'foggy', 'windy', 'calm', 'extreme conditions'],
    resources: ['timber', 'stone', 'metal ores', 'fresh water', 'fertile soil', 'wildlife', 'minerals', 'magical essence'],
    regions: ['the North', 'the South', 'the East', 'the West', 'the Central Plains', 'the Coastal Regions', 'the Mountain Realms', 'the Forest Kingdoms', 'the Desert Lands', 'the Frozen Wastes'],
    adjectives: ['ancient', 'mysterious', 'beautiful', 'dangerous', 'peaceful', 'forbidding', 'welcoming', 'isolated', 'bustling', 'serene', 'majestic', 'humble', 'grand', 'simple', 'complex', 'natural', 'artificial']
};
