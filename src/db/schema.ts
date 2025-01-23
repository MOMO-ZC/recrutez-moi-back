import {
  pgTable,
  varchar,
  date,
  integer,
  primaryKey,
  pgEnum,
  unique,
} from "drizzle-orm/pg-core";

/* COMPANIES */
export const companiesTable = pgTable("companies", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  created_at: date().notNull(),
  modified_at: date().notNull(),
});

export const userRoleEnum = pgEnum("role", ["candidate", "company"]);

/* USERS */
export const usersTable = pgTable("users", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: varchar({ length: 255 }).notNull(),
  role: userRoleEnum().notNull(),
  created_at: date({ mode: "date" }).notNull(),
  modified_at: date({ mode: "date" }).notNull(),
});

/* COMPANY USER */
export const companyUsersTable = pgTable("company_users", {
  user: integer()
    .primaryKey()
    .references(() => usersTable.id),
  name: varchar({ length: 255 }).notNull(),
  company: integer()
    .references(() => companiesTable.id)
    .notNull(),
});

/* CANDIDATE USER */
export const candidateUsersTable = pgTable("candidate_users", {
  user: integer()
    .primaryKey()
    .references(() => usersTable.id),
  firstname: varchar({ length: 255 }).notNull(),
  lastname: varchar({ length: 255 }).notNull(),
  phone: varchar({ length: 255 }),
  address: varchar({ length: 255 }).notNull(),
  birthdate: date({ mode: "date" }).notNull(),
  lookingForTitle: varchar({ length: 255 }), // name of the job
  lookingForExperience: integer(), // 1: junior, 2: confirmed, 3: senior
});

/* USER_HOBBIES */
export const userHobbiesTable = pgTable(
  "user_hobbies",
  {
    id_user: integer().references(() => usersTable.id),
    name: varchar({ length: 255 }).notNull(),
  },
  (table) => {
    return [
      {
        pk: primaryKey({ columns: [table.id_user, table.name] }),
      },
    ];
  }
);

/* LINKS */
export const linksTable = pgTable("links", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  id_user: integer()
    .references(() => usersTable.id)
    .notNull(),
  name: varchar({ length: 255 }).notNull(),
  url: varchar({ length: 255 }).notNull(),
});

/* SKILLS */
export const skillsTable = pgTable("skills", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
  type: varchar({ length: 255 }).notNull(), // soft, hard
  category: varchar({ length: 255 }).notNull(), // programming language, tool, ...
});

/* PROJECT TYPES */
export const projectTypesTable = pgTable("project_types", {
  name: varchar({ length: 255 }).primaryKey(),
});

/* PROJECTS */
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
export const projectsSkillsTable = pgTable(
  "projects_skills",
  {
    id_project: integer()
      .notNull()
      .references(() => projectsTable.id),
    id_skill: integer()
      .notNull()
      .references(() => skillsTable.id),
    created_at: date().notNull(),
    modified_at: date().notNull(),
  },
  (table) => {
    return [
      {
        pk: primaryKey({ columns: [table.id_project, table.id_skill] }),
      },
    ];
  }
);

/* EDUCATION */
export const educationTable = pgTable("education", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  domain: varchar({ length: 255 }).notNull(),
  diploma: varchar({ length: 255 }).notNull(),
});

/* USER EDUCATION */
export const userEducationTable = pgTable(
  "user_education",
  {
    id_education: integer().references(() => educationTable.id),
    id_user: integer().references(() => usersTable.id),
    school: varchar({ length: 255 }).notNull(),
    start: date(),
    end: date(),
    created_at: date().notNull(),
    modified_at: date().notNull(),
  },
  (table) => {
    return [
      {
        pk: primaryKey({ columns: [table.id_education, table.id_user] }),
      },
    ];
  }
);

/* EXPERIENCES */
export const experiencesTable = pgTable("experiences", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  name: varchar({ length: 255 }).notNull(),
});

/* USER EXPERIENCES */
export const userExperiencesTable = pgTable(
  "userExperiences",
  {
    id_experience: integer().references(() => experiencesTable.id),
    id_user: integer().references(() => usersTable.id),
    description: varchar({ length: 2500 }),
    start: date(),
    end: date(),
    created_at: date().notNull(),
    modified_at: date().notNull(),
  },
  (table) => {
    return [
      {
        pk: primaryKey({ columns: [table.id_experience, table.id_user] }),
      },
    ];
  }
);

/* EXPERIENCE_SKILLS */
export const experienceSkillsTable = pgTable(
  "experience_skills",
  {
    id_experience: integer().references(() => experiencesTable.id),
    id_skill: integer().references(() => skillsTable.id),
    created_at: date().notNull(),
    modified_at: date().notNull(),
  },
  (table) => {
    return [
      {
        pk: primaryKey({ columns: [table.id_experience, table.id_skill] }),
      },
    ];
  }
);

/* JOB_OFFERS */
export const jobOffersTable = pgTable("job_offers", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  id_company: integer()
    .references(() => companiesTable.id)
    .notNull(),
  title: varchar({ length: 255 }).notNull(),
  body: varchar({ length: 10000 }).notNull(),
  minSalary: integer().notNull(),
  maxSalary: integer().notNull(),
  address: varchar({ length: 255 }).notNull(),
  status: varchar({ length: 255 }).notNull(),
  image: varchar({ length: 2550 }),
  created_at: date().notNull().notNull(),
  modified_at: date().notNull().notNull(),
});

/* JOB_OFFER_SKILLS */
export const jobOfferSkillsTable = pgTable(
  "job_offer_skills",
  {
    id_skill: integer().references(() => skillsTable.id),
    id_job_offer: integer().references(() => jobOffersTable.id),
  },
  (table) => {
    return [
      {
        pk: primaryKey({ columns: [table.id_skill, table.id_job_offer] }),
      },
    ];
  }
);

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
  name: varchar({ length: 255 }).notNull(),
});

/* JOB_OFFER_LANGUAGES */
export const jobOfferLanguagesTable = pgTable(
  "job_offer_languages",
  {
    id_language: integer().references(() => languagesTable.id),
    id_job_offer: integer().references(() => jobOffersTable.id),
    level: varchar({ length: 255 }).notNull(),
  },
  (table) => {
    return [
      {
        pk: primaryKey({ columns: [table.id_language, table.id_job_offer] }),
      },
    ];
  }
);

/* USERS_LANGUAGES */
export const usersLanguagesTable = pgTable(
  "users_languages",
  {
    id_language: integer().references(() => languagesTable.id),
    id_user: integer().references(() => usersTable.id),
    level: varchar({ length: 255 }).notNull(),
  },
  (table) => {
    return [
      {
        pk: primaryKey({ columns: [table.id_language, table.id_user] }),
      },
    ];
  }
);

/* JOB APPLICATIONS */
export const applicationsTable = pgTable(
  "applications",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    id_user: integer()
      .references(() => usersTable.id)
      .notNull(),
    id_job_offer: integer()
      .references(() => jobOffersTable.id)
      .notNull(),
    status: varchar({ length: 255 }).notNull(),
    created_at: date().notNull(),
    modified_at: date().notNull(),
  },
  (table) => {
    return [
      {
        unique: unique("unique_link").on(table.id_user, table.id_job_offer),
      },
    ];
  }
);

/* JOB OFFERS LIKED */
export const usersLikedJobOffersTable = pgTable(
  "users_liked_job_offers",
  {
    id_user: integer()
      .references(() => usersTable.id)
      .notNull(),
    id_job_offer: integer()
      .references(() => jobOffersTable.id)
      .notNull(),
    created_at: date().notNull(),
  },
  (table) => {
    return [
      {
        pk: primaryKey({ columns: [table.id_user, table.id_job_offer] }),
      },
    ];
  }
);
