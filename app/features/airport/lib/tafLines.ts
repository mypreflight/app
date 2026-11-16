const CHANGE_GROUP = /^(FM\d{6}|BECMG|TEMPO|PROB\d{2})$/;

export function tafLines(content: string): string[] {
  const tokens = content.trim().split(/\s+/);
  const lines: string[][] = [];

  tokens.forEach((token, index) => {
    const continuesProbability = index > 0 && /^PROB\d{2}$/.test(tokens[index - 1]);
    const startsLine = lines.length === 0 || (CHANGE_GROUP.test(token) && !continuesProbability);

    if (startsLine) {
      lines.push([token]);
    } else {
      lines[lines.length - 1].push(token);
    }
  });

  return lines.map((line) => line.join(" "));
}
