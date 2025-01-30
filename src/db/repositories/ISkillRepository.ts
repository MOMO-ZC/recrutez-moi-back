import { InferSelectModel } from "drizzle-orm";
import { skillsTable } from "../schema";

type Skill = InferSelectModel<typeof skillsTable>;

/**
 * Interface representing a skill repository.
 */
export default interface ISkillRepository {
  /**
   * Adds a new skill to the database
   * @param name The name of the new skill
   * @param type The type of the new skill (softskill or hardskill)
   * @param category The category of the new skill (programming language, tool, etc.)
   */
  createSkill(
    name: string,
    type: "Softskill" | "Hardskill",
    category: string
  ): Promise<Skill>;

  /**
   * Retrieves a skill by its ID
   * @param id The ID of the skill to retrieve
   */
  getById(id: number): Promise<Skill | null>;

  /**
   * Retrieves a skill by its name
   * @param name The name of the skill to retrieve
   */
  getByName(name: string): Promise<Skill | null>;

  /**
   * Retrieves all skills of a given type
   * @param type The type of the skills to retrieve
   */
  getByType(type: "Softskill" | "Hardskill"): Promise<Skill[]>;

  /**
   * Retrieves all skills of a given category
   * @param category The category of the skills to retrieve
   */
  getByCategory(category: string): Promise<Skill[]>;

  /**
   * Retrieves all skills in the database
   */
  getAll(): Promise<Skill[]>;

  /**
   * Retrieves all types of skills in the database
   */
  getAllTypes(): Promise<string[]>;

  /**
   * Retrieves all categories of skills in the database
   */
  getAllCategories(): Promise<string[]>;

  /**
   *
   * @param id The id of the skill to update
   * @param name The new name of the skill
   * @param type The new type of the skill
   * @param category The new category of the skill
   */
  updateSkill(
    id: number,
    name?: string,
    type?: "Softskill" | "Hardskill",
    category?: string
  ): Promise<{ id: number; name: string; type: string; category: string }>;

  /**
   * Deletes a skill from the database
   * @param id The id of the skill to delete
   */
  deleteSkill(id: number): Promise<void>;
}
