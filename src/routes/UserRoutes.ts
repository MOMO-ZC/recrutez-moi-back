import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  res.send("List of all users");
});

export default router;
