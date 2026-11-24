"""Rebuild ../index.html from the files in src/.  Usage:  python3 source/build.py"""
import pathlib
root = pathlib.Path(__file__).parent
order = ['board', 'core', 'world', 'player', 'art', 'art2', 'entities', 'extras', 'game', 'levels', 'ui']
js = '\n'.join((root / 'src' / f'{n}.js').read_text(encoding='utf-8') for n in order)
js = '{\n"use strict";\n' + js + '\n}'
shell = (root / 'src' / 'shell.html').read_text(encoding='utf-8')
out = shell.replace('/*__SCRIPTS__*/', js)
(root.parent / 'index.html').write_text(out, encoding='utf-8')
print('Built', root.parent / 'index.html', len(out), 'bytes')
