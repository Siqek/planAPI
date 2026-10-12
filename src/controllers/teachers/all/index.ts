import { Request, Response } from "express";
import { getDb } from "../../../lib/db";

export function getAllTeachers(_req: Request, res: Response): void {

    const db = getDb();

    try {
        const stmt = db.prepare(`
            SELECT id, name
            FROM teachers;
        `);

        const rooms = stmt.all();

        res.status(200).json(rooms);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "INTERNAL_ERROR",
            message: "Database error."
        });
    }
}
