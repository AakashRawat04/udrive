import { vValidator } from "@hono/valibot-validator";
import { and, eq } from "drizzle-orm";
import { Hono } from "hono";
import { jwt, sign } from "hono/jwt";
import postgres from "postgres";
import {
	editAdminSchema,
	loginSchema,
	registerSchema,
	getOtpSchema,
} from "../../schema/auth";
import { insertUserSchema, userDbSchema } from "../../schema/user";
import { userStatus, userTypes } from "../../utils/constants";
import { db } from "../../utils/db";
import { SendEmailCommand, SESClient } from "@aws-sdk/client-ses";
import crypto from "crypto";

const sesClient = new SESClient({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

function generateOtp(digits: number): number {
  const max = Math.pow(10, digits);
  const min = Math.pow(10, digits - 1);
  return crypto.randomInt(min, max);
}

export const auth = new Hono()

  .post("/login", vValidator("json", loginSchema), async (c) => {
    const body = c.req.valid("json");

    const response = await db
      .select()
      .from(userDbSchema)
      .where(
        and(
          eq(userDbSchema.email, body.email),
          eq(userDbSchema.status, userStatus.VERIFIED)
        )
      );

    console.log(response);
    if (response.length === 0) {
      return c.json({ error: "User not found", data: null });
    }

    const userResponse = response[0];

    if (userResponse.password !== body.password) {
      return c.json({ error: "Invalid password", data: null });
    }

    const token = await sign(
      {
        id: userResponse.id,
        email: body.email,
        role: userResponse.role,
        exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, // 30 days
      },
      process.env.JWT_SECRET!
    );

    return c.json({ data: token, error: null });
  })

  .post("/register", vValidator("json", registerSchema), async (c) => {
    try {
      const body = c.req.valid("json");

      const user = await db
        .select()
        .from(userDbSchema)
        .where(eq(userDbSchema.email, body.email));

      if (user.length > 0 && user[0].status === userStatus.VERIFIED) {
        return c.json({ error: "User already exists", data: null });
      }

      if (body.otp !== user[0].otp) {
        return c.json({ error: "Invalid OTP", data: null });
      }

      const response = await db
        .update(userDbSchema)
        .set({
          name: body.name,
          email: body.email,
          password: body.password,
          role: userTypes.USER,
          status: userStatus.VERIFIED,
        })
        .where(eq(userDbSchema.email, body.email));

      return c.json({ data: response });
    } catch (e) {
      console.error(e);
      return c.json({ error: "An error occurred" });
    }
  })

  .get("/user", jwt({ secret: process.env.JWT_SECRET! }), async (c) => {
    const payload = c.get("jwtPayload") as { email: string; role: string };

    const response = await db
      .select()
      .from(userDbSchema)
      .where(eq(userDbSchema.email, payload.email));

    if (response.length === 0) {
      return c.json({ error: "User not found", data: null }, 404);
    }

    return c.json({ data: response[0] });
  })

  .post("/user.getOTP", vValidator("json", getOtpSchema), async (c) => {
    const body = c.req.valid("json");

    const response = await db
      .select()
      .from(userDbSchema)
      .where(eq(userDbSchema.email, body.email))
      .limit(1);

    const otp = generateOtp(6);

    if (response.length === 0) {
      await db.insert(userDbSchema).values({
        email: body.email,
        otp,
        status: userStatus.UNVERIFIED,
      });
    } else {
      if (response[0].status === userStatus.VERIFIED) {
        return c.json({ error: "User already exists" });
      }

      await db
        .update(userDbSchema)
        .set({
          otp,
          status: userStatus.UNVERIFIED,
        })
        .where(eq(userDbSchema.email, body.email));
    }

    const email = new SendEmailCommand({
      Destination: {
        ToAddresses: [body.email],
      },
      Message: {
        Body: {
          Text: {
            Data: `Dear User,

Your One-Time Password (OTP) for UDrive is ${otp}. Please use this OTP to complete your password reset process.

If you did not request this, please ignore this email.

Best regards,
The UDrive Team`,
          },
        },
        Subject: {
          Data: "Your UDrive OTP",
        },
      },
      Source: process.env.SES_SENDER_EMAIL,
    });

    await sesClient.send(email);

    return c.json({ data: "OTP sent successfully" });
  })

  .put(
    "/user.update",
    vValidator("json", insertUserSchema),
    jwt({ secret: process.env.JWT_SECRET! }),
    async (c) => {
      const payload = c.get("jwtPayload") as { email: string; role: string };

      const body = c.req.valid("json");

      const response = await db
        .update(userDbSchema)
        .set(body)
        .where(eq(userDbSchema.email, payload.email));

      return c.json({ data: response });
    }
  )

  // route for super admins only to create admin users
  .post(
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

        const response = await db.insert(userDbSchema).values({
          name: body.name,
          email: body.email,
          password: body.password,
          role: userTypes.ADMIN,
          status: userStatus.VERIFIED,
        });

        return c.json({ data: "admin created successfully" });
      } catch (e) {
        console.error(e);
        return c.json({ error: "An error occurred" });
      }
    }
  )

  .put(
    "/admin.update/:userId",
    vValidator("json", editAdminSchema),
    jwt({
      secret: process.env.JWT_SECRET!,
    }),
    async (c) => {
      try {
        const body = c.req.valid("json");

        // check if the user is a super admin
        const jwtPayload = c.get("jwtPayload");
        if (jwtPayload.role !== userTypes.SUPER_ADMIN) {
          return c.json({ error: "Unauthorized" });
        }

        await db
          .update(userDbSchema)
          .set({
            name: body.name,
            email: body.email,
            password: body.password,
          })
          .where(eq(userDbSchema.id, c.req.param("userId")));

        return c.json({ data: "admin updated successfully" });
      } catch (e) {
        console.error(e);
        return c.json({ error: "An error occurred" });
      }
    }
  )

  .get(
    "/admin.getAllAdmins",
    jwt({
      secret: process.env.JWT_SECRET!,
    }),
    async (c) => {
      const jwtPayload = c.get("jwtPayload");
      if (jwtPayload.role !== userTypes.SUPER_ADMIN) {
        return c.json({ error: "Unauthorized" });
      }

      const response = await db
        .select()
        .from(userDbSchema)
        .where(eq(userDbSchema.role, userTypes.ADMIN));

      return c.json({ data: response });
    }
  )

  .delete(
    "/admin.delete/:userId",
    jwt({
      secret: process.env.JWT_SECRET!,
    }),
    async (c) => {
      const jwtPayload = c.get("jwtPayload");
      if (jwtPayload.role !== userTypes.SUPER_ADMIN) {
        return c.json({ error: "Unauthorized" });
      }

      try {
        const response = await db
          .delete(userDbSchema)
          .where(eq(userDbSchema.id, c.req.param("userId")));
        return c.json({ data: response });
      } catch (e) {
        if (e instanceof postgres.PostgresError) {
          if (e.message.includes("violates foreign key constraint")) {
            return c.json({ error: "User has branches assigned to him" }, 400);
          }
        }
        throw e;
      }
    }
  );

// list all the admins
// delete admins
// update admins
// super admin can update password
