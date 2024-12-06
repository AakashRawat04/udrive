import { vValidator } from "@hono/valibot-validator";
import { and, eq, gte, lte, or } from "drizzle-orm";
import { Hono } from "hono";
import { jwt } from "hono/jwt";
import { branchDbSchema } from "../../schema/branch";
import {
	carDbSchema,
	carRequestDbSchema,
	carRequestSchema,
	updateCarRequestSchema,
} from "../../schema/car";
import { userDbSchema } from "../../schema/user";
import { carRequestStatus, userTypes } from "../../utils/constants";
import { db } from "../../utils/db";

export const carRequest = new Hono()
	.use(
		jwt({
			secret: process.env.JWT_SECRET!,
		})
	)

	/**
	 * user
	 * car.request
	 *
	 * car.request.list.by.branch/:branchId/:status
	 * car.request.list/:carId/:status
	 *
	 * admin
	 * car.request.update (approve/reject)
	 * car.request.delete/:carRequestId
	 */

	// create car request
	.post("/car.request", vValidator("json", carRequestSchema), async (c) => {
		const user = c.get("jwtPayload");
		const body = c.req.valid("json");
		console.log(body);

		// check if user is user
		if (user.role !== userTypes.USER) {
			return c.json({ error: "Unauthorized" });
		}

		// check if the user with id exists or not
		const userResponse = await db
			.select()
			.from(userDbSchema)
			.where(eq(userDbSchema.email, user.email));

		console.log("userResponse", userResponse);
		if (userResponse.length === 0) {
			return c.json({ error: "User not found" });
		}

		//fetch if car with id exists or not
		const carResponse = await db
			.select()
			.from(carDbSchema)
			.where(eq(carDbSchema.id, body.car));

		console.log("carResponse", carResponse);

		if (carResponse.length === 0) {
			return c.json({ error: "Car not found" });
		}

		//fetch if branch with id exists or not
		const branchResponse = await db
			.select()
			.from(branchDbSchema)
			.where(eq(branchDbSchema.id, carResponse[0].branch));

		console.log("branchResponse", branchResponse);

		if (branchResponse.length === 0) {
			return c.json({ error: "Branch not found" });
		}

		// Check for overlapping approved bookings
		const overlappingRequests = await db
			.select()
			.from(carRequestDbSchema)
			.where(
				and(
					eq(carRequestDbSchema.car, body.car),
					eq(carRequestDbSchema.status, carRequestStatus.APPROVED),
					or(
						and(
							gte(carRequestDbSchema.from, new Date(body.from)),
							lte(carRequestDbSchema.from, new Date(body.to))
						),
						and(
							gte(carRequestDbSchema.to, new Date(body.from)),
							lte(carRequestDbSchema.to, new Date(body.to))
						)
					)
				)
			);

		if (overlappingRequests.length > 0) {
			return c.json({
				error: "Car is already booked in the specified time frame",
			});
		}

		// check if the car is already booked by the user
		const userCarRequests = await db
			.select()
			.from(carRequestDbSchema)
			.where(
				and(
					eq(carRequestDbSchema.car, body.car),
					eq(carRequestDbSchema.user, userResponse[0].id),
					or(
						and(
							eq(carRequestDbSchema.from, new Date(body.from)),
							eq(carRequestDbSchema.to, new Date(body.to))
						),
						eq(carRequestDbSchema.status, carRequestStatus.APPROVED)
					)
				)
			);

		if (userCarRequests.length > 0) {
			return c.json({
				error: "Car is already booked by the user in the specified time frame",
			});
		}

		// create car request
		const carRequestBody = {
			...body,
			user: userResponse[0].id,
			branch: branchResponse[0].id,
			from: new Date(body.from),
			to: new Date(body.to),
			status: carRequestStatus.PENDING,
		};

		const response = await db
			.insert(carRequestDbSchema)
			.values(carRequestBody)
			.returning();
		console.log(response);

		if (response.length === 0) {
			return c.json({ error: "Car request not created" });
		}

		return c.json({ data: response[0] });
	})

	// list all car requests
	.get("/car.request.list", async (c) => {
		const user = c.get("jwtPayload");
		console.log(user);

		// check if user is admin
		if (user.role !== userTypes.SUPER_ADMIN && user.role !== userTypes.ADMIN) {
			return c.json({ error: "Unauthorized" });
		}

		// fetch all car requests with either pending, or rejected status
		const response = await db
			.select()
			.from(carRequestDbSchema)
			.where(eq(carRequestDbSchema.status, carRequestStatus.PENDING))
			.leftJoin(userDbSchema, eq(carRequestDbSchema.user, userDbSchema.id))
			.leftJoin(carDbSchema, eq(carRequestDbSchema.car, carDbSchema.id));

		console.log(response);

		return c.json({ data: response });
	})

	// list all car requests by user id
	.get("/car.request.listByUser", async (c) => {
		const user = c.get("jwtPayload");
		console.log(user);

		// check if user is user
		if (user.role !== userTypes.USER) {
			return c.json({ error: "Unauthorized" });
		}

		// check if the user with id exists or not
		const userResponse = await db
			.select()
			.from(userDbSchema)
			.where(eq(userDbSchema.email, user.email));

		console.log("userResponse", userResponse);
		if (userResponse.length === 0) {
			return c.json({ error: "User not found" });
		}

		// fetch car requests by user
		const response = await db
			.select()
			.from(carRequestDbSchema)
			.where(eq(carRequestDbSchema.user, userResponse[0].id))
			.leftJoin(carDbSchema, eq(carRequestDbSchema.car, carDbSchema.id))
			.leftJoin(
				branchDbSchema,
				eq(carRequestDbSchema.branch, branchDbSchema.id)
			);

		console.log(response);

		return c.json({ data: response });
	})

	// list car requests by branch
	.get("/car.request.list.by.branch/:branchId/:status", async (c) => {
		const user = c.get("jwtPayload");
		const branchId = c.req.param("branchId");
		const status = c.req.param("status");
		console.log(branchId, status);

		// check if user is admin
		if (user.role !== userTypes.ADMIN) {
			return c.json({ error: "Unauthorized" });
		}

		//fetch if branch with id exists or not
		const branchResponse = await db
			.select()
			.from(branchDbSchema)
			.where(eq(branchDbSchema.id, branchId));

		console.log("branchResponse", branchResponse);

		if (branchResponse.length === 0) {
			return c.json({ error: "Branch not found" });
		}

		// fetch car requests by branch
		const response = await db
			.select()
			.from(carRequestDbSchema)
			.where(
				and(
					eq(carRequestDbSchema.branch, branchId),
					eq(carRequestDbSchema.status, status)
				)
			);

		console.log(response);

		return c.json({ data: response });
	})

	// list car requests by car
	.get("/car.request.list/:carId/:status", async (c) => {
		const user = c.get("jwtPayload");
		const carId = c.req.param("carId");
		const status = c.req.param("status");
		console.log(carId, status);

		// check if user is admin
		if (user.role !== userTypes.ADMIN) {
			return c.json({ error: "Unauthorized" });
		}

		//fetch if car with id exists or not
		const carResponse = await db
			.select()
			.from(carDbSchema)
			.where(eq(carDbSchema.id, carId));

		console.log("carResponse", carResponse);

		if (carResponse.length === 0) {
			return c.json({ error: "Car not found" });
		}

		// fetch car requests by car
		const response = await db
			.select()
			.from(carRequestDbSchema)
			.where(
				and(
					eq(carRequestDbSchema.car, carId),
					eq(carRequestDbSchema.status, status)
				)
			);

		console.log(response);

		return c.json({ data: response });
	})

	// update car request
	.post(
		"/car.request.update",
		vValidator("json", updateCarRequestSchema),
		async (c) => {
			const user = c.get("jwtPayload");
			const body = c.req.valid("json");
			console.log(body);

			// check if user is admin
			if (
				user.role !== userTypes.ADMIN &&
				user.role !== userTypes.SUPER_ADMIN
			) {
				return c.json({ error: "Unauthorized" });
			}

			//fetch if car request with id exists or not
			const carRequestResponse = await db
				.select()
				.from(carRequestDbSchema)
				.where(eq(carRequestDbSchema.id, body.id));

			console.log("carRequestResponse", carRequestResponse);

			if (carRequestResponse.length === 0) {
				return c.json({ error: "Car request not found" });
			}

			// update car request
			const response = await db
				.update(carRequestDbSchema)
				.set({ status: body.status })
				.where(eq(carRequestDbSchema.id, body.id))
				.returning();
			console.log(response);

			if (response.length === 0) {
				return c.json({ error: "Car request not updated" });
			}

			// If the request is approved, reject other pending requests for the same car
			// if (body.status === carRequestStatus.APPROVED) {
			// 	await db
			// 		.update(carRequestDbSchema)
			// 		.set({ status: carRequestStatus.REJECTED })
			// 		.where(
			// 			and(
			// 				eq(carRequestDbSchema.car, carRequestResponse[0].car),
			// 				eq(carRequestDbSchema.status, carRequestStatus.PENDING)
			// 			)
			// 		);
			// }

			return c.json({ data: response[0] });
		}
	)

	// delete car request
	.post("/car.request.delete/:carRequestId", async (c) => {
		const user = c.get("jwtPayload");
		const carRequestId = c.req.param("carRequestId");
		console.log(carRequestId);

		// check if user is admin
		if (user.role !== userTypes.ADMIN) {
			return c.json({ error: "Unauthorized" });
		}

		//fetch if car request with id exists or not
		const carRequestResponse = await db
			.select()
			.from(carRequestDbSchema)
			.where(eq(carRequestDbSchema.id, carRequestId));

		console.log("carRequestResponse", carRequestResponse);

		if (carRequestResponse.length === 0) {
			return c.json({ error: "Car request not found" });
		}

		// delete car request
		const response = await db
			.delete(carRequestDbSchema)
			.where(eq(carRequestDbSchema.id, carRequestId))
			.returning();
		console.log(response);

		if (response.length === 0) {
			return c.json({ error: "Car request not deleted" });
		}

		return c.json({ data: response[0] });
	});
