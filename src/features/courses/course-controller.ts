import * as _ from "lodash";
import Bluebird = require('bluebird');
import Course from '../../database/models/course';
import StudentEnrollment from '../../database/models/student-enrollment';
import { ForeignKeyConstraintError } from 'sequelize';
import NotFoundError from '../../exceptions/not-found-error';
import CourseUnitContent from '../../database/models/course-unit-content';
import CourseTopicContent from '../../database/models/course-topic-content';
import CourseWWTopicQuestion from '../../database/models/course-ww-topic-question';
import rendererHelper from '../../utilities/renderer-helper';
import StudentWorkbook from '../../database/models/student-workbook';
import StudentGrade from '../../database/models/student-grade';
import User from '../../database/models/user';
import logger from '../../utilities/logger';
import sequelize = require("sequelize");
// When changing to import it creates the following compiling error (on instantiation): This expression is not constructable.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const Sequelize = require('sequelize');

interface EnrollByCodeOptions {
    code: string;
    userId: number;
}

interface CourseListOptions {
    filter: {
        instructorId: number;
        enrolledUserId: number;
    };
}

interface GetQuestionOptions {
    userId: number;
    questionId: number;
}

interface UpdateTopicOptions {
    where: {
        id: number;
    };
    updates: {
        startDate: Date;
        endDate: Date;
        deadDate: Date;
        name: string;
        active: boolean;
        partialExtend: boolean;
    };
}

interface UpdateUnitOptions {
    where: {
        id: number;
    };
    updates: {
        name: string;
        active: boolean;
    };
}

interface GetGradesOptions {
    where: {
        courseId?: number;
        unitId?: number;
        topicId?: number;
        questionId?: number;
    };
}

interface GetStatisticsOnUnitsOptions {
    where: {
        courseId?: number;
    };
}

interface GetStatisticsOnTopicsOptions {
    where: {
        courseUnitContentId?: number;
        courseId?: number;
    };
}

interface GetStatisticsOnQuestionsOptions {
    where: {
        courseTopicContentId?: number;
        courseId?: number;
    };
}

class CourseController {
    getCourseById(id: number): Promise<Course> {
        return Course.findOne({
            where: {
                id,
            },
            include: [{
                model: CourseUnitContent,
                as: 'units',
                include: [{
                    model: CourseTopicContent,
                    as: 'topics',
                    include: [{
                        model: CourseWWTopicQuestion,
                        as: 'questions',
                    }]
                }]
            }],
            order: [
                ['units', 'contentOrder', 'ASC'],
                ['units', 'topics', 'contentOrder', 'ASC'],
                ['units', 'topics', 'questions', 'problemNumber', 'ASC'],
            ]
        })
    }

    getCourses(options: CourseListOptions): Bluebird<Course[]> {
        // Where is a dynamic sequelize object
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: any = {};
        const include = [];
        if (options.filter.instructorId !== null && options.filter.instructorId !== undefined) {
            where.instructorId = options.filter.instructorId;
        }

        if (options.filter.enrolledUserId !== null && options.filter.enrolledUserId !== undefined) {
            include.push({
                model: StudentEnrollment,
                attributes: [],
                as: 'enrolledStudents',
            });
            // TODO it doesn't like userId here and requires user_id, but it let's use use the sequelize field elseware
            where['$enrolledStudents.user_id$'] = options.filter.enrolledUserId;
        }

        return Course.findAll({
            where,
            include,
        });
    }

    createCourse(courseObject: Course): Bluebird<Course> {
        return Course.create(courseObject);
    }

    createUnit(courseUnitContent: CourseUnitContent): Promise<CourseUnitContent> {
        return CourseUnitContent.create(courseUnitContent);
    }

    createTopic(courseTopicContent: CourseTopicContent): Promise<CourseTopicContent> {
        return CourseTopicContent.create(courseTopicContent);
    }

    async updateTopic(options: UpdateTopicOptions): Promise<number> {
        const updates = await CourseTopicContent.update(options.updates, {
            where: options.where
        });
        // updates count
        return updates[0];
    }

    async updateUnit(options: UpdateUnitOptions): Promise<number> {
        const updates = await CourseUnitContent.update(options.updates, {
            where: options.where
        });
        // updates count
        return updates[0];
    }

    createQuestion(question: CourseWWTopicQuestion): Promise<CourseWWTopicQuestion> {
        return CourseWWTopicQuestion.create(question);
    }

    async getQuestion(question: any): Promise<any> {
        const courseQuestion = await CourseWWTopicQuestion.findOne({
            where: {
                id: question.questionId
            }
        });

        let studentGrade: StudentGrade;
        studentGrade = await StudentGrade.findOne({
            where: {
                userId: question.userId,
                courseWWTopicQuestionId: question.questionId
            }
        });

        if (studentGrade === null) {
            studentGrade = await StudentGrade.create({
                userId: question.userId,
                courseWWTopicQuestionId: question.questionId,
                randomSeed: Math.floor(Math.random() * 999999),
                bestScore: 0,
                numAttempts: 0,
                firstAttempts: 0,
                latestAttempts: 0,
            });
        }

        const rendererData = await rendererHelper.getProblem({
            sourceFilePath: courseQuestion.webworkQuestionPath,
            problemSeed: studentGrade.randomSeed,
            formURL: question.formURL,
        });
        return {
            // courseQuestion,
            rendererData
        }
    }

    async submitAnswer(options: any): Promise<any> {
        const studentGrade = await StudentGrade.findOne({
            where: {
                userId: options.userId,
                courseWWTopicQuestionId: options.questionId
            }
        });

        const bestScore = Math.max(studentGrade.bestScore, options.score);

        studentGrade.bestScore = bestScore;
        studentGrade.numAttempts++;
        if (studentGrade.numAttempts === 1) {
            studentGrade.firstAttempts = options.score;
        }
        studentGrade.latestAttempts = options.score;
        await studentGrade.save();

        return StudentWorkbook.create({
            studentGradeId: studentGrade.id,
            userId: options.userId,
            courseWWTopicQuestionId: studentGrade.courseWWTopicQuestionId,
            randomSeed: studentGrade.randomSeed,
            submitted: options.submitted,
            result: options.score,
            time: new Date()
        })
    }

    getCourseByCode(code: string): Promise<Course> {
        return Course.findOne({
            where: {
                code
            }
        })
    }

    async enroll(enrollment: StudentEnrollment): Promise<StudentEnrollment> {
        try {
            return await StudentEnrollment.create(enrollment);
        } catch (e) {
            if (e instanceof ForeignKeyConstraintError) {
                throw new NotFoundError('User or course was not found');
            }
            throw e;
        }
    }

    async enrollByCode(enrollment: EnrollByCodeOptions): Promise<StudentEnrollment> {
        try {
            const course = await this.getCourseByCode(enrollment.code);
            if (course === null) {
                throw new NotFoundError('Could not find course with the given code');
            }
            return this.enroll({
                courseId: course.id,
                userId: enrollment.userId,
                enrollDate: new Date(),
                dropDate: new Date()
            } as StudentEnrollment);
        } catch (e) {
            if (e instanceof ForeignKeyConstraintError) {
                throw new NotFoundError('User or course was not found');
            }
            throw e;
        }
    }

    async findMissingGrades(): Promise<any[]> {
        const result = await User.findAll({
            include: [{
                model: StudentEnrollment,
                as: 'courseEnrollments',
                include: [{
                    model: Course,
                    as: 'course',
                    include: [{
                        model: CourseUnitContent,
                        as: 'units',
                        include: [{
                            model: CourseTopicContent,
                            as: 'topics',
                            include: [{
                                model: CourseWWTopicQuestion,
                                as: 'questions',
                                include: [{
                                    model: StudentGrade,
                                    as: 'grades',
                                    required: false
                                }]
                            }]
                        }]
                    }]
                }]
            }],
            where: {
                '$courseEnrollments.course.units.topics.questions.grades.id$': {
                    [Sequelize.Op.eq]: null
                }
            }
        });

        const results: any[] = [];
        result.forEach((student: any) => {
            student.courseEnrollments.forEach((studentEnrollment: any) => {
                studentEnrollment.course.units.forEach((unit: any) => {
                    unit.topics.forEach((topic: any) => {
                        topic.questions.forEach((question: any) => {
                            results.push({
                                student,
                                question,
                            });
                        });
                    });
                });
            })
        })
        return results;
    }

    async syncMissingGrades(): Promise<void> {
        const missingGrades = await this.findMissingGrades();
        logger.info(`Found ${missingGrades.length} missing grades`)
        await missingGrades.asyncForEach(async (missingGrade: any) => {
            await StudentGrade.create({
                userId: missingGrade.student.id,
                courseWWTopicQuestionId: missingGrade.question.id,
                randomSeed: Math.floor(Math.random() * 999999),
                bestScore: 0,
                numAttempts: 0,
                firstAttempts: 0,
                latestAttempts: 0,
            });
        });
    }

    async getGrades(options: GetGradesOptions): Promise<StudentGrade[]> {
        const {
            courseId,
            questionId,
            topicId,
            unitId
        } = options.where;

        const setFilterCount = [
            courseId,
            questionId,
            topicId,
            unitId
        ].reduce((accumulator, val) => accumulator + (!_.isNil(val) && 1 || 0), 0);

        if (setFilterCount !== 1) {
            throw new Error(`One filter must be set but found ${setFilterCount}`);
        }

        const where = _({
            [`$question.topic.unit.course.${Course.rawAttributes.id.field}$`]: courseId,
            [`$question.topic.unit.${CourseUnitContent.rawAttributes.id.field}$`]: unitId,
            [`$question.topic.${CourseTopicContent.rawAttributes.id.field}$`]: topicId,
            [`$question.${CourseWWTopicQuestion.rawAttributes.id.field}$`]: questionId,
        }).omitBy(_.isUndefined).value();

        const totalProblemCountCalculationString = `COUNT(question.${CourseWWTopicQuestion.rawAttributes.id.field})`;
        const pendingProblemCountCalculationString = `COUNT(CASE WHEN ${StudentGrade.rawAttributes.numAttempts.field} = 0 THEN ${StudentGrade.rawAttributes.numAttempts.field} END)`;
        const masteredProblemCountCalculationString = `COUNT(CASE WHEN ${StudentGrade.rawAttributes.bestScore.field} >= 1 THEN ${StudentGrade.rawAttributes.bestScore.field} END)`;
        const inProgressProblemCountCalculationString = `${totalProblemCountCalculationString} - ${pendingProblemCountCalculationString} - ${masteredProblemCountCalculationString}`;

        // Include cannot be null or undefined, coerce to empty array
        let includeOthers = false;
        let unitInclude;
        if (includeOthers || _.isNil(courseId) === false) {
            includeOthers = true;
            unitInclude = [{
                model: Course,
                as: 'course',
                attributes: [],
            }]
        }

        let topicInclude;
        if (includeOthers || _.isNil(unitId) === false) {
            includeOthers = true;
            topicInclude = [{
                model: CourseUnitContent,
                as: 'unit',
                attributes: [],
                include: unitInclude || [],
            }]
        }

        let questionInclude;
        if(includeOthers || _.isNil(topicId) === false) {
            includeOthers = true;
            questionInclude = [{
                model: CourseTopicContent,
                as: 'topic',
                attributes: [],
                include: topicInclude || [],
            }];
        }

        let attributes: sequelize.FindAttributeOptions;
        // Group cannot be empty array, use null if there is no group clause
        let group: sequelize.GroupOption;
        if (_.isNil(questionId) === false) {
            attributes = [
                'id', 
                'bestScore',
                'numAttempts'
            ]
            group = null;
        } else {
            attributes = [
                [sequelize.fn('avg', sequelize.col(`${StudentGrade.rawAttributes.bestScore.field}`)), 'average'],
                [sequelize.literal(pendingProblemCountCalculationString), 'pendingProblemCount'],
                [sequelize.literal(masteredProblemCountCalculationString), 'masteredProblemCount'],
                [sequelize.literal(inProgressProblemCountCalculationString), 'inProgressProblemCount'],
            ];
            group = [`user.${User.rawAttributes.id.field}`, `user.${User.rawAttributes.firstName.field}`, `user.${User.rawAttributes.lastName.field}`, ];
        }

        return StudentGrade.findAll({
            include: [{
                model: User,
                as: 'user',
                attributes: ['id', 'firstName', 'lastName']
            }, {
                model: CourseWWTopicQuestion,
                as: 'question',
                attributes: [],
                include: questionInclude || [],
            }],
            attributes,
            where,
            group
        });
    }

    getStatisticsOnUnits(options: GetStatisticsOnUnitsOptions): Promise<CourseUnitContent[]> {
        const {
            courseId
        } = options.where;

        const where = _({
            courseId,
        }).omitBy(_.isNil).value();

        return CourseUnitContent.findAll({
            where,
            attributes: [
                'id',
                'name',
                // TODO see if alias can be used instead
                [sequelize.fn('avg', sequelize.col(`topics.questions.grades.${StudentGrade.rawAttributes.numAttempts.field}`)), 'averageAttemptedCount'],
                [sequelize.fn('avg', sequelize.col(`topics.questions.grades.${StudentGrade.rawAttributes.bestScore.field}`)), 'averageScore'],
                [sequelize.fn('count', sequelize.col(`topics.questions.grades.${StudentGrade.rawAttributes.id.field}`)), 'totalGrades'],
                [sequelize.literal(`count(CASE WHEN "topics->questions->grades".${StudentGrade.rawAttributes.bestScore.field} >= 1 THEN "topics->questions->grades".${StudentGrade.rawAttributes.id.field} END)`), 'completedCount'],
                [sequelize.literal(`CASE WHEN COUNT("topics->questions->grades".${StudentGrade.rawAttributes.id.field}) > 0 THEN count(CASE WHEN "topics->questions->grades".${StudentGrade.rawAttributes.bestScore.field} >= 1 THEN "topics->questions->grades".${StudentGrade.rawAttributes.id.field} END)::FLOAT / count("topics->questions->grades".${StudentGrade.rawAttributes.id.field}) ELSE NULL END`), 'completionPercent'],
            ],
            include: [{
                model: CourseTopicContent,
                as: 'topics',
                attributes: [],
                include: [{
                    model: CourseWWTopicQuestion,
                    as: 'questions',
                    attributes: [],
                    include: [{
                        model: StudentGrade,
                        as: 'grades',
                        attributes: []
                    }]
                }]
            }],
            group: [`CourseUnitContent.${CourseUnitContent.rawAttributes.id.field}`, `CourseUnitContent.${CourseUnitContent.rawAttributes.id.field}` ]
        })
    }

    getStatisticsOnTopics(options: GetStatisticsOnTopicsOptions): Promise<CourseTopicContent[]> {
        const {
            courseUnitContentId,
            courseId
        } = options.where;

        const where = _({
            courseUnitContentId,
            '$unit.course_id$': courseId
        }).omitBy(_.isNil).value();

        const include: sequelize.IncludeOptions[] = [{
            model: CourseWWTopicQuestion,
            as: 'questions',
            attributes: [],
            include: [{
                model: StudentGrade,
                as: 'grades',
                attributes: []
            }]
        }]

        if(!_.isNil(courseId)) {
            include.push({
                model: CourseUnitContent,
                as: 'unit',
                attributes: []
            })
        }


        return CourseTopicContent.findAll({
            where,
            attributes: [
                'id',
                'name',
                // TODO see if alias can be used instead
                [sequelize.fn('avg', sequelize.col('questions.grades.num_attempts')), 'averageAttemptedCount'],
                [sequelize.fn('avg', sequelize.col('questions.grades.best_score')), 'averageScore'],
                [sequelize.fn('count', sequelize.col('questions.grades.id')), 'totalGrades'],
                [sequelize.literal('count(CASE WHEN "questions->grades".best_score >= 1 THEN "questions->grades".id END)'), 'completedCount'],
                [sequelize.literal('CASE WHEN COUNT("questions->grades".id) > 0 THEN count(CASE WHEN "questions->grades".best_score >= 1 THEN "questions->grades".id END)::FLOAT / count("questions->grades".id) ELSE NULL END'), 'completionPercent'],
            ],
            include,
            group: ['CourseTopicContent.id', 'CourseTopicContent.name' ]
        })
    }

    getStatisticsOnQuestions(options: GetStatisticsOnQuestionsOptions): Promise<CourseWWTopicQuestion[]> {
        const {
            courseTopicContentId,
            courseId
        } = options.where;
        
        const where = _({
            courseTopicContentId,
            '$topic.unit.course_id$': courseId
        }).omitBy(_.isNil).value();

        const include: sequelize.IncludeOptions[] = [{
            model: StudentGrade,
            as: 'grades',
            attributes: []
        }]

        if(!_.isNil(courseId)) {
            include.push({
                model: CourseTopicContent,
                as: 'topic',
                attributes: [],
                include: [{
                    model: CourseUnitContent,
                    as: 'unit',
                    attributes: []
                }]
            })
        }

        return CourseWWTopicQuestion.findAll({
            where,
            attributes: [
                'id',
                [sequelize.literal('\'Problem \' || "CourseWWTopicQuestion".problem_number'), 'name'],
                // TODO see if alias can be used instead
                [sequelize.fn('avg', sequelize.col('grades.num_attempts')), 'averageAttemptedCount'],
                [sequelize.fn('avg', sequelize.col('grades.best_score')), 'averageScore'],
                [sequelize.fn('count', sequelize.col('grades.id')), 'totalGrades'],
                [sequelize.literal('count(CASE WHEN "grades".best_score >= 1 THEN "grades".id END)'), 'completedCount'],
                [sequelize.literal('CASE WHEN COUNT("grades".id) > 0 THEN count(CASE WHEN "grades".best_score >= 1 THEN "grades".id END)::FLOAT / count("grades".id) ELSE NULL END'), 'completionPercent'],
            ],
            include,
            group: ['CourseWWTopicQuestion.id' ]
        })
    }
}

export const courseController = new CourseController();
export default courseController;