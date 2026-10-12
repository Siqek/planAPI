import Database from 'better-sqlite3';
import { Lesson, Room, Teacher } from '../types';

export function insertLesson(db: Database.Database, lesson: Lesson) {
    const stmt = db.prepare(`
        INSERT INTO lessons (day, hour, teacher_id, room, class, subject, raw_text, is_parsed)
        VALUES (@day, @hour, @teacher_id, @room, @class, @subject, @raw_text, @is_parsed)
    `);
    stmt.run(lesson);
}

export function insertLessonsBulk(db: Database.Database, lessons: Lesson[]) {
    const stmt = db.prepare(`
        INSERT INTO lessons (day, hour, teacher_id, room, class, subject, raw_text, is_parsed)
        VALUES (@day, @hour, @teacher_id, @room, @class, @subject, @raw_text, @is_parsed)
    `);

    const insertMany = db.transaction((rows: Lesson[]) => {
        for (const row of rows) {
            stmt.run(row);
        }
    });

    insertMany(lessons);
}

export function insertTeachersBulk(db: Database.Database, teachers: Teacher[]) {
    const stmt = db.prepare(`
        INSERT INTO teachers (id, name)
        VALUES (@id, @name)
    `);

    const insertMany = db.transaction((rows: Teacher[]) => {
        for (const row of rows) {
            stmt.run(row);
        }
    });

    insertMany(teachers);
}

export function insertRoomsBulk(db: Database.Database, rooms: Room[]) {
    const stmt = db.prepare(`
        INSERT INTO rooms (short_name, long_name)
        VALUES (@short_name, @long_name)
    `);

    const insertMany = db.transaction((rows: Room[]) => {
        for (const row of rows) {
            stmt.run(row);
        }
    });

    insertMany(rooms);
}
