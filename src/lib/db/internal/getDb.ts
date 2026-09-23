import Database from "better-sqlite3";
import { initDb } from "./initDB";

let db: Database.Database | undefined;

export function getDb(): Database.Database {
    if (db === undefined) {
        db = initDb('./data/lessons.db')
    }
    return db;
}
