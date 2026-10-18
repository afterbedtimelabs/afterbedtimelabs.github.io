"""V2.1 face studies: authored pixel clusters, never rasterized vector shapes.
Run: python generate.py (Pillow 12.3.0). Does not write production assets.
"""
from pathlib import Path
import json, hashlib
from PIL import Image, ImageDraw, ImageFont

ROOT=Path(__file__).resolve().parent
PAL=json.loads((ROOT/'palette.json').read_text())
C={k:tuple(bytes.fromhex(v[1:]))+(255,) for k,v in PAL.items()}
BASE=Image.open(ROOT/'previous.png').convert('RGBA')
OUT=ROOT/'candidates'
PRE=ROOT/'previews'
LEGEND={'o':'outline','d':'leather','a':'amber','g':'eyeLight',
        'h':'highlight','s':'creamShadow','c':'cream','p':'cheek','f':'fur'}
# Each character is ONE source pixel. "." leaves the pixel below untouched.
EYES={
'A':[
'...ddd...',
'..doood..',
'.dhhooao.',
'dhhhooaad',
'dhoooaaad',
'doooaaaad',
'.daaagaa.',
'.dagggad.',
'..dgggd..',
'...ddd...'],
'B':[
'...dddd...',
'..dooooa..',
'.dhhhooao.',
'dhhhooaaad',
'dhhhoooaad',
'dohoooaaad',
'doooaaahad',
'.daaaaggd.',
'.dagggggd.',
'..dggggd..',
'...dddd...'],
'C':[
'...ddd...',
'..doood..',
'.daohhod.',
'daoohhhad',
'daooohhad',
'daooogaad',
'.daaagaa.',
'.dagggad.',
'..dddd...']
}
MOUTHS={
'A':['o....o','.oooo.'],
'B':['oooooo','oppppo','.oppo.','..oo..'],
'C':['....o','.ooo.']
}
def px(im,x,y,color): im.putpixel((x,y),C[color])
def run(im,y,left,right,color):
    for x in range(left,right+1): px(im,x,y,color)
def glyph(im,x,y,rows,mirror=False):
    width=max(map(len,rows))
    for dy,row in enumerate(rows):
        for dx,ch in enumerate(row):
            if ch!='.': px(im,x+(width-1-dx if mirror else dx),y+dy,LEGEND[ch])
def face_base():
    im=BASE.copy()
    # Restore the face's interior only; original outside contour and ear bow stay.
    for y in range(17,37):
        for x in range(11,52):
            old=BASE.getpixel((x,y))
            interior=all(BASE.getpixel((x+dx,y+dy))[3] for dx in (-1,0,1) for dy in (-1,0,1))
            if old[3] and interior:
                px(im,x,y,'fur')
    # Explicit row contours: two cream eye masks curve into the cheek/muzzle.
    left=[(20,22),(18,24),(17,25),(16,26),(15,27),(15,28),
          (14,28),(13,29),(13,29),(12,29),(12,29),(13,29),
          (14,30),(16,31),(18,31),(21,31)]
    for y,(l,r) in enumerate(left,19):
        run(im,y,l,r,'cream')
        run(im,y,63-r,63-l,'cream')
    # Cream muzzle rises toward the nose, with a rounded jawline.
    for y,l,r in [(27,28,35),(28,27,36),(29,25,38),(30,22,41),
                  (31,19,44),(32,19,44),(33,20,43),(34,22,41),(35,26,37)]:
        run(im,y,l,r,'cream')
    # Fur tufts over the eyes are light, not dark eyebrows.
    for y,l,r in [(17,20,22),(18,19,23)]:
        run(im,y,l,r,'cream'); run(im,y,63-r,63-l,'cream')
    # Warm shadow follows lower cheeks, never crosses eyes or smile.
    for y,l,r in [(31,13,14),(32,14,16),(33,16,18),(34,19,21),
                  (35,22,25),(36,27,36)]:
        run(im,y,l,r,'creamShadow')
        if y<36: run(im,y,63-r,63-l,'creamShadow')
    # Short hand-set russet and peach clusters soften the mask's edge.
    for x,y in [(12,25),(12,26),(13,23),(14,22),(49,22),(50,23),(51,25),(51,26)]:
        px(im,x,y,'furLight')
    for y,l,r in [(30,14,16),(31,15,17)]:
        run(im,y,l,r,'cheek');run(im,y,63-r,63-l,'cheek')
    # Keep the previously requested girl cue. This is a deliberate teal bow.
    im.paste(BASE.crop((10,13,22,21)),(10,13))
    return im
def candidate(key):
    im=face_base()
    if key=='A':
        glyph(im,18,21,EYES[key]);glyph(im,37,21,EYES[key])
        glyph(im,29,33,MOUTHS[key])
    elif key=='B':
        glyph(im,17,20,EYES[key]);glyph(im,37,20,EYES[key])
        glyph(im,29,32,MOUTHS[key])
    else:
        glyph(im,18,22,EYES[key]);glyph(im,37,21,EYES[key])
        glyph(im,29,33,MOUTHS[key])
        # Raised cream tuft, one row higher on the curious side.
        run(im,17,40,43,'cream');run(im,18,40,43,'fur')
    # Tiny nose: a warm reflected pixel, two dark shoulders, one lower point.
    glyph(im,30,29,['doo','.o.'])
    # Remove old eye/nose/mouth pixels not covered by the new masks.
    return im
def digest(path):return hashlib.sha256(path.read_bytes()).hexdigest()
def save_indexed(im,path):
    colors=[(0,0,0)]+[c[:3] for c in C.values()]
    lookup={c:i+1 for i,c in enumerate(C.values())}
    p=Image.new('P',im.size)
    p.putpalette(sum((list(c) for c in colors),[])+[0]*(768-3*len(colors)))
    p.putdata([lookup[v] if v[3] else 0 for v in im.get_flattened_data()])
    p.save(path,transparency=0,optimize=False)
def render():
    OUT.mkdir(exist_ok=True);PRE.mkdir(exist_ok=True)
    sprites={'Previous':BASE}
    titles={'A':'A - Soft and Friendly','B':'B - Bright and Expressive','C':'C - Cozy and Curious'}
    for k in EYES:
        sprites[k]=candidate(k);save_indexed(sprites[k],OUT/f'{k}.png')
    font=ImageFont.load_default(size=20);small=ImageFont.load_default(size=15)
    def paste(board,im,x,y,s):
        enlarged=im.resize((64*s,64*s),Image.Resampling.NEAREST)
        board.paste(enlarged,(x,y),enlarged)
    # 4x side-by-side, light and dark. Width stays manageable in chat.
    board=Image.new('RGB',(1184,720),'#F5EFE3');d=ImageDraw.Draw(board)
    d.text((24,18),'TINKER PANDA V2.1 / FACE CANDIDATES',font=font,fill='#392B2A')
    d.text((24,49),'Same 64 x 64 silhouette and body. All sprites shown at exact 4x.',font=small,fill='#71695D')
    for i,(k,im) in enumerate(sprites.items()):
        x=16+292*i
        d.text((x+8,87),titles.get(k,'Previous - unapproved'),font=small,fill='#392B2A')
        paste(board,im,x+10,112,4)
        d.rectangle((x,388,x+279,683),fill='#202D2C')
        paste(board,im,x+10,404,4)
    d.text((24,695),'Review only. Native PNGs and full 1x / 4x / 8x previews are included.',font=small,fill='#71695D')
    board.save(PRE/'comparison-4x.png')
    # Per-sprite inspection boards: actual 1x, 4x and 8x on BOTH backgrounds.
    for k,im in sprites.items():
        board=Image.new('RGB',(936,1304),'#F5EFE3');d=ImageDraw.Draw(board)
        d.text((24,20),titles.get(k,'Previous implementation - unapproved'),font=font,fill='#392B2A')
        d.text((24,52),'Exact display pixels: 1x = 64, 4x = 256, 8x = 512',font=small,fill='#71695D')
        for bg,top,ink in [('#F5EFE3',90,'#392B2A'),('#202D2C',690,'#FFF0CB')]:
            d.rectangle((0,top,935,top+599),fill=bg)
            for s,x in [(1,24),(4,112),(8,392)]:
                d.text((x,top+18),f'{s}x / {64*s}px',font=small,fill=ink)
                paste(board,im,x,top+62,s)
        board.save(PRE/f'{k.lower()}-scales.png')
        for s in [1,4,8]:
            for label,bg in [('light','#F5EFE3'),('dark','#202D2C')]:
                tile=Image.new('RGB',(64*s,64*s),bg);paste(tile,im,0,0,s)
                tile.save(PRE/f'{k.lower()}-{s}x-{label}.png')
    # Offline inspector keeps 1x genuinely 64 CSS pixels even on narrow displays.
    html='''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Tinker V2.1 face approval</title><style>body{margin:24px;background:#f5efe3;color:#392b2a;font:16px system-ui}button,select{font:inherit;margin:6px;padding:8px}main{display:flex;gap:24px;overflow:auto}article{flex:none}img{image-rendering:pixelated;display:block}h2{font-size:16px}.dark{background:#202d2c;color:#fff0cb}p{max-width:70ch}</style>
<h1>Tinker Panda V2.1</h1><p>Unapproved facial candidates. Teal ear pixels form her bow. Same silhouette, palette and body; only facial pixels differ.</p>
<label>Scale <select id="scale"><option value="1">1x - 64px</option><option value="4" selected>4x - 256px</option><option value="8">8x - 512px</option></select></label><button id="theme">Toggle light / dark</button><main>'''
    for k in sprites:
        src='previous.png' if k=='Previous' else f'candidates/{k}.png'
        html+=f'<article><h2>{titles.get(k,"Previous - unapproved")}</h2><img src="{src}" width="256" height="256" alt="{titles.get(k,k)}"></article>'
    html+='''</main><p>Choose A, B or C before any animation expansion or website integration.</p><script>
document.querySelector('#scale').onchange=e=>document.querySelectorAll('img').forEach(im=>{im.width=im.height=64*Number(e.target.value)});
document.querySelector('#theme').onclick=()=>document.body.classList.toggle('dark');</script></html>'''
    (ROOT/'review.html').write_text(html)
    validate()
def validate():
    report={'status':'technical-pass / visual-approval-required','nativeSize':[64,64],
            'palette':PAL,'baselineSha256':digest(ROOT/'previous.png'),'candidates':{}}
    basealpha=BASE.getchannel('A').tobytes()
    for k in EYES:
        path=OUT/f'{k}.png';im=Image.open(path).convert('RGBA')
        assert im.size==(64,64)
        assert im.getchannel('A').tobytes()==basealpha
        assert {p[3] for p in im.get_flattened_data()}=={0,255}
        assert {p for p in im.get_flattened_data() if p[3]}<=set(C.values())
        changes=[]
        for y in range(64):
            for x in range(64):
                if im.getpixel((x,y))!=BASE.getpixel((x,y)):
                    assert 11<=x<=51 and 17<=y<=36
                    changes.append((x,y))
        assert im.crop((0,37,64,64)).tobytes()==BASE.crop((0,37,64,64)).tobytes()
        for s in [1,4,8]:
            for label,bg in [('light','#F5EFE3'),('dark','#202D2C')]:
                shown=Image.open(PRE/f'{k.lower()}-{s}x-{label}.png').convert('RGB')
                rgb=Image.new('RGB',(64,64),bg);rgb.paste(im,(0,0),im)
                expected=rgb.resize((64*s,64*s),Image.Resampling.NEAREST)
                assert shown.tobytes()==expected.tobytes()
        report['candidates'][k]={'sha256':digest(path),'changedPixels':len(changes),
            'opaqueColors':len({p for p in im.get_flattened_data() if p[3]}),
            'sameSilhouette':True,'sameBody':True,'binaryAlpha':True,
            'paletteExact':True,'nearestNeighborPreviewsExact':True}
    (ROOT/'validation.json').write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps(report['candidates'],indent=2))
if __name__=='__main__':render()
