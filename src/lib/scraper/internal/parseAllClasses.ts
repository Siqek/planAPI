import { Lesson } from "../../db/types";
import { getHrefsWithClassNames } from "./getHrefsWithClassNames";
import { parseClassSchedule } from "./parseClassSchedule";

export async function parseAllClasses(): Promise<Lesson[]> {
    const result: Lesson[] = [];

    if (process.env.SCHEDULES_URL === undefined) {
        throw new Error("SCHEDULES_URL is undefined.");
    }

    if (process.env.SCHEDULE_BASE_URL === undefined) {
        throw new Error("SCHEDULE_BASE_URL is undefined.");
    }

    const hrefsWithClassNames = await getHrefsWithClassNames(new URL(process.env.SCHEDULES_URL));

    for (const { href, className } of hrefsWithClassNames) {

        const lessons = await parseClassSchedule(new URL(href, process.env.SCHEDULE_BASE_URL), className);

        result.push(...lessons);
    }

    return result;
}
