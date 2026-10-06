import * as cheerio from "cheerio";

import { fetchHTML } from "./fetchHTML";
import type { HrefWithClassName } from "../types";

export async function getHrefsWithClassNames(url: URL): Promise<HrefWithClassName[]> {

    const HrefRegex: RegExp = /plany\/o\d+\.html/;
    const ItemSelector: string = "a[href]";

    const html = await fetchHTML(url);
    const $ = cheerio.load(html);

    const matchingItems = $(ItemSelector)
        .filter((_, el) => HrefRegex.test($(el).attr('href') ?? ""));

    const hrefsWithClassNames = matchingItems.map((_, el) => {
        const elem = $(el);
        return {
            href: elem.attr('href') ?? "",
            className: elem.text()
        }
    }).get();

    return hrefsWithClassNames;
}
