import { boolean, check, integer, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const items = pgTable(
  "items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 80 }).notNull(),
    quantity: integer("quantity").notNull(),
    bought: boolean("bought").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    quantityRange: check(
      "items_quantity_range",
      sql`${table.quantity} >= 1 AND ${table.quantity} <= 999`,
    ),
  }),
);

export type ItemRow = typeof items.$inferSelect;
