import "dotenv/config";
import express, { Express, Request, Response } from "express";
import CandidateRoutes from "./routes/CandidateRoutes";
import CompanyRoutes from "./routes/CompanyRoutes";
import AuthenticationRoutes from "./routes/AuthenticationRoutes";

const app: Express = express();
const port = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server");
});

app.use("/auth", AuthenticationRoutes);

app.use("/candidates", CandidateRoutes);
app.use("/companies", CompanyRoutes);

app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
