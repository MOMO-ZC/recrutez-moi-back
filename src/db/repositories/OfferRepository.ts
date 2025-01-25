import { InferSelectModel, InferInsertModel, eq, and } from "drizzle-orm";
import {
  companyUsersTable,
  educationTable,
  experiencesTable,
  jobOfferEducationTable,
  jobOfferExperiencesTable,
  jobOfferLanguagesTable,
  jobOfferSkillsTable,
  jobOffersTable,
  languagesTable,
  skillsTable,
  usersLikedJobOffersTable,
} from "../schema";
import IOfferRepository from "./IOfferRepository";
import { db } from "..";
import { UserHasNoAssociatedCandidateOrCompany } from "../../exceptions/UserExceptions";

type Offer = InferSelectModel<typeof jobOffersTable>;
type OfferInsert = InferInsertModel<typeof jobOffersTable>;

export default class OfferRepository implements IOfferRepository {
  async create(
    userId: number,
    offer: Omit<OfferInsert, "id_company" | "created_at" | "modified_at">
  ): Promise<Offer> {
    // Get the associated company id
    const companyIdResponse = await db
      .select({ company_id: companyUsersTable.company })
      .from(companyUsersTable)
      .where(eq(companyUsersTable.user, userId));
    if (companyIdResponse.length === 0) {
      // No associated company ID
      throw new UserHasNoAssociatedCandidateOrCompany();
    }

    return (
      await db
        .insert(jobOffersTable)
        .values({
          ...offer,
          id_company: companyIdResponse[0].company_id,
          created_at: new Date().toISOString(),
          modified_at: new Date().toISOString(),
        })
        .returning()
    )[0];
  }

  async update(
    offer: Partial<
      Omit<Offer, "id" | "id_company" | "created_at" | "modified_at">
    > & {
      id: number;
    }
  ): Promise<Offer> {
    const { id, ...updateFields } = offer;
    return (
      await db
        .update(jobOffersTable)
        .set({ ...updateFields, modified_at: new Date().toISOString() })
        .where(eq(jobOffersTable.id, id))
        .returning()
    )[0];
  }

  async updateWithLinks(
    offer: Partial<
      Omit<Offer, "id" | "created_at" | "modified_at"> & {
        skills: number[];
        education: number[];
        experiences: number[];
        languages: { id: number; level: string }[];
      }
    > & {
      id: number;
      gps_location?: [number, number];
    }
  ): Promise<Offer> {
    const { id, skills, education, experiences, languages, ...updateFields } =
      offer;

    console.log("updateFields", updateFields);
    const updatedOffer = (
      await db
        .update(jobOffersTable)
        .set({ ...updateFields, modified_at: new Date().toISOString() })
        .where(eq(jobOffersTable.id, id))
        .returning()
    )[0];

    // Update skills
    if (skills && skills.length > 0) {
      await db
        .delete(jobOfferSkillsTable)
        .where(eq(jobOfferSkillsTable.id_job_offer, id));
      await db
        .insert(jobOfferSkillsTable)
        .values(
          skills.map((id_skill) => ({ id_job_offer: id, id_skill: id_skill }))
        );
    }

    // Update education
    if (education && education.length > 0) {
      await db
        .delete(jobOfferEducationTable)
        .where(eq(jobOfferEducationTable.id_job_offer, id));
      await db.insert(jobOfferEducationTable).values(
        education.map((id_education) => ({
          id_job_offer: id,
          id_education: id_education,
        }))
      );
    }

    // Update experiences
    if (experiences && experiences.length > 0) {
      await db
        .delete(jobOfferExperiencesTable)
        .where(eq(jobOfferExperiencesTable.id_job_offer, id));
      await db.insert(jobOfferExperiencesTable).values(
        experiences.map((id_experience) => ({
          id_job_offer: id,
          id_experience: id_experience,
        }))
      );
    }

    // Update languages
    if (languages && languages.length > 0) {
      await db
        .delete(jobOfferLanguagesTable)
        .where(eq(jobOfferLanguagesTable.id_job_offer, id));
      await db.insert(jobOfferLanguagesTable).values(
        languages.map(({ id: id_language, level }) => ({
          id_job_offer: id,
          id_language: id_language,
          level: level,
        }))
      );
    }

    return updatedOffer;
  }

  async delete(id: number): Promise<null> {
    await db.delete(jobOffersTable).where(eq(jobOffersTable.id, id));
    return null;
  }

  async getById(id: number): Promise<
    Offer & {
      skills: { id: number; name: string; type: string; category: string }[];
      education: { id: number; domain: string; diploma: string }[];
      experiences: { id: number; name: string }[];
      languages: { id: number; name: string; level: string }[];
    }
  > {
    const offer = (
      await db.select().from(jobOffersTable).where(eq(jobOffersTable.id, id))
    )[0];

    return {
      ...offer,
      skills: await db
        .select({
          id: skillsTable.id,
          name: skillsTable.name,
          type: skillsTable.type,
          category: skillsTable.category,
        })
        .from(skillsTable)
        .innerJoin(
          jobOfferSkillsTable,
          eq(skillsTable.id, jobOfferSkillsTable.id_skill)
        )
        .where(eq(jobOfferSkillsTable.id_job_offer, id)),
      education: await db
        .select({
          id: educationTable.id,
          domain: educationTable.domain,
          diploma: educationTable.diploma,
        })
        .from(educationTable)
        .innerJoin(
          jobOfferEducationTable,
          eq(educationTable.id, jobOfferEducationTable.id_education)
        )
        .where(eq(jobOfferEducationTable.id_job_offer, id)),
      experiences: await db
        .select({
          id: experiencesTable.id,
          name: experiencesTable.name,
        })
        .from(experiencesTable)
        .innerJoin(
          jobOfferExperiencesTable,
          eq(experiencesTable.id, jobOfferExperiencesTable.id_experience)
        )
        .where(eq(jobOfferExperiencesTable.id_job_offer, id)),
      languages: await db
        .select({
          id: languagesTable.id,
          name: languagesTable.name,
          level: jobOfferLanguagesTable.level,
        })
        .from(languagesTable)
        .innerJoin(
          jobOfferLanguagesTable,
          eq(languagesTable.id, jobOfferLanguagesTable.id_language)
        )
        .where(eq(jobOfferLanguagesTable.id_job_offer, id)),
    };
  }

  async getAll(): Promise<
    (Offer & {
      skills: { id: number; name: string; type: string; category: string }[];
      education: { id: number; domain: string; diploma: string }[];
      experiences: { id: number; name: string }[];
      languages: { id: number; name: string; level: string }[];
    })[]
  > {
    const offers = await db.select().from(jobOffersTable);

    return await Promise.all(
      offers.map(async (offer) => ({
        ...offer,
        skills: await db
          .select({
            id: skillsTable.id,
            name: skillsTable.name,
            type: skillsTable.type,
            category: skillsTable.category,
          })
          .from(skillsTable)
          .innerJoin(
            jobOfferSkillsTable,
            eq(skillsTable.id, jobOfferSkillsTable.id_skill)
          )
          .where(eq(jobOfferSkillsTable.id_job_offer, offer.id)),
        education: await db
          .select({
            id: educationTable.id,
            domain: educationTable.domain,
            diploma: educationTable.diploma,
          })
          .from(educationTable)
          .innerJoin(
            jobOfferEducationTable,
            eq(educationTable.id, jobOfferEducationTable.id_education)
          )
          .where(eq(jobOfferEducationTable.id_job_offer, offer.id)),
        experiences: await db
          .select({
            id: experiencesTable.id,
            name: experiencesTable.name,
          })
          .from(experiencesTable)
          .innerJoin(
            jobOfferExperiencesTable,
            eq(experiencesTable.id, jobOfferExperiencesTable.id_experience)
          )
          .where(eq(jobOfferExperiencesTable.id_job_offer, offer.id)),
        languages: await db
          .select({
            id: languagesTable.id,
            name: languagesTable.name,
            level: jobOfferLanguagesTable.level,
          })
          .from(languagesTable)
          .innerJoin(
            jobOfferLanguagesTable,
            eq(languagesTable.id, jobOfferLanguagesTable.id_language)
          )
          .where(eq(jobOfferLanguagesTable.id_job_offer, offer.id)),
      }))
    );
  }

  async getAllWithLiked(userId: number): Promise<
    (Offer & {
      liked: boolean;
      skills: { id: number; name: string; type: string; category: string }[];
      education: { id: number; domain: string; diploma: string }[];
      experiences: { id: number; name: string }[];
      languages: { id: number; name: string; level: string }[];
    })[]
  > {
    const offers = await db.select().from(jobOffersTable);

    return await Promise.all(
      offers.map(async (offer) => ({
        ...offer,
        liked: await this.doesUserLike(offer.id, userId),
        skills: await db
          .select({
            id: skillsTable.id,
            name: skillsTable.name,
            type: skillsTable.type,
            category: skillsTable.category,
          })
          .from(skillsTable)
          .innerJoin(
            jobOfferSkillsTable,
            eq(skillsTable.id, jobOfferSkillsTable.id_skill)
          )
          .where(eq(jobOfferSkillsTable.id_job_offer, offer.id)),
        education: await db
          .select({
            id: educationTable.id,
            domain: educationTable.domain,
            diploma: educationTable.diploma,
          })
          .from(educationTable)
          .innerJoin(
            jobOfferEducationTable,
            eq(educationTable.id, jobOfferEducationTable.id_education)
          )
          .where(eq(jobOfferEducationTable.id_job_offer, offer.id)),
        experiences: await db
          .select({
            id: experiencesTable.id,
            name: experiencesTable.name,
          })
          .from(experiencesTable)
          .innerJoin(
            jobOfferExperiencesTable,
            eq(experiencesTable.id, jobOfferExperiencesTable.id_experience)
          )
          .where(eq(jobOfferExperiencesTable.id_job_offer, offer.id)),
        languages: await db
          .select({
            id: languagesTable.id,
            name: languagesTable.name,
            level: jobOfferLanguagesTable.level,
          })
          .from(languagesTable)
          .innerJoin(
            jobOfferLanguagesTable,
            eq(languagesTable.id, jobOfferLanguagesTable.id_language)
          )
          .where(eq(jobOfferLanguagesTable.id_job_offer, offer.id)),
      }))
    );
  }

  async addSkills(offerId: number, skills: number[]): Promise<null> {
    await db.insert(jobOfferSkillsTable).values(
      skills.map((id_skill) => ({
        id_job_offer: offerId,
        id_skill: id_skill,
      }))
    );

    return null;
  }

  async addEducation(offerId: number, education: number[]): Promise<null> {
    await db.insert(jobOfferEducationTable).values(
      education.map((id_education) => ({
        id_offer: offerId,
        id_education: id_education,
      }))
    );

    return null;
  }

  async addExperiences(offerId: number, experiences: number[]): Promise<null> {
    await db.insert(jobOfferExperiencesTable).values(
      experiences.map((id_experience) => ({
        id_offer: offerId,
        id_experience: id_experience,
      }))
    );

    return null;
  }

  async addLanguages(
    offerId: number,
    languages: { id: number; level: string }[]
  ): Promise<null> {
    await db.insert(jobOfferLanguagesTable).values(
      languages.map(({ id, level }) => ({
        id_job_offer: offerId,
        id_language: id,
        level: level,
      }))
    );

    return null;
  }

  async getLiked(userId: number): Promise<Offer[]> {
    return db
      .select({
        id: jobOffersTable.id,
        id_company: jobOffersTable.id_company,
        title: jobOffersTable.title,
        body: jobOffersTable.body,
        locationType: jobOffersTable.locationType,
        address: jobOffersTable.address,
        gps_location: jobOffersTable.gps_location,
        minSalary: jobOffersTable.minSalary,
        maxSalary: jobOffersTable.maxSalary,
        status: jobOffersTable.status,
        image: jobOffersTable.image,
        created_at: jobOffersTable.created_at,
        modified_at: jobOffersTable.modified_at,
      })
      .from(usersLikedJobOffersTable)
      .innerJoin(
        jobOffersTable,
        eq(usersLikedJobOffersTable.id_job_offer, jobOffersTable.id)
      )
      .where(eq(usersLikedJobOffersTable.id_user, userId));
  }

  async doesUserLike(offerId: number, userId: number): Promise<boolean> {
    const liked = await db
      .select()
      .from(usersLikedJobOffersTable)
      .where(
        and(
          eq(usersLikedJobOffersTable.id_job_offer, offerId),
          eq(usersLikedJobOffersTable.id_user, userId)
        )
      );

    return liked.length > 0;
  }

  async like(offerId: number, userId: number): Promise<null> {
    await db.insert(usersLikedJobOffersTable).values({
      id_user: userId,
      id_job_offer: offerId,
      created_at: new Date().toISOString(),
    });

    return null;
  }

  async unlike(offerId: number, userId: number): Promise<null> {
    await db
      .delete(usersLikedJobOffersTable)
      .where(
        eq(usersLikedJobOffersTable.id_job_offer, offerId) &&
          eq(usersLikedJobOffersTable.id_user, userId)
      );
    return null;
  }
}
