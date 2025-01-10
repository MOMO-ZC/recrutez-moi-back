import {
  pgTable,
  varchar,
  date,
  integer,
  primaryKey,
} from "drizzle-orm/pg-core";

/* COMPANIES */
export const companiesTable = pgTable("companies", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  created_at: date().notNull(),
  modified_at: date().notNull(),
});

/* USERS */
export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  email: varchar({ length: 255 }).notNull().unique(),
  firstname: varchar({ length: 255 }).notNull(),
  lastname: varchar({ length: 255 }).notNull(),
  phone: varchar({ length: 255 }),
  password: varchar({ length: 255 }).notNull(),
  address: varchar({ length: 255 }),
  birthdate: date({ mode: "date" }).notNull(),
  created_at: date({ mode: "date" }).notNull(),
  modified_at: date({ mode: "date" }).notNull(),
});

/* HOBBIES */
export const hobbiesTable = pgTable("hobbies", {
  name: varchar({ length: 255 }).primaryKey(),
});

/* USER_HOBBIES */
export const userHobbiesTable = pgTable(
  "user_hobbies",
  {
    id_user: integer().references(() => usersTable.id),
    id_hobby: varchar({ length: 255 }).references(() => hobbiesTable.name),
  },
  (table) => {
    return [
      {
        pk: primaryKey({ columns: [table.id_user, table.id_hobby] }),
      },
    ];
  }
);

/* LINKS */
export const linksTable = pgTable("links", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  id_user: integer().references(() => usersTable.id),
  name: varchar({ length: 255 }),
  url: varchar({ length: 255 }),
});

/* SKILLS */
export const skillsTable = pgTable("skills", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }),
  type: varchar({ length: 255 }).notNull(), // soft, hard
  category: varchar({ length: 255 }).notNull(), // programming language, tool, ...
  created_at: date().notNull(),
  modified_at: date().notNull(),
});

/* PROJECT TYPES */
export const projectTypesTable = pgTable("project_types", {
  name: varchar({ length: 255 }).primaryKey(),
});

/* PROJETCS */
export const projectsTable = pgTable("projects", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  id_user: integer()
    .notNull()
    .references(() => usersTable.id),
  name: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 2500 }).notNull(),
  type: varchar({ length: 255 })
    .notNull()
    .references(() => projectTypesTable.name),
  created_at: date().notNull(),
  modified_at: date().notNull(),
});

/* PROJECTS_SKILLS */
export const projectsSkillsTable = pgTable("projects_skills", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  id_projet: integer()
    .notNull()
    .references(() => projectsTable.id),
  id_skill: integer()
    .notNull()
    .references(() => skillsTable.id),
  created_at: date().notNull(),
  modified_at: date().notNull(),
});

/* EDUCATION */
export const educationTable = pgTable("education", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  id_user: integer().references(() => usersTable.id),
  school: varchar({ length: 255 }),
  domain: varchar({ length: 255 }).notNull(),
  diploma: varchar({ length: 255 }).notNull(),
  start: date(),
  end: date(),
  created_at: date().notNull(),
  modified_at: date().notNull(),
});

/* EXPERIENCES */
export const experiencesTable = pgTable("experiences", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  id_user: integer().references(() => usersTable.id),
  name: varchar({ length: 255 }),
  description: varchar({ length: 2500 }),
  start: date(),
  end: date(),
  created_at: date().notNull(),
  modified_at: date().notNull(),
});

/* EXPERIENCE_SKILLS */
export const experienceSkillsTable = pgTable("experience_skills", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  id_experience: integer().references(() => experiencesTable.id),
  id_skill: integer().references(() => skillsTable.id),
  created_at: date().notNull(),
  modified_at: date().notNull(),
});

/* JOB_OFFERS */
export const jobOffersTable = pgTable("job_offers", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  id_entreprise: integer().references(() => companiesTable.id),
  title: varchar({ length: 255 }),
  body: varchar({ length: 10000 }),
  salary: integer(),
  address: varchar({ length: 255 }),
  status: varchar({ length: 255 }),
  created_at: date().notNull(),
  modified_at: date().notNull(),
});

/* JOB_OFFER_SKILLS */
export const jobOfferSkillsTable = pgTable("job_offer_skills", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  id_skill: integer().references(() => skillsTable.id),
  id_job_offer: integer().references(() => jobOffersTable.id),
  created_at: date().notNull(),
  modified_at: date().notNull(),
});

/* JOB_OFFER_EDUCATION */
export const jobOfferEducationTable = pgTable(
  "job_offer_education",
  {
    id_education: integer().references(() => educationTable.id),
    id_job_offer: integer().references(() => jobOffersTable.id),
  },
  (table) => {
    return [
      {
        pk: primaryKey({ columns: [table.id_education, table.id_job_offer] }),
      },
    ];
  }
);

/* JOB_OFFER_EXPERIENCES */
export const jobOfferExperiencesTable = pgTable(
  "job_offer_experiences",
  {
    id_experience: integer().references(() => experiencesTable.id),
    id_job_offer: integer().references(() => jobOffersTable.id),
  },
  (table) => {
    return [
      {
        pk: primaryKey({ columns: [table.id_experience, table.id_job_offer] }),
      },
    ];
  }
);

/* LANGUAGES */
export const languagesTable = pgTable("languages", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }),
});

/* JOB_OFFER_LANGUAGES */
export const jobOfferLanguagesTable = pgTable("job_offer_languages", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  id_language: integer().references(() => languagesTable.id),
  id_job_offer: integer().references(() => jobOffersTable.id),
});

/* USERS_LANGUAGES */
export const usersLanguagesTable = pgTable("users_languages", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  id_language: integer().references(() => languagesTable.id),
  id_user: integer().references(() => usersTable.id),
  created_at: date().notNull(),
});

/* JOB APPLICATIONS */
export const applicationsTable = pgTable("applications", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  id_user: integer().references(() => usersTable.id),
  id_job_offer: integer().references(() => jobOffersTable.id),
  status: varchar({ length: 255 }),
  created_at: date().notNull(),
  modified_at: date().notNull(),
});
