# TokenBase

Universal base models for the Token ecosystem.

Shared foundation for TokenRemote, TokenSports, CashierFu, and future Token projects.

## Packages

- **models/** — Base model interfaces (Entity, Context, Group, Scope, Unifier, Financial Terms)
- **time/** — Time management terms (planned)

## Design Principles

- Flat models, no inheritance hierarchies
- Compose through references, not nesting
- Context handles display/scoping, models handle logic
- Every model gets base CRUD properties

