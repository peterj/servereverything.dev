# Everything MCP Server

A reference [Model Context Protocol](https://modelcontextprotocol.io) server running on Cloudflare Workers that exercises all MCP features — tools, resources, prompts, subscriptions, and logging.

## MCP Endpoint

```
https://servereverything.dev/mcp
```

## Features

### Tools

| Tool | Description |
|------|-------------|
| `echo` | Echoes back input |
| `get-annotated-message` | Messages with priority & audience annotations |
| `get-tiny-image` | Returns a tiny MCP logo image |
| `get-sum` | Adds two numbers |
| `get-structured-content` | Structured weather data with output schema |
| `get-resource-reference` | Returns a resource content block |
| `get-resource-links` | Returns resource link blocks |
| `trigger-long-running-operation` | Progress reporting demo |
| `toggle-simulated-logging` | Periodic multi-level logging |
| `toggle-subscriber-updates` | Resource subscription notifications |

### Resources

- **Dynamic text** — `demo://resource/dynamic/text/{resourceId}`
- **Dynamic blob** — `demo://resource/dynamic/blob/{resourceId}`
- **Static documents** — `instructions.md`, `features.md`

### Prompts

- **simple-prompt** — no arguments
- **args-prompt** — city + optional state
- **completable-prompt** — auto-completing department & name
- **resource-prompt** — embeds a dynamic resource

## Development

```sh
npm install
npm run dev
```

## Deploy

```sh
npm run deploy
```
