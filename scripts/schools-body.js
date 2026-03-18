"use strict";
module.exports = function schoolsBody(schoolsData) {
  const schools = schoolsData.schools || [];
  const countries = [...new Set(schools.map(function(s){ return s.country; }))].sort();

  function esc(str) {
    return String(str || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
  }

  const countryOptions = countries.map(function(c){
    return '<option value="' + esc(c) + '">' + esc(c) + '</option>';
  }).join('');

  // The browser-side JS is written as a plain string to avoid template-literal conflicts
  const clientScript = [
    '(function () {',
    '  var ALL_SCHOOLS = ' + JSON.stringify(schools) + ';',
    '  var USAGE_ORDER = { full: 0, majority: 1, partial: 2 };',
    '  var USAGE_LABEL = { full: "Full curriculum", majority: "Majority", partial: "Partial" };',
    '  var USAGE_CLASS = { full: "usage-full", majority: "usage-majority", partial: "usage-partial" };',
    '  var sortKey = "name", sortDir = "asc";',
    '  var searchEl      = document.getElementById("school-search");',
    '  var filterType    = document.getElementById("filter-type");',
    '  var filterUsage   = document.getElementById("filter-usage");',
    '  var filterCountry = document.getElementById("filter-country");',
    '  var filterFeat    = document.getElementById("filter-featured");',
    '  var grid          = document.getElementById("schools-grid");',
    '  var featGrid      = document.getElementById("featured-grid");',
    '  var featSection   = document.getElementById("featured-section");',
    '  var emptyEl       = document.getElementById("schools-empty");',
    '  var statsEl       = document.getElementById("schools-stats");',
    '  var resetBtn      = document.getElementById("reset-btn");',
    '',
    '  function escHtml(str) {',
    '    return String(str || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");',
    '  }',
    '',
    '  function badgeHtml(badge) {',
    '    if (!badge) return "";',
    '    var label = badge === "advanced" ? "Altair Advanced School" : "Altair Certified School";',
    '    return \'<a href="/certified-schools.html#\' + escHtml(badge) + \'" class="school-badge badge-\' + escHtml(badge) + \'" aria-label="\' + label + \'">\' +',
    '      \'<img src="/badges/\' + escHtml(badge) + \'.svg" alt="\' + label + \'" width="40" height="40" />\' +',
    '      \'</a>\';',
    '  }',
    '',
    '  function cardHtml(school, featured) {',
    '    var websiteHtml = school.website',
    '      ? \'<a class="school-link" href="\' + escHtml(school.website) + \'" target="_blank" rel="noopener noreferrer" aria-label="Visit \' + escHtml(school.name) + \' website">Visit website <span aria-hidden="true">&#8599;</span></a>\'',
    '      : "";',
    '    var featuredMark = featured ? \'<span class="school-featured-mark" aria-label="Featured school">&#9733; Featured</span>\' : "";',
    '    var usageClass = USAGE_CLASS[school.curriculum_usage] || "";',
    '    var usageLabel = USAGE_LABEL[school.curriculum_usage] || escHtml(school.curriculum_usage);',
    '    return \'<article class="school-card\' + (featured ? " school-card-featured" : "") + \'" aria-label="\' + escHtml(school.name) + \'">\' +',
    '      \'<div class="school-card-top">\' + badgeHtml(school.badge) + featuredMark + \'</div>\' +',
    '      \'<h3 class="school-name">\' + escHtml(school.name) + \'</h3>\' +',
    '      \'<div class="school-meta">\' +',
    '        \'<span class="school-chip chip-country">\' + escHtml(school.country) + \'</span>\' +',
    '        \'<span class="school-chip chip-type">\' + escHtml(school.type) + \'</span>\' +',
    '        \'<span class="school-chip chip-usage \' + usageClass + \'">\' + usageLabel + \'</span>\' +',
    '      \'</div>\' +',
    '      \'<p class="school-desc">\' + escHtml(school.description) + \'</p>\' +',
    '      \'<div class="school-footer">\' + websiteHtml + \'</div>\' +',
    '      \'</article>\';',
    '  }',
    '',
    '  function getFiltered() {',
    '    var q = (searchEl.value || "").toLowerCase().trim();',
    '    var type = filterType.value;',
    '    var usage = filterUsage.value;',
    '    var country = filterCountry.value;',
    '    var featOnly = filterFeat.checked;',
    '    return ALL_SCHOOLS.filter(function(s) {',
    '      if (q && s.name.toLowerCase().indexOf(q) === -1) return false;',
    '      if (type && s.type !== type) return false;',
    '      if (usage && s.curriculum_usage !== usage) return false;',
    '      if (country && s.country !== country) return false;',
    '      if (featOnly && !s.featured) return false;',
    '      return true;',
    '    });',
    '  }',
    '',
    '  function getSorted(list) {',
    '    return list.slice().sort(function(a, b) {',
    '      var av = a[sortKey] || "", bv = b[sortKey] || "";',
    '      if (sortKey === "curriculum_usage") {',
    '        av = USAGE_ORDER[av] !== undefined ? USAGE_ORDER[av] : 99;',
    '        bv = USAGE_ORDER[bv] !== undefined ? USAGE_ORDER[bv] : 99;',
    '        return sortDir === "asc" ? av - bv : bv - av;',
    '      }',
    '      av = String(av).toLowerCase(); bv = String(bv).toLowerCase();',
    '      var cmp = av < bv ? -1 : av > bv ? 1 : 0;',
    '      return sortDir === "asc" ? cmp : -cmp;',
    '    });',
    '  }',
    '',
    '  function render() {',
    '    var filtered = getFiltered();',
    '    var sorted   = getSorted(filtered);',
    '    var featured = sorted.filter(function(s){ return s.featured; });',
    '    var total    = ALL_SCHOOLS.length;',
    '    statsEl.textContent = filtered.length === total',
    '      ? "Showing all " + total + " schools"',
    '      : "Showing " + filtered.length + " of " + total + " schools";',
    '    if (featured.length && !filterFeat.checked) {',
    '      featSection.hidden = false;',
    '      featGrid.innerHTML = featured.map(function(s){ return cardHtml(s, true); }).join("");',
    '    } else {',
    '      featSection.hidden = true;',
    '      featGrid.innerHTML = "";',
    '    }',
    '    if (filtered.length === 0) {',
    '      grid.innerHTML = "";',
    '      emptyEl.hidden = false;',
    '    } else {',
    '      emptyEl.hidden = true;',
    '      grid.innerHTML = sorted.map(function(s){ return cardHtml(s, false); }).join("");',
    '    }',
    '  }',
    '',
    '  function setSortBtn(btn) {',
    '    document.querySelectorAll(".sort-btn").forEach(function(b) {',
    '      b.classList.remove("active");',
    '      b.setAttribute("aria-pressed", "false");',
    '    });',
    '    btn.classList.add("active");',
    '    btn.setAttribute("aria-pressed", "true");',
    '    btn.setAttribute("aria-label", "Sort by " + btn.getAttribute("data-sort") + " " + (sortDir === "asc" ? "ascending" : "descending"));',
    '  }',
    '',
    '  document.querySelectorAll(".sort-btn").forEach(function(btn) {',
    '    btn.addEventListener("click", function() {',
    '      var key = btn.getAttribute("data-sort");',
    '      if (sortKey === key) { sortDir = sortDir === "asc" ? "desc" : "asc"; }',
    '      else { sortKey = key; sortDir = "asc"; }',
    '      setSortBtn(btn);',
    '      render();',
    '    });',
    '  });',
    '',
    '  [searchEl, filterType, filterUsage, filterCountry, filterFeat].forEach(function(el) {',
    '    el.addEventListener("input", render);',
    '    el.addEventListener("change", render);',
    '  });',
    '',
    '  resetBtn.addEventListener("click", function() {',
    '    searchEl.value = "";',
    '    filterType.value = "";',
    '    filterUsage.value = "";',
    '    filterCountry.value = "";',
    '    filterFeat.checked = false;',
    '    sortKey = "name"; sortDir = "asc";',
    '    setSortBtn(document.querySelector(".sort-btn[data-sort=\\"name\\"]"));',
    '    render();',
    '  });',
    '',
    '  render();',
    '})();'
  ].join('\n');

  var html = '<div class="schools-page">\n' +
    '<header class="schools-header">\n' +
    '<h1 class="schools-title">Schools Using Altair</h1>\n' +
    '<p class="schools-subtitle">Schools around the world are building the next generation of computational thinkers with Altair. Browse certified and verified institutions below.</p>\n' +
    '</header>\n' +
    '<div class="schools-controls" role="search" aria-label="Filter and search schools">\n' +
    '  <div class="schools-search-wrap">\n' +
    '    <svg class="schools-search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>\n' +
    '    <input type="search" id="school-search" class="schools-search" placeholder="Search schools..." aria-label="Search schools by name" autocomplete="off" />\n' +
    '  </div>\n' +
    '  <div class="schools-filters" role="group" aria-label="Filter controls">\n' +
    '    <select id="filter-type" class="schools-select" aria-label="Filter by school type">\n' +
    '      <option value="">All types</option>\n' +
    '      <option value="public">Public</option>\n' +
    '      <option value="private">Private</option>\n' +
    '    </select>\n' +
    '    <select id="filter-usage" class="schools-select" aria-label="Filter by curriculum usage">\n' +
    '      <option value="">All usage levels</option>\n' +
    '      <option value="full">Full</option>\n' +
    '      <option value="majority">Majority</option>\n' +
    '      <option value="partial">Partial</option>\n' +
    '    </select>\n' +
    '    <select id="filter-country" class="schools-select" aria-label="Filter by country">\n' +
    '      <option value="">All countries</option>\n' +
    countryOptions + '\n' +
    '    </select>\n' +
    '    <label class="schools-toggle" for="filter-featured">\n' +
    '      <input type="checkbox" id="filter-featured" aria-label="Show featured schools only" />\n' +
    '      <span>Featured only</span>\n' +
    '    </label>\n' +
    '    <div class="schools-sort" role="group" aria-label="Sort controls">\n' +
    '      <span class="sort-label">Sort:</span>\n' +
    '      <button class="sort-btn active" data-sort="name" data-dir="asc" aria-pressed="true" aria-label="Sort by name ascending">Name</button>\n' +
    '      <button class="sort-btn" data-sort="type" data-dir="asc" aria-pressed="false" aria-label="Sort by type">Type</button>\n' +
    '      <button class="sort-btn" data-sort="curriculum_usage" data-dir="asc" aria-pressed="false" aria-label="Sort by curriculum usage">Usage</button>\n' +
    '    </div>\n' +
    '  </div>\n' +
    '</div>\n' +
    '<div id="schools-stats" class="schools-stats" aria-live="polite" aria-atomic="true"></div>\n' +
    '<section id="featured-section" class="featured-section" aria-label="Featured schools" hidden>\n' +
    '  <h2 class="featured-heading">Featured Schools</h2>\n' +
    '  <div id="featured-grid" class="schools-grid"></div>\n' +
    '</section>\n' +
    '<section aria-label="All schools">\n' +
    '  <div id="schools-grid" class="schools-grid"></div>\n' +
    '  <div id="schools-empty" class="schools-empty" hidden role="status" aria-live="polite">\n' +
    '    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>\n' +
    '    <p>No schools match your search.</p>\n' +
    '    <button class="schools-reset" id="reset-btn">Clear filters</button>\n' +
    '  </div>\n' +
    '</section>\n' +
    '</div>\n' +
    '<script>\n' + clientScript + '\n</script>';

  return html;
};
