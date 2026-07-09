import dotenv from "dotenv";

dotenv.config();

function requireEnv(name: string, fallback?: string) {
  const value = process.env[name] ?? fallback;
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

const config = {
  port: Number(process.env.PORT || 4000),
  nodeEnv: process.env.NODE_ENV || "development",
  isProduction: process.env.NODE_ENV === "production",
  frontendUrl: process.env.FRONTEND_URL || "",
  databaseUrl: requireEnv("DATABASE_URL"),
  jwtAccessSecret: requireEnv("JWT_ACCESS_SECRET"),
  jwtRefreshSecret: requireEnv("JWT_REFRESH_SECRET"),
  jwtResetSecret: requireEnv("JWT_RESET_SECRET"),
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  jwtResetExpiresIn: process.env.JWT_RESET_EXPIRES_IN || "15m",
  cookieNames: {
    access: process.env.COOKIE_NAME_ACCESS || "MovieBlog_access",
    refresh: process.env.COOKIE_NAME_REFRESH || "MovieBlog_refresh",
  },
  supabaseUrl: process.env.SUPABASE_URL || "",
  supabaseServiceKey: process.env.SUPABASE_SERVICE_KEY || "",
  supabaseBucket: process.env.SUPABASE_BUCKET || "blog-images",
};
export default config;
