# TokenBase — End Goals

1. **Universal base models** — Shared foundation consumed by every Token project. One source of truth.

2. **Flat, composable** — No inheritance hierarchies. Models compose through references. Context handles display, models handle logic.

3. **Complete vocabulary** — Financial terms (70+), time terms (planned), functions, relationships, maps, styles, identifiers, unifiers, improvement pipeline, agent flows.

4. **Language spec** — Models become the type system for a compiled language. Layer 0 machine primitives → Layer 1 TokenBase language → Layer 2 generated targets (TS/Swift/Rust/C) → Layer 3 adoption.

5. **Bottom-up efficiency** — Start from the lowest layer, squeeze the air out, only lose efficiency at each compilation boundary. Don't compress higher-level assumptions into the foundation.

6. **Living document** — New concepts added as they emerge across projects. LANGUAGE.md captures the compiler vision. Insights logged as discovered.

7. **Refactor target** — After TokenRemote and TokenSports ship, re-abstract everything into TokenBase. Build the project builder framework. Kill busywork.
