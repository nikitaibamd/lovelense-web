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
icons['note'] = '<svg viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5.5l11-2V16"/><circle cx="6.5" cy="18" r="2.5"/><circle cx="17.5" cy="16" r="2.5"/></g></svg>'
icons['mplay'] = '<svg viewBox="0 0 24 24"><path d="M8 5.6v12.8a1 1 0 0 0 1.5.86l10.2-6.4a1 1 0 0 0 0-1.72L9.5 4.74A1 1 0 0 0 8 5.6Z" fill="currentColor"/></svg>'
icons['mpause'] = '<svg viewBox="0 0 24 24"><rect x="6.5" y="5" width="4" height="14" rx="1.4" fill="currentColor"/><rect x="13.5" y="5" width="4" height="14" rx="1.4" fill="currentColor"/></svg>'
icons['mnext'] = '<svg viewBox="0 0 24 24"><path d="M5 6.2v11.6a.9.9 0 0 0 1.4.75L15 12.75a.9.9 0 0 0 0-1.5L6.4 5.45A.9.9 0 0 0 5 6.2Z" fill="currentColor"/><rect x="16.5" y="5.5" width="2.6" height="13" rx="1.2" fill="currentColor"/></svg>'
icons['mstop'] = '<svg viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><path d="M4 7h16M9.5 7V4.8h5V7M6.5 7l.8 12.2a1.2 1.2 0 0 0 1.2 1.1h7a1.2 1.2 0 0 0 1.2-1.1L17.5 7M10 11v6M14 11v6"/></g></svg>'
icons['search'] = '<svg viewBox="0 0 24 24"><g fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.2 4.2"/></g></svg>'
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
bg = {}
t = t.replace('%%BG%%', json.dumps(bg)).replace('%%ICONS%%', '{}').replace('%%PETJS%%', open(P('src', 'pet.js'), encoding='utf-8').read())
assert not re.findall(r'%%[A-Za-z]+%%', t)
os.makedirs(P('dist'), exist_ok=True)
open(P('dist', 'index.html'), 'w', encoding='utf-8').write(t)
print('dist/index.html', len(t))
