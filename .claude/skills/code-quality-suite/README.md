# Code Quality Suite

Comprehensive code quality, security, and performance analysis.

## Quick Start

### Prerequisites

- Node.js >= 16
- ESLint (optional, for enhanced checks)
- TypeScript (optional, for type checking)

### Installation

```bash
cd .claude/skills
npm install
```

### Basic Usage

```bash
# Run quality checks
node code-quality-suite/scripts/quality-checker.js

# Run security scan
node code-quality-suite/scripts/security-scanner.js

# Generate comprehensive report
node code-quality-suite/scripts/report-generator.js
```

### Integration with /check Command

This skill is integrated with the `/check` command:

```bash
/check          # Basic checks
/check --detailed  # Uses Code Quality Suite
```

### Configuration

Edit configuration files to customize:

- `configs/eslint-rules.json` - ESLint rules
- `configs/security-rules.yaml` - Security scanning rules

## Features

### Code Quality

- ✅ ESLint integration
- ✅ TypeScript type checking
- ✅ Complexity analysis (Cyclomatic Complexity)
- ✅ Code smell detection

### Security

- ✅ npm audit integration
- ✅ Secret detection (API keys, passwords, private keys)
- ✅ OWASP Top 10 checks
- ✅ Dependency vulnerability scanning

### Performance

- 🚧 Algorithm efficiency analysis (planned)
- 🚧 Bundle size analysis (planned)

## Output

Reports are saved to `reports/`:

- `quality-check-YYYY-MM-DD.json` - Code quality results
- `security-scan-YYYY-MM-DD.json` - Security scan results
- `code-quality-suite-YYYY-MM-DD.md` - Unified Markdown report

## Scoring

Overall score: 0-100

- Code Quality: 50% weight
- Security: 50% weight

## Documentation

See [SKILL.md](SKILL.md) for detailed specifications and instructions.

## Troubleshooting

**Error: ESLint not found**

```bash
npm install eslint --save-dev
```

**Error: TypeScript not found**

```bash
npm install typescript --save-dev
```

## License

MIT
