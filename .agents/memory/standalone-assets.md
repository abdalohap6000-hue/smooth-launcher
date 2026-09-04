---
name: Standalone asset portability
description: Imported hosted asset metadata may not resolve when an app runs outside its original platform.
---

Hosted asset metadata URLs from an imported project are not guaranteed to exist in a standalone Replit preview. Prefer repository-local public assets when an equivalent file is already included.

**Why:** The imported app’s asset metadata route returned a broken image in the standalone preview even though the icon file was present in the repository.

**How to apply:** When an imported UI shows a broken image, inspect asset metadata URLs and check for a matching local file before changing the application architecture.