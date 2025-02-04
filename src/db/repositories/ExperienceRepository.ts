import { db } from "..";
import {
  experienceSkillsTable,
  experiencesTable,
  skillsTable,
} from "../schema";
import IExperienceRepository from "./IExperienceRepository";
import { eq } from "drizzle-orm";

/**
 * A repository for experiences
 */
export default class ExperienceRepository implements IExperienceRepository {
  async createExperience(
    name: string,
    skills?: number[]
  ): Promise<{
    id: number;
    name: string;
    skills: {
      id: number;
      name: string;
      type: string;
      category: string;
      created_at: Date;
      modified_at: Date;
    }[];
  }> {
    // Insert the experience
    const experience = (
      await db.insert(experiencesTable).values({ name }).returning()
    )[0];

    // Insert the skills
    console.log(skills);
    if (skills) {
      console.log("Inserting skills...");
      await db.insert(experienceSkillsTable).values(
        skills.map((skill) => ({
          id_experience: experience.id,
          id_skill: skill,
          created_at: new Date().toISOString(),
          modified_at: new Date().toISOString(),
        }))
      );
    }

    // Get the new experience
    const experienceWithSkills = await db
      .select({
        id: experiencesTable.id,
        name: experiencesTable.name,
        skill_id: experienceSkillsTable.id_skill,
        skill_name: skillsTable.name,
        skill_type: skillsTable.type,
        skill_category: skillsTable.category,
        skill_created_at: experienceSkillsTable.created_at,
        skill_modified_at: experienceSkillsTable.modified_at,
      })
      .from(experiencesTable)
      .where(eq(experiencesTable.id, experience.id))
      .leftJoin(
        experienceSkillsTable,
        eq(experienceSkillsTable.id_experience, experience.id)
      )
      .leftJoin(
        skillsTable,
        eq(skillsTable.id, experienceSkillsTable.id_skill)
      );

    const experienceResult = {
      id: experienceWithSkills[0].id,
      name: experienceWithSkills[0].name,
      skills: experienceWithSkills.map((skill) => ({
        id: skill.skill_id!,
        name: skill.skill_name!,
        type: skill.skill_type!,
        category: skill.skill_category!,
        created_at: new Date(skill.skill_created_at!),
        modified_at: new Date(skill.skill_modified_at!),
      })),
    };

    return experienceResult;
  }

  async updateExperience(
    id: number,
    name?: string,
    skills?: number[]
  ): Promise<{
    id: number;
    name: string;
    skills: {
      id: number;
      name: string;
      type: string;
      category: string;
      created_at: Date;
      modified_at: Date;
    }[];
  }> {
    // Update the experience name
    const experience = (
      await db
        .update(experiencesTable)
        .set({ name })
        .where(eq(experiencesTable.id, id))
        .returning()
    )[0];

    // Update the skills
    if (skills) {
      await db
        .delete(experienceSkillsTable)
        .where(eq(experienceSkillsTable.id_experience, id));
      await db.insert(experienceSkillsTable).values(
        skills.map((skill) => ({
          id_experience: id,
          id_skill: skill,
          created_at: new Date().toISOString(),
          modified_at: new Date().toISOString(),
        }))
      );
    }

    // Get the updated experience skills
    const experienceSkills = await db
      .select({
        id: experienceSkillsTable.id_skill,
        name: skillsTable.name,
        type: skillsTable.type,
        category: skillsTable.category,
        created_at: experienceSkillsTable.created_at,
        modified_at: experienceSkillsTable.modified_at,
      })
      .from(experienceSkillsTable)
      .where(eq(experienceSkillsTable.id_experience, experience.id))
      .leftJoin(
        skillsTable,
        eq(skillsTable.id, experienceSkillsTable.id_skill)
      );

    const experienceResult = {
      id: experience.id,
      name: experience.name,
      skills: experienceSkills.map((skill) => ({
        id: skill.id!,
        name: skill.name!,
        type: skill.type!,
        category: skill.category!,
        created_at: new Date(skill.created_at!),
        modified_at: new Date(skill.modified_at!),
      })),
    };

    return experienceResult;
  }

  async deleteExperience(id: number): Promise<void> {
    // Delete the experience skills
    await db
      .delete(experienceSkillsTable)
      .where(eq(experienceSkillsTable.id_experience, id));

    // Delete the experience
    await db.delete(experiencesTable).where(eq(experiencesTable.id, id));
  }

  async getExperienceById(id: number): Promise<{
    id: number;
    name: string;
    skills: {
      id: number;
      name: string;
      type: string;
      category: string;
      created_at: Date;
      modified_at: Date;
    }[];
  }> {
    const experienceWithSkills = await db
      .select({
        id: experiencesTable.id,
        name: experiencesTable.name,
        skill_id: experienceSkillsTable.id_skill,
        skill_name: skillsTable.name,
        skill_type: skillsTable.type,
        skill_category: skillsTable.category,
        skill_created_at: experienceSkillsTable.created_at,
        skill_modified_at: experienceSkillsTable.modified_at,
      })
      .from(experiencesTable)
      .where(eq(experiencesTable.id, id))
      .leftJoin(
        experienceSkillsTable,
        eq(experienceSkillsTable.id_experience, id)
      )
      .leftJoin(
        skillsTable,
        eq(skillsTable.id, experienceSkillsTable.id_skill)
      );

    const experienceResult = {
      id: experienceWithSkills[0].id,
      name: experienceWithSkills[0].name,
      skills: experienceWithSkills.map((skill) => ({
        id: skill.skill_id!,
        name: skill.skill_name!,
        type: skill.skill_type!,
        category: skill.skill_category!,
        created_at: new Date(skill.skill_created_at!),
        modified_at: new Date(skill.skill_modified_at!),
      })),
    };

    return experienceResult;
  }

  async getAllExperiences(): Promise<{
    experiences: {
      id: number;
      name: string;
      skills: {
        id: number;
        name: string;
        type: string;
        category: string;
        created_at: Date;
        modified_at: Date;
      }[];
    }[];
  }> {
    const experiences = await db
      .select({
        id: experiencesTable.id,
        name: experiencesTable.name,
        skill_id: experienceSkillsTable.id_skill,
        skill_name: skillsTable.name,
        skill_type: skillsTable.type,
        skill_category: skillsTable.category,
        skill_created_at: experienceSkillsTable.created_at,
        skill_modified_at: experienceSkillsTable.modified_at,
      })
      .from(experiencesTable)
      .leftJoin(
        experienceSkillsTable,
        eq(experienceSkillsTable.id_experience, experiencesTable.id)
      )
      .leftJoin(
        skillsTable,
        eq(skillsTable.id, experienceSkillsTable.id_skill)
      );

    const experienceMap = new Map<
      number,
      {
        id: number;
        name: string;
        skills: {
          id: number;
          name: string;
          type: string;
          category: string;
          created_at: Date;
          modified_at: Date;
        }[];
      }
    >();

    experiences.forEach((experience) => {
      if (!experienceMap.has(experience.id)) {
        experienceMap.set(experience.id, {
          id: experience.id,
          name: experience.name,
          skills: [],
        });
      }
      if (experience.skill_id) {
        experienceMap.get(experience.id)?.skills.push({
          id: experience.skill_id,
          name: experience.skill_name!,
          type: experience.skill_type!,
          category: experience.skill_category!,
          created_at: new Date(experience.skill_created_at!),
          modified_at: new Date(experience.skill_modified_at!),
        });
      }
    });

    return { experiences: Array.from(experienceMap.values()) };
  }
}
