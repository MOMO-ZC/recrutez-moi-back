import { pgTable, varchar, date, integer } from "drizzle-orm/pg-core";

/* ENTREPRISES */
export const entreprisesTable = pgTable("entreprises", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  following_user_id: integer(),
  followed_user_id: integer(),
  created_at: date().notNull(),
  modified_at: date().notNull(),
});

/* USERS */
export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  email: varchar({ length: 255 }).notNull(),
  firstname: varchar({ length: 255 }).notNull(),
  lastname: varchar({ length: 255 }).notNull(),
  phone: varchar({ length: 255 }),
  password: varchar({ length: 255 }).notNull(),
  birthdate: date({ mode: "date" }),
  created_at: date({ mode: "date" }).notNull(),
  modified_at: date({ mode: "date" }).notNull(),
});

/* SKILLS */
export const skillsTable = pgTable("skills", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }),
  created_at: date().notNull(),
  modified_at: date().notNull(),
});

/* PROJETS */
export const projetsTable = pgTable("projets", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  id_user: integer()
    .notNull()
    .references(() => usersTable.id),
  name: varchar({ length: 255 }).notNull(),
  description: varchar({ length: 2500 }).notNull(),
  created_at: date().notNull(),
  modified_at: date().notNull(),
});

/* PROJETS_SKILLS */
export const projetsSkillsTable = pgTable("projets_skills", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  id_projet: integer()
    .notNull()
    .references(() => projetsTable.id),
  id_skill: integer()
    .notNull()
    .references(() => skillsTable.id),
  created_at: date().notNull(),
  modified_at: date().notNull(),
});

/* FORMATIONS */
export const formationsTable = pgTable("formations", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  id_user: integer().references(() => usersTable.id),
  school: varchar({ length: 255 }),
  domain: varchar({ length: 255 }),
  diploma: varchar({ length: 255 }),
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

/* EXPERIENCES_SKILLS */
export const experiencesSkillsTable = pgTable("experiences_skills", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  id_experience: integer().references(() => experiencesTable.id),
  id_skill: integer().references(() => skillsTable.id),
  created_at: date().notNull(),
  modified_at: date().notNull(),
});

/* JOB_OFFERS */
export const jobOffersTable = pgTable("job_offers", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  id_entreprise: integer().references(() => entreprisesTable.id),
  title: varchar({ length: 255 }),
  body: varchar({ length: 10000 }),
  salary: integer(),
  remote: varchar({ length: 255 }),
  status: varchar({ length: 255 }),
  created_at: date().notNull(),
  modified_at: date().notNull(),
});

/* JOB_OFFERS_SKILLS */
export const jobOffersSkillsTable = pgTable("job_offers_skills", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  id_skill: integer().references(() => skillsTable.id),
  id_job_offer: integer().references(() => jobOffersTable.id),
  created_at: date().notNull(),
  modified_at: date().notNull(),
});

/* LANGUAGES */
export const languagesTable = pgTable("languages", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }),
  created_at: date().notNull(),
  modified_at: date().notNull(),
});

/* JOB_OFFERS_LANGUAGES */
export const jobOffersLanguagesTable = pgTable("job_offers_languages", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  id_language: integer().references(() => languagesTable.id),
  id_job_offer: integer().references(() => jobOffersTable.id),
  created_at: date().notNull(),
  modified_at: date().notNull(),
});

/* USERS_LANGUAGES */
export const usersLanguagesTable = pgTable("users_languages", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  id_language: integer().references(() => languagesTable.id),
  id_user: integer().references(() => usersTable.id),
  created_at: date().notNull(),
  modified_at: date().notNull(),
});

/* FAVORIS */
export const favorisTable = pgTable("favoris", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  id_user: integer().references(() => usersTable.id),
  id_job_offer: integer().references(() => jobOffersTable.id),
  created_at: date().notNull(),
  modified_at: date().notNull(),
});

/* POSTULATIONS */
export const postulationsTable = pgTable("postulations", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  id_user: integer().references(() => usersTable.id),
  id_post: integer().references(() => jobOffersTable.id),
  status: varchar({ length: 255 }),
  created_at: date().notNull(),
  modified_at: date().notNull(),
});
