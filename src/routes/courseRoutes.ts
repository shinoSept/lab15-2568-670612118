import { Router } from "express";
import type { Request, Response } from "express";
import { zCourseId } from "../schemas/courseValidator.js";
import { courses } from "../db/db.js";
import { zCourseDeleteBody, zCoursePostBody, zCoursePutBody} from "../schemas/courseValidator.js";
import type { Course } from "../libs/types.js";
const router: Router = Router();

// READ all
router.get("/", (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    message: "Courses Information",
    data: courses,
  });
});

// Params URL 
router.get("/:courseId", (req: Request, res: Response) => {
  try {
    const courseId = req.params.courseId;
    const result = zCourseId.safeParse(Number(courseId));

    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.issues[0]?.message,
      });
    }

    const foundIndex = courses.findIndex(
      (course) => course.courseId === Number(courseId)
    );

    if (foundIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Course does not exists",
      });
    }

    // add response header 'Link'
    res.set("Link", `/api/v2/courses/${courseId}`);

    return res.json({
      success: true,
      message: `Get course ${courseId} successfully`,
      data: courses[foundIndex],
    });
  } catch (err) {
    return res.json({
      success: false,
      message: "Somthing is wrong, please try again",
      error: err,
    });
  }
});

router.post("/", async (req: Request, res: Response) => {
  try {
    const body = (await req.body) as Course;

    // validate req.body with predefined validator
        const result = zCoursePostBody.safeParse(body);
    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.issues[0]?.message,
      });
    }

    //check duplicate studentId
    const found = courses.find(
      (course) => course.courseId === body.courseId
    );
    if (found) {
      return res.status(409).json({
        success: false,
        message: "Course is already exists",
      });
    }

    // add new student
    const new_course = body;
    courses.push(new_course);

    // add response header 'Link'
    res.set("Link", `/courses/${new_course.courseId}`);

    return res.status(201).json({
      success: true,
      data: new_course,
    });
    // return res.json({ ok: true, message: "successfully" });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Somthing is wrong, please try again",
      error: err,
    });
  }
});

router.put("/", (req: Request, res: Response) => {
  try {
    const body = req.body as Course;

    // validate req.body with predefined validator
    const result = zCoursePutBody.safeParse(body); // check zod
    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.issues[0]?.message,
      });
    }

    //check if studentId exists
    const foundIndex = courses.findIndex(
      (course) => course.courseId === body.courseId
    );

    if (foundIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Course does not exists",
      });
    }

    // update student data
    courses[foundIndex] = { ...courses[foundIndex], ...body };

    // add response header 'Link'
    res.set("Link", `/courses/${body.courseId}`);

    return res.status(200).json({
      success: true,
      message: `Course ${body.courseId} has been updated successfully`,
      data: courses[foundIndex],
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Somthing is wrong, please try again",
      error: err,
    });
  }
});

router.delete("/", (req: Request, res: Response) => {
  try {
    const body = req.body;
    const parseResult = zCourseId.safeParse(body.courseId);

    if (!parseResult.success) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        error: parseResult.error.issues[0]?.message,
      });
    }

    const foundIndex = courses.findIndex(
      (course: Course) => course.courseId === body.courseId
    );

    if (foundIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Course does not exists",
      });
    }

    // delete found student from array
    courses.splice(foundIndex, 1);

    res.status(200).json({
      success: true,
      message: `Course ${body.courseId} has been deleted successfully`,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Somthing is wrong, please try again",
      error: err,
    });
  }
});

export default router;
