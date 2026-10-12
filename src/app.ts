import express from "express";
import cors from "cors";

// controllers
import { countLessonsByTeacherAndSubject } from "./controllers/lessons/count";
import { getAllRooms } from "./controllers/rooms/all";
import { getAvailableRooms } from "./controllers/rooms/available";
import { findLessons } from "./controllers/lessons/find";
import { getAllTeachers } from "./controllers/teachers/all";

const app = express();
app.use(cors())
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.get("/lessons/count/:class", countLessonsByTeacherAndSubject);

app.get("/lessons/find", findLessons);

app.get("/rooms/all", getAllRooms);

app.get("/rooms/available/day/:day/hour/:hour", getAvailableRooms);

app.get("/teachers/all", getAllTeachers);

export default app;
