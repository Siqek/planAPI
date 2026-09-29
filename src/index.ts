import express from "express";
import cors from "cors";

import * as dotenv from "dotenv";
dotenv.config();

import { getDb, insertLessonsBulk } from "./lib/db";

import Database from "better-sqlite3";
import { parseAllClasses } from "./lib/scraper/internal/parseAllClasses";

// controllers
import { countLessonsByTeacherAndSubject } from "./controllers/lessons/count";
import { findLessons } from "./controllers/lessons/find";

async function main() {
    // inits DB
    getDb();

    await fillDbIfEmpty();

    const app = express();
    app.use(cors())
    app.use(express.json());

    app.get("/health", (_req, res) => res.json({ ok: true }));

    app.get("/lessons/count/:class", countLessonsByTeacherAndSubject);

    app.get("/lessons/find", findLessons);

    const port = Number(process.env.PORT) || 3000;
    app.listen(port, () => console.log(`Listening on ${port}`));
}

main().catch((err) => {
  console.error("Startup failed: ", err);
  process.exit(1);
});

async function fillDbIfEmpty() {
    const db: Database.Database = getDb();

    const result = db
        .prepare(`SELECT COUNT(*) AS count FROM lessons WHERE id IS NOT NULL`)
        .get() as { count: number };

    if (result.count > 0) {
        return;
    }

    const lessons = await parseAllClasses();
    insertLessonsBulk(db, lessons);
}
