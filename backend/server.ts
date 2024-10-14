import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { auth } from "./routes/auth/auth";
import { events } from "./routes/events/event";

const api = new Hono().route("/auth", auth).route("/events", events);

const app = new Hono()
	.use(cors())
	.use(logger())
	.get("/", (c) => {
		return c.json({ data: "uDrive API" });
	})
	.route("/api", api);

const port = Number(process.env.SERVER_PORT) || 3000;
console.log(`Server is running on port ${port}`);

serve({
	fetch: app.fetch,
	port,
});

export type AppType = typeof app;
