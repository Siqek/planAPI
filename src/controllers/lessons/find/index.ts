import { Request, Response } from "express";
import { getDb, findLessons as _findLessons } from "../../../lib/db";
import { LessonFilters } from "../../../lib/db/types";

export function findLessons(req: Request, res: Response): void {

    try {
        const db = getDb();

        const filters: LessonFilters = {
            day: typeof req.query.day === "string"
                ? req.query.day
                : undefined,

            hour: typeof req.query.hour === "string"
                ? req.query.hour
                : undefined,

            class: typeof req.query.class === "string"
                ? req.query.class
                : undefined,

            teacher: typeof req.query.teacher === "string"
                ? req.query.teacher
                : undefined,

            subject: typeof req.query.subject === "string"
                ? req.query.subject
                : undefined,

            room: typeof req.query.room === "string"
                ? req.query.room
                : undefined,
        };

        const lessons = _findLessons(db, filters);

        res.status(200).json(lessons);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "INTERNAL_ERROR",
            message: "Database error."
        });
    }
}
