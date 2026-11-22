import register from '../../data/kaerimichi/register.json';
import { localProjection, type Point } from './projection';
import type { Landmark } from '../../lib/kaerimichi/register';

interface State {
  records: Landmark[];
  selectedId: string;
  year: number | string | null;
}
interface Stop {
  record: Landmark;
  order: number;
  point: Point;
}
const distance = (a: Point,b: Point) => Math.hypot(a[0]-b[0],a[1]-b[1]);

class WalkingMap extends HTMLElement {
  private cleanup?: AbortController;
  private observer?: ResizeObserver;
  private canvas!: HTMLElement;
  private world!: SVGGElement;
  private markers!: HTMLElement;
  private chooser!: HTMLElement;
  private project!: (coord: number[]) => Point;
  private bounds!: [Point,Point];
  private routeExtent!: number[];
  private center: Point = [0,0];
  private scale = 1;
  private area = 'walk';
  private areaButtons: HTMLButtonElement[] = [];
  private areas = new Map<string, number[]>();
  private fitScale = 1;
  private width = 0;
  private height = 0;
  private stops: Stop[] = [];
  private selectedId = 'a2';
  private year = '';
  private pins = new Map<string, HTMLButtonElement>();
  private touches = new Map<number,Point>();
  private frame = 0;
  private focusAfterClose?: HTMLButtonElement;

  connectedCallback() {
    this.cleanup = new AbortController();
    const {signal} = this.cleanup;
    this.canvas = this.querySelector('.wm-canvas')!;
    this.world = this.querySelector('.wm-world')!;
    this.markers = this.querySelector('.wm-markers')!;
    this.chooser = this.querySelector('.wm-chooser')!;
    const bbox = this.dataset.bbox!.split(',').map(Number);
    this.project = localProjection(bbox);
    this.bounds = [this.project([bbox[0],bbox[3]]),this.project([bbox[2],bbox[1]])];
    this.routeExtent = this.dataset.routeExtent!.split(',').map(Number);
    this.setStops(register.landmarks as Landmark[]);
    // Area boundaries come from the published geographic records, independent of local edits.
    for (const [area, ids] of Object.entries({
      station: ['a2', 'drug-papas', 'hair-salon-best', 'my-basket'],
      honcho: ['old-nakasendo', 'itabashi-bridge'],
      nakajuku: ['itabashi-bridge', 'nakajuku-street', 'life-nakajuku'],
    })) {
      const points = this.stops.filter(stop => ids.includes(stop.record.id)).map(stop => stop.point);
      const xs = points.map(p => p[0]), ys = points.map(p => p[1]);
      this.areas.set(area, [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]);
    }
    this.areaButtons = Array.from(this.closest('kaerimichi-journal')!.querySelectorAll('button[data-area]'));
    for (const button of this.areaButtons) button.addEventListener('click', () => {
      const area = button.dataset.area!;
      const anchor = {station:'a2', honcho:'old-nakasendo', nakajuku:'itabashi-bridge'}[area];
      if (anchor && this.stops.some(s => s.record.id === anchor)) this.select(anchor);
      this.fit(area);
    }, {signal});
    this.querySelector('[data-tool="zoom-in"]')!.addEventListener('click',() => this.zoom(1.6),{signal});
    this.querySelector('[data-tool="zoom-out"]')!.addEventListener('click',() => this.zoom(1/1.6),{signal});
    this.querySelector('[data-tool="fit"]')!.addEventListener('click',() => this.fit(),{signal});
    this.canvas.addEventListener('keydown',this.key,{signal});
    this.canvas.addEventListener('pointerdown',this.press,{signal});
    this.canvas.addEventListener('pointermove',this.drag,{signal});
    this.canvas.addEventListener('pointerup',this.release,{signal});
    this.canvas.addEventListener('pointercancel',this.release,{signal});
    this.canvas.addEventListener('lostpointercapture',this.release,{signal});
    this.canvas.addEventListener('wheel',this.wheel,{signal,passive:false});
    this.addEventListener('keydown',event => {
      if (event.key === 'Escape') this.closeChooser(true);
    },{signal});
    window.addEventListener('kaerimichi:state',this.update,{signal});
    this.observer = new ResizeObserver(() => {
      const area = this.area;
      this.width = this.canvas.clientWidth;
      this.height = this.canvas.clientHeight;
      if (area) this.fit(area);
      else this.draw();
    });
    this.observer.observe(this.canvas);
    window.dispatchEvent(new Event('kaerimichi:map-ready'));
  }

  disconnectedCallback() {
    this.cleanup?.abort();
    this.observer?.disconnect();
    cancelAnimationFrame(this.frame);
    this.frame = 0;
    this.touches.clear();
  }

  private setStops(records: Landmark[]) {
    const [lower,upper] = this.bounds;
    this.stops = records.flatMap((record,index) => {
      if (!record.location.coordinates) return [];
      const point = this.project(record.location.coordinates);
      if (point[0] < lower[0] || point[1] < lower[1] || point[0] > upper[0] || point[1] > upper[1]) return [];
      return [{record,order:index+1,point}];
    });
  }

  private update = (event: Event) => {
    const {records,selectedId,year} = (event as CustomEvent<State>).detail;
    const changed = selectedId !== this.selectedId;
    this.setStops(records);
    this.selectedId = selectedId;
    const record = records.find(record => record.id === selectedId);
    const outside = !!record?.location.coordinates && !this.stops.some(s => s.record.id === selectedId);
    this.querySelector<HTMLElement>('.wm-outside')!.hidden = !outside;
    this.year = year && /^\d{4}$/.test(String(year)) ? String(year) : '';
    if (changed) {
      this.closeChooser();
      const stop = this.stops.find(s => s.record.id === selectedId);
      if (stop && this.width) {
        const [x,y] = this.screen(stop.point);
        if (x < 36 || y < 52 || x > this.width-36 || y > this.height-52) {
          this.markArea('');
          this.center = [...stop.point];
        }
      }
    }
    this.draw();
  };

  private markArea(area: string) {
    this.area = area;
    for (const button of this.areaButtons) button.setAttribute('aria-pressed', String(button.dataset.area === area));
  }

  private fit(area = 'walk') {
    if (!this.width || !this.height) return;
    const scaleTo = ([west,north,east,south]: number[]) => Math.max(.03, Math.min(
      (this.width-110)/Math.max(east-west,100), (this.height-155)/Math.max(south-north,100)));
    this.fitScale = scaleTo(this.routeExtent);
    const extent = this.areas.get(area) ?? this.routeExtent;
    this.center = [(extent[0]+extent[2])/2, (extent[1]+extent[3])/2];
    this.scale = scaleTo(extent);
    this.markArea(area);
    this.closeChooser();
    this.draw();
  }

  private screen([x,y]: Point): Point {
    return [this.width/2 + (x-this.center[0])*this.scale,this.height/2 + (y-this.center[1])*this.scale];
  }

  private zoom(factor: number, anchor: Point = [this.width/2,this.height/2]) {
    this.markArea('');
    const prev = this.scale;
    this.scale = Math.min(this.fitScale*24,Math.max(this.fitScale*.65,this.scale*factor));
    this.center[0] += (anchor[0]-this.width/2)*(1/prev-1/this.scale);
    this.center[1] += (anchor[1]-this.height/2)*(1/prev-1/this.scale);
    this.closeChooser();
    this.draw();
  }

  private draw() {
    if (!this.frame) this.frame = requestAnimationFrame(() => {
      this.frame = 0;
      if (!this.width || !this.height) return;
      const [upper,lower] = this.bounds;
      this.center = this.center.map((v,i) => Math.max(upper[i],Math.min(lower[i],v))) as Point;
      const [x,y] = this.screen([0,0]);
      this.world.setAttribute('transform',`translate(${x} ${y}) scale(${this.scale})`);
      const length = [1,2,5,10,20,50,100,200,500,1000].filter(n => n*this.scale <= 88).pop() ?? 1;
      const bar = this.querySelector<HTMLElement>('.wm-scale')!;
      bar.style.width = length*this.scale+'px';
      bar.firstElementChild!.textContent = length+' m';
      this.renderPins();
    });
  }

  private renderPins() {
    // A group at a shared building preserves the source position of each stop.
    // Zooming separates close stops. Coincident positions always open a chooser.
    const groups: Stop[][] = [];
    for (const stop of this.stops) {
      const group = groups.find(group => distance(group[0].point,stop.point)*this.scale < 30);
      if (group) group.push(stop);
      else groups.push([stop]);
    }
    const active = new Set<string>();
    for (const group of groups) {
      const selected = group.find(s => s.record.id === this.selectedId);
      const primary = selected ?? group[0];
      const [x,y] = this.screen(primary.point);
      const id = group[0].record.id;
      let pin = this.pins.get(id);
      if (!pin) {
        pin = document.createElement('button');
        pin.type = 'button';
        pin.className = 'wm-pin';
        this.markers.append(pin);
        this.pins.set(id,pin);
      }
      active.add(id);
      pin.hidden = x < 0 || y < 0 || x > this.width || y > this.height;
      pin.style.left = x+'px';
      pin.style.top = y+'px';
      pin.dataset.id = primary.record.id;
      pin.dataset.approx = String(primary.record.location.confidence === 'APPROXIMATED');
      pin.dataset.dim = String(!!this.year && !group.some(s => s.record.observations.some(obs => obs.date.startsWith(this.year))));
      pin.setAttribute('aria-pressed',String(!!selected));
      const label = group.map(s => s.record.nameEn).join(', ');
      pin.setAttribute('aria-label',group.length > 1 ? 'Choose from nearby stops: '+label : 'Stop '+primary.order+', '+label);
      pin.title = label;
      pin.textContent = String(primary.order).padStart(2,'0');
      if (group.length > 1) {
        const extra = document.createElement('span');
        extra.className = 'wm-extra';
        extra.textContent = '+'+(group.length-1);
        pin.append(extra);
      }
      if (selected || ['a2','life-nakajuku'].includes(primary.record.id)) {
        const caption = document.createElement('span');
        caption.className = 'wm-caption';
        caption.textContent = primary.record.nameEn;
        caption.dataset.edge = x < 108 ? 'left' : x > this.width-108 ? 'right' : '';
        caption.dataset.below = String(y < 55);
        pin.append(caption);
      }
      const button = pin;
      pin.onclick = () => group.length === 1 ? this.select(primary.record.id) : this.choose(group,button);
    }
    for (const [id,pin] of this.pins) {
      if (!active.has(id)) {
        pin.remove();
        this.pins.delete(id);
      }
    }
  }

  private select(id: string) {
    this.closeChooser(true);
    window.dispatchEvent(new CustomEvent('kaerimichi:select',{detail:{id}}));
  }

  private choose(group: Stop[], opener: HTMLButtonElement) {
    this.focusAfterClose = opener;
    this.chooser.replaceChildren();
    for (const {order,record} of group) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = String(order).padStart(2,'0')+' · '+record.nameEn;
      button.onclick = () => this.select(record.id);
      this.chooser.append(button);
    }
    const close = document.createElement('button');
    close.type = 'button';
    close.textContent = 'Close';
    close.onclick = () => this.closeChooser(true);
    this.chooser.append(close);
    this.chooser.hidden = false;
    this.chooser.querySelector('button')?.focus({preventScroll:true});
  }

  private closeChooser(restore = false) {
    if (this.chooser.hidden) return;
    this.chooser.hidden = true;
    if (restore) this.focusAfterClose?.focus({preventScroll:true});
  }

  private key = (event: KeyboardEvent) => {
    if (event.altKey || event.ctrlKey || event.metaKey) return;
    const step = (event.shiftKey ? 120 : 48)/this.scale;
    switch (event.key) {
      case 'ArrowLeft': this.center[0] -= step; break;
      case 'ArrowRight': this.center[0] += step; break;
      case 'ArrowUp': this.center[1] -= step; break;
      case 'ArrowDown': this.center[1] += step; break;
      case '+': case '=': this.zoom(1.6); break;
      case '-': this.zoom(1/1.6); break;
      case 'Home': this.fit(); break;
      default: return;
    }
    if (event.key.startsWith('Arrow')) this.markArea('');
    event.preventDefault();
    this.draw();
  };

  private wheel = (event: WheelEvent) => {
    if (!event.ctrlKey && !this.canvas.contains(document.activeElement)) return;
    event.preventDefault();
    const rect = this.canvas.getBoundingClientRect();
    this.zoom(event.deltaY < 0 ? 1.15 : 1/1.15,[event.clientX-rect.left,event.clientY-rect.top]);
  };

  private press = (event: PointerEvent) => {
    if ((event.target as Element).closest('button') || event.button !== 0) return;
    this.closeChooser();
    this.canvas.focus({preventScroll:true});
    this.canvas.setPointerCapture(event.pointerId);
    this.touches.set(event.pointerId,[event.clientX,event.clientY]);
  };

  private drag = (event: PointerEvent) => {
    const previous = this.touches.get(event.pointerId);
    if (!previous) return;
    const current: Point = [event.clientX,event.clientY];
    this.touches.set(event.pointerId,current);
    const other = Array.from(this.touches).find(([id]) => id !== event.pointerId)?.[1];
    if (other) {
      const oldDistance = distance(other,previous);
      if (oldDistance > 2) {
        const rect = this.canvas.getBoundingClientRect();
        this.zoom(distance(other,current)/oldDistance,[(current[0]+other[0])/2-rect.left,(current[1]+other[1])/2-rect.top]);
      }
    } else {
      this.markArea('');
      this.center[0] -= (current[0]-previous[0])/this.scale;
      this.center[1] -= (current[1]-previous[1])/this.scale;
      this.draw();
    }
  };

  private release = (event: PointerEvent) => {
    this.touches.delete(event.pointerId);
  };
}
if (!customElements.get('kaerimichi-map')) customElements.define('kaerimichi-map',WalkingMap);
