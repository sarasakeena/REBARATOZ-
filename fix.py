import re

with open('index.html', 'r', encoding='utf-8') as f:
    d = f.read()
d = re.sub(r'[ \t]*<span class="badge">.*?</span>[ \t]*\n?', '', d)
with open('index.html', 'w', encoding='utf-8') as f:
    f.write(d)

with open('style.css', 'r', encoding='utf-8') as f:
    c = f.read()
c = re.sub(r'color:\s*var\(--color-white\);', 'color: #000000;', c)
c = re.sub(r'color:\s*#FFFFFF;', 'color: #000000;', c)
with open('style.css', 'w', encoding='utf-8') as f:
    f.write(c)
