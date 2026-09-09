# Production dependency remediation — 2026-09-09

Production dependency audit reported critical Next.js advisories and high Sharp
libheif advisories. Existing pins were Next/eslint-config-next 16.2.12 and Sharp
0.35.0. Updated the Next pair to 16.3.4 and Sharp to 0.35.4 using explicit pins
and the lockfile, not `npm audit fix --force`. Vinext, Vite, React, routing,
authentication and all application schedules remain unchanged.

Build plus 39 behavior tests passed; production `npm audit --omit=dev` and the
repository's independent lockfile advisory check report zero production issues.
This does not claim all development-tool dependencies are advisory-free.
Deployment evidence is recorded by the staged allocation checkpoint after release.
