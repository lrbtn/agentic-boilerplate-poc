import { Hono } from "hono";
import { serve } from "@hono/node-server";
import type { AppDatabase } from "./infrastructure/db.js";
import { createDb, createPool } from "./infrastructure/db.js";
import { DrizzleItemRepository } from "./infrastructure/drizzle-item-repository.js";
import { createItemsRouter } from "./api/items-router.js";

export function createApp({ db }: { db: AppDatabase }): Hono {
  const repo = new DrizzleItemRepository(db);
  const app = new Hono();
  app.route("/", createItemsRouter({ repo }));
  return app;
}

const isMainModule = import.meta.url === `file://${process.argv[1]}`;
if (isMainModule) {
  const pool = createPool();
  const db = createDb(pool);
  const app = createApp({ db });
  const port = Number(process.env.PORT ?? 3000);
  serve({ fetch: app.fetch, port }, (info) => {
    console.warn(`api listening on :${info.port}`);
  });
}
