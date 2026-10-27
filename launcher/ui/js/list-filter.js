/** Continue is the highlighted action while the last duty is still on disk.
 * Starting a new one overwrites that autosave, so the saved timetable would be lost.
 * A named save slot is not that duty, and a player joining a game has no Continue. */
export const continueIsPrimary = (situations, lanMode) =>
  lanMode !== 'join' && (situations || []).some((x) => x && x.name === 'Last situation');

/** Case-insensitive filter of [value, label] pairs. An empty query keeps the list. */
export function filterOptions(items, query) {
  const q = (query || '').trim().toLowerCase();
  if (!q) return items;
  return items.filter(([, label]) => String(label).toLowerCase().includes(q));
}
