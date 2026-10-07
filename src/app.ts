import express from "express";
import cors from "cors";

// controllers
import { countLessonsByTeacherAndSubject } from "./controllers/lessons/count";
import { findLessons } from "./controllers/lessons/find";

const app = express();
app.use(cors())
app.use(express.json());

app.get("/health", (_req, res) => res.json({ ok: true }));

app.get("/lessons/count/:class", countLessonsByTeacherAndSubject);

app.get("/lessons/find", findLessons);

export default app;
