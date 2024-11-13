import { vValidator } from "@hono/valibot-validator";
import { and, eq, isNull } from "drizzle-orm";
import { Hono } from "hono";
import { jwt } from "hono/jwt";
import {
  carDbSchema,
  carJourneyDbSchema,
  endCarJourneySchema,
  startCarJourneySchema,
  updateCarJourneySchema,
} from "../../schema/car";
import { userDbSchema } from "../../schema/user";
import { userTypes } from "../../utils/constants";
import { db } from "../../utils/db";

export const carJourney = new Hono()
  .use(
    jwt({
      secret: process.env.JWT_SECRET!,
    })
  )

  /**
   * car.journey.list
   * car.journey.list.by.car/:carId
   * car.journey.list.by.branch/:branchId
   * car.journey.list.by.user/:userId
   * car.journey.start
   * car.journey.end
   * car.journey.update
   * car.journey.delete/:carJourneyId
   */

  // start car journey
  .post(
    "/car.journey.start",
    vValidator("json", startCarJourneySchema),
    async (c) => {
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
        .where(eq(userDbSchema.id, user.id));

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

      // check if the car is already in a journey
      const carJourneyResponse = await db
        .select()
        .from(carJourneyDbSchema)
        .where(
          and(
            eq(carJourneyDbSchema.car, body.car),
            isNull(carJourneyDbSchema.endTime)
          )
        );

      console.log("carJourneyResponse", carJourneyResponse);
      if (carJourneyResponse.length > 0) {
        return c.json({ error: "Car already in a journey" });
      }

      // start car journey
      const carJourneyStartResponse = await db
        .insert(carJourneyDbSchema)
        .values({
          car: body.car,
          user: user.id,
          startTime: new Date(body.startTime),
        });

      console.log("carJourneyStartResponse", carJourneyStartResponse);
      return c.json({ message: "Car journey started" });
    }
  )

  // end car journey
  .post(
    "/car.journey.end",
    vValidator("json", endCarJourneySchema),
    async (c) => {
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
        .where(eq(userDbSchema.id, user.id));

      console.log("userResponse", userResponse);
      if (userResponse.length === 0) {
        return c.json({ error: "User not found" });
      }

      // check if the car is in a journey
      const carJourneyResponse = await db
        .select()
        .from(carJourneyDbSchema)
        .where(
          and(
            eq(carJourneyDbSchema.id, body.id),
            isNull(carJourneyDbSchema.endTime)
          )
        );

      console.log("carJourneyResponse", carJourneyResponse);
      if (carJourneyResponse.length === 0) {
        return c.json({ error: "Car not in a journey" });
      }

      // end car journey
      const carJourneyEndResponse = await db
        .update(carJourneyDbSchema)
        .set({
          endTime: new Date(body.endTime),
          finalPrice: "100",
        })
        .where(
          and(
            eq(carJourneyDbSchema.id, body.id),
            isNull(carJourneyDbSchema.endTime)
          )
        );

      console.log("carJourneyEndResponse", carJourneyEndResponse);
      return c.json({ message: "Car journey ended" });
    }
  )

  // list car journey by car
  .get("/car.journey.list.by.car/:carId", async (c) => {
    const carId = c.req.param("carId");
    console.log(carId);

    const carJourneyResponse = await db
      .select()
      .from(carJourneyDbSchema)
      .where(eq(carJourneyDbSchema.car, carId));

    console.log("carJourneyResponse", carJourneyResponse);
    return c.json({ carJourneyResponse });
  })

  // list car journey by branch
  .get("/car.journey.list.by.branch/:branchId", async (c) => {
    const branchId = c.req.param("branchId");
    console.log(branchId);

    const carJourneyResponse = await db
      .select()
      .from(carJourneyDbSchema)
      .where(eq(carJourneyDbSchema.car, branchId));

    console.log("carJourneyResponse", carJourneyResponse);
    return c.json({ carJourneyResponse });
  })

  // list car journey by user
  .get("/car.journey.list.by.user/:userId", async (c) => {
    const userId = c.req.param("userId");
    console.log(userId);

    const carJourneyResponse = await db
      .select()
      .from(carJourneyDbSchema)
      .where(eq(carJourneyDbSchema.user, userId));

    console.log("carJourneyResponse", carJourneyResponse);
    return c.json({ carJourneyResponse });
  })

  // update car journey
  .put(
    "/car.journey.update",
    vValidator("json", updateCarJourneySchema),
    async (c) => {
      const user = c.get("jwtPayload");
      const body = c.req.valid("json");
      console.log(body);

      // check if user is admin
      if (user.role !== userTypes.ADMIN) {
        return c.json({ error: "Unauthorized" });
      }

      // check if the user with id exists or not
      const userResponse = await db
        .select()
        .from(userDbSchema)
        .where(eq(userDbSchema.id, body.user));

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

      // check if the car is in a journey
      const carJourneyResponse = await db
        .select()
        .from(carJourneyDbSchema)
        .where(eq(carJourneyDbSchema.id, body.id));

      console.log("carJourneyResponse", carJourneyResponse);
      if (carJourneyResponse.length === 0) {
        return c.json({ error: "Car journey not found" });
      }

      // update car journey
      const carJourneyUpdateResponse = await db
        .update(carJourneyDbSchema)
        .set({
          car: body.car,
          user: body.user,
          startTime: body.startTime
            ? new Date(body.startTime)
            : carJourneyResponse[0].startTime,
          endTime: body.endTime
            ? new Date(body.endTime)
            : carJourneyResponse[0].endTime,
          finalPrice: body.finalPrice ?? carJourneyResponse[0].finalPrice,
        })
        .where(eq(carJourneyDbSchema.id, body.id));

      console.log("carJourneyUpdateResponse", carJourneyUpdateResponse);
      return c.json({ message: "Car journey updated" });
    }
  )

  // delete car journey
  .delete("/car.journey.delete/:carJourneyId", async (c) => {
    const user = c.get("jwtPayload");
    const carJourneyId = c.req.param("carJourneyId");
    console.log(carJourneyId);

    // check if user is admin
    if (user.role !== userTypes.ADMIN) {
      return c.json({ error: "Unauthorized" });
    }

    // check if the car journey with id exists or not
    const carJourneyResponse = await db
      .select()
      .from(carJourneyDbSchema)
      .where(eq(carJourneyDbSchema.id, carJourneyId));

    console.log("carJourneyResponse", carJourneyResponse);
    if (carJourneyResponse.length === 0) {
      return c.json({ error: "Car journey not found" });
    }

    // delete car journey
    const carJourneyDeleteResponse = await db
      .delete(carJourneyDbSchema)
      .where(eq(carJourneyDbSchema.id, carJourneyId));

    console.log("carJourneyDeleteResponse", carJourneyDeleteResponse);
    return c.json({ message: "Car journey deleted" });
  });
