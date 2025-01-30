import { db } from "..";
import {
  experienceSkillsTable,
  jobOfferSkillsTable,
  projectsSkillsTable,
  skillsTable,
} from "../schema";
import ISkillRepository from "./ISkillRepository";
import { eq } from "drizzle-orm";

/**
 * Skill repository class.
 */
export default class SkillRepository implements ISkillRepository {
  async createSkill(
    name: string,
    type: "Softskill" | "Hardskill",
    category: string
  ): Promise<{ id: number; name: string; type: string; category: string }> {
    return (
      await db.insert(skillsTable).values({ name, type, category }).returning()
    )[0];
  }

  async getById(id: number): Promise<{
    id: number;
    name: string;
    type: string;
    category: string;
  } | null> {
    return (
      await db.select().from(skillsTable).where(eq(skillsTable.id, id))
    )[0];
  }

  async getByName(name: string): Promise<{
    id: number;
    name: string;
    type: string;
    category: string;
  } | null> {
    return (
      await db.select().from(skillsTable).where(eq(skillsTable.name, name))
    )[0];
  }

  async getByType(type: "Softskill" | "Hardskill"): Promise<
    {
      id: number;
      name: string;
      type: "Softskill" | "Hardskill";
      category: string;
    }[]
  > {
    return (await db
      .select()
      .from(skillsTable)
      .where(eq(skillsTable.type, type))) as {
      id: number;
      name: string;
      type: "Softskill" | "Hardskill";
      category: string;
    }[];
  }

  async getByCategory(category: string): Promise<
    {
      id: number;
      name: string;
      type: "Softskill" | "Hardskill";
      category: string;
    }[]
  > {
    return (await db
      .select()
      .from(skillsTable)
      .where(eq(skillsTable.category, category))) as {
      id: number;
      name: string;
      type: "Softskill" | "Hardskill";
      category: string;
    }[];
  }

  async getAll(): Promise<
    { id: number; name: string; type: string; category: string }[]
  > {
    return await db.select().from(skillsTable);
  }

  async getAllTypes(): Promise<string[]> {
    return (
      await db.selectDistinct({ type: skillsTable.type }).from(skillsTable)
    ).map((skill) => skill.type);
  }

  async getAllCategories(): Promise<string[]> {
    return (
      await db
        .selectDistinct({ category: skillsTable.category })
        .from(skillsTable)
    ).map((skill) => skill.category);
  }

  async updateSkill(
    id: number,
    name?: string,
    type?: "Softskill" | "Hardskill",
    category?: string
  ): Promise<{ id: number; name: string; type: string; category: string }> {
    return (
      await db
        .update(skillsTable)
        .set({
          name,
          type,
          category,
        })
        .where(eq(skillsTable.id, id))
        .returning()
    )[0];
  }

  async deleteSkill(id: number): Promise<void> {
    // Delete all references to the skill
    await db
      .delete(projectsSkillsTable)
      .where(eq(projectsSkillsTable.id_skill, id));
    await db
      .delete(jobOfferSkillsTable)
      .where(eq(jobOfferSkillsTable.id_skill, id));
    await db
      .delete(experienceSkillsTable)
      .where(eq(experienceSkillsTable.id_skill, id));

    // Delete the skill itself
    await db.delete(skillsTable).where(eq(skillsTable.id, id));
  }
}
