/**
 * Refreshes every "days to" figure in the reader's browser: to the reported target, or to an announced opening date (opening mode),
 * and, on a partly open line, the rest of the line's count under the opening date.
 * The dates come from project.json (target_completion.countdown_date, or the first section's service.opening.date), in IST.
 */
for (const el of document.querySelectorAll<HTMLElement>('[data-countdown]')) {
  const value = el.querySelector<HTMLElement>('[data-countdown-value]');
  if (!value) continue;
  const target = Date.parse(`${el.dataset.countdown}T23:59:59+05:30`);
  const days = Math.max(0, Math.ceil((target - Date.now()) / 86_400_000));
  value.textContent = days.toLocaleString('en-IN');
}
