# Contributing

Adding an episode:

1. Copy `src/content/_episode-template.md` to `src/content/episodes/<slug>.md`.
2. Fill in the frontmatter and the three target variants. The template's header
   comment lists the conventions the site's JavaScript depends on — read it.
3. `npm run build` must pass; CI runs it on every PR plus a check that all
   three target divs exist.

Every command in an episode must have been run end to end before it lands.
Node version is pinned in `.nvmrc`. Content rules live in the README.
