const entities: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

export const escapeHtml = (text: string) =>
  text.replace(/[&<>"']/g, (character) => entities[character]!);

/** Render `code` and **strong** spans in frontmatter text as escaped HTML. */
export function inlineMarkdown(text: string) {
  return escapeHtml(text)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
}

export const capitalize = (text: string) =>
  text.charAt(0).toUpperCase() + text.slice(1);

/** "1 lesson", "2 lessons"; pass the plural for irregular words. */
export const plural = (count: number, word: string, many = `${word}s`) =>
  `${count} ${count === 1 ? word : many}`;
