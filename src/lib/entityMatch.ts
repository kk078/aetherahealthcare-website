/** Match complete words, never a short payer alias inside another word. */
export function mentionsEntity(text: string, name: string): boolean {
  const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const term = normalize(name);
  return term.length >= 3 && ` ${normalize(text)} `.includes(` ${term} `);
}
