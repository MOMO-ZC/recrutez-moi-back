import { Router } from "express";
import {
  AddOffer,
  GetAllOffers,
  GetLikedOffers,
  GetOfferById,
  LikeOffer,
  RemoveOffer,
  UnlikeOffer,
  UpdateOffer,
} from "../controllers/OfferController";
import { ErrorResponse } from "../formats/ErrorResponse";
import { OfferNotFoundError } from "../exceptions/OfferExceptions";
import authenticationMiddleware from "../middlewares/authentication";
import CompanyRepository from "../db/repositories/CompanyRepository";
import { UserNotFoundError } from "../exceptions/UserExceptions";

const router = Router();

// Create a new offer
router.post("/", authenticationMiddleware, async (request, response) => {
  if (request.params.userRole === "company") {
    // Make sure that the offer is being created for the current company
    const companyUserId = await new CompanyRepository().findById(
      parseInt(request.params.userId)
    );
    if (!companyUserId || companyUserId === null) {
      response
        .status(404)
        .json(
          new ErrorResponse("Company not found", new Error("Company not found"))
        );
      return;
    }

    // Create the offer
    const controllerResponse = await AddOffer({
      userId: companyUserId.company,
      ...request.body,
    });
    if (!controllerResponse) {
      response
        .status(401)
        .json(
          new ErrorResponse(
            "Could not add offer.",
            new Error("Could not add offer.")
          )
        );
      return;
    }

    response.json(controllerResponse);
  } else {
    response
      .status(401)
      .json(
        new ErrorResponse(
          "Only companies can add offers",
          new Error("Only companies can add offers.")
        )
      );
  }
});

// Update an offer
router.patch("/:id", authenticationMiddleware, async (request, response) => {
  // Make sure that the user is a company
  if (request.params.userRole === "company") {
    // Make sure that the company owns the offer
    const userCompanyId = await new CompanyRepository().findById(
      parseInt(request.params.userId)
    );
    if (!userCompanyId || userCompanyId === null) {
      response
        .status(404)
        .json(
          new ErrorResponse("Company not found", new Error("Company not found"))
        );
      return;
    }

    // Get the offer to be updated
    try {
      const offer = await GetOfferById({
        id: parseInt(request.params.id),
        id_user: parseInt(request.params.userId),
      });

      if (offer.id_company !== userCompanyId.company) {
        response
          .status(401)
          .json(
            new ErrorResponse(
              "Company does not own this offer",
              new Error("Company does not own this offer")
            )
          );
        return;
      }
    } catch (error: unknown) {
      if (error instanceof OfferNotFoundError) {
        response
          .status(404)
          .json(
            new ErrorResponse("Offer not found", new Error("Offer not found"))
          );
        return;
      }
    }

    // TODO: Validate data
    const controllerResponse = await UpdateOffer({
      ...request.body,
      id: request.params.id,
    });
    if (!controllerResponse) {
      response
        .status(401)
        .json(
          new ErrorResponse(
            "Could not update offer",
            new Error("Could not update offer")
          )
        );
      return;
    }

    response.json(controllerResponse);
  } else {
    response
      .status(401)
      .json(
        new ErrorResponse(
          "Only companies can edit offers",
          new Error("Only companies can edit offers")
        )
      );
  }
});

// Remove an offer
router.delete("/:id", authenticationMiddleware, async (request, response) => {
  // Make sure the user is a company
  if (request.params.userRole !== "company") {
    response
      .status(401)
      .json(
        new ErrorResponse(
          "Only companies can remove offers",
          new Error("Only companies can remove offers")
        )
      );
    return;
  }

  // Make sure the company owns the offer
  const userCompanyId = await new CompanyRepository().findById(
    parseInt(request.params.userId)
  );
  if (!userCompanyId || userCompanyId === null) {
    response
      .status(404)
      .json(
        new ErrorResponse("Company not found", new Error("Company not found"))
      );
    return;
  }

  try {
    const offer = await GetOfferById({
      id: parseInt(request.params.id),
      id_user: parseInt(request.params.userId),
    });
    if (offer.id_company !== userCompanyId.company) {
      response
        .status(401)
        .json(
          new ErrorResponse(
            "Company does not own this offer",
            new Error("Company does not own this offer")
          )
        );
      return;
    }
  } catch (error: unknown) {
    if (error instanceof OfferNotFoundError) {
      response
        .status(404)
        .json(
          new ErrorResponse("Offer not found", new Error("Offer not found"))
        );
      return;
    }
  }

  // Verify that id is a number
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

  // Remove the offer
  try {
    const controllerResponse = await RemoveOffer({ id });
    response.json(controllerResponse);
  } catch (error: unknown) {
    if (error instanceof OfferNotFoundError) {
      response
        .status(404)
        .json(
          new ErrorResponse("Offer not found", new Error("Offer not found"))
        );
    }
  }

  return;
});

// Get an offer by its ID
router.get("/:id", authenticationMiddleware, async (request, response) => {
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

  try {
    const controllerResponse = await GetOfferById({
      id: id,
      id_user: parseInt(request.params.userId),
    });
    if (!controllerResponse) {
      throw new OfferNotFoundError();
    }
    response.json(controllerResponse);
  } catch (error: unknown) {
    if (error instanceof OfferNotFoundError) {
      response
        .status(404)
        .json(
          new ErrorResponse("Offer not found", new Error("Offer not found"))
        );
    } else {
      response
        .status(500)
        .json(new ErrorResponse("Internal server error", error));
    }
    return;
  }
});

// Get all offers or only liked offers
router.get("/", authenticationMiddleware, async (request, response) => {
  if (request.query.liked === "true") {
    const controllerResponse = await GetLikedOffers({ id_user: 1 });

    response.json(controllerResponse);
  } else {
    const controllerResponse = await GetAllOffers({
      id_user: parseInt(request.params.userId),
    });

    response.json(controllerResponse);
  }
});

// Like an offer
router.post("/:id/like", async (request, response) => {
  try {
    const controllerResponse = await LikeOffer({
      id_user: 1,
      id_offer: parseInt(request.params.id),
    });
    response.json(controllerResponse);
  } catch (error: unknown) {
    if (error instanceof OfferNotFoundError) {
      response
        .status(404)
        .json(
          new ErrorResponse("Offer not found", new Error("Offer not found"))
        );
    } else if (error instanceof UserNotFoundError) {
      response
        .status(404)
        .json(new ErrorResponse("User not found", new Error("User not found")));
    }
  }
});

// Unlike an offer
router.post(
  "/:id/unlike",
  authenticationMiddleware,
  async (request, response) => {
    const controllerResponse = await UnlikeOffer({
      id_user: parseInt(request.params.userId),
      id_offer: parseInt(request.params.id),
    });

    response.json(controllerResponse);
  }
);

export default router;
