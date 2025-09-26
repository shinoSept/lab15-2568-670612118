import express from "express";
import morgan from 'morgan';
import type { Request, Response } from "express";
import { students, courses } from "../src/db/db.js";
import { 
  zStudentPostBody, 
  zStudentPutBody, 
  zStudentDeleteBody,
  zStudentId,
} from "./schemas/studentValidator.js";
import { zCoursePostBody, zCoursePutBody, zCourseDeleteBody} from "./schemas/courseValidator.js";
import type { Student, Course } from "./libs/types.js"
import z from "zod";
import studentRouter from "./routes/studentRoutes.js";
import courseRouter from "./routes/courseRoutes.js";


const app: any = express();

//Middleware
app.use(express.json());
app.use(morgan('dev'));

app.listen(3000, () =>
  console.log("🚀 Server running on http://localhost:3000")
);

app.get('/me', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: "Student Imformation",
    data: {
      studentId: "670612118",
      firstname: "Chinoros",
      lastname: "Poonriboon",
      program: "CPE",
      section: "801"
    }
  })
});

app.use("/api/v2/students", studentRouter);
app.use("/api/v2/courses", courseRouter);

app.get("/api/v2/students/:studentId/courses", (req: Request, res: Response) => {
  try {
    const studentId = req.params.studentId;
    const result = zStudentId.safeParse(studentId);
  
    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.issues[0]?.message,
      });
    }

    //check duplicate studentId
    const foundIndex = students.findIndex(
      (student) => student.studentId === studentId
    );

    if (foundIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Student does not exists",
      });
    }

    // add response header 'Link'
    res.set("Link", `/students/${studentId}`);

    return res.json({
      success: true,
      message: `Get courses detail of student ${studentId}`,
    });
  } catch (err) {
    return res.json({
      success: false,
      message: "Somthing is wrong, please try again",
      error: err,
    });
  }
});

app.get("/api/v2/courses/{courseId}", (req: Request, res: Response) => {
});

app.post("/api/v2/courses", (req: Request, res: Response) => {

});

app.put("/api/v2/courses", (req: Request, res: Response) => {

});

export default app;
