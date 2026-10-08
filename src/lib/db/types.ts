export enum Day {
    Monday = 0,
    Tuesday = 1,
    Wednesday = 2,
    Thursday = 3,
    Friday = 4,
    Saturday = 5,
    Sunday = 6
}

export interface Lesson {
    id?: number;
    day: Day;
    hour: number;
    class: string;
    teacher_id: string | null;
    teacher_name: string | null;
    room: string | null;
    subject: string | null;
    raw_text: string | null;
    is_parsed: 0 | 1;
}

export type LessonFilters = {
    day?: string | undefined;
    hour?: string | undefined;
    class?: string | undefined;
    teacher?: string | undefined;
    subject?: string | undefined;
    room?: string | undefined;
};

export interface Teacher {
    id: string;
    name: string;
};

export interface Room {
    short_name: string;
    long_name: string;
};
