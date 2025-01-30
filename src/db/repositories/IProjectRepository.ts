import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { projectsTable } from "../schema";

type Project = InferSelectModel<typeof projectsTable>;
type ProjectInsert = InferInsertModel<typeof projectsTable>;

/**
 * Interface for Project Repository
 */
export default interface IProjectRepository {
  /**
   * Create a new project in the database
   * @param project The project to create
   */
  create(
    project: Omit<ProjectInsert, "created_at" | "modified_at"> & {
      skills: number[];
    }
  ): Promise<
    Project & {
      skills: {
        id: number;
        name: string;
        type: string;
        category: string;
        created_at: Date;
      }[];
    }
  >;

  /**
   * Retrieve a project by its id
   * @param id The id of the project to find
   */
  findById(id: number): Promise<
    | (Project & {
        skills: {
          id: number;
          name: string;
          type: string;
          category: string;
          created_at: Date;
        }[];
      })
    | null
  >;

  /**
   * Retrieve all projects
   */
  findAll(): Promise<
    (Project & {
      skills: {
        id: number;
        name: string;
        type: string;
        category: string;
        created_at: Date;
      }[];
    })[]
  >;

  findForUser(id_user: number): Promise<{
    projects: {
      id: number;
      name: string;
      description: string;
      type: string;
      skills: {
        id: number;
        name: string;
        type: string;
        category: string;
        created_at: Date;
      }[];
      created_at: Date;
      modified_at: Date;
    }[];
  }>;

  /**
   * Updates a project in the database
   * @param id The id of the project to update
   * @param project The values to update in the project
   */
  update(
    id: number,
    project: Partial<
      Omit<Project, "id" | "created_at" | "modified_at"> & { skills: number[] }
    >
  ): Promise<
    | (Project & {
        skills: {
          id: number;
          name: string;
          type: string;
          category: string;
          created_at: Date;
        }[];
      })
    | null
  >;

  /**
   * Deletes a project from the database
   * @param id The id of the project to delete
   */
  delete(id: number): Promise<void>;

  /**
   * Retrieve all project types
   */
  getAllProjectTypes(): Promise<{ name: string }[]>;

  /**
   * /!\ WARNING: Shouldn't be used by a user /!\
   *
   * Adds a new project type to the database
   * @param name The name of the project type
   */
  createProjectType(name: string): Promise<void>;
}
