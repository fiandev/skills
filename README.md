# skills

[![skills.sh](https://skills.sh/b/fiandev/skills)](https://skills.sh/fiandev/skills)

My personal agent skills — installable with the [`skills`](https://github.com/vercel-labs/skills) CLI for Claude Code, OpenCode, Codex, Cursor, and [75+ more agents](https://skills.sh/docs).

## Install

```bash
npx skills add fiandev/skills
```

Install a single skill:

```bash
npx skills add fiandev/skills --skill popular-repo
```

## Skills

| Skill | Description |
| ----- | ----------- |
| [`popular-repo`](skills/popular-repo) | Find the most popular GitHub repositories for a given period and deliver a social-ready feed with name, catchy description, and author. |

## Development

Skill scripts are written in TypeScript and compiled to plain `.js` so they run under `node` or `bun`:

```bash
npm install
npm run build   # transpiles every **/*.ts script to a sibling .js
```

Releases are automated: publishing a GitHub Release runs `.github/workflows/release.yml`, which compiles all `.ts` scripts to `.js` and commits the output back to the release branch.

## License

[MIT](LICENSE)
