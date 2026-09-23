import Database from 'better-sqlite3';
import { Lesson } from '../types';

export function insertLesson(db: Database.Database, lesson: Lesson) {
    const stmt = db.prepare(`
        INSERT INTO lessons (day, hour, teacher, room, class, subject, raw_text, is_parsed)
        VALUES (@day, @hour, @teacher, @room, @class, @subject, @raw_text, @is_parsed)
    `);
    stmt.run(lesson);
}

export function insertLessonsBulk(db: Database.Database, lessons: Lesson[]) {
    const stmt = db.prepare(`
        INSERT INTO lessons (day, hour, teacher, room, class, subject, raw_text, is_parsed)
        VALUES (@day, @hour, @teacher, @room, @class, @subject, @raw_text, @is_parsed)
    `);

    const insertMany = db.transaction((rows: Lesson[]) => {
        for (const row of rows) {
        stmt.run(row);
        }
    });

    insertMany(lessons);
}
