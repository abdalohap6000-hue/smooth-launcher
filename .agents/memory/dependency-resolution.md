---
name: Dependency resolution
description: Replit package installation can rewrite semver ranges and lockfile resolutions when given exact package specs.
---

Package installation commands can turn caret ranges into exact pins and replace previously resolved transitive versions. Always inspect the package manifest and lockfile after installing dependencies.

**Why:** An initial setup install downgraded secure resolved versions to older exact pins, which was only visible after the completion review inspected the lockfile and audit.

**How to apply:** Preserve existing semver ranges where possible, verify security-sensitive packages after installation, and run a frozen install plus build and audit before completing setup.