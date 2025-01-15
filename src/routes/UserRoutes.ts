import { Router } from "express";
import { editUser } from "../controllers/UserController";
import { UserNotFoundError } from "../exceptions/UserExceptions";
import { ErrorResponse } from "../formats/ErrorResponse";

const router = Router();

router.get("/", (req, res) => {
  res.send("List of all users");
});

router.put("/:id", async (request, response) => {
  try {
    const id = request.params.id;

    await editUser({ id, ...request.body });

    response.status(200).send();
  } catch (error) {
    if (error instanceof UserNotFoundError) {
      response
        .status(404)
        .json(new ErrorResponse(error.message, error, error.stack));
    } else {
      response
        .status(500)
        .json(new ErrorResponse("Internal server error", error));
    }
    return;
  }
});

export default router;
