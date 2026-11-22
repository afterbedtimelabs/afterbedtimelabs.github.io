"""Integer-grid authored pixel art. Python 3.10+ / Pillow 12.3.0.

No input bitmap, resize-to-native, antialiasing, quantization, randomness or AI
image dependency. Coordinates are inclusive. Transparent pixels are index 0.
Run from any working directory; generated files are committed for Node-only use.
"""
from pathlib import Path
import json
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'public/mascot/tinker-panda-v2'
PAL = json.loads((ROOT / 'art/tinker-panda/palette.json').read_text())
C = {name: tuple(bytes.fromhex(value[1:])) + (255,) for name, value in PAL.items()}
SIZE = 64

def canvas(): return Image.new('RGBA', (SIZE, SIZE))
def pen(im): return ImageDraw.Draw(im)
def poly(im, points, color):
    assert all(isinstance(v, int) for p in points for v in p)
    pen(im).polygon(points, fill=C[color])
def box(im, xy, color):
    assert all(isinstance(v, int) for v in xy)
    pen(im).rectangle(xy, fill=C[color])
def line(im, points, color, width=1): pen(im).line(points, fill=C[color], width=width)
def ellipse(im, xy, color): pen(im).ellipse(xy, fill=C[color])
def stamp(im, layer, dx=0, dy=0): im.alpha_composite(layer, (dx, dy))

def emblem(im, x, y, base='hood'):
    # Crescent ABOVE a bed: 7 × 8, single shared pixel glyph.
    for dx, dy in [(2,0),(3,0),(1,1),(1,2),(2,3),(3,3),(4,2),
                   (0,5),(0,6),(0,7),(1,5),(2,5),(3,5),(4,5),(5,5),(6,5),(6,6),(6,7),(1,4)]:
        box(im,(x+dx,y+dy,x+dx,y+dy),'teal')

def tail(sway=0):
    im=canvas()
    poly(im,[(20,34),(13,33),(8,35),(5,39),(3,44),(3,49),(5,53),(9,56),(15,57),(22,55),(26,51),(25,41)],'outline')
    poly(im,[(20,35),(13,35),(9,37),(6,41),(5,45),(5,49),(7,52),(11,55),(16,55),(23,52),(24,46)],'fur')
    # Three separately authored, connected cream bands, clipped to tail interior.
    mask=im.getchannel('A')
    bands=canvas()
    for pts in [[(8,37),(10,36),(7,43),(7,49),(9,53),(7,52),(5,48),(6,42)],
                [(13,35),(15,35),(12,42),(11,49),(14,55),(12,55),(9,49),(10,42)],
                [(18,35),(21,36),(17,43),(15,49),(18,54),(16,55),(13,49),(14,42)]]:
        poly(bands,pts,'cream')
    for y in range(64):
        for x in range(64):
            if bands.getpixel((x,y))[3] and im.getpixel((x,y)) != C['outline'] and mask.getpixel((x,y)):
                im.putpixel((x,y),bands.getpixel((x,y)))
    if sway:
        shifted=canvas()
        # Distal tail moves 1 px; attachment at x >= 23 stays fixed.
        for y in range(64):
            for x in range(64):
                if im.getpixel((x,y))[3]: shifted.putpixel((x,y+(sway if x<17 else 0)),im.getpixel((x,y)))
        return shifted
    return im

def body(breathe=0, back=False):
    im=canvas()
    # Fixed feet and ground anchor (32, 60).
    for x in (21,34):
        box(im,(x,54,x+7,59),'outline'); box(im,(x+1,55,x+6,58),'furShadow')
        box(im,(x+1,56,x+2,58),'furLight'); box(im,(x+4,57,x+5,58),'fur')
    poly(im,[(20,33),(40,33),(44,38),(47,47),(44,54),(39,57),(22,57),(17,53),(15,46),(17,38)],'outline')
    poly(im,[(21,35),(39,35),(42,39),(45,47),(42,52),(38,55),(23,55),(19,52),(17,46),(19,39)],'hood')
    poly(im,[(18,43),(21,39),(21,49),(23,53),(38,53),(42,50),(44,47),(43,53),(39,56),(22,56),(18,52)],'hoodShadow')
    line(im,[(20,39),(18,44),(18,48)],'hoodLight')
    line(im,[(40,39),(42,42),(43,46)],'hoodLight')
    poly(im,[(20,34),(24,32),(38,32),(42,35),(39,40),(24,40)],'hoodShadow')
    line(im,[(22,35),(26,38),(36,38),(40,35)],'hoodLight')
    if back:
        poly(im,[(22,35),(39,35),(37,41),(33,43),(27,42),(23,39)],'hoodShadow')
        line(im,[(23,36),(26,39),(34,40),(38,37)],'hoodLight')
        line(im,[(21,44),(20,51),(39,51)],'hoodLight')
    else:
        for x in (25,35):
            box(im,(x-1,38+breathe,x+1,45+breathe),'outline')
            box(im,(x,38+breathe,x,43+breathe),'teal'); box(im,(x,45+breathe,x,45+breathe),'cream')
            box(im,(x+1,39+breathe,x+1,43+breathe),'tealShadow')
        line(im,[(26,49),(24,51),(36,51),(35,49)],'hoodLight')
    # Leather cross-body strap and default utility pouch at viewer right.
    line(im,[(40,37),(36,45),(39,50)],'outline',3)
    line(im,[(40,37),(37,45),(40,50)],'leatherLight')
    box(im,(39,44,49,55),'outline'); box(im,(40,45,48,54),'leather')
    box(im,(40,45,48,47),'leatherLight'); box(im,(41,46,47,46),'gold')
    box(im,(41,47,47,54),'cream'); emblem(im,41,47)
    box(im,(38,47,39,49),'gold')
    if breathe:
        # One-row collar rise only; face is translated rigidly below.
        line(im,[(22,34),(39,34)],'hoodLight')
    return im

def bow(im,x,y,portrait_size=False):
    # Teal bow on her right ear: viewer-left from the front, viewer-right behind.
    # Both sizes are separately authored integer geometry, not scaled bitmaps.
    if portrait_size:
        outer=[(0,0),(6,2),(8,2),(14,0),(15,1),(15,8),(14,9),(8,6),(6,6),(0,9)]
        left=[(1,2),(5,3),(6,4),(5,6),(1,7)]
        right=[(9,3),(13,2),(14,2),(14,7),(9,6)]
        knot=(6,3,8,5)
    else:
        outer=[(0,0),(4,1),(6,2),(10,0),(11,1),(11,6),(10,7),(6,5),(4,5),(0,7)]
        left=[(1,1),(3,2),(4,3),(3,5),(1,6)]
        right=[(7,3),(10,1),(10,6),(7,4)]
        knot=(4,2,6,4)
    shift=lambda pts:[(x+dx,y+dy) for dx,dy in pts]
    poly(im,shift(outer),'outline')
    poly(im,shift(left),'teal'); poly(im,shift(right),'teal')
    box(im,(x+knot[0],y+knot[1],x+knot[2],y+knot[3]),'tealShadow')
    box(im,(x+knot[0]+1,y+knot[1],x+knot[0]+1,y+knot[1]+1),'teal')

def eye(im,x,y,state='neutral',mirror=False):
    if state in ('blink','happy'):
        pts=[(x,y+4),(x+1,y+2),(x+3,y+1),(x+5,y+3)] if state=='happy' else [(x,y+3),(x+2,y+4),(x+4,y+4),(x+5,y+3)]
        line(im,pts,'outline')
        if mirror: line(im,[(x+5,y+3),(x+6,y+2)],'outline')
        else: line(im,[(x,y+3),(x-1,y+2)],'outline')
        return
    ellipse(im,(x,y,x+7,y+9),'outline')
    ellipse(im,(x+1,y+2,x+6,y+8),'amber')
    box(im,(x+2,y+2,x+5,y+5),'outline')
    box(im,(x+2,y+2,x+3,y+3),'highlight')
    box(im,(x+5,y+6,x+5,y+7),'eyeLight')
    if state in ('sleepy','half'):
        box(im,(x,y,x+7,y+4),'cream')
        line(im,[(x,y+5),(x+7,y+5)],'outline')
        if mirror: line(im,[(x+7,y+5),(x+8,y+4)],'outline')
        else: line(im,[(x,y+5),(x-1,y+4)],'outline')
    elif mirror: line(im,[(x+6,y+2),(x+8,y+1)],'outline')
    else: line(im,[(x+1,y+2),(x-1,y+1)],'outline')

def head(expression='neutral',back=False):
    im=canvas()
    # One continuous silhouette: ears are part of the head, never separate shapes.
    # Binary one-pixel erosion creates the outline without antialiasing.
    outline=[(10,22),(9,16),(10,11),(12,7),(15,5),(19,5),(22,7),(25,12),
             (28,11),(30,9),(32,11),(35,10),(37,13),(40,12),(43,7),
             (46,5),(50,5),(53,8),(54,12),(54,17),(52,22),(54,26),
             (54,29),(52,32),(48,35),(43,37),(37,38),(25,38),(19,37),
             (14,35),(10,32),(8,29),(8,26)]
    poly(im,outline,'outline')
    inner=im.getchannel('A').filter(ImageFilter.MinFilter(3))
    im.paste(C['fur'],(0,0,64,64),inner)
    # Short, rounded cream ears; open rust roots blend into the forehead.
    ellipse(im,(11,7,23,23),'cream')
    ellipse(im,(15,10,22,20),'ear')
    ellipse(im,(16,13,21,21),'creamShadow')
    ellipse(im,(41,7,52,23),'cream')
    ellipse(im,(43,10,49,20),'ear')
    ellipse(im,(44,13,48,21),'creamShadow')
    poly(im,[(11,21),(16,18),(21,16),(25,14),(28,13),(32,13),(36,14),
             (40,15),(46,18),(51,21),(52,25),(49,30),(42,35),(21,35),(12,29)],'fur')
    poly(im,[(13,21),(18,17),(23,16),(22,19),(18,21),(14,25)],'furLight')
    poly(im,[(10,29),(15,33),(21,35),(42,35),(50,32),(52,29),
             (50,32),(47,34),(42,36),(37,37),(25,37),(19,36),(14,34)],'furShadow')
    if back:
        poly(im,[(15,30),(20,32),(24,30),(27,33),(31,31),(35,34),(39,31),(43,33),(48,30),(46,34),(40,36),(24,36),(18,34)],'furLight')
        bow(im,42,13)
        return im
    # Rounded eye masks merge into a plump muzzle, leaving a small orange bridge.
    ellipse(im,(13,20,29,34),'cream')
    ellipse(im,(34,20,50,34),'cream')
    ellipse(im,(20,27,43,36),'cream')
    poly(im,[(27,20),(31,18),(35,21),(34,26),(32,28),(30,28),(28,26)],'fur')
    box(im,(19,18,23,19),'cream'); box(im,(38,18,42,19),'cream')
    eye(im,18,21,expression); eye(im,36,21,expression,True)
    box(im,(14,30,18,31),'cheek'); box(im,(45,30,49,31),'cheek')
    box(im,(29,28,32,28),'outline'); box(im,(30,29,31,29),'outline')
    box(im,(29,28,29,28),'hoodLight')
    if expression=='curious':
        box(im,(30,32,32,34),'outline'); box(im,(31,32,31,32),'cream')
    elif expression=='happy':
        poly(im,[(28,31),(33,31),(33,33),(32,34),(29,34),(28,33)],'outline'); box(im,(29,33,32,33),'cheek')
    else:
        line(im,[(28,32),(29,33),(32,33),(33,32)],'outline')
    if expression=='curious': box(im,(38,17,42,17),'cream')
    bow(im,10,13)
    return im

def front(expression='neutral',rise=0,breathe=0,sway=0):
    im=tail(sway); stamp(im,body(breathe)); stamp(im,head(expression),0,-rise); return im

def back():
    im=canvas(); stamp(im,tail().transpose(Image.Transpose.FLIP_LEFT_RIGHT),-1,0)
    stamp(im,body(back=True).transpose(Image.Transpose.FLIP_LEFT_RIGHT),-1,0)
    stamp(im,head(back=True)); return im

def side():
    im=tail()
    box(im,(30,53,39,59),'outline'); box(im,(31,55,38,58),'furShadow')
    poly(im,[(28,33),(39,33),(43,40),(44,51),(41,56),(25,56),(22,51),(23,42)],'outline')
    poly(im,[(29,35),(38,35),(41,41),(42,50),(39,54),(26,54),(24,50),(25,42)],'hood')
    poly(im,[(25,34),(38,34),(40,37),(35,41),(28,41),(24,37)],'hoodShadow')
    line(im,[(26,35),(29,38),(35,38),(38,36)],'hoodLight')
    line(im,[(39,39),(40,45)],'teal')
    line(im,[(28,38),(23,49)],'leatherLight',2)
    box(im,(21,46,31,55),'outline'); box(im,(22,47,30,54),'leatherLight')
    box(im,(23,47,29,54),'cream'); emblem(im,23,47)
    emblem(im,32,43)
    poly(im,[(25,16),(25,9),(28,4),(31,3),(35,6),(37,13),(41,16),(44,22),(49,26),(49,30),(45,33),(37,36),(27,35),(20,31),(18,28),(21,26),(18,23),(22,21)],'outline')
    poly(im,[(27,17),(27,10),(30,5),(32,5),(34,8),(35,15),(39,18),(42,23),(47,27),(47,30),(43,32),(36,34),(28,33),(22,30),(23,27),(21,24),(25,22)],'fur')
    poly(im,[(28,17),(28,10),(31,7),(33,10),(33,16),(31,20)],'cream')
    poly(im,[(30,16),(30,11),(31,10),(32,13),(31,17)],'ear')
    poly(im,[(39,20),(42,23),(43,26),(47,27),(47,30),(43,32),(38,33),(35,30),(36,24)],'cream')
    eye(im,37,23); box(im,(46,27,48,28),'outline')
    line(im,[(44,30),(45,31),(46,30)],'outline')
    box(im,(35,30,37,31),'cheek'); bow(im,24,14); return im

def portrait(expression='neutral'):
    # Dedicated 64px composition, hand-authored at native resolution.
    im=canvas()
    poly(im,[(17,45),(44,45),(52,51),(57,63),(5,63),(9,53)],'outline')
    poly(im,[(18,47),(43,47),(50,52),(54,63),(8,63),(12,54)],'hood')
    poly(im,[(19,47),(25,52),(36,52),(43,47),(41,54),(23,55)],'hoodShadow')
    for x in (23,37):
        box(im,(x-1,53,x+2,62),'outline'); box(im,(x,54,x+1,60),'teal'); box(im,(x,62,x+1,63),'cream')
    line(im,[(47,50),(43,59),(44,63)],'leatherLight',2)
    emblem(im,47,55)
    face=canvas()
    poly(face,[(4,28),(3,17),(5,10),(8,5),(12,3),(17,3),(22,8),(26,15),
               (29,14),(32,12),(35,15),(39,15),(44,7),(48,3),(53,3),
               (58,7),(60,14),(59,23),(58,28),(61,34),(61,40),(57,44),
               (51,48),(43,51),(22,51),(13,48),(6,43),(2,39),(2,34)],'outline')
    mask=face.getchannel('A').filter(ImageFilter.MinFilter(3))
    face.paste(C['fur'],(0,0,64,64),mask)
    ellipse(face,(6,6,23,27),'cream'); ellipse(face,(11,10,20,23),'ear')
    ellipse(face,(41,6,57,27),'cream'); ellipse(face,(44,10,53,23),'ear')
    poly(face,[(6,27),(13,22),(21,19),(26,17),(38,17),(45,21),(56,27),
               (59,35),(56,43),(48,47),(22,48),(11,44),(4,37)],'fur')
    poly(face,[(8,28),(14,23),(21,20),(23,21),(18,24),(11,30)],'furLight')
    poly(face,[(5,39),(13,45),(22,48),(43,48),(52,45),(58,40),(56,44),
               (50,47),(42,50),(23,50),(14,47),(8,43)],'furShadow')
    stamp(im,face)
    ellipse(im,(8,26,29,45),'cream'); ellipse(im,(34,26,55,45),'cream')
    ellipse(im,(18,34,46,48),'cream')
    for x in (17,39):
        ellipse(im,(x,28,x+8,39),'outline'); ellipse(im,(x+1,30,x+7,38),'amber')
        box(im,(x+2,30,x+6,35),'outline'); box(im,(x+2,30,x+4,32),'highlight')
        box(im,(x+5,36,x+6,37),'eyeLight')
    line(im,[(18,30),(15,28)],'outline')
    line(im,[(46,30),(49,28)],'outline')
    box(im,(18,22,22,23),'cream'); box(im,(41,22,45,23),'cream')
    box(im,(10,40,15,42),'cheek'); box(im,(49,40,54,42),'cheek')
    poly(im,[(29,37),(34,37),(34,38),(32,40),(31,40),(29,38)],'outline')
    box(im,(30,37,31,37),'hoodLight')
    line(im,[(28,43),(29,45),(33,45),(35,43)],'outline')
    bow(im,6,18,portrait_size=True)
    return im

def indexed(im):
    colors=[(0,0,0)]+[c[:3] for c in C.values()]
    lookup={c:i+1 for i,c in enumerate(C.values())}
    p=Image.new('P', im.size); p.putpalette(sum((list(c) for c in colors),[])+[0]*(768-3*len(colors)))
    p.putdata([lookup[px] if px[3] else 0 for px in im.get_flattened_data()]); p.info['transparency']=0
    return p

def write(im,path):
    target=OUT/path; target.parent.mkdir(parents=True,exist_ok=True)
    indexed(im).save(target,transparency=0,optimize=False)

def generate():
    OUT.mkdir(parents=True,exist_ok=True)
    expressions=['neutral','happy','blink','curious','sleepy']
    for name in expressions: write(front(name),Path('expressions')/f'{name}.png')
    for name,im in [('front',front()),('side',side()),('back',back()),('portrait',portrait())]: write(im,Path(f'{name}.png'))
    animations={
        'idle':([front(),front(rise=1,breathe=1)],[1200,1200]),
        'blink':([front(),front('half'),front('blink'),front('half')],[2800,80,120,80]),
        'happy':([front('happy')]+[canvas() for _ in range(3)],[500,120,160,120]),
        'tail':([front(sway=0),front(sway=1),front(sway=0),front(sway=-1)],[280,280,280,280]),
    }
    # Happy bounce translates the whole figure, preserving head/body relation.
    for idx,dy in enumerate([-1,-3,-1],1): stamp(animations['happy'][0][idx],front('happy'),0,dy)
    manifest={'version':2,'status':'draft-awaiting-visual-approval','frameSize':64,'anchor':[32,60],
              'palette':PAL,'expressions':expressions,'animations':{}}
    for name,(frames,timings) in animations.items():
        atlas=Image.new('RGBA',(64*len(frames),64))
        for i,im in enumerate(frames):
            write(im,Path('frames')/f'{name}-{i}.png'); atlas.alpha_composite(im,(i*64,0))
        write(atlas,Path('atlases')/f'{name}.png')
        previews=[indexed(im.resize((256,256),Image.Resampling.NEAREST)) for im in frames]
        previews[0].save(OUT/f'{name}.gif',save_all=True,append_images=previews[1:],duration=timings,loop=0,
                         transparency=0,disposal=2,optimize=False)
        manifest['animations'][name]={'frames':len(frames),'durationsMs':timings,'atlas':f'atlases/{name}.png',
                                      'offsetsY':[0,-1,-3,-1] if name=='happy' else [0]*len(frames)}
    atlas=Image.new('RGBA',(64*5,64))
    for i,name in enumerate(expressions): atlas.alpha_composite(front(name),(i*64,0))
    write(atlas,Path('atlases/expressions.png'))
    atlas=Image.new('RGBA',(64*4,64))
    for i,im in enumerate([front(),side(),back(),portrait()]): atlas.alpha_composite(im,(i*64,0))
    write(atlas,Path('atlases/views.png'))
    (OUT/'manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
    print(f'Generated Tinker Panda V2: 19 opaque palette colors; 14 animation frames: {OUT}')

if __name__=='__main__': generate()
