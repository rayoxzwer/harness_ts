export function mergeUser(user: { name: string }, updates: Partial<{ name: string }>) {
  return { ...updates, ...user };
}
