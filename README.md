Heavily opinionated GraphQL Subgraph project template.

Actual template code is maintained and downloaded from https://github.com/Xmaxer/baselinecode-subgraph-project-template

Creates a GraphQL Subgraph project with:

- TypeScript
- TS Paths
- ESBuild as compiler
- Prettier
- ESLint
- Husky pre-commit hooks
- Pino logger (console logs disallowed)
- GraphQL middleware support
- GraphQL WebSocket protocol support (subscriptions)
- Federation ready (tested with WunderGraph Cosmo)
- GraphQL Codegen for TypeScript definitions and SDL
- Custom performance measurer for functions
- Node 24 (Not configurable atm)

## Usage

```bash
npx @baselinecode/subgraph-project -n my-subgraph -r http://localhost:4000/graphql -a subgraph
```

### Options

- `-n, --name <string>`: The name of the project (required)
- `-r, --routingUrl <string>`: The HTTP endpoint of the subgraph (required)
- `-a, --apiType <string>`: The API type (required)

## What's Included

### Core Technologies

- **TypeScript**: Type-safe JavaScript with strict mode
- **ESBuild**: Fast TypeScript compiler
- **Node.js 24**: Latest LTS version
- **TS Paths**: Clean imports using path aliases

### GraphQL

- **GraphQL Apollo Server**: Modern GraphQL server
- **Federation Support**: Apollo Federation compatible
- **WebSocket Support**: Real-time subscriptions via GraphQL over WebSocket
- **GraphQL Codegen**: Generate TypeScript types from schema
- **Middleware Support**: Extensible request/response pipeline

### Developer Experience

- **ESLint**: Code linting with strict rules
- **Prettier**: Code formatting
- **Husky**: Git hooks for pre-commit checks
- **Pino Logger**: Structured logging (console.log disallowed)
- **Performance Measurer**: Custom utility for function performance tracking

### Code Quality

- No `any` types allowed
- No `console.log` allowed (use Pino logger)
- Strict TypeScript configuration
- Enforced code formatting
- Pre-commit hooks for quality checks
- Relative imports restricted (use path aliases)

## Post-Installation

After creating your project:

1. Update `.env` with your configuration
2. Define your GraphQL schema in `src/schema/schemaDefs/`
3. Run `npm run graphql:generate` to generate TypeScript types
4. Implement your resolvers
5. Start development with `npm start`

## Available Scripts

- `npm start`: Start development server with hot reload
- `npm run build`: Build for production
- `npm run serve`: Run production build
- `npm run lint`: Lint and fix code
- `npm run prettier`: Format code
- `npm run typescript:check`: Type check
- `npm run graphql:generate`: Generate GraphQL schema and types

## Project Structure

```
my-subgraph/
├── src/
│   ├── schema/
│   │   ├── schemaDefs/       # GraphQL schema definitions
│   │   └── resolvers/        # GraphQL resolvers
│   ├── utils/
│   │   ├── logger.mts        # Pino logger configuration
│   │   └── performance.mts   # Performance measurement utility
│   ├── middleware/           # GraphQL middleware
│   └── main.mts              # Application entry point
├── .env                      # Environment variables
├── codegen.ts                # GraphQL Codegen configuration
└── package.json
```

## License

MIT
