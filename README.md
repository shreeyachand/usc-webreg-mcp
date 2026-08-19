# USC WebReg/Course Catalog MCP

MCP server exposing USC's public course catalog API (`classes.usc.edu`) for AI agents. Allows you to ask questions like, "What GE B options are there on Tuesday/Thursday that start after noon?"

## Setup

```
npm install
npm run build
node dist/index.js
```

## Local config

### opencode

Add to `~/.config/opencode/opencode.jsonc`:

```jsonc
{
  "mcp": {
    "usc-courses": {
      "type": "local",
      "command": ["node", "/absolute/path/to/usc-webreg-mcp/dist/index.js"],
      "enabled": true
    }
  }
}
```

### Claude Code

Add a `.mcp.json` in the project root (or run `claude mcp add`):

```json
{
  "mcpServers": {
    "usc-courses": {
      "command": "node",
      "args": ["/absolute/path/to/usc-webreg-mcp/dist/index.js"]
    }
  }
}
```

## Tools

| Tool | Description |
|------|-------------|
| `list_terms` | All academic terms with season/year/status |
| `get_term` | Single term details by termCode (e.g. `20263`) |
| `list_schools` | Schools/colleges and their programs for a term |
| `list_programs` | Programs (departments) and their school for a term |
| `get_program` | Program details/notes (D-clearance info) |
| `list_course_prefixes` | Every subject prefix in the catalog |
| `list_sessions` | Enrollment sessions and drop dates |
| `check_course_exists` | Whether a course code exists in the catalog |
| `get_syllabus_index` | SimpleSyllabus index URL for a term |
| `get_section_fees` | Fees for a section by `sisSectionId` |
| `search_courses` | Keyword search of the catalog (code/title/description) |
| `get_course` | Full course record incl. all sections, prereqs, restrictions |
| `list_courses_by_program` | All courses for a school+program |
| `list_ge_requirements` | GE structure (requirements + category prefixes) |
| `list_courses_by_ge` | Courses satisfying a GE category |
| `get_ge_category_details` | Name/details of a GE category |

## Schedule filters

`search_courses`, `list_courses_by_program`, and `list_courses_by_ge` accept optional section filters: `days` (`["Mon","Wed"]`), `startAfter`/`startBefore` (`"12:00"`), and `openOnly`.

Example: GE B classes meeting Mon+Wed at/after noon:

```
list_courses_by_ge(termCode=20263, geRequirementPrefix=ACORELIT,
  geCategoryPrefix=HINQ, days=["Mon","Wed"], startAfter="12:00")
```