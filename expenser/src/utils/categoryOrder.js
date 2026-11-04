// Manual ordering of categories (Categories page > "Reorder"). Every category may carry an `order`
// number; the lists in the app (Categories page, the form dropdown, filters) all use this one sort.

/**
 * Manual order first (`order` ascending); categories that were never ordered (older data, imports)
 * go after them, alphabetically - exactly how the list looked before ordering existed.
 */
export function sortCategories(list, locale) {
  return [...list].sort((a, b) => {
    const ao = Number.isFinite(a.order);
    const bo = Number.isFinite(b.order);
    if (ao && bo && a.order !== b.order) return a.order - b.order;
    if (ao !== bo) return ao ? -1 : 1;
    return String(a.name).localeCompare(String(b.name), locale);
  });
}
