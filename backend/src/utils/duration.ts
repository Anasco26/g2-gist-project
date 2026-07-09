const durationPattern = /^(\d+)(ms|s|m|h|d|w)$/;

const multipliers: Record<string, number> = {
  ms: 1,
  s: 1_000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
  w: 604_800_000,
};

export function parseDurationToMs(value: string): number {
  const match = durationPattern.exec(value.trim());
  if (!match) {
    throw new Error(`Invalid duration value: ${value}`);
  }

  const amount = Number(match[1]);
  const unit = match[2];

  return amount * multipliers[unit];
}
