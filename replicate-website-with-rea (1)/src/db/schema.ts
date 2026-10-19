import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  real,
} from "drizzle-orm/pg-core";

export const products = pgTable(
  "products",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    name: text("name").notNull(),
    brand: text("brand").notNull(),
    category: text("category").notNull(),
    kind: text("kind").notNull(),
    price: integer("price").notNull(),
    compareAtPrice: integer("compare_at_price"),
    storage: text("storage"),
    colorName: text("color_name").notNull(),
    color: text("color").notNull(),
    grade: text("grade").notNull().default("Excellent"),
    batteryHealth: integer("battery_health"),
    rating: real("rating").notNull().default(4.8),
    reviewCount: integer("review_count").notNull().default(0),
    badge: text("badge"),
    stock: integer("stock").notNull().default(10),
    featured: boolean("featured").notNull().default(false),
    image: text("image").notNull().default("/products/iphone-15.webp"),
    description: text("description").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("products_category_idx").on(t.category)],
);

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  productId: integer("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  author: text("author").notNull(),
  rating: integer("rating").notNull(),
  body: text("body").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  reference: text("reference").notNull().unique(),
  customerName: text("customer_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  city: text("city").notNull(),
  address: text("address").notNull(),
  paymentMethod: text("payment_method").notNull(),
  items: jsonb("items").notNull(),
  subtotal: integer("subtotal").notNull(),
  shipping: integer("shipping").notNull(),
  total: integer("total").notNull(),
  status: text("status").notNull().default("confirmed"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const subscribers = pgTable("subscribers", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type Review = typeof reviews.$inferSelect;
export type Order = typeof orders.$inferSelect;
