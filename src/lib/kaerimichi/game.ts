import development from '../../data/kaerimichi/development.json';

export const { milestones, media } = development;

export function captureFor(landmarkId: string) {
  return media.find(entry => entry.kind === 'image' && entry.landmarkId === landmarkId);
}
