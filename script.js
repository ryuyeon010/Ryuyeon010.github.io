(function() {
  const STORAGE_KEY = "animationsEnabled";
  const htmlEl = document.documentElement;
  const toggleEl = document.getElementById("animationToggle");
  const rippleLayer = document.getElementById("ripple-layer");

  function getSystemPrefersReducedMotion() {
    try {
      return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch { return false; }
  }

  function readPersistedPreference() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === null) return undefined;
    return saved === "true";
  }

  function persistPreference(enabled) {
    try { localStorage.setItem(STORAGE_KEY, String(enabled)); } catch {}
  }

  function setAnimationsEnabled(enabled) {
    htmlEl.setAttribute("data-animations", enabled ? "on" : "off");
    if (toggleEl) toggleEl.checked = enabled;
    persistPreference(enabled);
  }

  // Initialize
  const systemReduced = getSystemPrefersReducedMotion();
  const persisted = readPersistedPreference();
  const initialEnabled = persisted !== undefined ? persisted : !systemReduced;
  setAnimationsEnabled(initialEnabled);

  if (toggleEl) {
    toggleEl.addEventListener("change", () => {
      setAnimationsEnabled(toggleEl.checked);
    });
  }

  // Occasional ripple/wave trigger
  let waveTimeoutId = null;
  function clearScheduledWave() {
    if (waveTimeoutId !== null) {
      clearTimeout(waveTimeoutId);
      waveTimeoutId = null;
    }
  }

  function scheduleNextWave() {
    clearScheduledWave();
    const delayMs = Math.floor(6000 + Math.random() * 9000); // 6s ~ 15s
    waveTimeoutId = setTimeout(() => {
      if (htmlEl.getAttribute("data-animations") === "on") {
        triggerWaveOnce();
      }
      scheduleNextWave();
    }, delayMs);
  }

  function triggerWaveOnce() {
    // Restart the CSS animation by toggling a class
    document.body.classList.remove("is-waving");
    // Force reflow so animation can restart
    void rippleLayer.offsetWidth; // eslint-disable-line no-unused-expressions
    document.body.classList.add("is-waving");
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      clearScheduledWave();
    } else {
      scheduleNextWave();
    }
  });

  scheduleNextWave();
})();
