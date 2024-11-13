import { vValidator } from "@hono/valibot-validator";
import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { jwt } from "hono/jwt";
import {
  ratingDbSchema,
  ratingSchema,
  updateRatingSchema,
} from "../../schema/rating";
import { userTypes } from "../../utils/constants";
import { db } from "../../utils/db";

export const rating = new Hono()
  .use(
    jwt({
      secret: process.env.JWT_SECRET!,
    })
  )

  // create rating
  .post("/rating.create", vValidator("json", ratingSchema), async (c) => {
    const user = c.get("jwtPayload");
    const body = c.req.valid("json");
    console.log(body);

    // check if user is super admin
    if (user.role !== userTypes.USER) {
      return c.json({ error: "Unauthorized" });
    }

    const response = await db.insert(ratingDbSchema).values(body).returning();
    console.log(response);

    if (response.length === 0) {
      return c.json({ error: "Rating not created" });
    }

    return c.json({ data: response[0] });
  })

  // update rating
  .put("/rating.update", vValidator("json", updateRatingSchema), async (c) => {
    const user = c.get("jwtPayload");
    const body = c.req.valid("json");
    console.log(body);

    // check if user is super admin
    if (user.role !== userTypes.USER) {
      return c.json({ error: "Unauthorized" });
    }

    const response = await db
      .update(ratingDbSchema)
      .set(body)
      .where(eq(ratingDbSchema.id, body.id))
      .returning();
    console.log(response);

    if (response.length === 0) {
      return c.json({ error: "Rating not updated" });
    }

    return c.json({ data: response[0] });
  })

  // delete rating
  .delete(
    "/rating.delete",
    vValidator("json", updateRatingSchema),
    async (c) => {
      const user = c.get("jwtPayload");
      const body = c.req.valid("json");
      console.log(body);

      // check if user is super admin
      if (user.role !== userTypes.USER) {
        return c.json({ error: "Unauthorized" });
      }

      const response = await db
        .delete(ratingDbSchema)
        .where(eq(ratingDbSchema.id, body.id))
        .returning();
      console.log(response);

      if (response.length === 0) {
        return c.json({ error: "Rating not deleted" });
      }

      return c.json({ data: response[0] });
    }
  )

  // get all ratings by car id
  .get("/rating.get/:id", async (c) => {
    const id = c.req.param("id");
    console.log(id);

    const response = await db
      .select()
      .from(ratingDbSchema)
      .where(eq(ratingDbSchema.car, id));
    console.log(response);

    return c.json({ data: response });
  })

  // get all ratings by user id
  .get("/rating.getByUserId/:id", async (c) => {
    const id = c.req.param("id");
    console.log(id);

    const response = await db
      .select()
      .from(ratingDbSchema)
      .where(eq(ratingDbSchema.user, id));
    console.log(response);

    return c.json({ data: response });
  });
