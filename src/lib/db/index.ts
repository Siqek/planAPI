import { getDb } from "./internal/getDb";
import { findLessons } from "./internal/query";
import { insertLessonsBulk, insertTeachersBulk } from "./internal/insert";
import { replaceAllLessons } from "./internal/replaceAllLessons";

export {
    getDb,
    findLessons,
    insertLessonsBulk,
    insertTeachersBulk,
    replaceAllLessons
};

