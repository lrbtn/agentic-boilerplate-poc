import { resetDb } from "./reset-db.js";

export default async function globalSetup(): Promise<void> {
  await resetDb();
}
