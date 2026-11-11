"""Сборка мини-аппа: src/index.template.html + assets/ -> dist/index.html"""
import re, base64, json, glob, os, io
from PIL import Image
ROOT = os.path.dirname(os.path.abspath(__file__))
P = lambda *a: os.path.join(ROOT, *a)
t = open(P('src', 'index.template.html'), encoding='utf-8').read()
t = t.replace('<input class="in" id="pName" maxlength="16">', '<input class="in" id="petNameIn" maxlength="16">')
t = t.replace('$("pName").value=p.name;', '$("petNameIn").value=p.name;').replace('var n=$("pName").value.trim();if(!n)return;call("/v2/pet/setup"', 'var n=$("petNameIn").value.trim();if(!n)return;call("/v2/pet/setup"')
icons = {}
for f in glob.glob(P('assets', 'icons', '*.svg')):
    s = open(f).read().strip()
    s = re.sub(r'\s(width|height)="24"', '', s).replace('stroke="#493B45"', 'stroke="currentColor"')
    icons[os.path.basename(f)[:-4]] = s
icons['chev'] = '<svg viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m9 5 7 7-7 7"/></g></svg>'
icons['heartfill'] = '<svg viewBox="0 0 24 24"><path d="M12 20s-8-5.4-8-10.2A4.4 4.4 0 0 1 12 7.4a4.4 4.4 0 0 1 8 2.4C20 14.6 12 20 12 20Z" style="fill:var(--acc)"/></svg>'
t = re.sub(r'%%([a-z]+)%%', lambda m: icons.get(m.group(1), m.group(0)), t)
# Картинки — отдельными файлами с хешем в имени (кэшируются навсегда)
import hashlib, shutil
A = P('dist', 'a')
shutil.rmtree(A, ignore_errors=True); os.makedirs(A)
def put(name, data, ext):
    h = hashlib.sha256(data).hexdigest()[:10]
    fn = f'{name}.{h}.{ext}'
    open(os.path.join(A, fn), 'wb').write(data)
    return 'a/' + fn
bg = {'sunlit-room': put('room', open(P('assets', 'sunlit-room.webp'), 'rb').read(), 'webp')}
b = io.BytesIO(); Image.open(P('assets', 'cat.png')).convert('RGB').save(b, 'WEBP', quality=80)
cat = put('cat', b.getvalue(), 'webp')
spr_src = json.load(open(P('assets', 'sprites.json')))
spr = {}
for k, v in spr_src.items():
    head, data = v.split(',', 1)
    ext = 'webp' if 'webp' in head else 'png'
    spr[k] = put('pet-' + k, base64.b64decode(data), ext)
t = t.replace('%%BG%%', json.dumps(bg)).replace('%%CAT%%', cat).replace('%%ICONS%%', '{}').replace('%%SPR%%', json.dumps(spr))
assert not re.findall(r'%%[A-Za-z]+%%', t)
os.makedirs(P('dist'), exist_ok=True)
open(P('dist', 'index.html'), 'w', encoding='utf-8').write(t)
print('dist/index.html', len(t))
