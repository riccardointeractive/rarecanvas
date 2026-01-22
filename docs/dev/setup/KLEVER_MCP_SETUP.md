# Klever MCP Server Setup

**Purpose:** Install the Klever MCP Server for enhanced smart contract development with Claude  
**Created:** December 8, 2025  
**Repository:** https://github.com/klever-io/mcp-klever-vm

---

## What is Klever MCP?

A Model Context Protocol (MCP) server that provides Claude with **81+ Klever blockchain knowledge entries** including:

- Smart contract patterns and examples
- Storage mapper recommendations
- Payment handling (KLV vs KDA tokens)
- Event emission rules
- CLI tools (koperator, ksc)
- Deployment scripts
- Common errors and solutions
- Best practices and optimizations

---

## Installation Steps

### Step 1: Clone & Build

```bash
cd ~
git clone https://github.com/klever-io/mcp-klever-vm.git
cd mcp-klever-vm
npm install
cp .env.example .env
npm run build
```

### Step 2: Configure Claude Desktop

```bash
mkdir -p ~/Library/Application\ Support/Claude
nano ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

Paste this configuration:

```json
{
  "mcpServers": {
    "klever-vm": {
      "command": "node",
      "args": ["/Users/riccardomarconato/mcp-klever-vm/dist/index.js"],
      "env": {
        "MODE": "mcp",
        "STORAGE_TYPE": "memory"
      }
    }
  }
}
```

Save: `Ctrl+O` → `Enter` → `Ctrl+X`

### Step 3: Restart Claude Desktop

```bash
osascript -e 'quit app "Claude"'
open -a Claude
```

### Step 4: Verify Connection

1. Open Claude Desktop
2. Click the **sliders icon** (⚙️) at bottom of chat input
3. Confirm **klever-vm** shows with blue toggle enabled ✅

---

## Testing the MCP

Try these prompts in Claude:

```
What are the best practices for handling native KLV payments vs KDA tokens?
```

```
Show me storage mapper patterns for Klever VM
```

```
How do I emit events correctly in Klever smart contracts?
```

---

## Available MCP Tools

| Tool | Description |
|------|-------------|
| `query_context` | Search Klever VM patterns, examples, best practices |
| `add_context` | Add new patterns to knowledge base |
| `get_context` | Get specific context by ID |
| `find_similar` | Find similar code patterns |
| `init_klever_project` | Initialize new contract project with scripts |
| `enhance_with_context` | Auto-enhance queries with relevant context |
| `get_knowledge_stats` | View knowledge base statistics |

---

## Knowledge Base Contents (81+ entries)

- **Core Patterns:** Payment handling, token operations, decimal conversions
- **Storage Mappers:** SingleValueMapper, MapMapper, SetMapper, VecMapper
- **Events:** Emission rules, parameter formatting
- **Modules:** Admin, Pause, built-in helpers
- **CLI Tools:** koperator commands, ksc build commands
- **Examples:** Lottery, staking, cross-contract communication
- **Errors:** Common mistakes and solutions
- **Scripts:** Deploy, upgrade, query helpers

---

## Troubleshooting

### Server not connecting?

Test manually:
```bash
cd ~/mcp-klever-vm
MODE=mcp node dist/index.js
```

Should output:
```
🔄 Auto-ingesting Klever knowledge base...
Ingested 4 common patterns
✅ Auto-ingestion complete: 81 contexts loaded, 0 failed
[MCP] Klever MCP Server started with knowledge base
```

### Check config is correct

```bash
cat ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

### View logs

```bash
ls ~/Library/Logs/Claude/
cat ~/Library/Logs/Claude/mcp*.log
```

### Rebuild if needed

```bash
cd ~/mcp-klever-vm
npm run build
```

---

## Updating the MCP

```bash
cd ~/mcp-klever-vm
git pull
npm install
npm run build
```

Then restart Claude Desktop.

---

## File Locations

| Item | Path |
|------|------|
| MCP Server | `~/mcp-klever-vm/` |
| Claude Desktop Config | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Claude Code Config | `~/.claude.json` |
| MCP Logs | `~/Library/Logs/Claude/mcp*.log` |

---

## Related Documentation

- [Klever Smart Contracts Guide](./smart-contracts/KLEVER_SMART_CONTRACTS_GUIDE.md)
- [Contract Development](./smart-contracts/CONTRACT_DEVELOPMENT.md)
- [ABI Encoding Guide](./smart-contracts/ABI_ENCODING_GUIDE.md)
- [Klever API Comparison](./api/KLEVER_API_COMPARISON.md)

---

**Result:** Claude now has access to comprehensive Klever smart contract knowledge for Digiko development! 🚀
