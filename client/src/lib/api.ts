import { hcWithType } from "../../../backend/client";

export const client = hcWithType(process.env.BASE_URL!);