export const stripMarkdownLinks = (md: string) => {
  return md.replace(/\[([^\]]+)\]\([^)]+\)(\{[^}]*\})?/g, '$1');
};
