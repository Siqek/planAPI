import * as cheerio from "cheerio";

import { fetchHTML } from "./fetchHTML";
import { Room } from "../../db/types";

export async function getRooms(): Promise<Room[]> {

    const HrefRegex: RegExp = /plany\/s\d+\.html/;
    const ItemSelector: string = "a[href]";

    if (process.env.SCHEDULES_URL === undefined) {
        throw new Error("SCHEDULES_URL is undefined.");
    }

    const url = new URL(process.env.SCHEDULES_URL);

    const html = await fetchHTML(url);
    const $ = cheerio.load(html);

    const matchingItems = $(ItemSelector)
        .filter((_, el) => HrefRegex.test($(el).attr('href') ?? ""));

    const ShortNameRegex = /^[^\s]+/u;

    const teachers: Room[] = matchingItems.map((_, el) => {
        const elem = $(el);
        const text = elem.text().trim();
        const shortName = text.match(ShortNameRegex)?.[0] ?? "";
        const longName = text;
        return {
            short_name: shortName,
            long_name: longName
        }
    }).get();

    return teachers;
}
