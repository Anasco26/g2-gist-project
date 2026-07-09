import fs from "fs";
import path from "path";
import winston from "winston";
import config from "../config";

const logDir = path.resolve(process.cwd(), "logs");

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logger = winston.createLogger({
  level: config.isProduction ? "info" : "debug",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  defaultMeta: { service: "MovieBlog-api" },
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(
          ({ level, message, timestamp, stack, ...meta }) => {
            const details =
              Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : "";
            const errorStack = stack ? `\n${stack}` : "";
            return `${timestamp as string} ${level}: ${message as string}${details}${errorStack}`;
          },
        ),
      ),
    }),
    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error",
    }),
    new winston.transports.File({
      filename: path.join(logDir, "combined.log"),
    }),
  ],
});

export const morganStream = {
  write: (message: string) => logger.http(message.trim()),
};

export default logger;
