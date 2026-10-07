import * as cheerio from 'cheerio';
import type { Element } from 'domhandler';

import { Lesson } from '../../db/types.js';

import { fetchHTML } from './fetchHTML.js';

export async function parseClassSchedule(scheduleUrl: URL, className: string): Promise<Lesson[]> {

    const html = await fetchHTML(scheduleUrl);
    const $: cheerio.CheerioAPI = cheerio.load(html);

    const DAYS_IN_SCHEDULE = 5;
    const schedule: Lesson[] = [];

    // skip the first row, which contains only meta data
    const rows =  $('table[class="tabela"] tr').not(':first');

    for (let hour = 0; hour < rows.length; ++hour) {

        for (let day = 0; day < DAYS_IN_SCHEDULE; ++day) {

            const cell = $(rows[hour]).find('td[class="l"]').eq(day);

            const lessons: CellData[] | null = parseLessonCell($, cell);

            if (lessons === null) {
                continue;
            }

            lessons.forEach(({ teacher_id, room, subject, raw_text, is_parsed }: CellData) => {
                const lesson: Lesson = {
                    day,
                    hour,
                    class: className,
                    teacher_id,
                    teacher_name: null,
                    room,
                    subject,
                    raw_text,
                    is_parsed
                };
                schedule.push(lesson);
            });
        }
    }

    return schedule;
}

type CellData = {
    subject: string | null;
    room: string | null;
    teacher_id: string | null;
    raw_text: string | null;
    is_parsed: 0 | 1
};
function parseLessonCell($: cheerio.CheerioAPI, cell: cheerio.Cheerio<Element>): CellData[] | null {

    if ($(cell).text().replace(/\u00a0/g, '').trim() === '') {
        return null;
    }

    const result: CellData[] = [];

    const spans = $(cell).children('span:not([class])');
    const lessons = spans.length > 0 ? spans : $(cell);

    for (const lesson of lessons) {
        const subjectItems = $(lesson).children('[class="p"]');
        const teacherItems = $(lesson).children('[class="n"]');
        const classroomItems = $(lesson).children('[class="s"]');

        if (subjectItems.length == 1
            && teacherItems.length == 1
            && classroomItems.length == 1) {

            const parsedLesson: CellData = {
                subject: $(subjectItems).text(),
                room: $(classroomItems).text(),
                teacher_id: $(teacherItems).text(),
                raw_text: null,
                is_parsed: 1
            };

            result.push(parsedLesson);
            continue;
        }

        const unparsedLesson: CellData = {
            subject: null,
            room: null,
            teacher_id: null,
            raw_text: $(lesson).text(),
            is_parsed: 0
        };
        result.push(unparsedLesson);
    }

    return result;
}
