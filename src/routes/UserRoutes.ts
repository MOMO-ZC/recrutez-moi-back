import { Router } from "express";
import { editUser } from "../controllers/UserController";

const router = Router();

router.get("/", (req, res) => {
  res.send("List of all users");
});

router.put("/:id", async (request, response) => {
  try {
    const id = request.params.id;

    await editUser({ id, ...request.body });

    response.status(200).send("User updated");
  } catch (error) {
    response.status(500).send("Internal server error: " + error);
  }
});

export default router;
