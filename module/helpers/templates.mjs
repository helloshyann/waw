/**
 * Define a set of template paths to pre-load
 * Pre-loaded templates are compiled and cached for fast access when rendering
 * @return {Promise}
 */
 export const preloadHandlebarsTemplates = async function() {
  return loadTemplates([

    // Actor partials.
    "systems/waw/templates/actor/parts/actor-features.html",
    "systems/waw/templates/actor/parts/actor-items.html",
    "systems/waw/templates/actor/parts/actor-spells.html",
    "systems/waw/templates/actor/parts/actor-effects.html",
    "systems/waw/templates/actor/parts/actor-report.html",
  ]);
};
