import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { auth } from "./routes/auth/auth";
import { branch } from "./routes/branch/branch";
import { car } from "./routes/car/car";
import { carJourney } from "./routes/car/carJourney";
import { carRequest } from "./routes/car/carRequest";
import { rating } from "./routes/rating/rating";

const api = new Hono()
	.route("/auth", auth)
	.route("/", branch)
	.route("/", car)
	.route("/", carRequest)
	.route("/", carJourney)
	.route("/", rating);

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
