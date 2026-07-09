<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Design Context (from PRODUCT.md)
**Register**: Product (App/Dashboard)
**Platform**: Web (Next.js)

**Design Principles**:
- **Expert Confidence**: The UI should feel like a serious, production-grade tool for people who take their craft seriously.
- **Show, Don't Tell**: Let the live data (active timers, global chat) speak for the energy of the room rather than relying on decorative UI scaffolding.
- **Intentional Interaction**: Every animation and micro-interaction must serve the workflow, not distract from it.

**Anti-references**:
- SaaS clichés (e.g., hero-metric templates).
- Over-used generic glassmorphism as a default decoration.
- Excessive or "insanely rounded" corners (e.g., 32px+ radii on standard cards).
