# Spec-Driven Development

Complete specification-driven development workflow: Requirements → Design →
Tasks.

## Quick Start

### Prerequisites

- Node.js >= 16
- Git (optional, for revision history)

### Installation

```bash
cd .claude/skills
npm install
```

### Basic Usage

```bash
# Merge new requirements with existing
node spec-driven-development/scripts/merge-documents.js requirements new-requirements.md

# Validate consistency across all documents
node spec-driven-development/scripts/validate-consistency.js --path=.tmp

# Generate revision history
node spec-driven-development/scripts/generate-revision.js .tmp/*.md
```

### Integration with /spec Commands

This skill is integrated with specification commands:

```bash
/spec "feature description"  # Full 3-stage workflow
/requirements "feature"      # Stage 1: Requirements
/design                      # Stage 2: Design
/tasks                       # Stage 3: Tasks
```

### Workspace

Documents are created in `.tmp/` directory:

- `requirements.md` - Requirements specification
- `design.md` - Detailed design
- `tasks.md` - Implementation tasks

## Features

### Document Management

- ✅ Automatic merging with existing documents
- ✅ Duplicate detection and removal
- ✅ Section consolidation

### Validation

- ✅ Component name consistency
- ✅ Requirements coverage (all requirements in design)
- ✅ Task coverage (all components have tasks)
- ✅ Circular dependency detection

### Revision History

- ✅ Git-based change detection
- ✅ Automatic revision entry generation
- ✅ Author attribution

## Workflow

### 1. Requirements Phase

- Define functional/non-functional requirements
- Identify constraints and success criteria
- Auto-merge with existing requirements.md

### 2. Design Phase

- Design architecture and components
- Define data flow and APIs
- Validate consistency with requirements
- Auto-merge with existing design.md

### 3. Tasks Phase

- Break down design into implementable tasks
- Define dependencies and estimates
- Validate coverage of all components
- Add to "In Progress" section of tasks.md

## Output

Validation results saved to `reports/`:

- `validation-results.json` - Consistency check results

## Documentation

See [SKILL.md](SKILL.md) for detailed specifications and instructions.

## Troubleshooting

**Error: Circular dependency detected**

- Review task dependencies in tasks.md
- Break circular references

**Error: Component not found in design**

- Ensure component is defined in design.md
- Check for naming inconsistencies

**Warning: Requirement not covered**

- Add component to design.md that addresses the requirement

## Best Practices

1. Always run validation after major changes
2. Keep component names consistent across documents
3. Add revision entries for significant updates
4. Review warnings before proceeding to implementation

## License

MIT
