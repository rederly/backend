import { Request, Response, NextFunction } from "express";
import courseController from "./course-controller";
const router = require('express').Router();
import validate from '../../middleware/joi-validator'
import { authenticationMiddleware } from "../../middleware/auth";
import httpResponse from "../../utilities/http-response";
import * as asyncHandler from 'express-async-handler'
import { createCourseValidation, getCourseValidation, enrollInCourseValidation, listCoursesValidation, createCourseUnitValidation, createCourseTopicValidation, createCourseTopicQuestionValidation, getQuestionValidation, updateCourseTopicValidation, getGrades, updateCourseUnitValidation, getStatisticsOnUnitsValidation, getStatisticsOnTopicsValidation, getStatisticsOnQuestionsValidation, getTopicsValidation } from "./course-route-validation";
import Session from "../../database/models/session";
import Boom = require("boom");
import NotFoundError from "../../exceptions/not-found-error";
import multer = require("multer");
import WebWorkDef from "../../utilities/web-work-def-parser";
import * as proxy from 'express-http-proxy';
import * as qs from 'qs';
import configurations from "../../configurations";

const fileUpload = multer();

router.get('/statistics/units',
    authenticationMiddleware,
    validate(getStatisticsOnUnitsValidation),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        try {
            const stats = await courseController.getStatisticsOnUnits({
                where: {
                    courseId: (req.query as any).courseId
                }
            });
            next(httpResponse.Ok('Fetched successfully', stats));
        } catch (e) {
            next(e)
        }
    }));

router.get('/statistics/topics',
    authenticationMiddleware,
    validate(getStatisticsOnTopicsValidation),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        try {
            const stats = await courseController.getStatisticsOnTopics({
                where: {
                    courseUnitContentId: (req.query as any).courseUnitContentId,
                    courseId: (req.query as any).courseId
                }
            });
            next(httpResponse.Ok('Fetched successfully', stats));
        } catch (e) {
            next(e)
        }
    }));

router.get('/statistics/questions',
    authenticationMiddleware,
    validate(getStatisticsOnQuestionsValidation),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        try {
            const stats = await courseController.getStatisticsOnQuestions({
                where: {
                    courseTopicContentId: (req.query as any).courseTopicContentId,
                    courseId: (req.query as any).courseId
                }
            });
            next(httpResponse.Ok('Fetched successfully', stats));
        } catch (e) {
            next(e)
        }
    }));

router.post('/def',
    authenticationMiddleware,
    // validate(createCourseValidation),
    fileUpload.single('def-file'),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const parsedDefFile = new WebWorkDef(req.file.buffer.toString())
        res.json(parsedDefFile);
    }));

router.post('/',
    authenticationMiddleware,
    validate(createCourseValidation),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        try {
            // TODO figure out session for request
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const session = (req as any).session as Session;
            const user = await session.getUser();
            const university = await user.getUniversity();

            const newCourse = await courseController.createCourse({
                instructorId: user.id,
                universityId: university.id,
                ...req.body
            });
            next(httpResponse.Created('Course successfully', newCourse));
        } catch (e) {
            next(e)
        }
    }));

router.post('/unit',
    authenticationMiddleware,
    validate(createCourseUnitValidation),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        try {
            const newUnit = await courseController.createUnit({
                ...req.body
            });
            // TODO handle not found case
            next(httpResponse.Created('Course Unit created successfully', newUnit));
        } catch (e) {
            next(e);
        }
    }));

router.post('/topic',
    authenticationMiddleware,
    validate(createCourseTopicValidation),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        try {
            const newTopic = await courseController.createTopic({
                ...req.body
            });
            // TODO handle not found case
            next(httpResponse.Created('Course Topic created successfully', newTopic));
        } catch (e) {
            next(e);
        }
    }));

router.get('/grades',
    authenticationMiddleware,
    validate(getGrades),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        try {
            const grades = await courseController.getGrades({
                where: {
                    courseId: (req.query as any).courseId as number,
                    questionId: (req.query as any).questionId as number,
                    topicId: (req.query as any).topicId as number,
                    unitId: (req.query as any).unitId as number
                }
            });
            next(httpResponse.Ok('Fetched successfully', grades));
        } catch (e) {
            next(e)
        }
    }));

router.get('/questions',
    authenticationMiddleware,
    // validate(getUser),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        const result = await courseController.getQuestions({
            userId: (req.query as any).userId as number,
            courseTopicContentId: (req.query as any).courseTopicContentId as number
        });
        next(httpResponse.Ok(null, result));
    }));

router.put('/topic/:id',
    authenticationMiddleware,
    validate(updateCourseTopicValidation),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        try {
            const updates = await courseController.updateTopic({
                where: {
                    id: parseInt(req.params.id)
                },
                updates: {
                    ...req.body
                }
            });
            // TODO handle not found case
            next(httpResponse.Ok('Updated topic successfully', updates));
        } catch (e) {
            next(e);
        }
    }));

router.put('/unit/:id',
    authenticationMiddleware,
    validate(updateCourseUnitValidation),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        try {
            const updates = await courseController.updateUnit({
                where: {
                    id: parseInt(req.params.id)
                },
                updates: {
                    ...req.body
                }
            });
            // TODO handle not found case
            next(httpResponse.Ok('Updated unit successfully', updates));
        } catch (e) {
            next(e);
        }
    }));

router.post('/question',
    authenticationMiddleware,
    validate(createCourseTopicQuestionValidation),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        try {
            const newQuestion = await courseController.addQuestion({
                ...req.body
            });
            // TODO handle not found case
            next(httpResponse.Created('Course Question created successfully', newQuestion));
        } catch (e) {
            next(e);
        }
    }));

router.get('/question/:id',
    authenticationMiddleware,
    validate(getQuestionValidation),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        // TODO figure out session for request
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const session = (req as any).session as Session;

        try {
            // TODO handle not found case
            const question = await courseController.getQuestion({
                questionId: parseInt(req.params.id),
                userId: session.userId,
                formURL: req.originalUrl
            });
            next(httpResponse.Ok('Fetched question successfully', question));

            // If testing renderer integration from the browser without the front end simply return the rendered html
            // To do so first uncomment the below res.send and comment out the above next
            // Also when in the browser console add your auth token (`document.cookie = "sessionToken=UUID;`)
            // Don't forget to do this in post as well
            // res.send(question.rendererData.renderedHTML);
        } catch (e) {
            next(e);
        }
    }));

router.post('/question/:id',
    authenticationMiddleware,
    proxy(configurations.renderer.url, {
        proxyReqPathResolver: (req) => {
            return `/rendered?${qs.stringify({
                format: 'json',
                template: 'single',
                formURL: req.originalUrl,
            })}`;
        },
        userResDecorator: async (proxyRes: Response<any>, proxyResData: any, userReq: any, userRes: Response<any>) => {
            let data = proxyResData.toString('utf8');
            console.log(data);
            data = JSON.parse(data);

            await courseController.submitAnswer({
                userId: userReq.session.userId,
                questionId: userReq.params.id,
                score: data.problem_result.score,
                submitted: data,
            });

            // There is no way to get next callback, however anything thrown will get sent to next
            // Using the below line will responde with a 201 the way we do in our routes
            throw httpResponse.Ok('Answer submitted for question', {
                rendererData: data
            });

            // If testing renderer integration from the browser without the front end simply return the rendered html
            // To do so first uncomment the below return and comment out the above throw
            // Also when in the browser console add your auth token (`document.cookie = "sessionToken=UUID;`)
            // Don't forget to do this in get as well
            // TODO switch back to json response, right now we don't use the extra data and the iframe implementation requires html passed back
            // return data.renderedHTML;
        }
    }));

router.get('/',
    authenticationMiddleware,
    validate(listCoursesValidation),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        try {
            const courses = await courseController.getCourses({
                filter: {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    instructorId: (req.query as any).instructorId as number,
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    enrolledUserId: (req.query as any).enrolledUserId as number,
                }
            });
            next(httpResponse.Ok('Fetched successfully', courses));
        } catch (e) {
            next(e)
        }
    }));

router.get('/topics',
    authenticationMiddleware,
    validate(getTopicsValidation),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await courseController.getTopics({
                courseId: (req.query as any).courseId as number,
                isOpen: (req.query as any).isOpen as boolean
            })
            next(httpResponse.Ok('Fetched successfully', result))
        } catch (e) {
            next(e)
        }
    }));

router.get('/:id',
    authenticationMiddleware,
    validate(getCourseValidation),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        try {
            const course = await courseController.getCourseById(parseInt(req.params.id));
            next(httpResponse.Ok('Fetched successfully', course));
        } catch (e) {
            next(e)
        }
    }));

router.post('/enroll',
    authenticationMiddleware,
    validate(enrollInCourseValidation),
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        try {
            const enrollment = await courseController.enroll({
                ...req.body,
            })
            next(httpResponse.Ok('Enrolled', enrollment));
        } catch (e) {
            if (e instanceof NotFoundError) {
                next(Boom.notFound(e.message));
            } else {
                next(e);
            }
        }
    }));

router.post('/enroll/:code',
    authenticationMiddleware,
    asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
        // TODO figure out session for request
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const session = (req as any).session as Session;

        try {
            const enrollment = await courseController.enrollByCode({
                code: req.params.code,
                userId: session.userId
            });
            next(httpResponse.Ok('Enrolled', enrollment));
        } catch (e) {
            if (e instanceof NotFoundError) {
                next(Boom.notFound(e.message));
            } else {
                next(e);
            }
        }
    }));

module.exports = router;
