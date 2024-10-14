import { vValidator } from "@hono/valibot-validator";
import { and, eq, or } from "drizzle-orm";
import { Hono } from "hono";
import { jwt } from "hono/jwt";
import {
	assignBranchSchema,
	branchDbSchema,
	branchSchema,
	updateBranchSchema,
} from "../../schema/branch";
import { userTypes } from "../../utils/constants";
import { db } from "../../utils/db";

export const branch = new Hono().use(
	jwt({
		secret: process.env.JWT_SECRET!,
	})
);

// create branch (super admin only)
branch.post("/branch.create", vValidator("json", branchSchema), async (c) => {
	const user = c.get("jwtPayload");
	const body = c.req.valid("json");
	console.log(body);

	// check if user is super admin
	if (user.role !== userTypes.SUPER_ADMIN) {
		return c.json({ error: "Unauthorized" });
	}

	//fetch if user with id and role = superadmin or admin exists or not
	const userResponse = await db
		.select()
		.from(user)
		.where(
			and(
				eq(user.id, body.admin),
				or(eq(user.role, userTypes.SUPER_ADMIN), eq(user.role, userTypes.ADMIN))
			)
		);

	console.log("userResponse", userResponse);

	if (userResponse.length === 0) {
		return c.json({ error: "User not found" });
	}

	const response = await db.insert(branchDbSchema).values(body).returning();
	console.log(response);

	if (response.length === 0) {
		return c.json({ error: "Branch not created" });
	}

	return c.json({ data: response[0] });
});

// update branch
branch.put(
	"/branch.update",
	vValidator("json", updateBranchSchema),
	async (c) => {
		const user = c.get("jwtPayload");
		const body = c.req.valid("json");
		console.log(body);

		// check if user is super admin
		if (user.role !== userTypes.SUPER_ADMIN) {
			return c.json({ error: "Unauthorized" });
		}

		const response = await db
			.update(branchDbSchema)
			.set(body)
			.where(eq(branchDbSchema.id, body.id))
			.returning();
		console.log(response);

		if (response.length === 0) {
			return c.json({ error: "Branch not updated" });
		}

		return c.json({ data: response[0] });
	}
);

// delete branch (super admin only) (delete by id)
branch.delete("/branch.delete/:id", async (c) => {
	const user = c.get("jwtPayload");
	const id = c.req.param("id");
	console.log(id);

	// check if user is super admin
	if (user.role !== userTypes.SUPER_ADMIN) {
		return c.json({ error: "Unauthorized" });
	}

	const response = await db
		.delete(branchDbSchema)
		.where(eq(branchDbSchema.id, id))
		.returning();
	console.log(response);

	if (response.length === 0) {
		return c.json({ error: "Branch not deleted" });
	}

	return c.json({ data: `deleted branch with id ${id}` });
});

// get all branches
branch.get("/branch.getAll", async (c) => {
	const branches = await db.select().from(branchDbSchema);
	return c.json({ data: branches });
});

// get branch by id
branch.get("/branch.getById/:id", async (c) => {
	const id = c.req.param("id");
	const branch = await db
		.select()
		.from(branchDbSchema)
		.where(eq(branchDbSchema.id, id));
	return c.json({ data: branch });
});

// assign branch to admin (super admin only) (assignee id and branch id in body)
branch.put(
	"/branch.assign",
	vValidator("json", assignBranchSchema),
	async (c) => {
		const user = c.get("jwtPayload");
		const body = c.req.valid("json");
		console.log(body);

		// check if user is super admin
		if (user.role !== userTypes.SUPER_ADMIN) {
			return c.json({ error: "Unauthorized" });
		}

		//fetch if user with id and role = superadmin or admin exists or not
		const userResponse = await db
			.select()
			.from(user)
			.where(
				and(
					eq(user.id, body.userId),
					or(
						eq(user.role, userTypes.SUPER_ADMIN),
						eq(user.role, userTypes.ADMIN)
					)
				)
			);

		console.log("userResponse", userResponse);

		if (userResponse.length === 0) {
			return c.json({ error: "User not found" });
		}

		const response = await db
			.update(branchDbSchema)
			.set({ admin: body.userId })
			.where(eq(branchDbSchema.id, body.branchId))
			.returning();
		console.log(response);

		if (response.length === 0) {
			return c.json({ error: "Branch not assigned" });
		}

		return c.json({ data: response[0] });
	}
);
