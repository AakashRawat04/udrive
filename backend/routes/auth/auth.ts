import { vValidator } from "@hono/valibot-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { jwt, sign } from "hono/jwt";
import { loginSchema, registerSchema } from "../../schema/auth";
import { user } from "../../schema/user";
import { userTypes } from "../../utils/constants";
import { db } from "../../utils/db";

export const auth = new Hono();

auth.post("/login", vValidator("json", loginSchema), async (c) => {
	const body = c.req.valid("json");

	const response = await db
		.select()
		.from(user)
		.where(eq(user.email, body.email));

	console.log(response);
	if (response.length === 0) {
		return c.json({ error: "User not found" });
	}

	const userResponse = response[0];
	if (userResponse.password !== body.password) {
		return c.json({ error: "Invalid password" });
	}

	const token = await sign(
		{
			email: body.email,
			role: userResponse.role,
			exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, // 30 days
		},
		process.env.JWT_SECRET!
	);

	return c.json({ data: token });
});

auth.post("/register", vValidator("json", registerSchema), async (c) => {
	try {
		const body = c.req.valid("json");

		const response = await db.insert(user).values({
			name: body.name,
			email: body.email,
			password: body.password,
			role: userTypes.USER,
		});

		return c.json({ data: response });
	} catch (e) {
		console.error(e);
		return c.json({ error: "An error occurred" });
	}
});

// route for super admins only to create admin users
auth.post(
	"/admin.create",
	vValidator("json", registerSchema),
	jwt({
		secret: process.env.JWT_SECRET!,
	}),
	async (c) => {
		try {
			const body = c.req.valid("json");
			console.log(body);

			// check if the user is a super admin
			const jwtPayload = c.get("jwtPayload");
			console.log("paylosd", jwtPayload);
			if (jwtPayload.role !== userTypes.SUPER_ADMIN) {
				return c.json({ error: "Unauthorized" });
			}

			const response = await db.insert(user).values({
				name: body.name,
				email: body.email,
				password: body.password,
				role: userTypes.ADMIN,
			});

			return c.json({ data: "admin created successfully" });
		} catch (e) {
			console.error(e);
			return c.json({ error: "An error occurred" });
		}
	}
);
