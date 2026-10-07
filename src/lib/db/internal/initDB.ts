import Database from 'better-sqlite3';

import fs from "node:fs";
import path from "node:path";


export function initDb(pathname: string): Database.Database {

    const absoluteDbPath = path.resolve(process.cwd(), pathname);

    const dataDir = path.dirname(absoluteDbPath);
    fs.mkdirSync(dataDir, { recursive: true });

    const db = new Database(absoluteDbPath);

    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');

    db.exec(`
        CREATE TABLE IF NOT EXISTS teachers (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS lessons (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            day INTEGER NOT NULL,
            hour INTEGER NOT NULL,
            class TEXT NOT NULL,
            teacher_id TEXT,
            subject TEXT,
            room TEXT,
            raw_text TEXT,
            is_parsed INTEGER DEFAULT 1
        );

        CREATE INDEX IF NOT EXISTS idx_day_hour ON lessons(day, hour);
        CREATE INDEX IF NOT EXISTS idx_teacher ON lessons(teacher_id);
        CREATE INDEX IF NOT EXISTS idx_room ON lessons(room);
        CREATE INDEX IF NOT EXISTS idx_class ON lessons(class);
    `);

    return db;
}
