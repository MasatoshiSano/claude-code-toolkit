# Technical Blog Generator

Generate beginner-friendly technical blog articles from code commits.

## Quick Start

### Prerequisites

- Node.js >= 16
- Git repository

### Installation

```bash
cd .claude/skills
npm install
```

### Basic Usage

```bash
# Analyze last commit
node technical-blog-generator/scripts/analyze-commit.js --commit=HEAD

# Detect blog topics
node technical-blog-generator/scripts/detect-blog-topics.js analysis.json

# Generate articles
node technical-blog-generator/scripts/generate-article.js topics.json analysis.json
```

### Integration with /blog Command

This skill is integrated with the `/blog` command:

```bash
/blog              # Analyze last commit and generate articles
/blog --auto-detect  # Automatic topic detection
```

### Configuration

Articles are generated in `_docs/blog/` directory.

## Features

- ✅ Automatic commit analysis (git diff, tech stack detection)
- ✅ Blog topic detection (new features, performance, refactoring, bug fixes)
- ✅ 3-tier article templates (beginner/intermediate/advanced)
- ✅ Multiple articles from single commit (1 topic per article)
- ✅ Before/After code examples
- ✅ Metrics-focused content (improvement percentages)

## Article Structure

### Beginner Articles

- Problem explanation
- Step-by-step implementation
- Before/After comparison
- Common pitfalls
- Next steps

### Intermediate Articles

- Architecture decisions
- Performance benchmarks
- Best practices and anti-patterns
- Testing strategies

### Advanced Articles

- Deep technical analysis
- Algorithm complexity
- Production deployment
- Cost analysis

## Output

Articles are saved to `_docs/blog/`:

- `YYYY-MM-DD-article-title.md` - Draft articles ready for editing

Reports are saved to `reports/`:

- `commit-analysis-YYYY-MM-DD.json` - Commit analysis data
- `blog-topics-YYYY-MM-DD.json` - Detected topics

## Documentation

See [SKILL.md](SKILL.md) for detailed specifications and instructions.

## Troubleshooting

**Error: Not a git repository**

- Ensure you're in a git repository
- Run `git init` if needed

**Error: No blog-worthy topics detected**

- Commit may be too small or trivial
- Try analyzing multiple commits

## License

MIT
