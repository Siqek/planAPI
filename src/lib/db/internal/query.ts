import Database from 'better-sqlite3';
import { Lesson } from '../types';

export interface LessonFilter {
  day?: string;
  hour?: number;
  teacher?: string;
  room?: string;
  class?: string;
  onlyParsed?: boolean;
}

export function findLessons(db: Database.Database, filter: LessonFilter): Lesson[] {
    const conditions: string[] = [];
    const params: Record<string, unknown> = {};

    const fieldMap: Record<keyof Omit<LessonFilter, 'onlyParsed'>, string> = {
        day: 'day', hour: 'hour', teacher: 'teacher', room: 'room', class: 'class',
    };

    for (const [key, column] of Object.entries(fieldMap)) {
        const value = filter[key as keyof typeof fieldMap];
        if (value !== undefined) {
        conditions.push(`${column} = @${key}`);
        params[key] = value;
        }
    }

    if (filter.onlyParsed) {
        conditions.push(`is_parsed = 1`);
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const stmt = db.prepare(`SELECT * FROM lessons ${where}`);
    return stmt.all(params) as Lesson[];
}
