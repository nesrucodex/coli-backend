import { createServer } from "http";
import dotenv from "dotenv";
import app from "./app";
import db from "./util/db";

dotenv.config();

const PORT = 5050;

const server = createServer(app);

const start = async () => {
  try {
    await db(process.env.LOCAL_MONGO_URL!);
    server.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    if (error instanceof Error) console.log(error.message);
  }
};

start();
