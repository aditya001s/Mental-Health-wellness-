// Simple client-side moderation utility
// For production, replace with a server-side moderation API or third-party service.

const bannedWords = [
  // sexual/explicit
  'fuck', 'fucker', 'fucking', 'bitch', 'slut', 'whore', 'cunt', 'dick', 'pussy',
  // abusive / violent
  'kill', 'murder', 'die', 'idiot', 'stupid', 'trash', 'loser', 'shut up', 'asshole',
  // derogatory slurs (example - include as appropriate)
  'retard', 'nigger', 'kike'
];

export function detectViolation(text?: string) {
  if (!text) return null;
  const lower = text.toLowerCase();
  for (const w of bannedWords) {
    // simple contains check - word boundaries would be better
    if (lower.includes(w)) {
      return {
        reason: 'Contains prohibited language',
        matched: w,
      };
    }
  }
  return null;
}
