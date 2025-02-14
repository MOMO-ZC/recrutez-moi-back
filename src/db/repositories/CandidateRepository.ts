import { InferInsertModel, InferSelectModel, and, eq, sql } from "drizzle-orm";
import ICandidateRepository from "./ICandidateRepository";
import {
  candidateUsersTable,
  educationsTable,
  experienceSkillsTable,
  experiencesTable,
  languagesTable,
  projectsSkillsTable,
  projectsTable,
  skillsTable,
  userEducationsTable,
  userExperiencesTable,
  userHobbiesTable,
  usersLanguagesTable,
  usersTable,
} from "../schema";
import { db } from "..";
import { createInsertSchema } from "drizzle-zod";

type Candidate = InferSelectModel<typeof candidateUsersTable>;
type CandidateInsert = InferInsertModel<typeof candidateUsersTable>;

export default class CandidateRepository implements ICandidateRepository {
  async add(candidate: CandidateInsert): Promise<Candidate | null> {
    return (
      await db.insert(candidateUsersTable).values(candidate).returning()
    )[0];
  }

  async findByEmail(email: string): Promise<Candidate | null> {
    return (
      await db
        .select()
        .from(candidateUsersTable)
        .leftJoin(usersTable, eq(usersTable.id, candidateUsersTable.user))
        .where(eq(usersTable.email, email))
    )[0].candidate_users;
  }

  async findById(id: number): Promise<Candidate | null> {
    return (
      await db
        .select()
        .from(candidateUsersTable)
        .where(eq(candidateUsersTable.user, id))
    )[0];
  }

  async remove(id: number): Promise<null> {
    await db
      .delete(candidateUsersTable)
      .where(eq(candidateUsersTable.user, id));
    return null;
  }

  async update({
    user,
    candidate,
  }: {
    user: number;
    candidate: Partial<Omit<Candidate, "user">>;
  }): Promise<null> {
    await db.transaction(async (tx) => {
      // Update the modified_at date in the users table
      await tx
        .update(usersTable)
        .set({ modified_at: new Date() })
        .where(eq(usersTable.id, user));

      // Update candidate_users table
      await tx
        .update(candidateUsersTable)
        .set(candidate)
        .where(eq(candidateUsersTable.user, user));
    });
    return null;
  }

  async updateWithUser({
    id,
    fullUser,
  }: {
    id: number;
    fullUser: Partial<
      Omit<Candidate, "user"> &
        Partial<
          Omit<
            InferSelectModel<typeof usersTable>,
            "id" | "created_at" | "modified_at"
          >
        >
    >;
  }): Promise<null> {
    // Filter fields
    const userSchema = createInsertSchema(usersTable);
    const userUpdateData = userSchema.partial().parse(fullUser);

    const candidateSchema = createInsertSchema(candidateUsersTable);
    const candidateUpdateData = candidateSchema.partial().parse(fullUser);

    await db.transaction(async (tx) => {
      // Update users table
      await tx
        .update(usersTable)
        .set({ ...userUpdateData, modified_at: new Date() })
        .where(eq(usersTable.id, id));

      // Update candidate_users table
      await tx
        .update(candidateUsersTable)
        .set(candidateUpdateData)
        .where(eq(candidateUsersTable.user, id));
    });
    return null;
  }

  async addEducation(
    id_candidate: number,
    id_education: number,
    school: string,
    start: Date,
    end: Date
  ): Promise<{
    education: {
      id: number;
      domain: string;
      diploma: string;
    };
    id_user: number;
    school: string;
    start: Date;
    end: Date;
    created_at: Date;
    modified_at: Date;
  }> {
    const newUserEducation = await db
      .insert(userEducationsTable)
      .values({
        id_education: id_education,
        id_user: id_candidate,
        school: school,
        start: start.toISOString(),
        end: end.toISOString(),
        created_at: new Date().toISOString(),
        modified_at: new Date().toISOString(),
      })
      .returning();

    // Get information about the education
    const education = await db
      .select()
      .from(educationsTable)
      .where(eq(educationsTable.id, id_education));

    return {
      education: education[0],
      id_user: newUserEducation[0].id_user as number,
      school: newUserEducation[0].school,
      start: new Date(newUserEducation[0].start!),
      end: new Date(newUserEducation[0].end!),
      created_at: new Date(newUserEducation[0].created_at),
      modified_at: new Date(newUserEducation[0].modified_at),
    };
  }

  async getCandidateEducations(id_candidate: number): Promise<{
    candidate_educations: {
      education: {
        id: number;
        domain: string;
        diploma: string;
      };
      school: string;
      start: Date;
      end: Date;
      created_at: Date;
      modified_at: Date;
    }[];
  }> {
    return {
      candidate_educations: (
        await db
          .select({
            id: educationsTable.id,
            domain: educationsTable.domain,
            diploma: educationsTable.diploma,
            school: userEducationsTable.school,
            start: userEducationsTable.start,
            end: userEducationsTable.end,
            created_at: userEducationsTable.created_at,
            modified_at: userEducationsTable.modified_at,
          })
          .from(userEducationsTable)
          .fullJoin(
            educationsTable,
            eq(userEducationsTable.id_education, educationsTable.id)
          )
          .where(
            and(
              eq(userEducationsTable.id_user, id_candidate),
              eq(userEducationsTable.id_education, educationsTable.id)
            )
          )
      ).map((education) => ({
        education: {
          id: education.id!,
          domain: education.domain!,
          diploma: education.diploma!,
        },
        school: education.school!,
        start: new Date(education.start!),
        end: new Date(education.end!),
        created_at: new Date(education.created_at!),
        modified_at: new Date(education.modified_at!),
      })),
    };
  }

  async educationExists(
    id_candidate: number,
    id_education: number
  ): Promise<boolean> {
    return (
      (
        await db
          .select()
          .from(userEducationsTable)
          .where(
            and(
              eq(userEducationsTable.id_user, id_candidate),
              eq(userEducationsTable.id_education, id_education)
            )
          )
      ).length > 0
    );
  }

  async updateEducation(
    id_candidate: number,
    id_education: number,
    school?: string,
    start?: Date,
    end?: Date
  ): Promise<void> {
    const updateData: Partial<InferInsertModel<typeof userEducationsTable>> = {
      school: school,
      start: start?.toISOString(),
      end: end?.toISOString(),
      created_at: undefined,
      modified_at: new Date().toISOString(),
    };

    await db
      .update(userEducationsTable)
      .set(updateData)
      .where(
        and(
          eq(userEducationsTable.id_user, id_candidate),
          eq(userEducationsTable.id_education, id_education)
        )
      );
  }

  async DeleteEducation(
    id_candidate: number,
    id_education: number
  ): Promise<void> {
    await db
      .delete(userEducationsTable)
      .where(
        and(
          eq(userEducationsTable.id_user, id_candidate),
          eq(userEducationsTable.id_education, id_education)
        )
      );
  }

  async getCandidateSkills(id_candidate: number): Promise<{
    skills: { id: number; name: string; type: string; category: string }[];
  }> {
    // Get the user's skills from their experiences and projects
    const userSkillsProjects = await db
      .selectDistinct({
        id: skillsTable.id,
        name: skillsTable.name,
        type: skillsTable.type,
        category: skillsTable.category,
      })
      .from(projectsTable)
      .where(eq(projectsTable.id_user, id_candidate))
      .innerJoin(
        projectsSkillsTable,
        eq(projectsSkillsTable.id_project, projectsTable.id)
      )
      .innerJoin(skillsTable, eq(skillsTable.id, projectsSkillsTable.id_skill))
      .groupBy(
        skillsTable.id,
        skillsTable.name,
        skillsTable.type,
        skillsTable.category
      );

    const userSkillsExperiences = await db
      .selectDistinct({
        id: skillsTable.id,
        name: skillsTable.name,
        type: skillsTable.type,
        category: skillsTable.category,
      })
      .from(userExperiencesTable)
      .where(eq(userExperiencesTable.id_user, id_candidate))
      .innerJoin(
        experiencesTable,
        eq(experiencesTable.id, userExperiencesTable.id_experience)
      )
      .innerJoin(
        experienceSkillsTable,
        eq(experienceSkillsTable.id_experience, experiencesTable.id)
      )
      .innerJoin(
        skillsTable,
        eq(skillsTable.id, experienceSkillsTable.id_skill)
      )
      .groupBy(
        skillsTable.id,
        skillsTable.name,
        skillsTable.type,
        skillsTable.category
      );

    // Join the two lists of skills
    const userSkills = userSkillsProjects.concat(userSkillsExperiences);

    return { skills: userSkills };
  }

  async getCandidateLanguages(
    id_candidate: number
  ): Promise<{ languages: { id: number; name: string; level: string }[] }> {
    return {
      languages: (
        await db
          .select({
            id: usersLanguagesTable.id_language,
            name: languagesTable.name,
            level: usersLanguagesTable.level,
          })
          .from(usersLanguagesTable)
          .where(eq(usersLanguagesTable.id_user, id_candidate))
          .innerJoin(
            languagesTable,
            eq(languagesTable.id, usersLanguagesTable.id_language)
          )
      ).map((language) => ({
        id: language.id as number,
        name: language.name as string,
        level: language.level as string,
      })),
    };
  }

  async getCandidateHobbies(
    id_candidate: number
  ): Promise<{ hobbies: { name: string }[] }> {
    return {
      hobbies: (
        await db
          .select({
            name: userHobbiesTable.name,
          })
          .from(userHobbiesTable)
          .where(eq(userHobbiesTable.id_user, id_candidate))
      ).map((hobby) => ({
        name: hobby.name as string,
      })),
    };
  }

  async addCandidateExperience(
    id_candidate: number,
    id_experience: number,
    description: string,
    start: Date,
    end: Date
  ): Promise<{
    experience: { id: number; name: string };
    id_user: number;
    description: string;
    start: Date;
    end: Date;
    created_at: Date;
    modified_at: Date;
  }> {
    const newUserExperience = await db
      .insert(userExperiencesTable)
      .values({
        id_experience: id_experience,
        id_user: id_candidate,
        description: description,
        start: start.toISOString(),
        end: end.toISOString(),
        created_at: new Date().toISOString(),
        modified_at: new Date().toISOString(),
      })
      .returning();

    // Get information about the experience
    const experience = await db
      .select()
      .from(experiencesTable)
      .where(eq(experiencesTable.id, id_experience));

    return {
      experience: experience[0],
      id_user: newUserExperience[0].id_user as number,
      description: newUserExperience[0].description!,
      start: new Date(newUserExperience[0].start!),
      end: new Date(newUserExperience[0].end!),
      created_at: new Date(newUserExperience[0].created_at),
      modified_at: new Date(newUserExperience[0].modified_at),
    };
  }

  async getCandidateExperienceById(
    id_candidate: number,
    id_experience: number
  ): Promise<{
    id: number;
    name: string;
    description: string;
    start: Date;
    end: Date;
    created_at: Date;
    modified_at: Date;
  }> {
    const experience = (
      await db
        .select({
          id: experiencesTable.id,
          name: experiencesTable.name,
          description: userExperiencesTable.description,
          start: userExperiencesTable.start,
          end: userExperiencesTable.end,
          created_at: userExperiencesTable.created_at,
          modified_at: userExperiencesTable.modified_at,
        })
        .from(userExperiencesTable)
        .where(
          and(
            eq(userExperiencesTable.id_user, id_candidate),
            eq(userExperiencesTable.id_experience, id_experience)
          )
        )
        .innerJoin(
          experiencesTable,
          eq(experiencesTable.id, userExperiencesTable.id_experience)
        )
    )[0];

    return {
      id: experience.id,
      name: experience.name,
      description: experience.description ?? "",
      start: experience.start ? new Date(experience.start) : new Date(), // FIXME: Should throw an error
      end: experience.end ? new Date(experience.end) : new Date(), // FIXME: Should throw an error
      created_at: new Date(experience.created_at),
      modified_at: new Date(experience.modified_at),
    };
  }

  async getCandidateExperiences(id_candidate: number): Promise<{
    experiences: {
      id: number;
      name: string;
      description: string;
      start: Date;
      end: Date;
      created_at: Date;
      modified_at: Date;
    }[];
  }> {
    // FIXME: NOT WORKING FOR SOME UNKNOWN REASON

    const experiences = await db
      .select()
      .from(userExperiencesTable)
      .where(eq(userExperiencesTable.id_user, id_candidate))
      .innerJoin(
        experiencesTable,
        eq(experiencesTable.id, userExperiencesTable.id_experience)
      );

    const experiencesMap = experiences.map((experience) => ({
      id: experience.experiences.id,
      name: experience.experiences.name,
      description: experience.userExperiences.description ?? "",
      start: experience.userExperiences.start
        ? new Date(experience.userExperiences.start)
        : new Date(),
      end: experience.userExperiences.end
        ? new Date(experience.userExperiences.end)
        : new Date(),
      created_at: new Date(experience.userExperiences.created_at),
      modified_at: new Date(experience.userExperiences.modified_at),
    }));

    return {
      experiences: experiencesMap,
    };
  }

  async deleteCandidateExperience(
    id_candidate: number,
    id_experience: number
  ): Promise<void> {
    await db
      .delete(userExperiencesTable)
      .where(
        and(
          eq(userExperiencesTable.id_user, id_candidate),
          eq(userExperiencesTable.id_experience, id_experience)
        )
      );
  }
}
