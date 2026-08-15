import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

const adminPath = process.env.MEDUSA_ADMIN_PATH || "/app"
const cookieSecure = process.env.COOKIE_SECURE !== undefined
  ? process.env.COOKIE_SECURE === "true"
  : process.env.NODE_ENV === "production"

if (!adminPath.startsWith("/")) {
  throw new Error("MEDUSA_ADMIN_PATH must start with a forward slash")
}

module.exports = defineConfig({
  admin: {
    backendUrl: process.env.MEDUSA_BACKEND_URL,
    path: adminPath as `/${string}`,
    disable: process.env.DISABLE_MEDUSA_ADMIN === "true",
  },
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    redisUrl: process.env.REDIS_URL,
    databaseDriverOptions: {
      connectionTimeoutMillis: 5000,
      connection: {
        ssl: process.env.DATABASE_SSL === "true"
          ? { rejectUnauthorized: true }
          : false,
      },
    },
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    },
    cookieOptions: {
      secure: cookieSecure,
      sameSite: cookieSecure ? "none" : "lax",
      httpOnly: true,
    },
  },
  modules: [
    {
      resolve: "./src/modules/marketplace",
    },
  ],
})
