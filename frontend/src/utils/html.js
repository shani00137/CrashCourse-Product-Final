function htmlToText(html) {
  if (!html) return "";
  const text = String(html)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6]|tr|table)>/gi, "\n")
    .replace(/<\/(td|th)>/gi, "\t")
    .replace(/<[^>]+>/g, "");
  const el = document.createElement("textarea");
  el.innerHTML = text;
  return el.value.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim();
}
export {
  htmlToText
};
