(() => {
  // IMPORTANT: do NOT change the embed ID, otherwise you lose association/tracking.
  const STAY22_EMBED_ID = "68e0453924ecc1f8e80860e1";

  const iframe = document.getElementById("stay22-widget");
  const placeholder = document.getElementById("search-placeholder");

  if (!iframe) return;

  // Build the Stay22 URL.
  const url = new URL(`https://www.stay22.com/embed/${STAY22_EMBED_ID}`);

  // Keep widget language in Italian (optional). Stay22 supports ljs=it.
  url.searchParams.set("ljs", "it");

  /**
   * Force the search bar title to NOT be pre-filled with a destination (e.g. "Dubai ...").
   *
   * Why this works:
   * - Stay22 supports the `venue` query parameter, which overwrites the output address / map title
   *   shown in the search bar.
   * - If we set venue to an empty value, many widgets fall back to the last saved destination.
   * - Using a ZERO-WIDTH SPACE keeps the value "truthy" while remaining invisible, so the widget
   *   cannot replace it with a saved destination.
   */
  url.searchParams.set("venue", "​"); // Zero‑width space (invisible)

  // Optional: forward campaign from your page URL to the iframe for sub-tracking.
  // Example: yourpage.html?campaign=AFFILIATE_SLUG
  const pageParams = new URLSearchParams(window.location.search);
  const campaigns = pageParams.getAll("campaign");
  for (const c of campaigns) {
    const value = (c ?? "").trim();
    if (value) url.searchParams.append("campaign", value);
  }

  // Load the widget
  iframe.src = url.toString();

  // UX: show the placeholder text like the native widget placeholder (screenshot 2),
  // but hide it as soon as the user interacts with the iframe (focus).
  const hidePlaceholder = () => {
    if (!placeholder) return;
    placeholder.style.opacity = "0";
  };

  iframe.addEventListener("focus", hidePlaceholder);
  // Fallbacks (some browsers may not fire focus immediately):
  iframe.addEventListener("pointerdown", hidePlaceholder);
  iframe.addEventListener("touchstart", hidePlaceholder, { passive: true });
})();
