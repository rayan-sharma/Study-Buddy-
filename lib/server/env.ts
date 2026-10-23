// Server-side config. Empty values and "YOUR_..." placeholders count as unset.
export function env(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value && !value.startsWith("YOUR_") ? value : undefined;
}

export function requireEnv(name: string): string {
  const value = env(name);
  if (!value) throw new Error(`${name} is not set in .env.local`);
  return value;
}
