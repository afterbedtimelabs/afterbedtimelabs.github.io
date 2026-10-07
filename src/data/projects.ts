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
  repositoryURL?: string;
  websiteURL?: string;
}

// Add a project here to generate its entry and detail page. Only add verified links.
export const projects: Project[] = [
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
    featured: true,
  },
  {
    slug: 'midnight-chiba',
    name: 'Midnight Chiba',
    category: 'Game experiment',
    summary: 'An atmospheric walking and supernatural game experiment set in rural Japan, built with Godot.',
    description: [
      'Midnight Chiba is an indie game experiment made with Godot. Its setting is rural Japan, with a focus on walking, atmosphere, and the supernatural.',
      'This is a space to explore how environment and pacing shape a game, and to document the practical work of building it.',
    ],
    areas: ['Atmosphere and environment', 'Walking and exploration', 'Supernatural themes'],
    tags: ['Godot', 'Games', 'Atmosphere'],
    artwork: 'chiba',
    featured: true,
  },
  {
    slug: 'dungeon-deckbuilder',
    name: 'Dungeon Deckbuilder',
    category: 'Game experiment',
    summary: 'A Godot deckbuilding experiment exploring different classes, combat, and progression.',
    description: [
      'Dungeon Deckbuilder is a game experiment built with Godot, combining deckbuilding with multiple classes and combat and progression experiments.',
      'The project provides a place to work through interconnected game systems and write about what is learned along the way.',
    ],
    areas: ['Deckbuilding systems', 'Classes and combat', 'Progression'],
    tags: ['Godot', 'Games', 'Deckbuilding'],
    artwork: 'deck',
    featured: false,
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
  },
];

export const featuredProjects = projects.filter((project) => project.featured);

export function getProjectPath(project: Pick<Project, 'slug'>): string {
  return `/projects/${project.slug}/`;
}
