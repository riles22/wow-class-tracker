// HTML recognizes </script > and </script\t> as terminators, including inside JSON
// script elements. Escape every opening angle bracket before embedding source text.
export function jsonForHtml(value) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}
