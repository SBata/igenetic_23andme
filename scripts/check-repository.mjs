import { execFileSync } from 'node:child_process';
import { readFileSync, existsSync } from 'node:fs';

const git = (...args) => execFileSync(process.env.GIT_BINARY || 'git', args, { maxBuffer: 128 * 1024 * 1024 });
const pattern = /AKIA[0-9A-Z]{16}|gh[pousr]_[A-Za-z0-9]{30,}|-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|^rs\d+[\t ]+(?:\d+|X|Y|MT)[\t ]+\d+[\t ]+[ACGT-]{1,2}\s*$/m;
const issues = new Set();
const check = (bytes, name) => { if (pattern.test(bytes.toString('utf8')) || /(?:^|\/)\.env(?:\.|$)/.test(name) && !name.endsWith('.example')) issues.add(name); };
let blobs = 0;
for (const line of git('rev-list', '--objects', '--all').toString().trim().split('\n')) {
  const [id, ...parts] = line.split(' ');
  const name = parts.join(' ');
  if (!name || git('cat-file', '-t', id).toString().trim() !== 'blob') continue;
  blobs++;
  check(git('cat-file', 'blob', id), name);
}
for (const name of git('ls-files', '--cached', '--others', '--exclude-standard', '-z').toString().split('\0').filter(Boolean)) {
  if (existsSync(name)) check(readFileSync(name), name);
}
if (issues.size) { console.error('Review potentially private content in:', [...issues]); process.exitCode = 1; }
else console.log(`PASS: ${blobs} history blobs and publishable working files checked for raw genotype rows and common secret formats. This pattern scan is not exhaustive.`);
