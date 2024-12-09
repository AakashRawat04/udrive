import { getSecretValue } from "./secretmanager";

export const getDbCredentials = async () => {
  const dbCredString = await getSecretValue(process.env.RDS_SECRET_NAME!);

  if (!dbCredString) {
    throw new Error("No secret found");
  }

  const dbCredJson = JSON.parse(dbCredString) as {
    username: string;
    password: string;
  };
  return dbCredJson;
};
