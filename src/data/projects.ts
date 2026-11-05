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
    name: 'Riku',
    category: 'Local AI · Desktop companion',
    summary: 'A little company at the computer. A desktop AI companion with conversation, memory, and a personality still taking shape.',
    description: [
      'Riku is my desktop AI companion, bringing together a desktop character, text conversation, optional local voice, and remembered preferences. The aim is a companion that feels comfortable keeping you company while you work or tinker.',
      'The interesting work is in the details: a remembered preference, a useful response, an expression that fits the moment, and controls that make it clear what the companion can access. The character and its behavior are still evolving.',
      'Navi remains the internal name in parts of the software, including the optional Gmail Monitor and its information and privacy pages. Riku is the desktop companion’s public name; Waypoint is a separate Minecraft project.',
    ],
    areas: ['Desktop presence and expression', 'Local conversation and voice', 'Memory and useful tools'],
    tags: ['Local AI', 'Companions', 'Python'],
    artwork: 'local',
    featured: true,
    status: 'Work in progress',
    introduction: '/writing/meet-riku/',
    availability: 'Private prototype · no public download yet',
    next: 'Refining the companion’s character, responsiveness, and everyday usefulness.',
    websiteURL: '/navi/',
  },
  {
    slug: 'mission-control',
    name: 'Mission Control',
    category: 'Personal AI · Operations dashboard',
    summary: 'A little mission control for my growing collection of AI experiments. See what’s running, what just happened, and what needs attention.',
    description: [
      'Mission Control grew out of monitoring my Discord bot. As the experiments multiplied, it became a local dashboard for keeping track of the services and AI tools around them.',
      'The service fleet shows what is running, how long it has been up, and how much CPU and memory it uses. A shared activity feed brings together starts, stops, warnings, and recoveries, with recent output available in the service inspector.',
      'The dashboard and Discord host share a service manager, so registered tools have one set of start, stop, and restart controls. Separate monitors feed it hardware health and activity. It is a working personal dashboard that is still growing alongside the projects it watches.',
    ],
    areas: ['Local services and models', 'AI agent workflows', 'Events, logs, and alerts'],
    tags: ['AI agents', 'Local tools', 'Automation'],
    artwork: 'control',
    featured: true,
    status: 'Work in progress · working dashboard',
    availability: 'Personal workspace · isolated demo shown',
    introduction: '/writing/meet-mission-control/',
    image: { src: '/images/projects/showcase/mission-overview.webp', alt: 'Mission Control’s dashboard showing service totals and provider status in an isolated demo with sample data.', caption: 'Genuine application capture · isolated demo, all values are sample data. Navi is the host’s internal name.', width: 1265, height: 712 },
    next: 'Making a growing collection of experiments easier to understand at a glance.',
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
    summary: 'A small delivery truck, loose cargo, and a late-night route through rural Japan. Take care of the boxes—and enjoy the road between stops.',
    description: [
      'NightStock is a delivery-driving prototype set in rural Japan after dark. The first shift takes a small kei truck from the depot along a mountain road, across a red bridge, through cedar forest and a tunnel, and down to YORUMICHI in the valley.',
      'Climb out, open the tailgate, and load three loose cartons by hand. The cargo moves independently of the truck, so braking and cornering matter. At the store, carry the boxes to the receiving mat: arriving is only part of the job.',
      'A flip phone carries dispatch instructions, while a local radio station accompanies the journey with subtitles. Switch between the cab and chase cameras to find your view of the road. V1.3.1 has a complete first delivery shift in a local Windows build; the game remains in development.',
    ],
    areas: ['Late-night rural driving', 'Loose cargo and physical delivery', 'Radio and roadside atmosphere'],
    tags: ['Godot', 'Games', 'Physics'],
    artwork: 'chiba',
    featured: true,
    status: 'Work in progress · playable first shift',
    availability: 'Private prototype · no public download yet',
    introduction: '/writing/meet-nightstock/',
    image: { src: '/images/projects/showcase/nightstock-v131-road.webp', alt: 'Headlights illuminate the red bridge through the windshield of NightStock’s right-hand-drive kei truck.', caption: 'V1.3.1 packaged gameplay · staged bridge viewpoint, mission overlay hidden. Original game lighting and colors.', width: 1920, height: 1080 },
    next: 'Refining the driving and cargo feel, startup, and consistency of the journey.',
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
export const activeProjects = ['mission-control', 'midnight-chiba', 'dungeon-deckbuilder', 'nightstock', 'riku'].map((slug) => projects.find((project) => project.slug === slug)!);
export const featuredProjects = activeProjects.filter((project) => project.featured);

export function getProjectPath(project: Pick<Project, 'slug'>): string {
  return `/projects/${project.slug}/`;
}
