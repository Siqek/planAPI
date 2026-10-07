import { Request, Response } from "express";
import { getDb } from "../../../lib/db";

export function countLessonsByTeacherAndSubject(req: Request, res: Response): void {

    const className = req.params?.class;

    if (className === undefined) {
        res.status(400).json({
            error: "MISSING_REQUIRED_PARAM",
            message: "'class' param is required."
        });
        return;
    }

    if (Array.isArray(className)) {
        res.status(400).json({
            error: "TOO_MANY_PARAM_VALUES",
            message: "'class' param must contain a single value."
        });
        return;
    }

    if (className.trim().length === 0) {
        res.status(400).json({
            error: "INVALID_PARAM",
            message: "'class' param cannot be empty."
        });
        return;
    }

    const db = getDb();

    try {
        const stmt = db.prepare(`
            SELECT
                class,
                teacher_id,
                t.name AS teacher_name,
                subject,
                raw_text,
                COUNT(*) AS lessons_count
            FROM lessons l
			LEFT JOIN teachers t
				ON l.teacher_id = t.id
            WHERE class LIKE @class
            GROUP BY teacher_id, subject, raw_text;
        `);

        const lessonsCount = stmt.all({ class: className.trim() });

        res.status(200).json(lessonsCount);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "INTERNAL_ERROR",
            message: "Database error."
        });
    }
}
