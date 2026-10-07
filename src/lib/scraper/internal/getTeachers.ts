import * as cheerio from "cheerio";

import { fetchHTML } from "./fetchHTML";
import { Teacher } from "../../db/types";

export async function getTeachers(): Promise<Teacher[]> {

    const HrefRegex: RegExp = /plany\/n\d+\.html/;
    const ItemSelector: string = "a[href]";

    if (process.env.SCHEDULES_URL === undefined) {
        throw new Error("SCHEDULES_URL is undefined.");
    }

    const url = new URL(process.env.SCHEDULES_URL);

    const html = await fetchHTML(url);
    const $ = cheerio.load(html);

    const matchingItems = $(ItemSelector)
        .filter((_, el) => HrefRegex.test($(el).attr('href') ?? ""));

    const NameRegex = /^[\p{L}\.\- ]+(?=\s+\()/u;
    const IdRegex = /(?<=\()\p{L}{2}(?=\)$)/u;

    const teachers: Teacher[] = matchingItems.map((_, el) => {
        const elem = $(el);
        const text = elem.text().trim();
        const id = text.match(IdRegex)?.[0] ?? "";
        const name = text.match(NameRegex)?.[0] ?? "";
        return {
            id,
            name
        }
    }).get();

    return teachers;
}
