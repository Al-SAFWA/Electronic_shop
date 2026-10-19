// Use this config to push the schema to Supabase:
//   DATABASE_URL="postgresql://postgres:<password>@db.<ref>.supabase.co:5432/postgres" \
//   npx drizzle-kit push --config=drizzle.supabase.config.ts
export default {
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  dbCredentials: {
    url: process.env.DATABASE_URL as string,
    ssl: "require",
  },
};
