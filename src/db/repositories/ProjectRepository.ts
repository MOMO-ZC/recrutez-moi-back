import { db } from "..";
import {
  projectsSkillsTable,
  projectsTable,
  projectTypesTable,
  skillsTable,
} from "../schema";
import IProjectRepository from "./IProjectRepository";
import { eq } from "drizzle-orm";

export default class ProjectRepository implements IProjectRepository {
  async create(
    project: Omit<
      {
        created_at: string;
        modified_at: string;
        name: string;
        id_user: number;
        description: string;
        type: string;
      },
      "created_at" | "modified_at"
    > & { skills: number[] }
  ): Promise<{
    id: number;
    created_at: string;
    modified_at: string;
    name: string;
    id_user: number;
    description: string;
    type: string;
    skills: {
      id: number;
      name: string;
      type: string;
      category: string;
      created_at: Date;
    }[];
  }> {
    const projectInsert = {
      ...project,
      created_at: new Date().toISOString(),
      modified_at: new Date().toISOString(),
    };

    const projectResult = (
      await db.insert(projectsTable).values(projectInsert).returning()
    )[0];

    if (project.skills.length > 0)
      await db.insert(projectsSkillsTable).values(
        project.skills.map((skill) => ({
          id_project: projectResult.id,
          id_skill: skill,
          created_at: new Date().toISOString(),
          modified_at: new Date().toISOString(),
        }))
      );

    // Retrieve the skills
    const skills = await db
      .select({
        id: skillsTable.id,
        name: skillsTable.name,
        type: skillsTable.type,
        category: skillsTable.category,
        created_at: projectsSkillsTable.created_at,
      })
      .from(projectsSkillsTable)
      .where(eq(projectsSkillsTable.id_project, projectResult.id))
      .innerJoin(skillsTable, eq(projectsSkillsTable.id_skill, skillsTable.id));

    const skillsWithDate = skills.map((skill) => ({
      ...skill,
      created_at: new Date(skill.created_at),
    }));

    return { ...projectResult, skills: skillsWithDate };
  }

  async findById(id: number): Promise<
    | ({
        id: number;
        created_at: string;
        modified_at: string;
        name: string;
        id_user: number;
        description: string;
        type: string;
      } & {
        skills: {
          id: number;
          name: string;
          type: string;
          category: string;
          created_at: Date;
        }[];
      })
    | null
  > {
    const project = (
      await db.select().from(projectsTable).where(eq(projectsTable.id, id))
    )[0];

    if (!project) return null;

    const skills = await db
      .select({
        id: skillsTable.id,
        name: skillsTable.name,
        type: skillsTable.type,
        category: skillsTable.category,
        created_at: projectsSkillsTable.created_at,
      })
      .from(projectsSkillsTable)
      .where(eq(projectsSkillsTable.id_project, id))
      .innerJoin(skillsTable, eq(projectsSkillsTable.id_skill, skillsTable.id));

    const skillsWithDate = skills.map((skill) => ({
      ...skill,
      created_at: new Date(skill.created_at),
    }));

    return {
      ...project,
      skills: skillsWithDate,
    };
  }

  async findAll(): Promise<
    {
      id: number;
      created_at: string;
      modified_at: string;
      name: string;
      id_user: number;
      description: string;
      type: string;
      skills: {
        id: number;
        name: string;
        type: string;
        category: string;
        created_at: Date;
      }[];
    }[]
  > {
    const projects = await db.select().from(projectsTable);

    const projectsWithSkills = await Promise.all(
      projects.map(async (project) => {
        const skills = await db
          .select({
            id: skillsTable.id,
            name: skillsTable.name,
            type: skillsTable.type,
            category: skillsTable.category,
            created_at: projectsSkillsTable.created_at,
          })
          .from(projectsSkillsTable)
          .where(eq(projectsSkillsTable.id_project, project.id))
          .innerJoin(
            skillsTable,
            eq(projectsSkillsTable.id_skill, skillsTable.id)
          );

        const skillsWithDate = skills.map((skill) => ({
          ...skill,
          created_at: new Date(skill.created_at),
        }));

        return {
          ...project,
          skills: skillsWithDate,
        };
      })
    );

    return projectsWithSkills;
  }

  async findForUser(id_user: number): Promise<{
    projects: {
      id: number;
      id_user: number;
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
  }> {
    const projects = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.id_user, id_user));

    const projectsWithSkills = await Promise.all(
      projects.map(async (project) => {
        const skills = await db
          .select({
            id: skillsTable.id,
            name: skillsTable.name,
            type: skillsTable.type,
            category: skillsTable.category,
            created_at: projectsSkillsTable.created_at,
          })
          .from(projectsSkillsTable)
          .where(eq(projectsSkillsTable.id_project, project.id))
          .innerJoin(
            skillsTable,
            eq(projectsSkillsTable.id_skill, skillsTable.id)
          );

        const skillsWithDate = skills.map((skill) => ({
          ...skill,
          created_at: new Date(skill.created_at),
        }));

        return {
          ...project,
          created_at: new Date(project.created_at),
          modified_at: new Date(project.modified_at),
          skills: skillsWithDate,
        };
      })
    );

    return { projects: projectsWithSkills };
  }

  async update(
    id: number,
    project: Partial<
      Omit<
        {
          id: number;
          created_at: string;
          modified_at: string;
          name: string;
          id_user: number;
          description: string;
          type: string;
        },
        "id" | "created_at" | "modified_at"
      > & { skills: number[] }
    >
  ): Promise<
    | ({
        id: number;
        created_at: string;
        modified_at: string;
        name: string;
        id_user: number;
        description: string;
        type: string;
      } & {
        skills: {
          id: number;
          name: string;
          type: string;
          category: string;
          created_at: Date;
        }[];
      })
    | null
  > {
    const projectUpdate = {
      ...project,
      modified_at: new Date().toISOString(),
      id: undefined,
      id_user: undefined,
    };

    const projectResult = (
      await db
        .update(projectsTable)
        .set(projectUpdate)
        .where(eq(projectsTable.id, id))
        .returning()
    )[0];

    if (!projectResult) return null;

    if (project.skills && project.skills.length > 0) {
      await db
        .delete(projectsSkillsTable)
        .where(eq(projectsSkillsTable.id_project, id));
      await db.insert(projectsSkillsTable).values(
        project.skills.map((skill) => ({
          id_project: id,
          id_skill: skill,
          created_at: new Date().toISOString(),
          modified_at: new Date().toISOString(),
        }))
      );
    }

    const skills = await db
      .select({
        id: skillsTable.id,
        name: skillsTable.name,
        type: skillsTable.type,
        category: skillsTable.category,
        created_at: projectsSkillsTable.created_at,
      })
      .from(projectsSkillsTable)
      .where(eq(projectsSkillsTable.id_project, id))
      .innerJoin(skillsTable, eq(projectsSkillsTable.id_skill, skillsTable.id));

    const skillsWithDate = skills.map((skill) => ({
      ...skill,
      created_at: new Date(skill.created_at),
    }));

    return {
      ...projectResult,
      skills: skillsWithDate,
    };
  }

  async delete(id: number): Promise<void> {
    await db
      .delete(projectsSkillsTable)
      .where(eq(projectsSkillsTable.id_project, id));

    await db.delete(projectsTable).where(eq(projectsTable.id, id));
  }

  async getAllProjectTypes(): Promise<{ name: string }[]> {
    const projectTypes = await db.select().from(projectTypesTable);
    return projectTypes.map((projectType) => ({
      name: projectType.name,
    }));
  }

  async createProjectType(name: string): Promise<void> {
    await db.insert(projectTypesTable).values({ name });
  }
}
