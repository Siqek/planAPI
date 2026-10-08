import * as dotenv from "dotenv";
dotenv.config();

import app from "./app";

import { getDb, insertLessonsBulk, insertRoomsBulk, insertTeachersBulk } from "./lib/db";

import Database from "better-sqlite3";
import { getRooms, getTeachers, parseAllClasses } from "./lib/scraper";

async function main() {
    if (process.env.SCHEDULES_URL === undefined) {
        throw new Error("SCHEDULES_URL is undefined.");
    }

    if (process.env.SCHEDULE_BASE_URL === undefined) {
        throw new Error("SCHEDULE_BASE_URL is undefined.");
    }

    // inits DB
    getDb();

    await fillDbIfEmpty();

    const port = Number(process.env.PORT) || 3000;
    app.listen(port, () => console.log(`Listening on ${port}`));
}

main().catch((err) => {
    console.error("Startup failed: ", err);
    process.exit(1);
});

async function fillDbIfEmpty() {
    const db: Database.Database = getDb();

    const { count: lessonCount } = db
        .prepare(`SELECT COUNT(*) AS count FROM lessons WHERE id IS NOT NULL`)
        .get() as { count: number };

    if (lessonCount === 0) {
        console.log(
            `[INFO] No lessons found in the database. Populating the 'lessons' table...`
        );

        const lessons = await parseAllClasses();
        insertLessonsBulk(db, lessons);
    }

    const { count: teacherCount } = db
        .prepare(`SELECT COUNT(*) AS count FROM teachers WHERE id IS NOT NULL`)
        .get() as { count: number };

    if (teacherCount === 0) {
        console.log(
            `[INFO] No teachers found in the database. Populating the 'teachers' table...`
        );

        const teachers = await getTeachers();
        insertTeachersBulk(db, teachers);
    }

    const { count: roomCount } = db
        .prepare(`SELECT COUNT(*) AS count FROM rooms WHERE short_name IS NOT NULL`)
        .get() as { count: number };

    if (roomCount === 0) {
        console.log(
            `[INFO] No rooms found in the database. Populating the 'rooms' table...`
        );

        const rooms = await getRooms();
        insertRoomsBulk(db, rooms);
    }
}
