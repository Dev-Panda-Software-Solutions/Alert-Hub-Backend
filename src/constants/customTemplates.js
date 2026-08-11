const CUSTOM_TEMPLATES = require('../data/customTemplates.json');

// Flat map: "domain.type" key → full template entry (subject/heading/body/explanation)
const CUSTOM_TEMPLATE_MAP = {};
CUSTOM_TEMPLATES.forEach((t) => { CUSTOM_TEMPLATE_MAP[t.key] = t; });

// All valid keys — used for request validation
const ALL_CUSTOM_TEMPLATE_KEYS = CUSTOM_TEMPLATES.map((t) => t.key);

// Grouped by domain — shape the frontend picker (domain → list of {key, label}) consumes
const CUSTOM_TEMPLATE_CATALOG = [];
const domainIndex = {};
CUSTOM_TEMPLATES.forEach((t) => {
  if (!domainIndex[t.domain]) {
    domainIndex[t.domain] = { key: t.domain, label: t.domainLabel, types: [] };
    CUSTOM_TEMPLATE_CATALOG.push(domainIndex[t.domain]);
  }
  domainIndex[t.domain].types.push({ key: t.key, label: t.typeLabel });
});

module.exports = { CUSTOM_TEMPLATES, CUSTOM_TEMPLATE_MAP, ALL_CUSTOM_TEMPLATE_KEYS, CUSTOM_TEMPLATE_CATALOG };
