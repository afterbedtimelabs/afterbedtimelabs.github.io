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
  introduction?: string;
  next?: string;
  archived?: boolean;
  repositoryURL?: string;
  websiteURL?: string;
}

// Add a project here to generate its entry and detail page. Only add verified links.
export const projects: Project[] = [
  {
    slug: 'riku',
    name: 'Navi / Waypoint',
    category: 'Local AI · Desktop companion',
    summary: 'A little company at the computer, and a helping hand in Minecraft. Two personal AI companion experiments, still taking shape.',
    description: [
      'Navi is the desktop companion previously introduced here as Riku. It brings together a desktop character, text conversation, optional local voice, and remembered preferences. Waypoint is a separate Minecraft companion with implemented following, gathering, and crafting controllers.',
      'The interesting work is in the details: a remembered preference, a useful response, an expression that fits the moment, and controls that make it clear what the companion can access. The character and its behavior are still evolving.',
      'The existing Navi Gmail Monitor is a specific, optional email feature with its own public information and privacy policy. Those pages keep the Navi name so existing app and privacy links continue to make sense.',
    ],
    areas: ['Desktop presence and expression', 'Local conversation and voice', 'Memory and useful tools'],
    tags: ['Local AI', 'Companions', 'Python'],
    artwork: 'local',
    featured: true,
    status: 'Work in progress',
    introduction: '/writing/meet-navi-waypoint/',
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
    status: 'Work in progress · playable prototype',
    introduction: '/writing/meet-midnight-chiba/',
    availability: 'In development · no public download yet',
    image: { src: '/images/projects/showcase/chiba-store.webp', alt: 'A lit convenience store and blue vending machine beside a dark rural road in Midnight Chiba.', caption: 'In-engine capture · the convenience store, captured with the existing camera-review script.', width: 1280, height: 720 },
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
    status: 'Work in progress · playtesting',
    introduction: '/writing/meet-dungeon-deckbuilder/',
    availability: 'Browser demo in testing · public link to follow',
    image: { src: '/images/projects/showcase/deck-mage.webp', alt: 'Dungeon Deckbuilder’s Mage faces a Raider, with equipment, enemy intent, and five elemental cards visible.', caption: 'In-game capture · the Mage’s opening hand, captured with the existing UI test routine.', width: 1280, height: 720 },
    next: 'Making combat choices, equipment upgrades, and class identities easier to read.',
  },
  {
    slug: 'nightstock',
    name: 'NightStock',
    category: 'Game experiment',
    summary: 'One tiny kei truck, eight loose boxes, and plenty of opportunities to regret a sharp turn.',
    description: [
      'NightStock is a physics-driven kei truck prototype. Drive a load of loose cardboard boxes around straights, bumps, hills, and turns, and see what stays in the back.',
      'Switch between chase and cab cameras, open the tailgate, or climb out to pick boxes up again. The cargo moves independently of the truck, so braking and cornering matter.',
      'The current version is an early physics playground with simple test-course scenery. Handling and cargo recovery are the experiment; a finished delivery game is still a possibility to explore.',
    ],
    areas: ['Truck handling', 'Loose cargo physics', 'Driving and on-foot recovery'],
    tags: ['Godot', 'Games', 'Physics'],
    artwork: 'chiba',
    featured: true,
    status: 'Work in progress · physics playground',
    availability: 'Private prototype · no public download yet',
    introduction: '/writing/meet-nightstock/',
    image: { src: '/images/projects/showcase/nightstock-loaded.webp', alt: 'A white kei truck carries cardboard boxes beside the NightStock test course.', caption: 'In-engine capture · the loaded truck in the existing scripted camera review. Standard prototype HUD shown.', width: 1280, height: 720 },
    next: 'Exploring the feel of driving with loose cargo and recovering a spilled load.',
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

// Preserve existing detail URLs, including /projects/riku/ for the companion.
export const activeProjects = ['midnight-chiba', 'dungeon-deckbuilder', 'nightstock', 'riku'].map((slug) => projects.find((project) => project.slug === slug)!);
export const featuredProjects = activeProjects.filter((project) => project.featured);

export function getProjectPath(project: Pick<Project, 'slug'>): string {
  return `/projects/${project.slug}/`;
}
