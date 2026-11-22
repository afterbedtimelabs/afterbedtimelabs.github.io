import published from '../../data/kaerimichi/register.json';
import { captureFor } from '../../lib/kaerimichi/game';
import { parseRegister, readWorkingRegister, type Landmark, type Register } from '../../lib/kaerimichi/register';

const initialYears = ['2021', '2023', '2024', '2025', '2026'];
const stopNumber = (index: number) => String(index + 1).padStart(2, '0');

function make<K extends keyof HTMLElementTagNameMap>(tag: K, value?: string, style?: string) {
  const node = document.createElement(tag);
  if (value !== undefined) node.textContent = value;
  if (style) node.className = style;
  return node;
}

function confidence(value: string) {
  const badge = make('span', value.toLowerCase(), 'kj-confidence');
  badge.dataset.level = value;
  return badge;
}

function dateLabel(iso: string) {
  const parts = iso.split('-');
  if (parts.length === 1) return iso;
  const fmt = new Intl.DateTimeFormat('en', { year: 'numeric', month: 'long', ...(parts.length > 2 ? {day:'numeric' as const} : {}), timeZone:'UTC' });
  return fmt.format(new Date(iso + (parts.length === 2 ? '-01' : '') + 'T00:00:00Z'));
}

function citations(record: Landmark, ids: string[]) {
  const links = make('ul', undefined, 'kj-citations');
  for (const id of ids) {
    const source = record.sources.find(item => item.id === id);
    if (!source) continue;
    const row = make('li');
    if (source.url) {
      const link = make('a', source.title + ' ↗');
      link.href = source.url;
      row.append(link);
    } else {
      row.append(make('span', source.title));
    }
    links.append(row);
  }
  return links;
}

class KaerimichiJournal extends HTMLElement {
  private register!: Register;
  private selected = '';
  private year = '';
  private lifecycle?: AbortController;
  private field<T extends HTMLElement = HTMLElement>(key: string) {
    return this.querySelector<T>('[data-kj="' + key + '"]')!;
  }
  connectedCallback() {
    this.lifecycle?.abort();
    this.lifecycle = new AbortController();
    const { signal } = this.lifecycle;
    this.register = parseRegister(published);
    try { this.register = readWorkingRegister() ?? this.register; } catch { /* Published records remain available. */ }
    this.selected = this.register.landmarks[0].id;
    this.field<HTMLSelectElement>('stops').addEventListener('change', e => this.select((e.currentTarget as HTMLSelectElement).value), { signal });
    this.field('prev').addEventListener('click', () => this.step(-1), { signal });
    this.field('next').addEventListener('click', () => this.step(1), { signal });
    this.field('list').addEventListener('click', e => {
      const item = (e.target as Element).closest<HTMLButtonElement>('button[data-id]');
      if (item) this.select(item.dataset.id!);
    }, { signal });
    this.field('years').addEventListener('click', e => {
      const button = (e.target as Element).closest<HTMLButtonElement>('button[data-year]');
      if (!button) return;
      this.year = button.dataset.year!;
      const entries = this.matching();
      if (entries.length && !entries.some(row => row.id === this.selected)) this.selected = entries[0].id;
      this.render();
    }, { signal });
    window.addEventListener('kaerimichi:select', (e: Event) => this.select((e as CustomEvent).detail.id), { signal });
    window.addEventListener('kaerimichi:map-ready', () => this.mapState(), { signal });
    window.addEventListener('atlas:working', (e: Event) => {
      this.register = (e as CustomEvent<{register:Register|null}>).detail.register ?? parseRegister(published);
      if (!this.register.landmarks.some(row => row.id === this.selected)) this.selected = this.register.landmarks[0].id;
      this.buildControls();
      this.render();
    }, { signal });
    this.buildControls();
    this.render();
  }
  disconnectedCallback() { this.lifecycle?.abort(); }

  private buildControls() {
    const options = this.register.landmarks.map((record, index) => new Option(stopNumber(index) + ' · ' + record.nameEn, record.id));
    this.field('stops').replaceChildren(...options);
    const years = Array.from(new Set([...initialYears, ...this.register.landmarks.flatMap(row => row.observations.map(obs => obs.date.slice(0,4)))])).sort();
    if (this.year && !years.includes(this.year)) this.year = '';
    this.field('years').replaceChildren(...['', ...years].map(year => {
      const button = make('button', year || 'All years');
      button.type = 'button';
      button.dataset.year = year;
      return button;
    }));
  }
  private matching() {
    return this.register.landmarks.filter(record => !this.year || record.observations.some(obs => obs.date.startsWith(this.year)));
  }
  private select(id: string) {
    const row = this.register.landmarks.find(item => item.id === id);
    if (!row) return;
    this.selected = id;
    this.render();
    this.field('selection-status').textContent = 'Selected ' + row.nameEn;
  }
  private step(offset: number) {
    const records = this.register.landmarks;
    const next = records[records.findIndex(item => item.id === this.selected) + offset];
    if (next) this.select(next.id);
  }
  private mapState() {
    if (this.register) window.dispatchEvent(new CustomEvent('kaerimichi:state', { detail: {records:this.register.landmarks, selectedId:this.selected, year:this.year || null} }));
  }
  private render() {
    const records = this.register.landmarks;
    const index = records.findIndex(item => item.id === this.selected);
    const row = records[index];
    this.field('folio').textContent = stopNumber(index) + ' / ' + String(records.length).padStart(2,'0');
    this.field('place').textContent = row.nameEn;
    this.field('place-ja').textContent = row.nameJa;
    this.field('category').textContent = row.category;
    this.field('description').textContent = row.description;
    const capture = captureFor(row.id);
    this.field('capture').hidden = !capture;
    if (capture) {
      const img = this.field<HTMLImageElement>('capture-image');
      img.src = capture.src;
      img.alt = capture.description;
      this.field<HTMLAnchorElement>('capture-link').href = capture.src;
      this.field('capture-caption').textContent = 'Godot reconstruction · ' + capture.version;
    }
    const position = this.field('location-state');
    position.textContent = row.location.coordinates ? (row.location.confidence === 'VERIFIED' ? 'Verified map position' : 'Approximate map position') : 'Map position unresolved';
    position.dataset.level = row.location.confidence;
    this.field<HTMLSelectElement>('stops').value = row.id;
    this.field<HTMLButtonElement>('prev').disabled = index === 0;
    this.field<HTMLButtonElement>('next').disabled = index === records.length - 1;
    this.field('view-record').setAttribute('aria-label','Read field notes for ' + row.nameEn);
    const matches = this.matching();
    this.field('filter-status').textContent = this.year
      ? String(matches.length) + (matches.length === 1 ? ' landmark with observations in ' : ' landmarks with observations in ') + this.year
      : String(records.length) + ' landmarks in walking order';
    for (const button of this.field('years').querySelectorAll<HTMLButtonElement>('button')) button.setAttribute('aria-pressed',String(button.dataset.year === this.year));
    const list = this.field('list');
    const focusedId = list.contains(document.activeElement) ? (document.activeElement as HTMLElement).dataset.id : null;
    list.replaceChildren(...matches.map(item => {
      const button = make('button', undefined, 'kj-list-stop');
      button.type = 'button';
      button.dataset.id = item.id;
      button.setAttribute('aria-pressed',String(item.id === row.id));
      const name = make('span',item.nameEn);
      const jp = make('small',item.nameJa);
      jp.lang = 'ja';
      name.append(jp);
      button.append(make('span',stopNumber(records.indexOf(item)), 'kj-list-index'), name);
      return button;
    }));
    if (focusedId) Array.from(list.querySelectorAll('button')).find(button => button.dataset.id === focusedId)?.focus({preventScroll:true});
    if (!matches.length) list.append(make('p','No dated records for this year.', 'kj-list-empty'));
    this.field('notes-place').textContent = row.nameEn;
    this.field('notes-ja').textContent = row.nameJa;
    this.notes(row);
    this.mapState();
  }
  private notes(record: Landmark) {
    const notes = this.field('notes');
    const dated = record.observations.filter(obs => !this.year || obs.date.startsWith(this.year)).slice().sort((a,b) => a.date.localeCompare(b.date));
    notes.replaceChildren(make('h4','Dated observations'));
    if (!dated.length) notes.append(make('p',this.year ? 'No observation is documented for ' + record.nameEn + ' in ' + this.year + '.' : 'This register has no dated observations for this landmark.'));
    for (const observation of dated) {
      const item = make('section',undefined,'kj-observation');
      const date = make('time', dateLabel(observation.date));
      date.dateTime = observation.date;
      item.append(date, confidence(observation.confidence), make('p', observation.description));
      if (observation.appearance) item.append(make('p', observation.appearance));
      if (record.id === 'a2' && observation.date === '2020-03-21' && observation.sourceIds.includes('a2-photo-2020')) {
        const template = this.querySelector<HTMLTemplateElement>('#a2-photo')!;
        item.append(template.content.cloneNode(true));
      }
      item.append(citations(record, observation.sourceIds));
      notes.append(item);
    }
    const details = make('details',undefined,'kj-context');
    details.append(make('summary','Location, operating history & sources'));
    details.append(make('h4','Geographic position'),confidence(record.location.confidence),make('p',record.location.note));
    if (record.location.coordinates) {
      const [lon,lat] = record.location.coordinates;
      details.append(make('p', lat + '° latitude, ' + lon + '° longitude'));
    }
    details.append(citations(record,record.location.sourceIds), make('h4','Operating period'),confidence(record.operatingPeriod.confidence),make('p',record.operatingPeriod.description),citations(record,record.operatingPeriod.sourceIds));
    details.append(make('h4','Reconstruction confidence'),confidence(record.reconstructionConfidence));
    if (record.uncertainties.length) {
      details.append(make('h4','Open questions'));
      const questions = make('ul');
      questions.append(...record.uncertainties.map(item => make('li',item)));
      details.append(questions);
    }
    if (record.godotAssetId) details.append(make('h4','Godot asset'),make('code', record.godotAssetId));
    details.append(make('h4','Record sources'),citations(record,record.sources.map(source => source.id)));
    notes.append(details);
  }
}

if (!customElements.get('kaerimichi-journal')) customElements.define('kaerimichi-journal',KaerimichiJournal);
