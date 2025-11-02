// ...new file...
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..'); // project root
const exts = ['.html'];
const skipDirs = ['node_modules', '.git'];

// helper: recursively list files
function walk(dir) {
  let results = [];
  for (const name of fs.readdirSync(dir)) {
    if (skipDirs.includes(name)) continue;
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) results = results.concat(walk(full));
    else if (exts.includes(path.extname(full).toLowerCase())) results.push(full);
  }
  return results;
}

function ensureAttr(tagOpen, attr) {
  if (tagOpen.includes(attr + '=')) return tagOpen;
  // insert attribute before closing '>'
  return tagOpen.replace(/<([^\s>]+)/, `<$1 ${attr}`);
}

function wrapMatchWithSpan(html, regex, attr) {
  return html.replace(regex, (m, p1) => {
    // if already wrapped, skip
    if (m.includes(`data-${attr}`)) return m;
    return m.replace(p1, `<span data-${attr}>${p1}</span>`);
  });
}

const files = walk(root);
files.forEach(file => {
  try {
    let html = fs.readFileSync(file, 'utf8');
    let original = html;

    // add data-user-avatar to profile/avatar img tags
    html = html.replace(/<img\b([^>]*\bsrc=['"][^'"]*(profile|avatar)[^'"]*[^>]*)>/gi, (m, g1) => {
      if (m.includes('data-user-avatar')) return m;
      return m.replace('<img', '<img data-user-avatar');
    });

    // add data-user-name to first heading in file if missing
    if (!/data-user-name/.test(html)) {
      const headingMatch = html.match(/<(h1|h2|h3)\b([^>]*)>([^<]{2,120}?)<\/\1>/i);
      if (headingMatch) {
        const full = headingMatch[0];
        const tagOpen = `<${headingMatch[1]}${headingMatch[2]}`;
        if (!/data-user-name/.test(tagOpen)) {
          const replaced = full.replace(new RegExp(`<${headingMatch[1]}${headingMatch[2]}`), ensureAttr(`<${headingMatch[1]}${headingMatch[2]}`, 'data-user-name'));
          html = html.replace(full, replaced);
        }
      }
    }

    // wrap visible emails with data-user-email
    html = wrapMatchWithSpan(html, />(\s*[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\s*)</g, 'user-email');

    // wrap phone-like patterns with data-user-phone (simple heuristic)
    html = wrapMatchWithSpan(html, />(\s*\+?\d{2,3}[\s-]?\d{2,4}[\s-]?\d{2,4}[\s-]?\d{2,4}\s*)</g, 'user-phone');

    // wrap date patterns (yyyy-mm-dd or dd/mm/yyyy) with data-user-dob
    html = wrapMatchWithSpan(html, />(\s*\d{4}-\d{2}-\d{2}\s*)</g, 'user-dob');
    html = wrapMatchWithSpan(html, />(\s*\d{2}\/\d{2}\/\d{4}\s*)</g, 'user-dob');

    // wrap addresses containing common separators (comma + capitalized word)
    html = wrapMatchWithSpan(html, />(\s*[A-Z][A-Za-z0-9\s]+,\s*[A-Za-z\s]+)\s*</g, 'user-address');

    if (html !== original) {
      fs.writeFileSync(file, html, 'utf8');
      console.log('Patched:', path.relative(root, file));
    }
  } catch (err) {
    console.error('Error processing', file, err.message);
  }
});
console.log('Done.');
// ...new file...