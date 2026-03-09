import {
	McpServer,
	ResourceTemplate,
} from "@modelcontextprotocol/sdk/server/mcp.js";
import { completable } from "@modelcontextprotocol/sdk/server/completable.js";
import {
	SubscribeRequestSchema,
	UnsubscribeRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { McpAgent } from "agents/mcp";
import { z } from "zod";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MCP_TINY_IMAGE =
	"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";

const INSTRUCTIONS = `# Everything MCP Server (Cloudflare Workers Edition)

This server exercises all features of the MCP protocol. It implements tools, resources,
prompts, subscriptions, logging, and more to showcase MCP capabilities.

## Available Features
- **Tools**: echo, annotated messages, image generation, math, structured content, resource references, progress tracking, logging, and subscriptions
- **Resources**: Dynamic text/blob templates and static documents
- **Prompts**: Simple, parameterized, auto-completable, and resource-embedded prompts
- **Subscriptions**: Resource change notifications
- **Logging**: Simulated multi-level logging`;

// Resource URI configuration
const DYNAMIC_URI_BASE = "demo://resource/dynamic";
const TEXT_URI_BASE = `${DYNAMIC_URI_BASE}/text`;
const BLOB_URI_BASE = `${DYNAMIC_URI_BASE}/blob`;
const TEXT_URI_TEMPLATE = `${TEXT_URI_BASE}/{resourceId}`;
const BLOB_URI_TEMPLATE = `${BLOB_URI_BASE}/{resourceId}`;

const RESOURCE_TYPE_TEXT = "Text" as const;
const RESOURCE_TYPE_BLOB = "Blob" as const;
const RESOURCE_TYPES: string[] = [RESOURCE_TYPE_TEXT, RESOURCE_TYPE_BLOB];

// Static document resources (hardcoded since Workers have no filesystem)
const STATIC_DOCS: Record<
	string,
	{ content: string; mimeType: string; description: string }
> = {
	"instructions.md": {
		content: INSTRUCTIONS,
		mimeType: "text/markdown",
		description: "Server instructions and overview",
	},
	"features.md": {
		content: `# Server Features

## Tools
- \`echo\` — Echoes back the input message
- \`get-annotated-message\` — Returns messages annotated with priority and audience
- \`get-tiny-image\` — Returns a tiny MCP logo PNG image
- \`get-sum\` — Calculates the sum of two numbers
- \`get-structured-content\` — Returns structured weather data with output schema validation
- \`get-resource-reference\` — Returns a resource content block for a given type and ID
- \`get-resource-links\` — Returns multiple resource link content blocks
- \`trigger-long-running-operation\` — Simulates a multi-step operation with progress updates
- \`toggle-simulated-logging\` — Starts/stops periodic random-leveled log messages
- \`toggle-subscriber-updates\` — Starts/stops simulated resource update notifications

## Resources
- Dynamic Text: \`demo://resource/dynamic/text/{resourceId}\`
- Dynamic Blob: \`demo://resource/dynamic/blob/{resourceId}\`
- Static Documents: \`demo://resource/static/document/{name}\`

## Prompts
- \`simple-prompt\` — No-argument prompt returning static text
- \`args-prompt\` — Prompt with required city and optional state arguments
- \`completable-prompt\` — Prompt with auto-completing department and name arguments
- \`resource-prompt\` — Prompt that embeds a dynamic resource reference

## Resource Subscriptions
- Subscribe/unsubscribe via standard MCP requests
- Use \`toggle-subscriber-updates\` tool to start periodic update notifications

## Simulated Logging
- Use \`toggle-simulated-logging\` tool to start periodic log messages
- Messages cycle through all log levels (debug through emergency)`,
		mimeType: "text/markdown",
		description: "Complete feature list",
	},
};

// Log levels for simulated logging
const LOG_LEVELS = [
	"debug",
	"info",
	"notice",
	"warning",
	"error",
	"critical",
	"alert",
	"emergency",
] as const;

// ---------------------------------------------------------------------------
// Resource helpers
// ---------------------------------------------------------------------------

function textResourceUri(id: number): URL {
	return new URL(`${TEXT_URI_BASE}/${id}`);
}

function blobResourceUri(id: number): URL {
	return new URL(`${BLOB_URI_BASE}/${id}`);
}

function textResource(uri: URL, id: number) {
	const timestamp = new Date().toLocaleTimeString();
	return {
		uri: uri.toString(),
		mimeType: "text/plain" as const,
		text: `Resource ${id}: This is a plaintext resource created at ${timestamp}`,
	};
}

function blobResource(uri: URL, id: number) {
	const timestamp = new Date().toLocaleTimeString();
	return {
		uri: uri.toString(),
		mimeType: "text/plain" as const,
		blob: btoa(
			`Resource ${id}: This is a base64 blob created at ${timestamp}`,
		),
	};
}

function parseResourceId(
	uri: URL,
	variables: Record<string, string | string[]>,
): number {
	const idStr = String(variables.resourceId ?? "");
	const id = Number(idStr);
	if (!Number.isFinite(id) || !Number.isInteger(id) || id < 1) {
		throw new Error(`Unknown resource: ${uri.toString()}`);
	}
	return id;
}

const resourceIdForTemplateCompleter = (value: string): string[] => {
	const id = Number(value);
	return Number.isInteger(id) && id > 0 ? [value] : [];
};

// ---------------------------------------------------------------------------
// MCP Agent
// ---------------------------------------------------------------------------

export class MyMCP extends McpAgent {
	server = new McpServer(
		{
			name: "server-everything",
			title: "Everything MCP Server",
			version: "1.0.0",
		},
		{
			capabilities: {
				tools: { listChanged: true },
				prompts: { listChanged: true },
				resources: { subscribe: true, listChanged: true },
				logging: {},
			},
			instructions: INSTRUCTIONS,
		},
	);

	private loggingInterval: ReturnType<typeof setInterval> | null = null;
	private subsInterval: ReturnType<typeof setInterval> | null = null;
	private subscribedUris = new Set<string>();

	async init() {
		this.registerTools();
		this.registerResources();
		this.registerPrompts();
		this.setupSubscriptionHandlers();
	}

	// -------------------------------------------------------------------
	// Tools
	// -------------------------------------------------------------------

	private registerTools() {
		// Echo
		this.server.registerTool(
			"echo",
			{
				title: "Echo Tool",
				description: "Echoes back the input message",
				inputSchema: {
					message: z.string().describe("Message to echo"),
				},
			},
			async (args) => ({
				content: [{ type: "text", text: `Echo: ${args.message}` }],
			}),
		);

		// Get Annotated Message
		this.server.registerTool(
			"get-annotated-message",
			{
				title: "Get Annotated Message Tool",
				description:
					"Demonstrates how annotations provide metadata about content",
				inputSchema: {
					messageType: z
						.enum(["error", "success", "debug"])
						.describe(
							"Type of message to demonstrate different annotation patterns",
						),
					includeImage: z
						.boolean()
						.default(false)
						.describe("Whether to include an example image"),
				},
			},
			async (args) => {
				const content: Array<Record<string, unknown>> = [];

				if (args.messageType === "error") {
					content.push({
						type: "text",
						text: "Error: Operation failed",
						annotations: {
							priority: 1.0,
							audience: ["user", "assistant"],
						},
					});
				} else if (args.messageType === "success") {
					content.push({
						type: "text",
						text: "Operation completed successfully",
						annotations: { priority: 0.7, audience: ["user"] },
					});
				} else if (args.messageType === "debug") {
					content.push({
						type: "text",
						text: "Debug: Cache hit ratio 0.95, latency 150ms",
						annotations: {
							priority: 0.3,
							audience: ["assistant"],
						},
					});
				}

				if (args.includeImage) {
					content.push({
						type: "image",
						data: MCP_TINY_IMAGE,
						mimeType: "image/png",
						annotations: { priority: 0.5, audience: ["user"] },
					});
				}

				return { content } as any;
			},
		);

		// Get Tiny Image
		this.server.registerTool(
			"get-tiny-image",
			{
				title: "Get Tiny Image Tool",
				description: "Returns a tiny MCP logo image",
				inputSchema: {},
			},
			async () => ({
				content: [
					{
						type: "text" as const,
						text: "Here's the image you requested:",
					},
					{
						type: "image" as const,
						data: MCP_TINY_IMAGE,
						mimeType: "image/png",
					},
					{
						type: "text" as const,
						text: "The image above is the MCP logo.",
					},
				],
			}),
		);

		// Get Sum
		this.server.registerTool(
			"get-sum",
			{
				title: "Get Sum Tool",
				description: "Returns the sum of two numbers",
				inputSchema: {
					a: z.number().describe("First number"),
					b: z.number().describe("Second number"),
				},
			},
			async (args) => ({
				content: [
					{
						type: "text",
						text: `The sum of ${args.a} and ${args.b} is ${args.a + args.b}.`,
					},
				],
			}),
		);

		// Get Structured Content (with output schema)
		const outputSchema = z.object({
			temperature: z.number().describe("Temperature in celsius"),
			conditions: z.string().describe("Weather conditions description"),
			humidity: z.number().describe("Humidity percentage"),
		});

		this.server.registerTool(
			"get-structured-content",
			{
				title: "Get Structured Content Tool",
				description:
					"Returns structured weather data with an output schema for client validation",
				inputSchema: {
					location: z
						.enum(["New York", "Chicago", "Los Angeles"])
						.describe("Choose city"),
				},
				outputSchema,
			},
			async (args) => {
				const weatherMap: Record<
					string,
					{
						temperature: number;
						conditions: string;
						humidity: number;
					}
				> = {
					"New York": {
						temperature: 33,
						conditions: "Cloudy",
						humidity: 82,
					},
					Chicago: {
						temperature: 36,
						conditions: "Light rain / drizzle",
						humidity: 82,
					},
					"Los Angeles": {
						temperature: 73,
						conditions: "Sunny / Clear",
						humidity: 48,
					},
				};
				const weather = weatherMap[args.location];
				return {
					content: [{ type: "text", text: JSON.stringify(weather) }],
					structuredContent: weather,
				};
			},
		);

		// Get Resource Reference
		this.server.registerTool(
			"get-resource-reference",
			{
				title: "Get Resource Reference Tool",
				description:
					"Returns a resource reference that can be used by MCP clients",
				inputSchema: {
					resourceType: z
						.enum([RESOURCE_TYPE_TEXT, RESOURCE_TYPE_BLOB])
						.default(RESOURCE_TYPE_TEXT)
						.describe("Type of resource to fetch"),
					resourceId: z
						.number()
						.int()
						.positive()
						.default(1)
						.describe("ID of the resource to fetch"),
				},
			},
			async (args) => {
				const { resourceType, resourceId } = args;
				const uri =
					resourceType === RESOURCE_TYPE_TEXT
						? textResourceUri(resourceId)
						: blobResourceUri(resourceId);
				const resource =
					resourceType === RESOURCE_TYPE_TEXT
						? textResource(uri, resourceId)
						: blobResource(uri, resourceId);

				return {
					content: [
						{
							type: "text",
							text: `Returning resource reference for Resource ${resourceId}:`,
						},
						{ type: "resource", resource } as any,
						{
							type: "text",
							text: `You can access this resource using the URI: ${resource.uri}`,
						},
					],
				};
			},
		);

		// Get Resource Links
		this.server.registerTool(
			"get-resource-links",
			{
				title: "Get Resource Links Tool",
				description:
					"Returns resource links referencing different types of resources",
				inputSchema: {
					count: z
						.number()
						.int()
						.min(1)
						.max(10)
						.default(3)
						.describe("Number of resource links to return (1-10)"),
				},
			},
			async (args) => {
				const content: Array<Record<string, unknown>> = [
					{
						type: "text",
						text: `Here are ${args.count} resource links to resources available in this server:`,
					},
				];

				for (let id = 1; id <= args.count; id++) {
					const isText = id % 2 === 0;
					const uri = isText
						? textResourceUri(id)
						: blobResourceUri(id);
					const resource = isText
						? textResource(uri, id)
						: blobResource(uri, id);

					content.push({
						type: "resource_link",
						uri: resource.uri,
						name: `${isText ? "Text" : "Blob"} Resource ${id}`,
						description: `Resource ${id}: ${isText ? "plaintext resource" : "binary blob resource"}`,
						mimeType: resource.mimeType,
					});
				}

				return { content } as any;
			},
		);

		// Trigger Long Running Operation
		this.server.registerTool(
			"trigger-long-running-operation",
			{
				title: "Trigger Long Running Operation Tool",
				description:
					"Demonstrates a long running operation with progress updates",
				inputSchema: {
					duration: z
						.number()
						.default(10)
						.describe("Duration of the operation in seconds"),
					steps: z
						.number()
						.default(5)
						.describe("Number of steps in the operation"),
				},
			},
			async (args, extra) => {
				const { duration, steps } = args;
				const stepDuration = duration / steps;
				const progressToken = extra._meta?.progressToken;

				for (let i = 1; i <= steps; i++) {
					await new Promise((resolve) =>
						setTimeout(resolve, stepDuration * 1000),
					);

					if (progressToken !== undefined) {
						await this.server.server.notification(
							{
								method: "notifications/progress",
								params: {
									progress: i,
									total: steps,
									progressToken,
								},
							},
							{ relatedRequestId: extra.requestId },
						);
					}
				}

				return {
					content: [
						{
							type: "text",
							text: `Long running operation completed. Duration: ${duration} seconds, Steps: ${steps}.`,
						},
					],
				};
			},
		);

		// Toggle Simulated Logging
		this.server.registerTool(
			"toggle-simulated-logging",
			{
				title: "Toggle Simulated Logging",
				description:
					"Toggles simulated, random-leveled logging on or off",
				inputSchema: {},
			},
			async (_args, extra) => {
				const sessionId = extra?.sessionId;
				let response: string;

				if (this.loggingInterval) {
					clearInterval(this.loggingInterval);
					this.loggingInterval = null;
					response = `Stopped simulated logging${sessionId ? ` for session ${sessionId}` : ""}`;
				} else {
					const sendLog = async () => {
						const msg =
							LOG_LEVELS[
								Math.floor(Math.random() * LOG_LEVELS.length)
							];
						await this.server.sendLoggingMessage(
							{ level: msg, data: `${msg}-level message` },
							sessionId,
						);
					};
					sendLog();
					this.loggingInterval = setInterval(sendLog, 5000);
					response = `Started simulated logging${sessionId ? ` for session ${sessionId}` : ""} at a 5 second pace. Client's selected logging level will be respected.`;
				}

				return {
					content: [{ type: "text", text: response }],
				};
			},
		);

		// Toggle Subscriber Updates
		this.server.registerTool(
			"toggle-subscriber-updates",
			{
				title: "Toggle Subscriber Updates",
				description:
					"Toggles simulated resource subscription updates on or off",
				inputSchema: {},
			},
			async (_args, extra) => {
				const sessionId = extra?.sessionId;
				let response: string;

				if (this.subsInterval) {
					clearInterval(this.subsInterval);
					this.subsInterval = null;
					response = `Stopped simulated resource updates${sessionId ? ` for session ${sessionId}` : ""}`;
				} else {
					const sendUpdates = async () => {
						for (const uri of this.subscribedUris) {
							await this.server.server.notification({
								method: "notifications/resources/updated",
								params: { uri },
							});
						}
					};
					sendUpdates();
					this.subsInterval = setInterval(sendUpdates, 5000);
					response = `Started simulated resource update notifications${sessionId ? ` for session ${sessionId}` : ""} at a 5 second pace. Client will receive updates for subscribed resources.`;
				}

				return {
					content: [{ type: "text", text: response }],
				};
			},
		);
	}

	// -------------------------------------------------------------------
	// Resources
	// -------------------------------------------------------------------

	private registerResources() {
		// Dynamic text resource template
		this.server.registerResource(
			"Dynamic Text Resource",
			new ResourceTemplate(TEXT_URI_TEMPLATE, {
				list: undefined,
				complete: {
					resourceId: resourceIdForTemplateCompleter,
				},
			}),
			{
				mimeType: "text/plain",
				description:
					"Plaintext dynamic resource fabricated from the {resourceId} variable, which must be a positive integer.",
			},
			async (uri, variables) => {
				const id = parseResourceId(uri, variables);
				return { contents: [textResource(uri, id)] };
			},
		);

		// Dynamic blob resource template
		this.server.registerResource(
			"Dynamic Blob Resource",
			new ResourceTemplate(BLOB_URI_TEMPLATE, {
				list: undefined,
				complete: {
					resourceId: resourceIdForTemplateCompleter,
				},
			}),
			{
				mimeType: "application/octet-stream",
				description:
					"Binary (base64) dynamic resource fabricated from the {resourceId} variable, which must be a positive integer.",
			},
			async (uri, variables) => {
				const id = parseResourceId(uri, variables);
				return { contents: [blobResource(uri, id)] };
			},
		);

		// Static document resources
		for (const [name, doc] of Object.entries(STATIC_DOCS)) {
			const uri = `demo://resource/static/document/${encodeURIComponent(name)}`;
			this.server.registerResource(
				name,
				uri,
				{
					mimeType: doc.mimeType,
					description: doc.description,
				},
				async (resourceUri) => ({
					contents: [
						{
							uri: resourceUri.toString(),
							mimeType: doc.mimeType,
							text: doc.content,
						},
					],
				}),
			);
		}
	}

	// -------------------------------------------------------------------
	// Prompts
	// -------------------------------------------------------------------

	private registerPrompts() {
		// Simple prompt (no arguments)
		this.server.registerPrompt(
			"simple-prompt",
			{
				title: "Simple Prompt",
				description: "A prompt with no arguments",
			},
			() => ({
				messages: [
					{
						role: "user" as const,
						content: {
							type: "text" as const,
							text: "This is a simple prompt without arguments.",
						},
					},
				],
			}),
		);

		// Arguments prompt (city + optional state)
		this.server.registerPrompt(
			"args-prompt",
			{
				title: "Arguments Prompt",
				description:
					"A prompt with two arguments, one required and one optional",
				argsSchema: {
					city: z.string().describe("Name of the city"),
					state: z
						.string()
						.describe("Name of the state")
						.optional(),
				},
			},
			(args) => {
				const location = `${args.city}${args.state ? `, ${args.state}` : ""}`;
				return {
					messages: [
						{
							role: "user" as const,
							content: {
								type: "text" as const,
								text: `What's the weather in ${location}?`,
							},
						},
					],
				};
			},
		);

		// Completable prompt (department → name with auto-completion)
		this.server.registerPrompt(
			"completable-prompt",
			{
				title: "Team Management",
				description:
					"First argument choice narrows values for second argument",
				argsSchema: {
					department: completable(
						z.string().describe("Choose the department."),
						(value) =>
							[
								"Engineering",
								"Sales",
								"Marketing",
								"Support",
							].filter((d) => d.startsWith(value)),
					),
					name: completable(
						z
							.string()
							.describe(
								"Choose a team member to lead the selected department.",
							),
						(value, context) => {
							const dept = context?.arguments?.["department"];
							const teams: Record<string, string[]> = {
								Engineering: ["Alice", "Bob", "Charlie"],
								Sales: ["David", "Eve", "Frank"],
								Marketing: ["Grace", "Henry", "Iris"],
								Support: ["John", "Kim", "Lee"],
							};
							return (teams[dept ?? ""] ?? []).filter((n) =>
								n.startsWith(value),
							);
						},
					),
				},
			},
			({ department, name }) => ({
				messages: [
					{
						role: "user" as const,
						content: {
							type: "text" as const,
							text: `Please promote ${name} to the head of the ${department} team.`,
						},
					},
				],
			}),
		);

		// Resource prompt (embedded resource reference)
		this.server.registerPrompt(
			"resource-prompt",
			{
				title: "Resource Prompt",
				description:
					"A prompt that includes an embedded resource reference",
				argsSchema: {
					resourceType: completable(
						z.string().describe("Type of resource to fetch"),
						(value) =>
							RESOURCE_TYPES.filter((t) => t.startsWith(value)),
					),
					resourceId: completable(
						z.string().describe("ID of the text resource to fetch"),
						(value) => {
							const id = Number(value);
							return Number.isInteger(id) && id > 0
								? [value]
								: [];
						},
					),
				},
			},
			(args) => {
				const resourceType = args.resourceType;
				if (!RESOURCE_TYPES.includes(resourceType)) {
					throw new Error(
						`Invalid resourceType: ${resourceType}. Must be ${RESOURCE_TYPE_TEXT} or ${RESOURCE_TYPE_BLOB}.`,
					);
				}

				const resourceId = Number(args.resourceId);
				if (
					!Number.isFinite(resourceId) ||
					!Number.isInteger(resourceId) ||
					resourceId < 1
				) {
					throw new Error(
						`Invalid resourceId: ${args.resourceId}. Must be a finite positive integer.`,
					);
				}

				const uri =
					resourceType === RESOURCE_TYPE_TEXT
						? textResourceUri(resourceId)
						: blobResourceUri(resourceId);
				const resource =
					resourceType === RESOURCE_TYPE_TEXT
						? textResource(uri, resourceId)
						: blobResource(uri, resourceId);

				return {
					messages: [
						{
							role: "user" as const,
							content: {
								type: "text" as const,
								text: `This prompt includes the ${resourceType} resource with id: ${resourceId}. Please analyze the following resource:`,
							},
						},
						{
							role: "user" as const,
							content: {
								type: "resource" as const,
								resource,
							},
						},
					],
				};
			},
		);
	}

	// -------------------------------------------------------------------
	// Subscription handlers
	// -------------------------------------------------------------------

	private setupSubscriptionHandlers() {
		this.server.server.setRequestHandler(
			SubscribeRequestSchema,
			async (request, extra) => {
				const { uri } = request.params;
				this.subscribedUris.add(uri);

				await this.server.sendLoggingMessage(
					{
						level: "info",
						data: `Subscribed to resource: ${uri}`,
					},
					extra.sessionId,
				);

				return {};
			},
		);

		this.server.server.setRequestHandler(
			UnsubscribeRequestSchema,
			async (request, extra) => {
				const { uri } = request.params;
				this.subscribedUris.delete(uri);

				await this.server.sendLoggingMessage(
					{
						level: "info",
						data: `Unsubscribed from resource: ${uri}`,
					},
					extra.sessionId,
				);

				return {};
			},
		);
	}
}

// ---------------------------------------------------------------------------
// Worker entry point
// ---------------------------------------------------------------------------

import HTML from "./index.html";

export default {
	fetch(request: Request, env: Env, ctx: ExecutionContext) {
		const url = new URL(request.url);

		if (url.pathname === "/mcp") {
			return MyMCP.serve("/mcp").fetch(request, env, ctx);
		}

		if (url.pathname === "/" || url.pathname === "/index.html") {
			return new Response(HTML, {
				headers: { "Content-Type": "text/html; charset=utf-8" },
			});
		}

		return new Response("Not found", { status: 404 });
	},
};
