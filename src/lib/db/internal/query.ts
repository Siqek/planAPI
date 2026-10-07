import Database from "better-sqlite3";
import { Lesson, LessonFilters } from "../types";

export function findLessons(db: Database.Database, filters: LessonFilters): Lesson[] {

    const filterDefinitions = [
        { key: 'day', operator: '=' },
        { key: 'hour', operator: '=' },
        { key: 'class', operator: 'LIKE' },
        { key: 'teacher', operator: 'LIKE' },
        { key: 'subject', operator: 'LIKE' },
        { key: 'room', operator: 'LIKE' },
    ] as const;

    const activeFilters = filterDefinitions.filter(
        ({ key }) => filters[key] !== undefined
    );

    const where = activeFilters
        .map(({ key, operator }) => `${key} ${operator} @${key}`)
        .join(" AND ");

    const params = Object.fromEntries(
        activeFilters.map(({ key }) => [key, filters[key]])
    );

    const stmt = db.prepare(`
        SELECT
			l.id AS id,
			day,
			hour,
			class,
			teacher_id,
			t.name AS teacher_name,
			room,
			subject,
			raw_text,
			is_parsed
        FROM lessons l
		LEFT JOIN teachers t
			ON l.teacher_id = t.id
        ${where ? `WHERE ${where}` : ""};
    `);

    return stmt.all(params) as Lesson[];
}
