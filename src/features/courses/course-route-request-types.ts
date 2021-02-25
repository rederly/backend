/* eslint-disable @typescript-eslint/no-namespace */

/**
 * THIS FILE IS AUTO GENERATED
 * DO NOT MODIFY!!!
 * TO UPDATE THIS FILE CHANGE THE SCHEMES IN THE `-route-validation.ts` FILES
 * THEN RUN `npm run generate-route-types`
 */

import * as Joi from '@hapi/joi';
import 'joi-extract-type';
import * as validations from './course-route-validation';

export namespace CreateCourseRequest {
    export type params = Joi.extractType<typeof validations.createCourseValidation.params>;
    export type query = Joi.extractType<typeof validations.createCourseValidation.query>;
    export type body = Joi.extractType<typeof validations.createCourseValidation.body>;
};

export namespace PostImportCourseArchiveRequest {
    export type params = Joi.extractType<typeof validations.postImportCourseArchiveValidation.params>;
    export type query = Joi.extractType<typeof validations.postImportCourseArchiveValidation.query>;
    export type body = Joi.extractType<typeof validations.postImportCourseArchiveValidation.body>;
};

export namespace CreateQuestionsForTopicFromDefFileRequest {
    export type params = Joi.extractType<typeof validations.createQuestionsForTopicFromDefFileValidation.params>;
    export type query = Joi.extractType<typeof validations.createQuestionsForTopicFromDefFileValidation.query>;
    export type body = Joi.extractType<typeof validations.createQuestionsForTopicFromDefFileValidation.body>;
};

export namespace CreateCourseUnitRequest {
    export type params = Joi.extractType<typeof validations.createCourseUnitValidation.params>;
    export type query = Joi.extractType<typeof validations.createCourseUnitValidation.query>;
    export type body = Joi.extractType<typeof validations.createCourseUnitValidation.body>;
};

export namespace CreateCourseTopicRequest {
    export type params = Joi.extractType<typeof validations.createCourseTopicValidation.params>;
    export type query = Joi.extractType<typeof validations.createCourseTopicValidation.query>;
    export type body = Joi.extractType<typeof validations.createCourseTopicValidation.body>;
};

export namespace UpdateCourseTopicRequest {
    export type params = Joi.extractType<typeof validations.updateCourseTopicValidation.params>;
    export type query = Joi.extractType<typeof validations.updateCourseTopicValidation.query>;
    export type body = Joi.extractType<typeof validations.updateCourseTopicValidation.body>;
};

export namespace ExtendCourseTopicForUserRequest {
    export type params = Joi.extractType<typeof validations.extendCourseTopicForUserValidation.params>;
    export type query = Joi.extractType<typeof validations.extendCourseTopicForUserValidation.query>;
    export type body = Joi.extractType<typeof validations.extendCourseTopicForUserValidation.body>;
};

export namespace DeleteCourseUnitRequest {
    export type params = Joi.extractType<typeof validations.deleteCourseUnitValidation.params>;
    export type query = Joi.extractType<typeof validations.deleteCourseUnitValidation.query>;
    export type body = Joi.extractType<typeof validations.deleteCourseUnitValidation.body>;
};

export namespace DeleteCourseTopicRequest {
    export type params = Joi.extractType<typeof validations.deleteCourseTopicValidation.params>;
    export type query = Joi.extractType<typeof validations.deleteCourseTopicValidation.query>;
    export type body = Joi.extractType<typeof validations.deleteCourseTopicValidation.body>;
};

export namespace DeleteCourseQuestionRequest {
    export type params = Joi.extractType<typeof validations.deleteCourseQuestionValidation.params>;
    export type query = Joi.extractType<typeof validations.deleteCourseQuestionValidation.query>;
    export type body = Joi.extractType<typeof validations.deleteCourseQuestionValidation.body>;
};

export namespace UpdateCourseUnitRequest {
    export type params = Joi.extractType<typeof validations.updateCourseUnitValidation.params>;
    export type query = Joi.extractType<typeof validations.updateCourseUnitValidation.query>;
    export type body = Joi.extractType<typeof validations.updateCourseUnitValidation.body>;
};

export namespace UpdateCourseRequest {
    export type params = Joi.extractType<typeof validations.updateCourseValidation.params>;
    export type query = Joi.extractType<typeof validations.updateCourseValidation.query>;
    export type body = Joi.extractType<typeof validations.updateCourseValidation.body>;
};

export namespace UpdateCourseTopicQuestionRequest {
    export type params = Joi.extractType<typeof validations.updateCourseTopicQuestionValidation.params>;
    export type query = Joi.extractType<typeof validations.updateCourseTopicQuestionValidation.query>;
    export type body = Joi.extractType<typeof validations.updateCourseTopicQuestionValidation.body>;
};

export namespace UpdateGradeRequest {
    export type params = Joi.extractType<typeof validations.updateGradeValidation.params>;
    export type query = Joi.extractType<typeof validations.updateGradeValidation.query>;
    export type body = Joi.extractType<typeof validations.updateGradeValidation.body>;
};

export namespace UpdateGradeInstanceRequest {
    export type params = Joi.extractType<typeof validations.updateGradeInstanceValidation.params>;
    export type query = Joi.extractType<typeof validations.updateGradeInstanceValidation.query>;
    export type body = Joi.extractType<typeof validations.updateGradeInstanceValidation.body>;
};

export namespace CreateCourseTopicQuestionRequest {
    export type params = Joi.extractType<typeof validations.createCourseTopicQuestionValidation.params>;
    export type query = Joi.extractType<typeof validations.createCourseTopicQuestionValidation.query>;
    export type body = Joi.extractType<typeof validations.createCourseTopicQuestionValidation.body>;
};

export namespace ExtendCourseTopicQuestionRequest {
    export type params = Joi.extractType<typeof validations.extendCourseTopicQuestionValidation.params>;
    export type query = Joi.extractType<typeof validations.extendCourseTopicQuestionValidation.query>;
    export type body = Joi.extractType<typeof validations.extendCourseTopicQuestionValidation.body>;
};

export namespace GetQuestionGradeRequest {
    export type params = Joi.extractType<typeof validations.getQuestionGradeValidation.params>;
    export type query = Joi.extractType<typeof validations.getQuestionGradeValidation.query>;
    export type body = Joi.extractType<typeof validations.getQuestionGradeValidation.body>;
};

export namespace GetQuestionRawRequest {
    export type params = Joi.extractType<typeof validations.getQuestionRawValidation.params>;
    export type query = Joi.extractType<typeof validations.getQuestionRawValidation.query>;
    export type body = Joi.extractType<typeof validations.getQuestionRawValidation.body>;
};

export namespace GetQuestionOpenLabRequest {
    export type params = Joi.extractType<typeof validations.getQuestionOpenLabValidation.params>;
    export type query = Joi.extractType<typeof validations.getQuestionOpenLabValidation.query>;
    export type body = Joi.extractType<typeof validations.getQuestionOpenLabValidation.body>;
};

export namespace GetQuestionShowMeAnotherRequest {
    export type params = Joi.extractType<typeof validations.getQuestionShowMeAnotherValidation.params>;
    export type query = Joi.extractType<typeof validations.getQuestionShowMeAnotherValidation.query>;
    export type body = Joi.extractType<typeof validations.getQuestionShowMeAnotherValidation.body>;
};

export namespace GetQuestionRequest {
    export type params = Joi.extractType<typeof validations.getQuestionValidation.params>;
    export type query = Joi.extractType<typeof validations.getQuestionValidation.query>;
    export type body = Joi.extractType<typeof validations.getQuestionValidation.body>;
};

export namespace PreviewQuestionRequest {
    export type params = Joi.extractType<typeof validations.previewQuestionValidation.params>;
    export type query = Joi.extractType<typeof validations.previewQuestionValidation.query>;
    export type body = Joi.extractType<typeof validations.previewQuestionValidation.body>;
};

export namespace GetQuestionsRequest {
    export type params = Joi.extractType<typeof validations.getQuestionsValidation.params>;
    export type query = Joi.extractType<typeof validations.getQuestionsValidation.query>;
    export type body = Joi.extractType<typeof validations.getQuestionsValidation.body>;
};

export namespace GetCourseRequest {
    export type params = Joi.extractType<typeof validations.getCourseValidation.params>;
    export type query = Joi.extractType<typeof validations.getCourseValidation.query>;
    export type body = Joi.extractType<typeof validations.getCourseValidation.body>;
};

export namespace GetTopicRequest {
    export type params = Joi.extractType<typeof validations.getTopicValidation.params>;
    export type query = Joi.extractType<typeof validations.getTopicValidation.query>;
    export type body = Joi.extractType<typeof validations.getTopicValidation.body>;
};

export namespace GetTopicsRequest {
    export type params = Joi.extractType<typeof validations.getTopicsValidation.params>;
    export type query = Joi.extractType<typeof validations.getTopicsValidation.query>;
    export type body = Joi.extractType<typeof validations.getTopicsValidation.body>;
};

export namespace EnrollInCourseRequest {
    export type params = Joi.extractType<typeof validations.enrollInCourseValidation.params>;
    export type query = Joi.extractType<typeof validations.enrollInCourseValidation.query>;
    export type body = Joi.extractType<typeof validations.enrollInCourseValidation.body>;
};

export namespace EnrollInCourseByCodeRequest {
    export type params = Joi.extractType<typeof validations.enrollInCourseByCodeValidation.params>;
    export type query = Joi.extractType<typeof validations.enrollInCourseByCodeValidation.query>;
    export type body = Joi.extractType<typeof validations.enrollInCourseByCodeValidation.body>;
};

export namespace DeleteEnrollmentRequest {
    export type params = Joi.extractType<typeof validations.deleteEnrollmentValidation.params>;
    export type query = Joi.extractType<typeof validations.deleteEnrollmentValidation.query>;
    export type body = Joi.extractType<typeof validations.deleteEnrollmentValidation.body>;
};

export namespace ListCoursesRequest {
    export type params = Joi.extractType<typeof validations.listCoursesValidation.params>;
    export type query = Joi.extractType<typeof validations.listCoursesValidation.query>;
    export type body = Joi.extractType<typeof validations.listCoursesValidation.body>;
};

export namespace BrowseProblemsCourseListRequest {
    export type params = Joi.extractType<typeof validations.browseProblemsCourseListValidation.params>;
    export type query = Joi.extractType<typeof validations.browseProblemsCourseListValidation.query>;
    export type body = Joi.extractType<typeof validations.browseProblemsCourseListValidation.body>;
};

export namespace BrowseProblemsUnitListRequest {
    export type params = Joi.extractType<typeof validations.browseProblemsUnitListValidation.params>;
    export type query = Joi.extractType<typeof validations.browseProblemsUnitListValidation.query>;
    export type body = Joi.extractType<typeof validations.browseProblemsUnitListValidation.body>;
};

export namespace BrowseProblemsTopicListRequest {
    export type params = Joi.extractType<typeof validations.browseProblemsTopicListValidation.params>;
    export type query = Joi.extractType<typeof validations.browseProblemsTopicListValidation.query>;
    export type body = Joi.extractType<typeof validations.browseProblemsTopicListValidation.body>;
};

export namespace BrowseProblemsSearchRequest {
    export type params = Joi.extractType<typeof validations.browseProblemsSearchValidation.params>;
    export type query = Joi.extractType<typeof validations.browseProblemsSearchValidation.query>;
    export type body = Joi.extractType<typeof validations.browseProblemsSearchValidation.body>;
};

export namespace GetGradesRequest {
    export type params = Joi.extractType<typeof validations.getGradesValidation.params>;
    export type query = Joi.extractType<typeof validations.getGradesValidation.query>;
    export type body = Joi.extractType<typeof validations.getGradesValidation.body>;
};

export namespace GetGradesForTopicsByCourseRequest {
    export type params = Joi.extractType<typeof validations.getGradesForTopicsByCourseValidation.params>;
    export type query = Joi.extractType<typeof validations.getGradesForTopicsByCourseValidation.query>;
    export type body = Joi.extractType<typeof validations.getGradesForTopicsByCourseValidation.body>;
};

export namespace GetStatisticsOnUnitsRequest {
    export type params = Joi.extractType<typeof validations.getStatisticsOnUnitsValidation.params>;
    export type query = Joi.extractType<typeof validations.getStatisticsOnUnitsValidation.query>;
    export type body = Joi.extractType<typeof validations.getStatisticsOnUnitsValidation.body>;
};

export namespace GetStatisticsOnTopicsRequest {
    export type params = Joi.extractType<typeof validations.getStatisticsOnTopicsValidation.params>;
    export type query = Joi.extractType<typeof validations.getStatisticsOnTopicsValidation.query>;
    export type body = Joi.extractType<typeof validations.getStatisticsOnTopicsValidation.body>;
};

export namespace GetStatisticsOnQuestionsRequest {
    export type params = Joi.extractType<typeof validations.getStatisticsOnQuestionsValidation.params>;
    export type query = Joi.extractType<typeof validations.getStatisticsOnQuestionsValidation.query>;
    export type body = Joi.extractType<typeof validations.getStatisticsOnQuestionsValidation.body>;
};

export namespace GetProblemsRequest {
    export type params = Joi.extractType<typeof validations.getProblemsValidation.params>;
    export type query = Joi.extractType<typeof validations.getProblemsValidation.query>;
    export type body = Joi.extractType<typeof validations.getProblemsValidation.body>;
};

export namespace CreateAssessmentVersionRequest {
    export type params = Joi.extractType<typeof validations.createAssessmentVersionValidation.params>;
    export type query = Joi.extractType<typeof validations.createAssessmentVersionValidation.query>;
    export type body = Joi.extractType<typeof validations.createAssessmentVersionValidation.body>;
};

export namespace EndAssessmentVersionRequest {
    export type params = Joi.extractType<typeof validations.endAssessmentVersionValidation.params>;
    export type query = Joi.extractType<typeof validations.endAssessmentVersionValidation.query>;
    export type body = Joi.extractType<typeof validations.endAssessmentVersionValidation.body>;
};

export namespace SubmitAssessmentVersionRequest {
    export type params = Joi.extractType<typeof validations.submitAssessmentVersionValidation.params>;
    export type query = Joi.extractType<typeof validations.submitAssessmentVersionValidation.query>;
    export type body = Joi.extractType<typeof validations.submitAssessmentVersionValidation.body>;
};

export namespace GradeAssessmentRequest {
    export type params = Joi.extractType<typeof validations.gradeAssessmentValidation.params>;
    export type query = Joi.extractType<typeof validations.gradeAssessmentValidation.query>;
    export type body = Joi.extractType<typeof validations.gradeAssessmentValidation.body>;
};

export namespace GetAttachmentPresignedURLRequest {
    export type params = Joi.extractType<typeof validations.getAttachmentPresignedURLValidation.params>;
    export type query = Joi.extractType<typeof validations.getAttachmentPresignedURLValidation.query>;
    export type body = Joi.extractType<typeof validations.getAttachmentPresignedURLValidation.body>;
};

export namespace PostAttachmentRequest {
    export type params = Joi.extractType<typeof validations.postAttachmentValidation.params>;
    export type query = Joi.extractType<typeof validations.postAttachmentValidation.query>;
    export type body = Joi.extractType<typeof validations.postAttachmentValidation.body>;
};

export namespace ListAttachmentsRequest {
    export type params = Joi.extractType<typeof validations.listAttachmentsValidation.params>;
    export type query = Joi.extractType<typeof validations.listAttachmentsValidation.query>;
    export type body = Joi.extractType<typeof validations.listAttachmentsValidation.body>;
};

export namespace DeleteAttachmentRequest {
    export type params = Joi.extractType<typeof validations.deleteAttachmentValidation.params>;
    export type query = Joi.extractType<typeof validations.deleteAttachmentValidation.query>;
    export type body = Joi.extractType<typeof validations.deleteAttachmentValidation.body>;
};

export namespace EmailProfRequest {
    export type params = Joi.extractType<typeof validations.emailProfValidation.params>;
    export type query = Joi.extractType<typeof validations.emailProfValidation.query>;
    export type body = Joi.extractType<typeof validations.emailProfValidation.body>;
};

export namespace ReadQuestionRequest {
    export type params = Joi.extractType<typeof validations.readQuestionValidation.params>;
    export type query = Joi.extractType<typeof validations.readQuestionValidation.query>;
    export type body = Joi.extractType<typeof validations.readQuestionValidation.body>;
};

export namespace SaveQuestionRequest {
    export type params = Joi.extractType<typeof validations.saveQuestionValidation.params>;
    export type query = Joi.extractType<typeof validations.saveQuestionValidation.query>;
    export type body = Joi.extractType<typeof validations.saveQuestionValidation.body>;
};

export namespace UploadAssetRequest {
    export type params = Joi.extractType<typeof validations.uploadAssetValidation.params>;
    export type query = Joi.extractType<typeof validations.uploadAssetValidation.query>;
    export type body = Joi.extractType<typeof validations.uploadAssetValidation.body>;
};

export namespace CatalogRequest {
    export type params = Joi.extractType<typeof validations.catalogValidation.params>;
    export type query = Joi.extractType<typeof validations.catalogValidation.query>;
    export type body = Joi.extractType<typeof validations.catalogValidation.body>;
};

export namespace GetVersionRequest {
    export type params = Joi.extractType<typeof validations.getVersionValidation.params>;
    export type query = Joi.extractType<typeof validations.getVersionValidation.query>;
    export type body = Joi.extractType<typeof validations.getVersionValidation.body>;
};

export namespace BulkExportRequest {
    export type params = Joi.extractType<typeof validations.bulkExportValidation.params>;
    export type query = Joi.extractType<typeof validations.bulkExportValidation.query>;
    export type body = Joi.extractType<typeof validations.bulkExportValidation.body>;
};

export namespace EndBulkExportRequest {
    export type params = Joi.extractType<typeof validations.endBulkExportValidation.params>;
    export type query = Joi.extractType<typeof validations.endBulkExportValidation.query>;
    export type body = Joi.extractType<typeof validations.endBulkExportValidation.body>;
};
