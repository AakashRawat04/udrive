import { vValidator } from "@hono/valibot-validator";
import { and, desc, eq, inArray, isNull, or } from "drizzle-orm";
import { Hono } from "hono";
import { jwt } from "hono/jwt";
import { branchDbSchema } from "../../schema/branch";
import {
  carDbSchema,
  carRequestDbSchema,
  endCarJourneySchema,
  startCarJourneySchema,
  updateCarJourneySchema,
} from "../../schema/car";
import { userDbSchema } from "../../schema/user";
import { carRequestStatus, userTypes } from "../../utils/constants";
import { db } from "../../utils/db";

export const carJourney = new Hono()
  .use(
    jwt({
      secret: process.env.JWT_SECRET!,
    }),
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

      // check if user is user
      if (user.role == userTypes.USER) {
        return c.json({ error: "Unauthorized" });
      }

      // check if the user with id exists or not
      const userResponse = await db
        .select()
        .from(userDbSchema)
        .where(eq(userDbSchema.id, user.id));

      if (userResponse.length === 0) {
        return c.json({ error: "User not found" });
      }

      const carRequestResponse = await db
        .select()
        .from(carRequestDbSchema)
        .where(eq(carRequestDbSchema.id, body.carRequestId));

      if (carRequestResponse.length === 0) {
        return c.json({ error: "Car request not found" });
      }

      //fetch if car with id exists or not
      const carResponse = await db
        .select()
        .from(carDbSchema)
        .where(eq(carDbSchema.id, carRequestResponse[0].car));

      if (carResponse.length === 0) {
        return c.json({ error: "Car not found" });
      }

      // check if the car is already in a journey
      const carJourneyResponse = await db
        .select()
        .from(carRequestDbSchema)
        .where(
          and(
            eq(carRequestDbSchema.car, carRequestResponse[0].car),
            eq(carRequestDbSchema.status, carRequestStatus.STARTED),
          ),
        );

      if (carJourneyResponse.length > 0) {
        return c.json({ error: "Car already in a journey" });
      }

      // start car journey

      const carRequestUpdateResponse = await db
        .update(carRequestDbSchema)
        .set({
          status: carRequestStatus.STARTED,
          startTime: new Date(),
        })
        .where(and(eq(carRequestDbSchema.id, body.carRequestId)));

      return c.json({ data: "Car journey started" });
    },
  )

  // end car journey
  .post(
    "/car.journey.end",
    vValidator("json", endCarJourneySchema),
    async (c) => {
      const user = c.get("jwtPayload");
      const body = c.req.valid("json");

      // check if user is user
      if (user.role == userTypes.USER) {
        return c.json({ error: "Unauthorized" });
      }

      // check if the user with id exists or not
      const userResponse = await db
        .select()
        .from(userDbSchema)
        .where(eq(userDbSchema.id, user.id));

      if (userResponse.length === 0) {
        return c.json({ error: "User not found" });
      }

      // check if the car is in a journey
      const carJourneyResponse = await db
        .select()
        .from(carRequestDbSchema)
        .where(
          and(
            eq(carRequestDbSchema.id, body.carRequestId),
            isNull(carRequestDbSchema.endTime),
          ),
        );

      if (carJourneyResponse.length === 0) {
        return c.json({ error: "Car not in a journey" });
      }

      // end car journey
      const carJourneyEndResponse = await db
        .update(carRequestDbSchema)
        .set({
          endTime: new Date(),
          bill: body.bill.toString(),
          status: carRequestStatus.COMPLETED,
        })
        .where(
          and(
            eq(carRequestDbSchema.id, body.carRequestId),
            isNull(carRequestDbSchema.endTime),
          ),
        );

      return c.json({ data: "Car journey ended" });
    },
  )

  // cancel car journey
  .post(
    "/car.journey.cancel",
    vValidator("json", endCarJourneySchema),
    async (c) => {
      const user = c.get("jwtPayload");
      const body = c.req.valid("json");

      // check if user is user
      if (user.role !== userTypes.USER) {
        return c.json({ error: "Unauthorized" });
      }

      // check if the user with id exists or not
      const userResponse = await db
        .select()
        .from(userDbSchema)
        .where(eq(userDbSchema.id, user.id));

      if (userResponse.length === 0) {
        return c.json({ error: "User not found" });
      }

      // check if the car is in a journey
      const carJourneyResponse = await db
        .select()
        .from(carRequestDbSchema)
        .where(
          and(
            eq(carRequestDbSchema.id, body.carRequestId),
            isNull(carRequestDbSchema.endTime),
          ),
        );

      if (carJourneyResponse.length === 0) {
        return c.json({ error: "Car not in a journey" });
      }

      // cancel car journey
      const carJourneyCancelResponse = await db
        .update(carRequestDbSchema)
        .set({
          status: carRequestStatus.CANCELLED,
        })
        .where(
          and(
            eq(carRequestDbSchema.id, body.carRequestId),
            isNull(carRequestDbSchema.endTime),
          ),
        );

      return c.json({ data: "Car journey cancelled" });
    },
  )

  // list car journey by car
  .get("/car.journey.list.by.car/:carId", async (c) => {
    const carId = c.req.param("carId");

    const carJourneyResponse = await db
      .select()
      .from(carRequestDbSchema)
      .where(eq(carRequestDbSchema.car, carId));

    return c.json({ carJourneyResponse });
  })

  // list car journey by branch
  .get("/car.journey.list.by.branch/:branchId", async (c) => {
    const branchId = c.req.param("branchId");

    const carJourneyResponse = await db
      .select()
      .from(carRequestDbSchema)
      .where(eq(carRequestDbSchema.car, branchId));

    return c.json({ carJourneyResponse });
  })

  // list car journey by user
  .get("/car.journey.list.by.user/:userId", async (c) => {
    const userId = c.req.param("userId");

    const carJourneyResponse = await db
      .select()
      .from(carRequestDbSchema)
      .where(eq(carRequestDbSchema.user, userId));

    return c.json({ carJourneyResponse });
  })

  // update car journey
  .put(
    "/car.journey.update",
    vValidator("json", updateCarJourneySchema),
    async (c) => {
      const user = c.get("jwtPayload");
      const body = c.req.valid("json");

      // check if user is admin
      if (user.role !== userTypes.ADMIN) {
        return c.json({ error: "Unauthorized" });
      }

      // check if the user with id exists or not
      const userResponse = await db
        .select()
        .from(userDbSchema)
        .where(eq(userDbSchema.id, body.user));

      if (userResponse.length === 0) {
        return c.json({ error: "User not found" });
      }

      //fetch if car with id exists or not
      const carResponse = await db
        .select()
        .from(carDbSchema)
        .where(eq(carDbSchema.id, body.car));

      if (carResponse.length === 0) {
        return c.json({ error: "Car not found" });
      }

      // check if the car is in a journey
      const carJourneyResponse = await db
        .select()
        .from(carRequestDbSchema)
        .where(eq(carRequestDbSchema.id, body.id));

      if (carJourneyResponse.length === 0) {
        return c.json({ error: "Car journey not found" });
      }

      // update car journey
      const carJourneyUpdateResponse = await db
        .update(carRequestDbSchema)
        .set({
          car: body.car,
          user: body.user,
          startTime: body.startTime
            ? new Date(body.startTime)
            : carJourneyResponse[0].startTime,
          endTime: body.endTime
            ? new Date(body.endTime)
            : carJourneyResponse[0].endTime,
          bill: body.finalPrice ?? carJourneyResponse[0].bill,
        })
        .where(eq(carRequestDbSchema.id, body.id));

      return c.json({ data: "Car journey updated" });
    },
  )

  // delete car journey
  .delete("/car.journey.delete/:carJourneyId", async (c) => {
    const user = c.get("jwtPayload");
    const carJourneyId = c.req.param("carJourneyId");

    // check if user is admin
    if (user.role !== userTypes.ADMIN) {
      return c.json({ error: "Unauthorized" });
    }

    // check if the car journey with id exists or not
    const carJourneyResponse = await db
      .select()
      .from(carRequestDbSchema)
      .where(eq(carRequestDbSchema.id, carJourneyId));

    if (carJourneyResponse.length === 0) {
      return c.json({ error: "Car journey not found" });
    }

    // delete car journey
    const carJourneyDeleteResponse = await db
      .delete(carRequestDbSchema)
      .where(eq(carRequestDbSchema.id, carJourneyId));

    return c.json({ data: "Car journey deleted" });
  })

  // upcomming car journey from car request table
  .get("/car.booking.upcomming", async (c) => {
    const user = c.get("jwtPayload");

    // check if user is not admin or super admin
    if (user.role !== userTypes.ADMIN && user.role !== userTypes.SUPER_ADMIN) {
      return c.json({ error: "Unauthorized" });
    }

    // check if the user with id exists or not
    const userResponse = await db
      .select()
      .from(userDbSchema)
      .where(eq(userDbSchema.id, user.id));

    if (userResponse.length === 0) {
      return c.json({ error: "User not found" });
    }

    const userBranchs = await db
      .select()
      .from(branchDbSchema)
      .where(eq(branchDbSchema.admin, userResponse[0].id));

    const branchIds = userBranchs.map((branch) => branch.id);

    let response;
    if (user.role === userTypes.ADMIN) {
      // query upcoming bookings from the admin's branch
      response = await db
        .select()
        .from(carRequestDbSchema)
        .where(
          and(
            eq(carRequestDbSchema.status, carRequestStatus.APPROVED),
            inArray(carDbSchema.branch, branchIds),
          ),
        )
        .leftJoin(carDbSchema, eq(carRequestDbSchema.car, carDbSchema.id))
        .leftJoin(userDbSchema, eq(carRequestDbSchema.user, userDbSchema.id))
        .orderBy(carRequestDbSchema.from);
    } else {
      // super admin can see all upcoming bookings
      response = await db
        .select()
        .from(carRequestDbSchema)
        .where(eq(carRequestDbSchema.status, carRequestStatus.APPROVED))
        .leftJoin(carDbSchema, eq(carRequestDbSchema.car, carDbSchema.id))
        .leftJoin(userDbSchema, eq(carRequestDbSchema.user, userDbSchema.id))
        .orderBy(carRequestDbSchema.from);
    }

    return c.json({ data: response });
  })

  // ongoing car journey from car journey table
  .get("/car.booking.ongoing", async (c) => {
    const user = c.get("jwtPayload");

    // check if user is user
    if (user.role !== userTypes.ADMIN && user.role !== userTypes.SUPER_ADMIN) {
      return c.json({ error: "Unauthorized" });
    }

    // check if the user with id exists or not
    const userResponse = await db
      .select()
      .from(userDbSchema)
      .where(eq(userDbSchema.id, user.id));

    if (userResponse.length === 0) {
      return c.json({ error: "User not found" });
    }

    const userBranchs = await db
      .select()
      .from(branchDbSchema)
      .where(eq(branchDbSchema.admin, userResponse[0].id));

    const branchIds = userBranchs.map((branch) => branch.id);

    let response;
    if (user.role === userTypes.ADMIN) {
      // query all bookings from the admin's branch
      response = await db
        .select()
        .from(carRequestDbSchema)
        .where(
          and(
            eq(carRequestDbSchema.status, carRequestStatus.STARTED),
            inArray(carDbSchema.branch, branchIds),
          ),
        )
        .leftJoin(carDbSchema, eq(carRequestDbSchema.car, carDbSchema.id))
        .leftJoin(userDbSchema, eq(carRequestDbSchema.user, userDbSchema.id))
        .orderBy(carRequestDbSchema.to);
    } else {
      // query all ongoing bookings
      response = await db
        .select()
        .from(carRequestDbSchema)
        .where(eq(carRequestDbSchema.status, carRequestStatus.STARTED))
        .leftJoin(carDbSchema, eq(carRequestDbSchema.car, carDbSchema.id))
        .leftJoin(userDbSchema, eq(carRequestDbSchema.user, userDbSchema.id))
        .orderBy(carRequestDbSchema.to);
    }

    return c.json({ data: response });
  })

  .get("/car.booking.completed", async (c) => {
    const user = c.get("jwtPayload");

    // check if user is user
    if (user.role !== userTypes.ADMIN && user.role !== userTypes.SUPER_ADMIN) {
      return c.json({ error: "Unauthorized" });
    }

    // check if the user with id exists or not
    const userResponse = await db
      .select()
      .from(userDbSchema)
      .where(eq(userDbSchema.id, user.id));

    if (userResponse.length === 0) {
      return c.json({ error: "User not found" });
    }

    const userBranchs = await db
      .select()
      .from(branchDbSchema)
      .where(eq(branchDbSchema.admin, userResponse[0].id));

    const branchIds = userBranchs.map((branch) => branch.id);

    let response;
    if (user.role === userTypes.ADMIN) {
      // query all bookings from the admin's branch
      response = await db
        .select()
        .from(carRequestDbSchema)
        .where(
          and(
            eq(carRequestDbSchema.status, carRequestStatus.COMPLETED),
            inArray(carDbSchema.branch, branchIds),
          ),
        )
        .leftJoin(carDbSchema, eq(carRequestDbSchema.car, carDbSchema.id))
        .leftJoin(userDbSchema, eq(carRequestDbSchema.user, userDbSchema.id))
        .orderBy(desc(carRequestDbSchema.endTime));
    } else {
      // query all ongoing bookings
      response = await db
        .select()
        .from(carRequestDbSchema)
        .where(eq(carRequestDbSchema.status, carRequestStatus.COMPLETED))
        .leftJoin(carDbSchema, eq(carRequestDbSchema.car, carDbSchema.id))
        .leftJoin(userDbSchema, eq(carRequestDbSchema.user, userDbSchema.id))
        .orderBy(desc(carRequestDbSchema.endTime));
    }

    return c.json({ data: response });
  })

  .get("/car.booking.cancelled", async (c) => {
    const user = c.get("jwtPayload");

    // check if user is user
    if (user.role !== userTypes.ADMIN && user.role !== userTypes.SUPER_ADMIN) {
      return c.json({ error: "Unauthorized" });
    }

    // check if the user with id exists or not
    const userResponse = await db
      .select()
      .from(userDbSchema)
      .where(eq(userDbSchema.id, user.id));

    if (userResponse.length === 0) {
      return c.json({ error: "User not found" });
    }

    const userBranchs = await db
      .select()
      .from(branchDbSchema)
      .where(eq(branchDbSchema.admin, userResponse[0].id));

    const branchIds = userBranchs.map((branch) => branch.id);

    let response;
    if (user.role === userTypes.ADMIN) {
      // query all bookings from the admin's branch
      response = await db
        .select()
        .from(carRequestDbSchema)
        .where(
          and(
            or(
              eq(carRequestDbSchema.status, carRequestStatus.CANCELLED),
              eq(carRequestDbSchema.status, carRequestStatus.REJECTED),
            ),
            inArray(carDbSchema.branch, branchIds),
          ),
        )
        .leftJoin(carDbSchema, eq(carRequestDbSchema.car, carDbSchema.id))
        .leftJoin(userDbSchema, eq(carRequestDbSchema.user, userDbSchema.id))
        .orderBy(desc(carRequestDbSchema.updatedAt));
    } else {
      // query all ongoing bookings
      response = await db
        .select()
        .from(carRequestDbSchema)
        .where(
          or(
            eq(carRequestDbSchema.status, carRequestStatus.CANCELLED),
            eq(carRequestDbSchema.status, carRequestStatus.REJECTED),
          ),
        )
        .leftJoin(carDbSchema, eq(carRequestDbSchema.car, carDbSchema.id))
        .leftJoin(userDbSchema, eq(carRequestDbSchema.user, userDbSchema.id))
        .orderBy(desc(carRequestDbSchema.updatedAt));
    }

    return c.json({ data: response });
  });
