import app from "./app";
import config from "./config";
import prisma from "./db/prisma";

const port = config.port;

const start = async () => {
  try {
    await prisma.$connect();

    app.listen(port, () => {
      console.log(`MovieBlog API is running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to connect to PostgreSQL through Prisma:", error);
    process.exit(1);
  }
};

void start();
