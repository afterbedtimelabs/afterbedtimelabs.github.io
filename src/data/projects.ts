export type ProjectArtwork = 'control' | 'chiba' | 'deck' | 'local';

export interface Project {
  slug: string;
  name: string;
  category: string;
  summary: string;
  description: string[];
  areas: string[];
  tags: string[];
  artwork: ProjectArtwork;
  featured: boolean;
  status?: string;
  availability?: string;
  image?: { src: string; alt: string; caption: string; width: number; height: number };
  next?: string;
  archived?: boolean;
  repositoryURL?: string;
  websiteURL?: string;
}

// Add a project here to generate its entry and detail page. Only add verified links.
export const projects: Project[] = [
  {
    slug: 'riku',
    name: 'Riku',
    category: 'Local AI · Desktop companion',
    summary: 'A little company for the workbench. A desktop companion exploring local conversation, memory, and useful everyday tools.',
    description: [
      'Riku is the public-facing name for the companion developed as Navi. The project brings together a desktop character, text conversation, optional local voice, and tools that help make a personal workspace easier to understand.',
      'The interesting work is in the details: a remembered preference, a useful response, an expression that fits the moment, and controls that make it clear what the companion can access. The character and its behavior are still evolving.',
      'The existing Navi Gmail Monitor is a specific, optional email feature with its own public information and privacy policy. Those pages keep the Navi name so existing app and privacy links continue to make sense.',
    ],
    areas: ['Desktop presence and expression', 'Local conversation and voice', 'Memory and useful tools'],
    tags: ['Local AI', 'Companions', 'Python'],
    artwork: 'local',
    featured: true,
    status: 'In development',
    availability: 'Private prototype · no public download yet',
    next: 'Refining the companion’s character, responsiveness, and everyday usefulness.',
    websiteURL: '/navi/',
  },
  {
    slug: 'mission-control',
    name: 'Mission Control',
    category: 'AI & developer tooling',
    summary: 'Exploring a clearer way to work with local services, AI agents, and the tools around them.',
    description: [
      'Mission Control is a developer-tooling experiment around local services, AI agents, models, and the workflows that connect them.',
      'Its area of interest includes events, logs, and alerts: the information needed to understand what a collection of local tools is doing. This project page is a starting point for documenting those experiments and their lessons.',
    ],
    areas: ['Local services and models', 'AI agent workflows', 'Events, logs, and alerts'],
    tags: ['AI agents', 'Local tools', 'Automation'],
    artwork: 'control',
    featured: false,
    archived: true,
  },
  {
    slug: 'midnight-chiba',
    name: 'Midnight Chiba',
    category: 'Game experiment',
    summary: 'The long way home, after dark. A slow-burn walking game through a quiet Japanese neighborhood with something just out of place.',
    description: [
      'Midnight Chiba is a low-poly, slow-burn horror walking prototype built in Godot. A small evening journey leads from the station through residential lanes, past a shrine and cemetery, and out toward fields and the last warm porch.',
      'The playable route is built around walking, looking, and listening. Warm convenience-store lights punctuate darker streets; narrow passages open onto exposed paddies. The tension comes from the environment, pacing, and supernatural details.',
      'The current prototype offers a roughly 10–20 minute walk with exploration. It is still being refined, and a public release is not available yet.',
    ],
    areas: ['Atmosphere and environment', 'Walking and exploration', 'Supernatural themes'],
    tags: ['Godot', 'Games', 'Atmosphere'],
    artwork: 'chiba',
    featured: true,
    status: 'Playable prototype',
    availability: 'In development · no public download yet',
    image: { src: '/images/projects/midnight-chiba.png', alt: 'A lit convenience store and blue vending machine beside a dark rural road in Midnight Chiba.', caption: 'In-engine capture · the convenience store in the V8.2 prototype.', width: 1280, height: 720 },
    next: 'Tuning the contrast between safe-feeling landmarks and the uneasy spaces between them.',
  },
  {
    slug: 'dungeon-deckbuilder',
    name: 'Dungeon Deckbuilder',
    category: 'Game experiment',
    summary: 'Your equipment is your deck. A dungeon roguelite about reading the next attack and deciding which build is worth committing to.',
    description: [
      'Dungeon Deckbuilder is a Godot roguelite prototype where equipment determines the cards in your combat deck. Replace a piece to change direction, or upgrade it to deepen the build you already have.',
      'Six playable classes explore different decisions: Knight, Necromancer, Puppetmaster, Ninja, Summoner, and Mage. Equipment upgrades, mastery, and readable enemy intent connect each turn to the larger run.',
      'A short browser demo has been built for playtesting, with five combats, equipment rewards, an event, and a rest-or-train choice. Balance and presentation are still being refined; this showcase is not a public release announcement.',
    ],
    areas: ['Deckbuilding systems', 'Classes and combat', 'Progression'],
    tags: ['Godot', 'Games', 'Deckbuilding'],
    artwork: 'deck',
    featured: true,
    status: 'Playtesting',
    availability: 'Browser demo in testing · public link to follow',
    image: { src: '/images/projects/dungeon-deckbuilder.png', alt: 'Dungeon Deckbuilder’s Mage faces a Raider, with equipment, enemy intent, and five elemental cards visible.', caption: 'Gameplay capture · Mage combat from the presentation V3 pass.', width: 1280, height: 720 },
    next: 'Making combat choices, equipment upgrades, and class identities easier to read.',
  },
  {
    slug: 'local-ai-utilities',
    name: 'Local AI & Utilities',
    category: 'Tools & experiments',
    summary: 'Smaller experiments with local models, desktop utilities, and everyday developer workflows.',
    description: [
      'A collection of experiments around local LLMs, desktop utilities, automation, and developer tooling.',
      'These projects are a place to investigate useful ideas at a manageable scale. Individual tools and observations can be documented here as they take shape.',
    ],
    areas: ['Local language models', 'Desktop utilities', 'Developer automation'],
    tags: ['Local AI', 'Utilities', 'Automation'],
    artwork: 'local',
    featured: false,
    archived: true,
  },
];

// Keep old detail URLs available, while the public workbench focuses on these three.
export const activeProjects = ['riku', 'dungeon-deckbuilder', 'midnight-chiba'].map((slug) => projects.find((project) => project.slug === slug)!);
export const featuredProjects = activeProjects.filter((project) => project.featured);

export function getProjectPath(project: Pick<Project, 'slug'>): string {
  return `/projects/${project.slug}/`;
}
