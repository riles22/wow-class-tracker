/* HTML-output safety for the tracker build (CodeQL triage, 2026-09-22). The gear explorer's
   build shared it until that page was removed on 2026-10-28.

   esc() is the one escape. It covers all five characters that matter (& < > " '), so the
   same helper is safe in element text and in quoted attribute values. The tracker page is
   self-contained (a hashed CSP admits no external script), so src/template.html carries a
   byte-identical copy of ESC_SOURCE, and test/escaping.test.mjs fails if that copy drifts.
   The build uses esc() directly.

   inlineScripts() and scriptTagCount() feed the build-time CSP hash. Extraction uses no
   regular expression: a regex tag matcher misses variants such as `</script >`, and the
   parser, not the regex, decides where a script ends. So the build hashes only the bare
   `<script>` blocks the template authors, refuses a body that contains any other script end
   tag, and refuses an output with more script start tags (any case, any attributes) than
   its template has. */

export const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

/** The exact definition line the tracker template must contain. */
export const ESC_SOURCE = `const esc = ${esc};`;

/** Bodies of the bare `<script>` blocks, in document order. */
export function inlineScripts(html) {
  const open = "<script>", close = "</script>";
  const bodies = [];
  for (let at = html.indexOf(open); at !== -1; at = html.indexOf(open, at)) {
    const start = at + open.length;
    const end = html.indexOf(close, start);
    if (end === -1) throw new Error("unterminated inline <script> block");
    const body = html.slice(start, end);
    if (body.toLowerCase().includes("</script")) {
      throw new Error("an inline script contains a second script end tag; its CSP hash would not match what the browser runs");
    }
    bodies.push(body);
    at = end + close.length;
  }
  return bodies;
}

/** Every script start tag, in any letter case and with any attributes. */
export const scriptTagCount = html => html.toLowerCase().split("<script").length - 1;
