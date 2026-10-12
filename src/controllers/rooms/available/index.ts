import { Request, Response } from "express";
import { getDb } from "../../../lib/db";

export function getAvailableRooms(req: Request, res: Response): void {

	const dayParam = req.params?.day;
	const hourParam = req.params?.hour;

	if (dayParam === undefined || hourParam === undefined) {
		res.status(400).json({
			error: "MISSING_REQUIRED_PARAM",
			message: "'day' and 'hour' params are required."
		});
		return;
	}

	if (Array.isArray(dayParam) || Array.isArray(hourParam)) {
		res.status(400).json({
			error: "TOO_MANY_PARAM_VALUES",
			message: "'day' and 'hour' params must contain a single value."
		});
		return;
	}

	if (dayParam.trim().length === 0 || hourParam.trim().length === 0) {
		res.status(400).json({
			error: "INVALID_PARAM",
			message: "'day' and 'hour' params cannot be empty."
		});
		return;
	}

	const day = Number(dayParam);
	const hour = Number(hourParam);

	if (!Number.isInteger(day) || !Number.isInteger(hour)) {
		res.status(400).json({
			error: "INVALID_PARAM",
			message: "'day' and 'hour' params must be integers."
		});
		return;
	}

	const db = getDb();

	try {
		const stmt = db.prepare(`
			SELECT short_name, long_name
			FROM rooms
			WHERE short_name NOT IN (
				SELECT DISTINCT room
				FROM lessons
				WHERE room IS NOT NULL AND day = @day AND hour = @hour
			);
		`);

		const availableRooms = stmt.all({ day, hour });

		res.status(200).json(availableRooms);

	} catch (err) {
		console.error(err);
		res.status(500).json({
			error: "INTERNAL_ERROR",
			message: "Database error."
		});
	}
}

