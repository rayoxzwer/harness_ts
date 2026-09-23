export function getName(user: { name?: string | null }) {
  return user.name.toUpperCase();
}
