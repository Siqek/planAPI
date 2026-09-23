import Database from "better-sqlite3";
import { Lesson } from "../types";

export function replaceAllLessons(db: Database.Database, lessons: Lesson[]) {
    const insertStmt = db.prepare(`
        INSERT INTO lessons (day, hour, teacher, room, class, subject, raw_text, is_parsed)
        VALUES (@day, @hour, @teacher, @room, @class, @subject, @raw_text, @is_parsed)
    `);

    const replaceAll = db.transaction((rows: Lesson[]) => {
        db.prepare(`DELETE FROM lessons`).run();
        for (const row of rows) {
            insertStmt.run(row);
        }
    });

    replaceAll(lessons);
}
