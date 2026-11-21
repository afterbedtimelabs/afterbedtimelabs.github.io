/** Supplied project history of the private Godot build. */
export const milestones = [
  { version: 'V0.1', title: 'Geographic foundation', description: 'The first build established the neighborhood geography around Itabashihoncho.' },
  { version: 'V0.2', title: 'Historical storefronts', description: 'Shopfront studies brought historical storefronts into the reconstruction.' },
  { version: 'V0.3', title: 'The A2 neighborhood', description: 'The buildings around exit A2 took shape in greater detail.' },
  { version: 'V0.4', title: 'A connected walk', description: 'The private build connected A2 to LIFE Nakajuku in a walk of approximately 805 metres, according to the project history.' },
] as const

/** Add owner-cleared, genuine game captures here when available. */
export interface GameMedia {
  kind: 'image' | 'video'
  src: string
  description: string
  landmarkId: string | null
  version: typeof milestones[number]['version']
  credit: string
}

export const gameMedia: readonly GameMedia[] = []
