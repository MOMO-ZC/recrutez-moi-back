import { Router } from "express";
import {
  AddOffer,
  ApplyOffer,
  GetAllOffers,
  GetApplications,
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
import { db } from "../db";
import {
  candidateUsersTable,
  educationTable,
  experienceSkillsTable,
  experiencesTable,
  languagesTable,
  projectsSkillsTable,
  projectsTable,
  skillsTable,
  userEducationTable,
  userExperiencesTable,
  usersLanguagesTable,
} from "../db/schema";
import { eq, sql } from "drizzle-orm";
import GeocodingProvider from "../providers/GeocodingProvider";
import CandidateRepository from "../db/repositories/CandidateRepository";
import OfferRepository from "../db/repositories/OfferRepository";

const router = Router();

// Sort jobs using the LLM
router.get("/sort", authenticationMiddleware, async (request, response) => {
  // TODO: To be cleaned later...

  const candidateAttributeSelect = (
    await db
      .select()
      .from(candidateUsersTable)
      .where(eq(candidateUsersTable.user, parseInt(request.params.userId)))
  )[0];

  // TODO: Check that the user has an address
  // const userGPSAddress = new GeocodingProvider().geocode(
  //   candidateAttributeSelect.address!
  // );
  const userGPSAddress = candidateAttributeSelect.gps_location;

  // Get the user's languages
  const userLanguages = await db
    .select()
    .from(usersLanguagesTable)
    .where(eq(usersLanguagesTable.id_user, parseInt(request.params.userId)))
    .innerJoin(
      languagesTable,
      eq(languagesTable.id, usersLanguagesTable.id_language)
    );

  // Get the user's skills from their experiences and projects
  const userSkillsProjects = await db
    .selectDistinct({
      name: skillsTable.name,
      type: skillsTable.type,
      category: skillsTable.category,
      count: sql`COUNT(*)`,
    })
    .from(projectsTable)
    .where(eq(projectsTable.id_user, parseInt(request.params.userId)))
    .innerJoin(
      projectsSkillsTable,
      eq(projectsSkillsTable.id_project, projectsTable.id)
    )
    .innerJoin(skillsTable, eq(skillsTable.id, projectsSkillsTable.id_skill))
    .groupBy(skillsTable.name, skillsTable.type, skillsTable.category);

  const userSkillsExperiences = await db
    .selectDistinct({
      name: skillsTable.name,
      type: skillsTable.type,
      category: skillsTable.category,
      count: sql`COUNT(*)`,
    })
    .from(userExperiencesTable)
    .where(eq(userExperiencesTable.id_user, parseInt(request.params.userId)))
    .innerJoin(
      experiencesTable,
      eq(experiencesTable.id, userExperiencesTable.id_experience)
    )
    .innerJoin(
      experienceSkillsTable,
      eq(experienceSkillsTable.id_experience, experiencesTable.id)
    )
    .innerJoin(skillsTable, eq(skillsTable.id, experienceSkillsTable.id_skill))
    .groupBy(skillsTable.name, skillsTable.type, skillsTable.category);

  // Join the two lists of skills
  const userSkills = userSkillsProjects.concat(userSkillsExperiences);

  // Separate the user's skills into types
  const hardskills = userSkills.filter((skill) => skill.type === "Hardskill");
  const hardskillsDict: { [key: string]: number } = {};
  hardskills.forEach((skill) => {
    hardskillsDict[skill.name] = parseInt(skill.count as string);
  });
  const softskills = userSkills.filter((skill) => skill.type === "Softskill");
  const softskillsDict: { [key: string]: number } = {};
  softskills.forEach((skill) => {
    softskillsDict[skill.name] = parseInt(skill.count as string);
  });

  // Sum the number of year studies for the candidate
  const userEducation = await db
    .select()
    .from(userEducationTable)
    .where(eq(userEducationTable.id_user, parseInt(request.params.userId)))
    .innerJoin(
      educationTable,
      eq(educationTable.id, userEducationTable.id_education)
    );

  const convertLanguageLevelToNumber = (level: string): number => {
    switch (level) {
      case "beginner":
        return 1;
      case "intermediate":
        return 2;
      case "confirmed":
        return 3;
      case "native":
        return 4;
      default:
        return 0;
    }
  };
  let languagesDict: { [key: string]: number } = {};
  userLanguages.forEach((language) => {
    languagesDict[language.languages.name] = convertLanguageLevelToNumber(
      language.users_languages.level
    );
  });

  const convertDiplomaToYears = (diploma: string): number => {
    let n_years = 0;
    switch (diploma) {
      case "BTS":
      case "DUT":
        n_years = 2;
        break;
      case "License":
      case "Bachelor":
        n_years = 3;
        break;
      case "Master":
      case "Engineer":
        n_years = 5;
        break;
    }
    return n_years;
  };

  const candidate_attribute = {
    location: userGPSAddress,
    diploma: userEducation.reduce((acc: number, education) => {
      const n_years = convertDiplomaToYears(education.education.diploma);
      return acc + n_years;
    }, 0),
    seniority: candidateAttributeSelect.lookingForExperience,
    languages: languagesDict,
    hardskills: hardskillsDict,
    softskills: softskillsDict,
  };

  const offers = (await new OfferRepository().getAll()).map((offer) => {
    const hardskills = offer.skills
      .filter((skill) => skill.type === "Hardskill")
      .reduce((acc: { [key: string]: number }, cv) => {
        acc[cv.name] = (acc[cv.name] || 0) + 1;
        return acc;
      }, {});

    const softskills = offer.skills
      .filter((skill) => skill.type === "Softskill")
      .reduce((acc: { [key: string]: number }, cv) => {
        acc[cv.name] = (acc[cv.name] || 0) + 1;
        return acc;
      }, {});

    // Languages
    let languagesDict: { [key: string]: number } = {};
    offer.languages.forEach((language) => {
      languagesDict[language.name] = convertLanguageLevelToNumber(
        language.level
      );
    });

    return {
      // id: offer.id,
      jobTitle: offer.title,
      location: offer.gps_location,
      diploma: offer.education.reduce((acc: number, education) => {
        const n_years = convertDiplomaToYears(education.diploma);
        return acc > n_years ? acc : n_years;
      }, 0),
      seniority: 1, // FIXME: Add seniority to the offers
      languages: languagesDict,
      hardskills: hardskills,
      softskills: softskills,
    };
  });

  // Format the request
  const llmRequest = {
    user_job_title_emb: request.body.user_job_title_emb,
    candidate_weights: {
      hardskills: hardskillsDict,
      softskills: softskillsDict,
      languages: languagesDict,
    },
    candidate_attribute: candidate_attribute,
    job_offers: offers,
  };

  const llmResponse = await fetch("http://localhost:5000/sort_jobs", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(llmRequest),
  });

  // console.log(llmRequest);
  // response.json(llmRequest);
  response.json(await llmResponse.json());
});

// Create a new offer
router.post("/", authenticationMiddleware, async (request, response) => {
  if (request.params.userRole === "company") {
    // Make sure that the offer is being created for the current company
    const companyUserId = await new CompanyRepository().findByUserId(
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
      userId: companyUserId.user,
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
    const userCompanyId = await new CompanyRepository().findByUserId(
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
  const userCompanyId = await new CompanyRepository().findByUserId(
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
    }
    return;
  }
});

// Get all offers or only liked offers
router.get("/", authenticationMiddleware, async (request, response) => {
  if (request.query.liked === "true") {
    const controllerResponse = await GetLikedOffers({
      id_user: parseInt(request.params.userId),
    });

    response.json(controllerResponse);
  } else {
    const controllerResponse = await GetAllOffers({
      id_user: parseInt(request.params.userId),
    });

    response.json(controllerResponse);
  }
});

// Like an offer
router.post(
  "/:id/like",
  authenticationMiddleware,
  async (request, response) => {
    try {
      const controllerResponse = await LikeOffer({
        id_user: parseInt(request.params.userId),
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
          .json(
            new ErrorResponse("User not found", new Error("User not found"))
          );
      }
    }
  }
);

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

// Apply to an offer
router.post(
  "/:id/apply",
  authenticationMiddleware,
  async (request, response) => {
    const controllerResponse = await ApplyOffer({
      id_user: parseInt(request.params.userId),
      id_offer: parseInt(request.params.id),
    });

    response.json(controllerResponse);
  }
);

// Get all applications for an offer
router.get(
  "/:id/applications",
  authenticationMiddleware,
  async (request, response) => {
    const controllerResponse = await GetApplications(
      parseInt(request.params.id)
    );
    response.json(controllerResponse);
  }
);

export default router;
