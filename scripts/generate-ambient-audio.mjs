/**
 * After Hours / Window Rain — original deterministic procedural audio, 2026.
 * No recordings, soundfonts, external samples, networks or model APIs.
 * Run from the repository root: node scripts/generate-ambient-audio.mjs
 * Requires Node >=22 and ffmpeg/ffprobe on PATH (libvorbis + FLAC encoders).
 * All times and pitches below are the composition source.
 */
import { mkdir, writeFile, unlink, readFile, stat } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { createHash } from 'node:crypto';

const rate = 44100, bpm = 74, beat = 60 / bpm, bars = 48;
const output = resolve('public/audio/ambient');
await mkdir(output, { recursive: true });
const TAU = 2 * Math.PI;
const midi = (n) => 440 * 2 ** ((n - 69) / 12);
function random(seed) {
  let s = seed >>> 0;
  return () => { s ^= s << 13; s ^= s >>> 17; s ^= s << 5; return (s >>> 0) / 4294967296; };
}
const rng = random(0xbed71ae);
function stereo(seconds) {
  const length = Math.round(seconds * rate);
  return [new Float32Array(length), new Float32Array(length)];
}
const music = stereo(bars * 4 * beat);

// Mix every event on a circular timeline. Last-bar reverberation already exists
// at sample zero; this is a loop, not a faded song with silence at either end.
function add(buffer, start, length, sample, gain, pan = 0) {
  const offset = Math.round(start * rate), count = Math.ceil(length * rate);
  const left = Math.sqrt((1 - pan) / 2) * gain;
  const right = Math.sqrt((1 + pan) / 2) * gain;
  for (let i = 0; i < count; i++) {
    const t = i / rate, value = sample(t, i);
    const p = ((offset + i) % buffer[0].length + buffer[0].length) % buffer[0].length;
    buffer[0][p] += value * left; buffer[1][p] += value * right;
  }
}
const attack = (t, seconds) => 1 - Math.exp(-t / seconds);
function ep(note, when, velocity, pan, hold = 2.6) {
  const f = midi(note), phase = rng() * 0.12;
  add(music, when, hold + 2, (t) => {
    const release = t > hold ? Math.exp(-(t - hold) / .32) : 1;
    const body = Math.exp(-t / 1.55), tine = Math.exp(-t / .38);
    const fundamental = Math.sin(TAU * f * t + .65 * tine * Math.sin(TAU * f * 2 * t + phase));
    const softHarmonic = .14 * Math.sin(TAU * f * 2.003 * t) * Math.exp(-t / .78);
    return attack(t, .009) * release * (fundamental * body + softHarmonic);
  }, velocity, pan);
}
function bass(note, when, length, velocity = .18) {
  const f = midi(note);
  add(music, when, length + .22, (t) => {
    const env = attack(t, .018) * Math.exp(-t / 2) * (t > length ? Math.exp(-(t-length)/.055) : 1);
    return env * (.88 * Math.sin(TAU*f*t) + .12 * Math.sin(TAU*2*f*t));
  }, velocity, -.035);
}
function kick(when, velocity = .22) {
  add(music, when, .48, t => {
    // Smooth frequency drop, a rounded transient and a short soft body.
    const phase = TAU * (47 * t + 46 * .035 * (1 - Math.exp(-t / .035)));
    return attack(t,.002) * Math.sin(phase) * Math.exp(-t / .125);
  }, velocity);
}
function snare(when, velocity=.055) {
  let filtered = 0;
  add(music, when, .28, t => {
    filtered += .24 * (rng()*2-1-filtered);
    return attack(t,.002) * (.82*filtered + .18*Math.sin(TAU*183*t)) * Math.exp(-t/.058);
  }, velocity, .09);
}
function hat(when, velocity=.025) {
  let previous = 0, low = 0;
  add(music, when, .12, t => {
    const n = rng()*2-1, high = n - previous; previous = n;
    low += .53 * (high-low);
    return low * attack(t,.001) * Math.exp(-t/.018);
  }, velocity, -.25);
}

// Eight bars in D major: extended, close voicings; E/A and B/C# upper notes
// connect the chords. An original 48-bar arrangement changes the motif and
// leaves intentional rests rather than repeating a busy arpeggio forever.
const chords = [
  {name:'Dmaj9', root:38, notes:[54,57,61,64]},
  {name:'Bm9',   root:35, notes:[54,57,61,62]},
  {name:'Gmaj9', root:31, notes:[54,57,59,62]},
  {name:'A13',   root:33, notes:[55,59,61,66]},
  {name:'F#m7',  root:30, notes:[52,57,61,64]},
  {name:'Bm9',   root:35, notes:[54,57,61,62]},
  {name:'Em9',   root:28, notes:[54,55,59,62]},
  {name:'A13',   root:33, notes:[55,59,61,66]},
];
// [beat within bar, pitch, duration in beats]; not taken from any song.
const motif = [
  [[.60,69,.7],[2.15,66,1.0]],
  [[1.60,64,.65],[2.65,62,.9]],
  [[.65,66,.6],[2.1,69,1.15]],
  [[1.65,71,.7],[2.7,69,1]],
  [[.65,68,.85],[2.7,64,.8]],
  [[1.6,66,.85]],
  [[.6,67,.7],[1.7,66,.65],[2.8,64,.7]],
  [[1.6,64,.8],[2.65,61,.85]],
];

for (let bar=0; bar<bars; bar++) {
  const progression = bar % 8, phrase = Math.floor(bar/8), chord=chords[progression];
  const start = bar*4*beat;
  const human = (rng()-.5)*.015;
  // Low, hand-spaced EP chord then a lighter off-beat answer.
  chord.notes.forEach((n,i)=>ep(n, start+.025+i*.012+human, .095-(i*.006), -.32+i*.17, 2.2));
  if (progression!==3 && progression!==7 || phrase%2===0) {
    chord.notes.slice(1).forEach((n,i)=>ep(n, start+(2.5+(bar%2 ? .04:0))*beat+i*.01, .045, .19-i*.15, 1.6));
  }
  bass(chord.root,start+.008,beat*1.55,.205);
  bass(chord.root+12,start+2.65*beat,beat*.90,.13);
  if(bar%4===3) bass(chord.root+7,start+3.65*beat,beat*.27,.08);
  // Backbeat is deliberately small; a few omitted hats give it breathing room.
  kick(start,.235); snare(start+beat+.025,.088);
  if(bar%4!==2) kick(start+2.5*beat,.145);
  snare(start+3*beat+.03,.077);
  for(let eighth=0;eighth<8;eighth++) {
    if((bar+eighth)%7===0) continue;
    const swing=eighth%2 ? .055*beat : 0;
    hat(start+eighth*.5*beat+swing, eighth%2 ? .028 : .019);
  }
  // Melody rests on selected bars, and middle phrases answer rather than stack.
  if(!([1,4].includes(phrase) && [1,3,5,7].includes(progression))) {
    for(const [at,pitch,length] of motif[progression]) {
      let note=pitch;
      if(phrase===2 && progression===0) note=73;
      if(phrase===3 && progression===2 && pitch===69) note=71;
      if(phrase===5 && progression===6 && pitch===67) note=71;
      ep(note,start+at*beat+.018,.074, .24, length*beat);
    }
  }
}

// A short stereo room plus very quiet dotted-eighth reflections. All finite
// delays wrap so ambience is fully continuous through the loop boundary.
const dry = music.map(c=>c.slice());
for (const [delay,level,swap] of [[.037,.09,false],[.061,.07,true],[.117,.08,false],[.183,.055,true],[beat*.75,.105,true],[beat*1.5,.05,false],[beat*2.25,.025,true]]) {
  const offset = Math.round(delay*rate), n=music[0].length;
  for(let c=0;c<2;c++) for(let i=0;i<n;i++) music[c][i]+=dry[swap?1-c:c][(i-offset+n)%n]*level;
}
// Circular low-pass: pre-run once so no filter-start transient is introduced.
function lowPass(channels, cutoff) {
  const a = 1-Math.exp(-TAU*cutoff/rate);
  for(const data of channels) {
    let value=0;
    for(let i=0;i<data.length;i++) value+=a*(data[i]-value);
    for(let i=0;i<data.length;i++) { value+=a*(data[i]-value); data[i]=value; }
  }
}
lowPass(music, 5600);

let rain=stereo(41);
const rainRng=random(0x7a1a2026);
// Filtered stochastic rain, with very slow periodic swells; no added music,
// thunder, voices or disruptive foreground impacts.
for(let c=0;c<2;c++) {
  let brown=0, pink=0, previousLow=0;
  for(let i=0;i<rain[c].length;i++) {
    const white=rainRng()*2-1;
    brown=.997*brown+.003*white;
    pink=.94*pink+.06*white;
    const broad=.65*pink+.25*white+.1*brown;
    previousLow+=.014*(broad-previousLow);
    const t=i/rate;
    const swell=.94+.035*Math.sin(TAU*t/40)+.025*Math.cos(TAU*t/20+c*.3);
    rain[c][i]=(broad-previousLow)*swell;
  }
  // Equal-gain splice of the extra last second into the first second, then
  // remove that extra second. The loop edge now adjoins consecutive samples.
  const length=rate;
  for(let i=0;i<length;i++) {
    const mix=.5-.5*Math.cos(Math.PI*i/(length-1));
    rain[c][i]=rain[c][i]*mix+rain[c][rain[c].length-length+i]*(1-mix);
  }
}
rain=rain.map(channel=>channel.slice(0,40*rate));
lowPass(rain, 6200);

function master(channels, targetPeak) {
  let peak=0;
  for(const channel of channels) for(let i=0;i<channel.length;i++) peak=Math.max(peak,Math.abs(channel[i]));
  const gain=targetPeak/peak;
  for(const channel of channels) for(let i=0;i<channel.length;i++) channel[i]=Math.tanh(channel[i]*gain*.9)/Math.tanh(.9)*targetPeak;
  // The gentle nonlinear master above is normalized again to the actual target.
  let actual=0;
  for(const channel of channels) for(let i=0;i<channel.length;i++) actual=Math.max(actual,Math.abs(channel[i]));
  for(const channel of channels) for(let i=0;i<channel.length;i++) channel[i]*=targetPeak/actual;
}
master(music,.70); master(rain,.43);

function stats(channels) {
  let peak=0,sum=0,clipped=0,steps=0,maxStep=0;
  const seams=[];
  for(const channel of channels) {
    seams.push(Math.abs(channel[0]-channel.at(-1)));
    for(let i=0;i<channel.length;i++) {
      const x=channel[i],step=Math.abs(x-channel[(i+channel.length-1)%channel.length]);
      peak=Math.max(peak,Math.abs(x)); sum+=x*x; clipped+=Math.abs(x)>=1?1:0;
      steps+=step*step;maxStep=Math.max(maxStep,step);
    }
  }
  const count=channels[0].length*channels.length;
  return {seconds:channels[0].length/rate,sampleRate:rate,channels:channels.length,samplesPerChannel:channels[0].length,
    peakDbFS:20*Math.log10(peak),rmsDbFS:20*Math.log10(Math.sqrt(sum/count)),clippedSamples:clipped,
    boundaryStep:seams,rmsAdjacentStep:Math.sqrt(steps/count),maximumAdjacentStep:maxStep};
}
async function wav(path,channels) {
  const count=channels[0].length, buffer=Buffer.alloc(44+count*4);
  buffer.write('RIFF');buffer.writeUInt32LE(buffer.length-8,4);buffer.write('WAVE',8);buffer.write('fmt ',12);
  buffer.writeUInt32LE(16,16);buffer.writeUInt16LE(1,20);buffer.writeUInt16LE(2,22);
  buffer.writeUInt32LE(rate,24);buffer.writeUInt32LE(rate*4,28);buffer.writeUInt16LE(4,32);buffer.writeUInt16LE(16,34);
  buffer.write('data',36);buffer.writeUInt32LE(count*4,40);
  for(let i=0;i<count;i++)for(let c=0;c<2;c++)buffer.writeInt16LE(Math.max(-32768,Math.min(32767,Math.round(channels[c][i]*32767))),44+i*4+c*2);
  await writeFile(path,buffer);
}
function run(args) {
  const result=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-y',...args],{encoding:'utf8'});
  if(result.error || result.status!==0) throw new Error(result.error?.message||result.stderr||'ffmpeg failed');
}
async function encodedReport(filename) {
  const file=resolve(output,filename);
  const decoded=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-i',file,'-f','f32le','-acodec','pcm_f32le','-'],{maxBuffer:100*1024*1024});
  if(decoded.error||decoded.status!==0)throw new Error(decoded.error?.message||decoded.stderr.toString());
  const frames=decoded.stdout.length/8,channels=[new Float32Array(frames),new Float32Array(frames)];
  for(let i=0;i<frames;i++)for(let c=0;c<2;c++)channels[c][i]=decoded.stdout.readFloatLE(i*8+c*4);
  return {file:filename,bytes:(await stat(file)).size,sha256:createHash('sha256').update(await readFile(file)).digest('hex'),decoded:stats(channels)};
}
const metadata={title:'After Hours',artist:'After Bedtime Labs',comment:'Original procedural composition. No external recordings or samples. 74 BPM, 48 bars.'};
const musicWav=resolve(output,'after-hours-master.wav'), rainWav=resolve(output,'window-rain-master.wav');
await wav(musicWav,music);await wav(rainWav,rain);
run(['-i',musicWav,'-c:a','libvorbis','-q:a','5',...Object.entries(metadata).flatMap(([k,v])=>['-metadata',`${k}=${v}`]),resolve(output,'after-hours.ogg')]);
run(['-i',rainWav,'-c:a','libvorbis','-q:a','4','-metadata','title=Window Rain','-metadata','artist=After Bedtime Labs','-metadata','comment=Original deterministic filtered-noise rain ambience. No recordings.',resolve(output,'window-rain.ogg')]);
// A full lossless edition for owner listening/seam review, kept alongside web audio.
run(['-i',musicWav,'-c:a','flac','-compression_level','8',...Object.entries(metadata).flatMap(([k,v])=>['-metadata',`${k}=${v}`]),resolve(output,'after-hours.flac')]);
const report={title:'After Hours',bpm,bars,key:'D major',chordSequence:chords.map(c=>c.name),music:stats(music),rain:stats(rain),
  source:'scripts/generate-ambient-audio.mjs',origin:'New deterministic additive/FM/noise synthesis; no external samples, recordings, soundfonts, streams, or paid APIs.',
  encoded:await Promise.all(['after-hours.ogg','window-rain.ogg','after-hours.flac'].map(encodedReport)),
  verification:'Numerical signal and full encoded-file decoding validation only. No speaker playback. Owner listening and subjective musical approval remain pending.'};
await writeFile(resolve(output,'audio-analysis.json'),JSON.stringify(report,null,2)+'\n');
await unlink(musicWav);await unlink(rainWav);
console.log(JSON.stringify(report,null,2));
