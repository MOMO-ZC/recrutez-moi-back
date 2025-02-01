import { InferSelectModel, InferInsertModel, eq, and, sql } from "drizzle-orm";
import {
  applicationsTable,
  candidateUsersTable,
  companiesTable,
  companyUsersTable,
  educationsTable,
  experiencesTable,
  jobOfferEducationsTable,
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
        .delete(jobOfferEducationsTable)
        .where(eq(jobOfferEducationsTable.id_job_offer, id));
      await db.insert(jobOfferEducationsTable).values(
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
      company_name: string;
      skills: { id: number; name: string; type: string; category: string }[];
      education: { id: number; domain: string; diploma: string }[];
      experiences: { id: number; name: string }[];
      languages: { id: number; name: string; level: string }[];
    }
  > {
    const offer = (
      await db
        .select({
          id: jobOffersTable.id,
          id_company: jobOffersTable.id_company,
          title: jobOffersTable.title,
          body: jobOffersTable.body,
          address: jobOffersTable.address,
          gps_location: jobOffersTable.gps_location,
          min_salary: jobOffersTable.min_salary,
          max_salary: jobOffersTable.max_salary,
          location_type: jobOffersTable.location_type,
          status: jobOffersTable.status,
          image: jobOffersTable.image,
          created_at: jobOffersTable.created_at,
          modified_at: jobOffersTable.modified_at,
          company_name: companiesTable.name,
        })
        .from(jobOffersTable)
        .where(eq(jobOffersTable.id, id))
        .innerJoin(
          companiesTable,
          eq(jobOffersTable.id_company, companiesTable.id)
        )
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
          id: educationsTable.id,
          domain: educationsTable.domain,
          diploma: educationsTable.diploma,
        })
        .from(educationsTable)
        .innerJoin(
          jobOfferEducationsTable,
          eq(educationsTable.id, jobOfferEducationsTable.id_education)
        )
        .where(eq(jobOfferEducationsTable.id_job_offer, id)),
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

  async getByCompany(id_company: number): Promise<
    (Offer & {
      company_name: string;
      number_applicants: number;
      skills: { id: number; name: string; type: string; category: string }[];
      education: { id: number; domain: string; diploma: string }[];
      experiences: { id: number; name: string }[];
      languages: { id: number; name: string; level: string }[];
    })[]
  > {
    const offers = await db
      .select({
        id: jobOffersTable.id,
        id_company: jobOffersTable.id_company,
        title: jobOffersTable.title,
        body: jobOffersTable.body,
        address: jobOffersTable.address,
        gps_location: jobOffersTable.gps_location,
        min_salary: jobOffersTable.min_salary,
        max_salary: jobOffersTable.max_salary,
        location_type: jobOffersTable.location_type,
        status: jobOffersTable.status,
        image: jobOffersTable.image,
        created_at: jobOffersTable.created_at,
        modified_at: jobOffersTable.modified_at,
        company_name: companiesTable.name,
        number_applicants: sql<number>`(SELECT COUNT(*) FROM ${applicationsTable} WHERE ${applicationsTable.id_job_offer} = ${jobOffersTable.id})`,
      })
      .from(jobOffersTable)
      .where(eq(jobOffersTable.id_company, id_company))
      .innerJoin(
        companiesTable,
        eq(companiesTable.id, jobOffersTable.id_company)
      );

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
            id: educationsTable.id,
            domain: educationsTable.domain,
            diploma: educationsTable.diploma,
          })
          .from(educationsTable)
          .innerJoin(
            jobOfferEducationsTable,
            eq(educationsTable.id, jobOfferEducationsTable.id_education)
          )
          .where(eq(jobOfferEducationsTable.id_job_offer, offer.id)),
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
            id: educationsTable.id,
            domain: educationsTable.domain,
            diploma: educationsTable.diploma,
          })
          .from(educationsTable)
          .innerJoin(
            jobOfferEducationsTable,
            eq(educationsTable.id, jobOfferEducationsTable.id_education)
          )
          .where(eq(jobOfferEducationsTable.id_job_offer, offer.id)),
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
      company_name: string;
      liked: boolean;
      skills: { id: number; name: string; type: string; category: string }[];
      education: { id: number; domain: string; diploma: string }[];
      experiences: { id: number; name: string }[];
      languages: { id: number; name: string; level: string }[];
    })[]
  > {
    const offers = await db
      .select({
        id: jobOffersTable.id,
        id_company: jobOffersTable.id_company,
        title: jobOffersTable.title,
        body: jobOffersTable.body,
        address: jobOffersTable.address,
        gps_location: jobOffersTable.gps_location,
        min_salary: jobOffersTable.min_salary,
        max_salary: jobOffersTable.max_salary,
        location_type: jobOffersTable.location_type,
        status: jobOffersTable.status,
        image: jobOffersTable.image,
        created_at: jobOffersTable.created_at,
        modified_at: jobOffersTable.modified_at,
        company_name: companiesTable.name,
      })
      .from(jobOffersTable)
      .innerJoin(
        companiesTable,
        eq(companiesTable.id, jobOffersTable.id_company)
      );

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
            id: educationsTable.id,
            domain: educationsTable.domain,
            diploma: educationsTable.diploma,
          })
          .from(educationsTable)
          .innerJoin(
            jobOfferEducationsTable,
            eq(educationsTable.id, jobOfferEducationsTable.id_education)
          )
          .where(eq(jobOfferEducationsTable.id_job_offer, offer.id)),
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
    await db.insert(jobOfferEducationsTable).values(
      education.map((id_education) => ({
        id_job_offer: offerId,
        id_education: id_education,
      }))
    );

    return null;
  }

  async addExperiences(offerId: number, experiences: number[]): Promise<null> {
    await db.insert(jobOfferExperiencesTable).values(
      experiences.map((id_experience) => ({
        id_job_offer: offerId,
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

  async getLiked(
    userId: number
  ): Promise<(Offer & { company_name: string })[]> {
    return db
      .select({
        id: jobOffersTable.id,
        id_company: jobOffersTable.id_company,
        title: jobOffersTable.title,
        body: jobOffersTable.body,
        address: jobOffersTable.address,
        gps_location: jobOffersTable.gps_location,
        min_salary: jobOffersTable.min_salary,
        max_salary: jobOffersTable.max_salary,
        location_type: jobOffersTable.location_type,
        status: jobOffersTable.status,
        image: jobOffersTable.image,
        created_at: jobOffersTable.created_at,
        modified_at: jobOffersTable.modified_at,
        company_name: companiesTable.name,
      })
      .from(usersLikedJobOffersTable)
      .innerJoin(
        jobOffersTable,
        eq(usersLikedJobOffersTable.id_job_offer, jobOffersTable.id)
      )
      .innerJoin(
        companiesTable,
        eq(companiesTable.id, jobOffersTable.id_company)
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
        and(
          eq(usersLikedJobOffersTable.id_job_offer, offerId),
          eq(usersLikedJobOffersTable.id_user, userId)
        )
      );
    return null;
  }

  async apply(offerId: number, userId: number): Promise<{ id: number }> {
    const application = await db
      .insert(applicationsTable)
      .values({
        id_user: userId,
        id_job_offer: offerId,
        status: "pending",
        created_at: new Date().toISOString(),
        modified_at: new Date().toISOString(),
      })
      .returning();
    return { id: application[0].id };
  }

  async getApplications(offerId: number): Promise<
    {
      id: number;
      id_user: number;
      userFullname: string;
      status: string;
      created_at: string;
      modified_at: string;
    }[]
  > {
    return db
      .select({
        id: applicationsTable.id,
        id_user: applicationsTable.id_user,
        userFullname: sql<string>`${candidateUsersTable.firstname} || ' ' || ${candidateUsersTable.lastname}`,
        status: applicationsTable.status,
        created_at: applicationsTable.created_at,
        modified_at: applicationsTable.modified_at,
      })
      .from(applicationsTable)
      .where(eq(applicationsTable.id_job_offer, offerId))
      .innerJoin(
        candidateUsersTable,
        eq(candidateUsersTable.user, applicationsTable.id_user)
      );
  }

  async hasUserApplied(offerId: number, userId: number): Promise<boolean> {
    return (
      (
        await db
          .select()
          .from(applicationsTable)
          .where(
            and(
              eq(applicationsTable.id_job_offer, offerId),
              eq(applicationsTable.id_user, userId)
            )
          )
      ).length > 0
    );
  }
}
