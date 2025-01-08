import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import express, { Express, Request, Response } from "express";

const db = drizzle(process.env.DATABASE_URL!);

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
