export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-us", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
