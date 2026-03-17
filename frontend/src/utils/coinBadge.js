/**
 * Returns badge info based on coin count.
 * Milestones: 5 → Contributor, 10 → Reviewer,
 *             25 → Trusted, 50 → Expert, 100 → Legend
 */
export const BADGES = [
  { min: 100, label: "Legend",          emoji: "🏆", color: "text-yellow-500",  bg: "bg-yellow-50 dark:bg-yellow-900/30",  border: "border-yellow-300 dark:border-yellow-700" },
  { min: 50,  label: "Expert",          emoji: "💎", color: "text-blue-500",    bg: "bg-blue-50 dark:bg-blue-900/30",      border: "border-blue-300 dark:border-blue-700" },
  { min: 25,  label: "Trusted Reviewer",emoji: "⭐", color: "text-purple-500",  bg: "bg-purple-50 dark:bg-purple-900/30",  border: "border-purple-300 dark:border-purple-700" },
  { min: 10,  label: "Reviewer",        emoji: "📝", color: "text-green-500",   bg: "bg-green-50 dark:bg-green-900/30",    border: "border-green-300 dark:border-green-700" },
  { min: 5,   label: "Contributor",     emoji: "🌱", color: "text-teal-500",    bg: "bg-teal-50 dark:bg-teal-900/30",      border: "border-teal-300 dark:border-teal-700" },
];

export const NEXT_MILESTONES = [5, 10, 25, 50, 100];

/** Returns the highest earned badge for a given coin count, or null */
export function getBadge(coins) {
  return BADGES.find((b) => coins >= b.min) || null;
}

/** Returns the next milestone the user hasn't reached yet */
export function getNextMilestone(coins) {
  return NEXT_MILESTONES.find((m) => m > coins) || null;
}
