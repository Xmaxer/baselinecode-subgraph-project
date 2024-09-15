Heavily opinionated GraphQL Subgraph project template.

Actual template code is maintained and downloaded from https://github.com/Xmaxer/baselinecode-subgraph-project-template

Creates an empty NodeJS project with:

- Typescript
- TS Paths
- ESBuild as compiler
- Prettier
- ESLint
- Husky pre commit
- Pino logger as standard, disallow traditional console logs
- Node 22 (Not configurable atm)
- GraphQL middleware support
- GraphQL WebSocket protocol support (subscription)
- Federation ready (Tested using WunderGraph Cosmo)
- GraphQL Codegen to generate TS definitions and GraphQL SDL
- A simple custom performance measurer for functions
