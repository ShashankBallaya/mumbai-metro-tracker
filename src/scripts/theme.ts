/**
 * Night edition / morning edition switch. Saves the choice when storage is allowed;
 * without storage it still works for the current page view.
 */
const root = document.documentElement;
const button = document.querySelector<HTMLButtonElement>('[data-theme-toggle]');
const label = document.querySelector<HTMLElement>('[data-theme-label]');
const systemDark = window.matchMedia('(prefers-color-scheme: dark)');

function current(): 'light' | 'dark' {
  const set = root.dataset.theme;
  if (set === 'light' || set === 'dark') return set;
  return systemDark.matches ? 'dark' : 'light';
}

function render() {
  const theme = current();
  if (label) label.textContent = theme === 'dark' ? 'Morning edition' : 'Night edition';
  button?.setAttribute('aria-pressed', String(theme === 'dark'));
  button?.setAttribute('aria-label', theme === 'dark' ? 'Switch to the light morning edition' : 'Switch to the dark night edition');
}

button?.addEventListener('click', (event) => {
  const next = current() === 'dark' ? 'light' : 'dark';
  const apply = () => {
    root.dataset.theme = next;
  };
  // The new edition wipes in as a circle from the switch (View Transitions, where supported).
  // A press from the keyboard (detail 0) switches at once: no motion on keyboard actions.
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fromKeyboard = event.detail === 0;
  const doc = document as Document & { startViewTransition?: (cb: () => void) => unknown };
  if (doc.startViewTransition && !reduced && !fromKeyboard) {
    const r = button.getBoundingClientRect();
    root.style.setProperty('--vt-x', `${event.clientX || r.left + r.width / 2}px`);
    root.style.setProperty('--vt-y', `${event.clientY || r.top + r.height / 2}px`);
    doc.startViewTransition(apply);
  } else {
    apply();
  }
  try {
    localStorage.setItem('l12-theme', next);
  } catch {
    /* storage blocked: the choice lasts for this view only */
  }
  render();
});

systemDark.addEventListener('change', render);
render();
