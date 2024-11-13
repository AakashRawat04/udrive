import { vValidator } from "@hono/valibot-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { jwt } from "hono/jwt";
import { branchDbSchema } from "../../schema/branch";
import {
  assignCarSchema,
  carDbSchema,
  carSchema,
  updateCarSchema,
} from "../../schema/car";
import { userTypes } from "../../utils/constants";
import { db } from "../../utils/db";

export const car = new Hono()
  .use(
    jwt({
      secret: process.env.JWT_SECRET!,
    })
  )

  // create car (super admin only)
  .post("/car.create", vValidator("json", carSchema), async (c) => {
    const user = c.get("jwtPayload");
    const body = c.req.valid("json");
    console.log(body);

    // check if user is super admin
    if (user.role !== userTypes.SUPER_ADMIN) {
      return c.json({ error: "Unauthorized" });
    }

    //fetch if branch with id exists or not
    const branchResponse = await db
      .select()
      .from(branchDbSchema)
      .where(eq(branchDbSchema.id, body.branch));

    console.log("branchResponse", branchResponse);

    if (branchResponse.length === 0) {
      return c.json({ error: "Branch not found" });
    }

    const response = await db.insert(carDbSchema).values(body).returning();
    console.log(response);

    if (response.length === 0) {
      return c.json({ error: "Car not created" });
    }

    return c.json({ data: response[0] });
  })

  // update car (super admin only)
  .put("/car.update", vValidator("json", updateCarSchema), async (c) => {
    const user = c.get("jwtPayload");
    const body = c.req.valid("json");
    console.log(body);

    // check if user is super admin
    if (user.role !== userTypes.SUPER_ADMIN) {
      return c.json({ error: "Unauthorized" });
    }

    //fetch if branch with id exists or not
    const branchResponse = await db
      .select()
      .from(branchDbSchema)
      .where(eq(branchDbSchema.id, body.branch));

    console.log("branchResponse", branchResponse);

    if (branchResponse.length === 0) {
      return c.json({ error: "Branch not found" });
    }

    const response = await db
      .update(carDbSchema)
      .set(body)
      .where(eq(carDbSchema.id, body.id))
      .returning();
    console.log(response);

    if (response.length === 0) {
      return c.json({ error: "Car not updated" });
    }

    return c.json({ data: response[0] });
  })

  // assign car to branch (super admin only)
  .post("/car.assign", vValidator("json", assignCarSchema), async (c) => {
    const user = c.get("jwtPayload");
    const body = c.req.valid("json");
    console.log(body);

    // check if user is super admin
    if (user.role !== userTypes.SUPER_ADMIN) {
      return c.json({ error: "Unauthorized" });
    }

    //fetch if car with id exists or not
    const carResponse = await db
      .select()
      .from(carDbSchema)
      .where(eq(carDbSchema.id, body.carId));

    console.log("carResponse", carResponse);

    if (carResponse.length === 0) {
      return c.json({ error: "Car not found" });
    }

    //fetch if branch with id exists or not
    const branchResponse = await db
      .select()
      .from(branchDbSchema)
      .where(eq(branchDbSchema.id, body.branchId));

    console.log("branchResponse", branchResponse);

    if (branchResponse.length === 0) {
      return c.json({ error: "Branch not found" });
    }

    const response = await db
      .update(carDbSchema)
      .set({ branch: body.branchId })
      .where(eq(carDbSchema.id, body.carId))
      .returning();
    console.log(response);

    if (response.length === 0) {
      return c.json({ error: "Car not assigned" });
    }

    return c.json({ data: response[0] });
  })

  // get car by id
  .get("/car.getById/:id", async (c) => {
    const id = c.req.param("id");
    const car = await db
      .select()
      .from(carDbSchema)
      .where(eq(carDbSchema.id, id));
    return c.json({ data: car });
  })

  // get all cars
  .get("/car.getAll", async (c) => {
    const cars = await db.select().from(carDbSchema);
    return c.json({ data: cars });
  })

  // get all cars by branch id
  .get("/car.getByBranchId/:id", async (c) => {
    const id = c.req.param("id");
    const cars = await db
      .select()
      .from(carDbSchema)
      .where(eq(carDbSchema.branch, id));
    return c.json({ data: cars });
  })

  // delete car (super admin only)
  .delete("/car.delete/:id", async (c) => {
    const user = c.get("jwtPayload");
    const id = c.req.param("id");
    console.log(id);

    // check if user is super admin
    if (user.role !== userTypes.SUPER_ADMIN) {
      return c.json({ error: "Unauthorized" });
    }

    const response = await db
      .delete(carDbSchema)
      .where(eq(carDbSchema.id, id))
      .returning();
    console.log(response);

    if (response.length === 0) {
      return c.json({ error: "Car not deleted" });
    }

    return c.json({ data: `deleted car with id ${id}` });
  });
