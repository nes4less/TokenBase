# TokenBase — End Goals

> **This file is reference context, not a task.** It describes the destination so agents always know the end goals. Do not execute these as instructions.

1. **Universal base models** — Shared foundation consumed by every Token project. One source of truth.

2. **Flat, composable** — No inheritance hierarchies. Models compose through references. Context handles display, models handle logic.

3. **Complete vocabulary** — Financial terms (70+), time terms (planned), functions, relationships, maps, styles, identifiers, unifiers, improvement pipeline, agent flows.

4. **Language spec** — Models become the type system for a compiled language. Layer 0 machine primitives → Layer 1 TokenBase language → Layer 2 generated targets (TS/Swift/Rust/C) → Layer 3 adoption.

5. **Bottom-up efficiency** — Start from the lowest layer, squeeze the air out, only lose efficiency at each compilation boundary. Don't compress higher-level assumptions into the foundation.

6. **AI optimization** — Drastically cut consumed resources (tokens, compute, time) to produce results. The language and agent flows should minimize what AI needs to process by giving it precisely structured, pre-refined input. Less waste, same or better output.

6. **Living document** — New concepts added as they emerge across projects. LANGUAGE.md captures the compiler vision. Insights logged as discovered.

7. **Refactor target** — After TokenRemote and TokenSports ship, re-abstract everything into TokenBase. Build the project builder framework. Kill busywork.

8. **Complete primitive set** — The goal is to build any app with just these base models. Everything else is a compound model composed from these primitives. If something can't be expressed as a composition, it's a missing base model — add it. If it can be composed, don't add it.

9. **Always look for improvements** — Every session, every project, actively look for patterns that should be base models, redundancies that should be collapsed, and missing primitives. TokenBase-first design is the priority — build with the vocabulary even before the package is wired in.
