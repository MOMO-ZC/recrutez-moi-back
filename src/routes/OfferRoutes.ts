import { Router } from "express";
import {
  AddOffer,
  GetAllOffers,
  GetOfferById,
  RemoveOffer,
  UpdateOffer,
} from "../controllers/OfferController";
import { ErrorResponse } from "../formats/ErrorResponse";

const router = Router();

// Create a new offer
router.post("/", async (request, response) => {
  const controllerResponse = await AddOffer(request.body);
  if (!controllerResponse) {
    response.status(401).send("Could not add offer.");
    return;
  }

  response.json(controllerResponse);
});

// Update an offer
router.patch("/:id", async (request, response) => {
  // TODO: Check id and validate data
  const controllerResponse = await UpdateOffer({
    ...request.body,
    id: request.params.id,
  });
  if (!controllerResponse) {
    response.status(401).send("Could not update offer.");
    return;
  }

  response.json(controllerResponse);
});

// Remove an offer
router.delete("/:id", async (request, response) => {
  const id: number = parseInt(request.params.id);
  if (isNaN(id)) {
    response
      .status(400)
      .json(
        new ErrorResponse(
          "Invalid format for id. id must be a number.",
          new TypeError("Not a number.")
        )
      );
    return;
  }

  const controllerResponse = await RemoveOffer({ id });
  if (!controllerResponse) {
    response.status(404).send("Offer not found.");
    return;
  }
  response.json(controllerResponse);
});

// Get an offer by its ID
router.get("/:id", async (request, response) => {
  const id: number = parseInt(request.params.id);
  if (isNaN(id)) {
    response
      .status(400)
      .json(
        new ErrorResponse(
          "Invalid format for id. id must be a number.",
          new TypeError("Not a number.")
        )
      );
    return;
  }

  const controllerResponse = await GetOfferById({ id });
  if (!controllerResponse) {
    response.status(404).send("Offer not found.");
    return;
  }

  response.json(controllerResponse);
});

// Get all offers
router.get("/", async (request, response) => {
  const controllerResponse = await GetAllOffers({});

  response.json(controllerResponse);
});

export default router;
