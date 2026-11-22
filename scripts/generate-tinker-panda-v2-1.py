"""Tinker Panda 2.1 production; all art authored on integer 64-pixel grids.
Python 3.10+ / Pillow 12.3.0. Run from any directory.
Reads frozen approved candidate B and V2 source geometry. Never updates website.
"""
from pathlib import Path
import importlib.util, json, hashlib, shutil, sys
sys.dont_write_bytecode=True
from PIL import Image, ImageDraw, ImageFont

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'public/mascot/tinker-panda-v2.1'
DOC=ROOT/'docs/mascot-v2.1'
def module(name,path):
    spec=importlib.util.spec_from_file_location(name,path)
    m=importlib.util.module_from_spec(spec);spec.loader.exec_module(m);return m
v2=module('tinker_v2',ROOT/'scripts/generate-tinker-panda.py')
face=module('tinker_candidates',ROOT/'art/tinker-panda-v2.1/generate.py')
PAL=v2.PAL;C=v2.C
APPROVED=ROOT/'art/tinker-panda-v2.1/candidates/B.png'
APPROVED_SHA='a07781439461bc715463a6d830598e8eb93ef47ec508d346307d71915f534ba3'
assert hashlib.sha256(APPROVED.read_bytes()).hexdigest()==APPROVED_SHA,'Approved B was modified'
MASTER=Image.open(APPROVED).convert('RGBA')
assert MASTER.tobytes()==face.candidate('B').tobytes(),'Candidate source drift'
# Explicit pixel glyphs, shared iris/outline/highlight palette.
BLINK=['o........o','.oo....oo.','...oooo...']
JOY=['...oooo...','.oo....oo.','o........o']
HALF=['.dddddddd.','doooaaaadd','.daaaahad.','..dggggd..','...dddd...']
SLEEP=['..dddddd..','.doaaaad..','..daaad...','...ddd....']
CURIOUS=['...dddd...','..daoooa..','.daaohhho.','daaoohhhad',
         'daaoohhhad','daaoohoaad','daaaooahad','.daaaaggd.',
         '.dagggggd.','..dggggd..','...dddd...']
PORTRAIT_EYE=['....dddd....','..ddoooodd..','.dhhhooooad.','dhhhhoooaaad',
              'dhhhhoooaaad','dohhhoooaaad','doooooooaaad','doooooaaahad',
              'dooooaaaagad','.daaaaaaggd.',
              '.daaggggggd.','..dagggggd..','...dggggd...','....dddd....']
SIDE_EYE=['..ddd..','.dhooa.','dhhhoad','dhooaad',
          'dooaahd','.daaggd','..dggd.','...dd..']
def glyph(im,x,y,rows):face.glyph(im,x,y,rows)
def wipe(im,rect,color='cream'):
    for y in range(rect[1],rect[3]+1):
        for x in range(rect[0],rect[2]+1):im.putpixel((x,y),C[color])
def expression(name='neutral'):
    im=MASTER.copy()
    if name=='neutral':return im
    if name in ('blink','half','happy','sleepy','curious'):
        for x in (17,37):
            wipe(im,(x,20,x+9,30))
            rows,yy={'blink':(BLINK,25),'half':(HALF,24),'happy':(JOY,23),
                     'sleepy':(SLEEP,25),'curious':(CURIOUS,20)}[name]
            glyph(im,x,yy,rows)
    if name in ('sleepy','curious'):
        wipe(im,(29,32,34,35))
        if name=='sleepy':glyph(im,29,33,['o....o','.oooo.'])
        else:glyph(im,30,32,['.oo.','occo','occo','.oo.'])
    return im
def head(name='neutral'):
    # Keep the original attached-ear silhouette, with B's complete facial region.
    im=v2.head()
    im.paste(expression(name).crop((11,17,52,37)),(11,17))
    return im
def front(name='neutral',rise=0,breathe=0,sway=0):
    im=v2.tail(sway);v2.stamp(im,v2.body(breathe));v2.stamp(im,head(name),0,-rise)
    return im
def side():
    im=v2.side()
    # Replace only the old face; retain profile outline, bow, clothes and tail.
    for y in range(20,33):
        for x in range(35,47):
            if all(im.getpixel((x+dx,y+dy))[3] for dx in (-1,0,1) for dy in (-1,0,1)):
                im.putpixel((x,y),C['cream'])
    glyph(im,36,22,SIDE_EYE)
    glyph(im,46,27,['oo','o.'])
    glyph(im,43,30,['ooo','opo','.o.'])
    face.run(im,31,35,37,'cheek')
    face.run(im,32,36,39,'creamShadow')
    return im
def portrait():
    im=v2.portrait()
    # Dedicated native portrait, with an independently authored 12x14 B-style eye.
    for y in range(22,50):
        for x in range(6,58):
            if all(im.getpixel((x+dx,y+dy))[3] for dx in (-1,0,1) for dy in (-1,0,1)):
                im.putpixel((x,y),C['fur'])
    spans=[(18,23),(16,24),(14,25),(13,26),(12,27),(11,28),(10,28),
           (9,29),(9,29),(8,29),(8,30),(9,30),(9,30),(10,31),(11,31),
           (13,31),(15,31),(18,31),(21,31)]
    for y,(l,r) in enumerate(spans,27):
        face.run(im,y,l,r,'cream');face.run(im,y,63-r,63-l,'cream')
    for y,l,r in [(36,28,35),(37,27,36),(38,26,37),(39,24,39),
                  (40,22,41),(41,20,43),(42,20,43),(43,21,42),
                  (44,21,42),(45,22,41),(46,24,39),(47,27,36)]:
        face.run(im,y,l,r,'cream')
    for y,l,r in [(23,18,22),(24,17,23)]:
        face.run(im,y,l,r,'cream');face.run(im,y,63-r,63-l,'cream')
    for y,l,r in [(41,10,14),(42,11,15)]:
        face.run(im,y,l,r,'cheek');face.run(im,y,63-r,63-l,'cheek')
    for y,l,r in [(44,13,16),(45,16,20),(46,20,23),(47,24,26),(48,28,35)]:
        face.run(im,y,l,r,'creamShadow')
        if y<48:face.run(im,y,63-r,63-l,'creamShadow')
    glyph(im,15,27,PORTRAIT_EYE);glyph(im,37,27,PORTRAIT_EYE)
    glyph(im,29,39,['doooo','.ooo.','..o..'])
    glyph(im,28,43,['ooooooo','opppppo','.opppo.','..ooo..'])
    # The approved bow remains the same separately authored portrait-size bow.
    im.paste(v2.portrait().crop((6,18,22,28)),(6,18))
    return im
def write(im,path):
    path=OUT/path;path.parent.mkdir(parents=True,exist_ok=True)
    v2.indexed(im).save(path,transparency=0,optimize=False)
def sequences():
    happy=front('happy')
    bounce=[]
    for dy in (0,-1,-3,-1):
        im=v2.canvas();v2.stamp(im,happy,0,dy);bounce.append(im)
    return {
      'idle':([front(),front(rise=1,breathe=1)],[1200,1200]),
      'blink':([front(),front('half'),front('blink'),front('half')],[2800,80,120,80]),
      'happy':(bounce,[500,120,160,120]),
      'tail':([front(sway=s) for s in (0,1,0,-1)],[280,280,280,280])
    }
def gif(frames,timing,path,scale):
    enlarged=[v2.indexed(im.resize((64*scale,64*scale),Image.Resampling.NEAREST)) for im in frames]
    path.parent.mkdir(parents=True,exist_ok=True)
    enlarged[0].save(path,save_all=True,append_images=enlarged[1:],duration=timing,
                     loop=0,transparency=0,disposal=2,optimize=False)
def generate():
    OUT.mkdir(parents=True,exist_ok=True);DOC.mkdir(parents=True,exist_ok=True)
    assert front().tobytes()==MASTER.tobytes(),'Canonical front differs from approved B'
    # Copy the master file itself: front.png remains byte-for-byte B, not just visually equal.
    shutil.copyfile(APPROVED,OUT/'front.png')
    for name,im in [('side',side()),('back',v2.back()),('portrait',portrait())]:write(im,Path(name+'.png'))
    expressions=['neutral','happy','blink','curious','sleepy']
    for name in expressions:write(expression(name),Path('expressions')/(name+'.png'))
    atlas=Image.new('RGBA',(320,64))
    for i,name in enumerate(expressions):atlas.alpha_composite(expression(name),(64*i,0))
    write(atlas,Path('atlases/expressions.png'))
    atlas=Image.new('RGBA',(256,64))
    for i,im in enumerate([front(),side(),v2.back(),portrait()]):atlas.alpha_composite(im,(64*i,0))
    write(atlas,Path('atlases/views.png'))
    manifest={'version':'2.1','frameSize':64,'anchor':[32,60],
      'approval':{'frontFace':'B approved by owner 2026-10-17','sha256':APPROVED_SHA,
                  'derivedAssets':'First production pass; review pending'},
      'palette':PAL,'expressions':expressions,'animations':{}}
    for name,(frames,timing) in sequences().items():
        atlas=Image.new('RGBA',(len(frames)*64,64))
        for i,im in enumerate(frames):
            write(im,Path('frames')/f'{name}-{i}.png');atlas.alpha_composite(im,(64*i,0))
        write(atlas,Path('atlases')/(name+'.png'))
        for scale in (1,4,8):gif(frames,timing,OUT/f'previews/{name}-{scale}x.gif',scale)
        manifest['animations'][name]={'frames':len(frames),'durationsMs':timing,
          'loopMs':sum(timing),'atlas':f'atlases/{name}.png',
          'offsetsY':[0,-1,-3,-1] if name=='happy' else [0]*len(frames),
          'previews':{str(s):f'previews/{name}-{s}x.gif' for s in (1,4,8)}}
    (OUT/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
    previews()
    print('Generated 29 native/atlas PNGs, 14 frames and 12 animated previews.')
def previews():
    bg='#F5EFE3';dark='#202D2C';ink='#392B2A';muted='#71695D'
    small=ImageFont.load_default(size=15);heading=ImageFont.load_default(size=22)
    def paste(board,im,x,y,s):
        im=im.resize((64*s,64*s),Image.Resampling.NEAREST);board.paste(im,(x,y),im)
    # 4x overview, with all expressions and turnaround.
    board=Image.new('RGB',(1472,988),bg);d=ImageDraw.Draw(board)
    d.text((24,18),'TINKER PANDA V2.1 / APPROVED B PRODUCTION',font=heading,fill=ink)
    d.text((24,51),'Front master is identical to approved B. Derived views, expressions and loops are ready for review.',font=small,fill=muted)
    for i,name in enumerate(['neutral','happy','blink','curious','sleepy']):
        x=16+292*i;d.text((x+8,86),name.title(),font=small,fill=ink)
        paste(board,expression(name),x+10,110,4)
        d.rectangle((x,380,x+279,659),fill=dark)
        paste(board,expression(name),x+10,390,4)
    for i,(name,im) in enumerate([('Front',front()),('Side',side()),('Back',v2.back()),('Portrait',portrait())]):
        x=32+350*i;d.text((x,694),name+' / 4x',font=small,fill=ink);paste(board,im,x,718,4)
    board.save(DOC/'production-review.png')
    # Every master/expression gets genuine 1x, 4x and 8x on both backgrounds.
    views={'front':front(),'side':side(),'back':v2.back(),'portrait':portrait()}
    views.update({f'expression-{n}':expression(n) for n in ['neutral','happy','blink','curious','sleepy']})
    for name,im in views.items():
        board=Image.new('RGB',(936,1304),bg);d=ImageDraw.Draw(board)
        d.text((24,20),'Tinker Panda 2.1 / '+name,font=heading,fill=ink)
        d.text((24,52),'Native 64px / integer nearest-neighbor 256px and 512px',font=small,fill=muted)
        for color,top,fg in [(bg,90,ink),(dark,690,'#FFF0CB')]:
            d.rectangle((0,top,935,top+599),fill=color)
            for s,x in [(1,24),(4,112),(8,392)]:
                d.text((x,top+18),f'{s}x / {64*s}px',font=small,fill=fg);paste(board,im,x,top+62,s)
        board.save(DOC/f'{name}-scales.png')
    # All source animation frames at 4x for alignment inspection.
    board=Image.new('RGB',(1184,1360),bg);d=ImageDraw.Draw(board)
    d.text((24,16),'ANIMATION FRAME STRIPS / EXACT 4x',font=heading,fill=ink)
    for row,(name,(frames,times)) in enumerate(sequences().items()):
        y=68+row*318;d.text((24,y),name.title(),font=heading,fill=ink)
        for col,(im,ms) in enumerate(zip(frames,times)):
            x=16+col*292;paste(board,im,x+10,y+30,4)
            d.text((x+10,y+287),f'Frame {col} / {ms}ms',font=small,fill=muted)
    board.save(DOC/'animation-frames.png')
    # Offline animation viewer. No app route, network scripts or site integration.
    html="""<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Tinker Panda production review</title><style>
body{margin:24px;font:16px system-ui;background:#f5efe3;color:#392b2a}
body.dark{background:#202d2c;color:#fff0cb}main{display:flex;gap:24px;overflow:auto}
img{image-rendering:pixelated;display:block}article{flex:none}h2{font-size:18px}
button,select{font:inherit;margin:6px;padding:8px}p{max-width:70ch}
</style><h1>Tinker Panda 2.1</h1><p>Approved face B. First production animation review.
Every source frame is 64 x 64. All loops use integer pixel movement.</p>
<label>Scale <select id="scale"><option value="1">1x / 64px</option><option value="4" selected>4x / 256px</option><option value="8">8x / 512px</option></select></label>
<button id="theme">Light / dark</button><button id="motion">Pause animations</button><main>"""
    for name in sequences():
        html+=f'<article><h2>{name.title()}</h2><img data-name="{name}" src="../../public/mascot/tinker-panda-v2.1/previews/{name}-4x.gif" width="256" height="256" alt="Tinker Panda {name} animation"></article>'
    html+="""</main><p>Front, side, back, portrait and expression PNGs are in the adjacent production asset folder.</p><script>
const root='../../public/mascot/tinker-panda-v2.1/';
let paused=matchMedia('(prefers-reduced-motion: reduce)').matches;
function refresh(){const s=Number(document.querySelector('#scale').value);document.querySelectorAll('img').forEach(im=>{im.width=im.height=64*s;im.src=root+(paused?'frames/'+im.dataset.name+'-0.png':'previews/'+im.dataset.name+'-'+s+'x.gif')});document.querySelector('#motion').textContent=paused?'Play animations':'Pause animations'}
document.querySelector('#scale').onchange=refresh;
document.querySelector('#theme').onclick=()=>document.body.classList.toggle('dark');
document.querySelector('#motion').onclick=()=>{paused=!paused;refresh()};
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',e=>{paused=e.matches;refresh()});refresh();
</script></html>"""
    (DOC/'review.html').write_text(html)
if __name__=='__main__':generate()
