import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import configurations from '../configurations';
import Role from '../features/permissions/roles';
import * as _ from 'lodash';
import * as Joi from '@hapi/joi';
import 'joi-extract-type';
import { isAxiosError } from './axios-helper';
import logger from './logger';
import NotFoundError from '../exceptions/not-found-error';
import WrappedError from '../exceptions/wrapped-error';
import { RederlyExtendedJoi } from '../extensions/rederly-extended-joi';
import urljoin = require('url-join');
import * as fs from'fs';
import formHelper, { unmergeStrategies } from './form-helper';

// h/t -- https://stackoverflow.com/a/45460625
function scheduleRequests(axiosInstance: AxiosInstance, intervalMs: number): void {
    let lastInvocationTime: number | undefined = undefined;
    const scheduler = (config: AxiosRequestConfig): AxiosRequestConfig | Promise<AxiosRequestConfig> => {
        const now = Date.now();
        if (lastInvocationTime) {
            lastInvocationTime += intervalMs;
            const waitPeriodForThisRequest = lastInvocationTime - now;
            if (waitPeriodForThisRequest > 0) {
                return new Promise((resolve) => {
                    setTimeout(
                        () => resolve(config),
                        waitPeriodForThisRequest);
                });
            }
        }
        lastInvocationTime = now;
        return config;
    };
    axiosInstance.interceptors.request.use(scheduler);
}

const rendererAxios = axios.create({
    baseURL: configurations.renderer.url,
    responseType: 'json',
    timeout: configurations.renderer.requestTimeout
});

scheduleRequests(rendererAxios, 3);

// TODO switch over to new endpoint
// the proxy we are using doesn't work with the new renderer endpoint (i'm guessing the hyphen is the problem)
// I plan to swap the proxy and hope that fixes the problem, otherwise a deeper dive is required
export const RENDERER_ENDPOINT = '/rendered';
// Would use the old endpoint however these calls are under the new endpoint
export const NEW_RENDERER_ENDPOINT = '/render-api';
export const RENDERER_LOAD_ENDPOINT = urljoin(NEW_RENDERER_ENDPOINT, 'tap');
export const RENDERER_SAVE_ENDPOINT = urljoin(NEW_RENDERER_ENDPOINT, 'can');
export const RENDERER_CATALOG_ENDPOINT = urljoin(NEW_RENDERER_ENDPOINT, 'cat');
export const RENDERER_UPLOAD_ENDPOINT = urljoin(NEW_RENDERER_ENDPOINT, 'upload');
export const RENDERER_SMA_ENDPOINT = urljoin(NEW_RENDERER_ENDPOINT, 'sma');
export const VALID_PG_PATH_REGEX = /^(private|Contrib|webwork-open-problem-library|Library)\/[^\0]+$/;

export enum OutputFormat {
    SINGLE = 'single',
    SIMPLE = 'simple',
    STATIC = 'static',
    ASSESS = 'nosubmit',
    CLASSIC = 'classic',
    PRACTICE = 'practice',
}

export interface GetProblemParameters {
    sourceFilePath?: string;
    problemSeed?: number | null;
    formURL?: string;
    baseURL?: string;
    outputformat?: OutputFormat;
    problemSource?: string;
    format?: string;
    language?: string;
    showHints?: boolean;
    showSolutions?: boolean | number;
    permissionLevel?: number | number;
    problemNumber?: number;
    numCorrect?: number;
    numIncorrect?: number;
    processAnswers?: boolean;
    formData?: { [key: string]: unknown };
    showCorrectAnswers?: boolean;
    answersSubmitted?: number;
}

export interface ReadProblemSourceOptions {
    sourceFilePath: string;
}

export interface SaveProblemSourceOptions {
    writeFilePath: string;
    problemSource: string;
}

export interface CatalogOptions {
    basePath: string;
    maxDepth: number;
}

export interface IsPathAccessibleToRendererOptions {
    problemPath: string;
}

export interface UploadAssetOptions {
    rendererPath: string;
    filePath: string;
}

export interface ShowMeAnotherOptions {
    sourceFilePath: string;
    avoidSeeds: Array<number>;
    maxIterations?: number;
}

/* eslint-disable @typescript-eslint/camelcase */
export const rendererResponseValidationScheme = Joi.object({
    answers: Joi.object().pattern(/\w+/, Joi.object({
        _filter_name: RederlyExtendedJoi.toStringedString().optional(), // Should be required, but we've seen problem source mess with the object with and drop the field
        correct_ans: Joi.any().optional(), // I have seen string and number // REQUIRED BUT I SAW AN EXISTING PROBLEM WHERE AnSwEr0002 only had a name
        original_student_ans: RederlyExtendedJoi.toStringedString().allow('').optional(), // TODO more validation with form data? // Should be required, but we've seen problem source mess with the object with and drop the field
        preview_latex_string: RederlyExtendedJoi.toStringedString().allow('').allow(null).optional(), // TODO has special characters that seem to block string // Should be required, but we've seen problem source mess with the object with and drop the field
        score: Joi.number().min(0).max(1).optional(), // Should be required, but we've seen problem source mess with the object with and drop the field
        student_ans: RederlyExtendedJoi.toStringedString().allow('').optional(), // Should be required, but we've seen problem source mess with the object with and drop the field
        correct_ans_latex_string: RederlyExtendedJoi.toStringedString().optional(), // TODO I don't see this in the object
        entry_type: RederlyExtendedJoi.toStringedString().allow(null).optional(),
        // ans_label: Joi.string().required(), // DOCUMENT SAYS DO NOT KEEP
        // ans_message: Joi.string().required(), // DOCUMENT SAYS DO NOT KEEP
        // ans_name: Joi.string().required(), // DOCUMENT SAYS DO NOT KEEP
        // preview_text_string: Joi.string().required(), // DOCUMENT STATES AS INCONSISTENT
        // type: Joi.string().required(), // DOCUMENT SAYS DO NOT KEEP
        // done: Joi.any(), // Was null don't know what type it is
        // error_flag: Joi.any(), // Was null don't know what type it is // DOCUMENT NOT SURE, OMITTING
        // error_message: Joi.string().required(), // Was empty string when not set // DOCUMENT NOT SURE, OMITTING 
        // extra: Joi.any().optional(), // DOCUMENT STATES AS INCONSISTENT
        // firstElement: Joi.any().optional(), // DOCUMENT STATES AS INCONSISTENT
        // ignoreInfinity: Joi.any().optional(), // DOCUMENT STATES AS INCONSISTENT
        // ignoreStrings: Joi.any().optional(), // DOCUMENT STATES AS INCONSISTENT
        // implicitList: Joi.any().optional(), // DOCUMENT STATES AS INCONSISTENT
        // isPreview: Joi.any().required(), // DOCUMENT SAYS DO NOT KEEP
        // list_type: Joi.any().optional(), // DOCUMENT STATES AS INCONSISTENT
        // ordered: Joi.any().optional(), // DOCUMENT STATES AS INCONSISTENT
        // partialCredit: Joi.any().optional(), // DOCUMENT STATES AS INCONSISTENT
        // removeParens: Joi.any().optional(), // DOCUMENT STATES AS INCONSISTENT
        // requireParenMatch: Joi.any().optional(), // DOCUMENT STATES AS INCONSISTENT
        // short_type: Joi.any().optional(), // DOCUMENT STATES AS INCONSISTENT
        // showCoordinateHints: Joi.any().optional(), // DOCUMENT STATES AS INCONSISTENT
        // showEqualErrors: Joi.any().optional(), // DOCUMENT STATES AS INCONSISTENT
        // showHints: Joi.any().optional(), // DOCUMENT STATES AS INCONSISTENT
        // showLengthHints: Joi.any().optional(), // DOCUMENT STATES AS INCONSISTENT
        // showParenHints: Joi.any().optional(), // DOCUMENT STATES AS INCONSISTENT
        // showTypeWarnings: Joi.any().optional(), // DOCUMENT STATES AS INCONSISTENT
        // showUnionReduceWarnings: Joi.any().optional(), // DOCUMENT STATES AS INCONSISTENT
        // student_formula: Joi.any().optional(), // DOCUMENT NOT SURE, OMITTING
        // student_value: Joi.any().optional(), // DOCUMENT NOT SURE, OMITTING
        // studentsMustReduceUnions: Joi.any().optional(), // DOCUMENT STATES AS INCONSISTENT
        // typeMatch: Joi.any().optional(), // DOCUMENT STATES AS INCONSISTENT
    })).required(),
    debug: Joi.object({
        // TODO are these required or optional
        // debug: Joi.array().items(Joi.string()).required(),
        // internal: Joi.array().items(Joi.string()).required(),
        // perl_warn: Joi.string().allow('').required(),
        // pg_warn: Joi.array().items(Joi.string()).required(),
        // render_warn: Joi.array().items(Joi.string()).optional(), // THIS FIELD IS NEW, replace with required 
        // TODO add renderer version when implemented
        // TODO add problem version when implemented
    }).optional(), // THIS FIELD IS NEW, replace with required
    // flags: Joi.object({
    //     // comment: Joi.any().optional(), // DOCUMENT STATES AS INCONSISTENT
    //     // PROBLEM_GRADER_TO_USE: Joi.any(), // DOCUMENT SAYS DO NOT KEEP
    //     // recordSubmittedAnswers: Joi.any(), // DOCUMENT SAYS DO NOT KEEP
    //     // refreshCachedImages: Joi.any(), // DOCUMENT SAYS DO NOT KEEP
    //     // showpartialCorrectAnswers: Joi.any(), // DOCUMENT SAYS DO NOT KEEP
    //     // showHint: Joi.any(), // DOCUMENT NOT SURE, OMITTING
    //     ANSWER_ENTRY_ORDER: Joi.array().items(Joi.string()).required(),
    //     KEPT_EXTRA_ANSWERS: Joi.array().items(Joi.string()).required(),
    //     showHintLimit: Joi.number().required(),
    //     showPartialCorrectAnswers: Joi.number().min(0).max(1).optional(),
    //     solutionExists: Joi.number().min(0).max(1).required(),
    //     hintExists: Joi.number().min(0).max(1).required(),
    // }).required(),
    // form_data: Joi.any().required(),
    problem_result: Joi.object({
        errors: Joi.string().allow('').required(),
        msg: Joi.string().allow('').required(),
        score: Joi.number().min(0).max(1).required(),
        type: Joi.string().required(),
    }).required(),
    // problem_state: Joi.any(), // DOCUMENT SAYS DO NOT KEEP

    renderedHTML: Joi.string().required(),
}).required();
/* eslint-enable @typescript-eslint/camelcase */
export type RendererResponse = Joi.extractType<typeof rendererResponseValidationScheme>;

export interface ShowMeAnotherResponse {
    problem: RendererResponse;
    problemSeed: number;
}


class RendererHelper {
    getOutputFormatForPermission = (permissionLevel: number): OutputFormat => {
        if (permissionLevel < 10) {
            return OutputFormat.SINGLE;
        } else {
            return OutputFormat.SIMPLE;
        }
    };

    getPermissionForRole = (role: Role): number => {
        switch (role) {
            case Role.STUDENT:
                return 0;
            case Role.PROFESSOR:
                return 10;
            case Role.ADMIN:
                return 20;
            default:
                return -1;
        }
    }

    getOutputFormatForRole = (role: Role): OutputFormat => this.getOutputFormatForPermission(this.getPermissionForRole(role));

    // (nearly) identical to that used in ProblemIframe
    // run StudentWorkbook.submitted through _.omitBy(isPrevious) to compare to StudentGrade.currentProblemState
    isPrevious = (_value: unknown, key: string): boolean => {
        return /^previous_/.test(key);
    };

    cleanRendererResponseForTheDatabase = (resp: RendererResponse): Partial<RendererResponse> => {
        // I don't know if this method could be used if we needed nested keys
        // I'm back and forth between using _.pick and joi validation
        return _.pick(resp, [
            'form_data',
            'debug'
        ]);
    }

    cleanRendererResponseForTheResponse = (resp: RendererResponse): Partial<RendererResponse> => {
        // I don't know if this method could be used if we needed nested keys
        // I'm back and forth between using _.pick and joi validation
        return _.pick(resp, [
            'renderedHTML'
        ]);
    }

    parseRendererResponse = async (resp: string | object, debug?: unknown): Promise<RendererResponse> => {
        if (typeof (resp) === 'string') {
            resp = JSON.parse(resp);
        }

        const result = await rendererResponseValidationScheme.validate<RendererResponse>(resp as RendererResponse, {
            abortEarly: true,
            allowUnknown: true,
            stripUnknown: false, // we will use this for typing the response, however for the database we will have a different scheme
            context: {
                debug
            }
        });

        return result;
    };


    async getProblem({
        sourceFilePath,
        problemSource,
        problemSeed,
        formURL,
        baseURL = '/',
        outputformat,
        language,
        showHints,
        showSolutions,
        permissionLevel,
        problemNumber,
        numCorrect,
        numIncorrect,
        processAnswers,
        format = 'json',
        formData,
        answersSubmitted,
        showCorrectAnswers = false
    }: GetProblemParameters): Promise<unknown> {
        if (!_.isNil(problemSource)) {
            problemSource = Buffer.from(problemSource).toString('base64');
        }
        const params = {
            sourceFilePath,
            problemSource,
            problemSeed,
            formURL,
            baseURL,
            outputformat,
            format,
            language,
            showHints: _.isNil(showHints) ? undefined : Number(showHints),
            showSolutions: Number(showSolutions),
            permissionLevel,
            problemNumber,
            numCorrect,
            numIncorrect,
            processAnswers,
            answersSubmitted,
            showCorrectAnswers: showCorrectAnswers ? 'true' : undefined
        };

        // Use the passed in form data but overwrite with params
        formData = {
            // formData can be null or undefined but spread handles this
            ..._(formData).omitBy(_.isNil).value(),
            ..._(params).omitBy(_.isNil).value()
        };

        const resultFormData = formHelper.objectToFormData({object: formData, unmerge: unmergeStrategies.unmergeDuplicatingKey});

        try {
            const resp = await rendererAxios.post(RENDERER_ENDPOINT, resultFormData?.getBuffer(), {
                headers: resultFormData?.getHeaders()
            });

            return resp.data;
        } catch (e) {
            const errorMessagePrefix = 'Get problem from renderer error';
            if(isAxiosError(e)) {
                if (e.response?.status === 404) {
                    logger.debug(`Question path ${sourceFilePath} not found by the renderer "${e.response?.data}"`);
                    throw new NotFoundError('Problem path not found');
                }
                // TODO cleanup error handling, data might be lengthy
                throw new WrappedError(`${errorMessagePrefix}; response: ${JSON.stringify(e.response?.data)}`, e);
            }
            // Some application error occurred
            throw new WrappedError(errorMessagePrefix, e);
        }
    }

    /**
     * This function calls the renderer to get the problem source for a specific file
     * @param {string} options.sourceFilePath The path for the renderer to read the problem source from
     * @returns {string} The contents of the filepath
     */
    readProblemSource = async ({
        sourceFilePath
    }: ReadProblemSourceOptions): Promise<unknown> => {
        const resultFormData = formHelper.objectToFormData({ 
            object: { sourceFilePath: sourceFilePath}, 
        });

        try {
            const resp = await rendererAxios.post<string>(RENDERER_LOAD_ENDPOINT, resultFormData?.getBuffer(), {
                headers: resultFormData?.getHeaders()
            });

            return resp.data;
        } catch (e) {
            const errorMessagePrefix = 'Read problem source from renderer';
            if(isAxiosError(e)) {
                if (e.response?.status === 404) {
                    logger.debug(`Question path ${sourceFilePath} not found by the renderer "${e.response?.data}"`);
                    throw new NotFoundError('Problem path not found');
                }
                // TODO cleanup error handling, data might be lengthy
                throw new WrappedError(`${errorMessagePrefix}; response: ${JSON.stringify(e.response?.data)}`, e);
            }
            // Some application error occurred
            throw new WrappedError(errorMessagePrefix, e);
        }
    }

    /**
     * This function calls the renderer to save the problem source
     * if the file already exists it will overwrite
     * @param {string} options.writeFilePath The path for the renderer to write the problem source to
     * @param {string} options.problemSource The problem source to save
     * @returns {string} The resolved file path
     */
    saveProblemSource = async ({
        writeFilePath,
        problemSource
    }: SaveProblemSourceOptions): Promise<string> => {
        const transformedProblemSource = Buffer.from(problemSource).toString('base64');
        const resultFormData = formHelper.objectToFormData({
            object: {
                writeFilePath: writeFilePath,
                problemSource: transformedProblemSource,
            },
        });

        try {
            const resp = await rendererAxios.post<string>(RENDERER_SAVE_ENDPOINT, resultFormData?.getBuffer(), {
                headers: resultFormData?.getHeaders()
            });

            return resp.data;
        } catch (e) {
            const errorMessagePrefix = `Could not save "${writeFilePath}"`;
            if(isAxiosError(e)) {
                throw new WrappedError(`${errorMessagePrefix}; response: ${JSON.stringify(e.response?.data)}`, e);
            }
            // Some application error occurred
            throw new WrappedError(errorMessagePrefix, e);
        }
    }

    /**
     * TODO fix return
     * catalog a pg file that exists returns an empty string
     * @param param0 
     */
    catalog = async ({
        basePath,
        maxDepth,
    }: CatalogOptions): Promise<{ [key: string]: number }> => {
        const resultFormData = formHelper.objectToFormData({
            object: {
                basePath: basePath,
                maxDepth: maxDepth,
            },
        });

        try {
            const resp = await rendererAxios.post<{ [key: string]: number }>(RENDERER_CATALOG_ENDPOINT, resultFormData?.getBuffer(), {
                headers: resultFormData?.getHeaders()
            });

            return resp.data;
        } catch (e) {
            const errorMessagePrefix = `Could not catalog "${basePath}"`;
            if(isAxiosError(e)) {
                if (e.response?.status === 404) {
                    logger.debug('Path not found');
                    return {};
                }
                throw new WrappedError(`${errorMessagePrefix}; response: ${JSON.stringify(e.response?.data)}`, e);
            }
            // Some application error occurred
            throw new WrappedError(errorMessagePrefix, e);
        }
    }

    isPathAccessibleToRenderer = async ({
        problemPath
    }: IsPathAccessibleToRendererOptions): Promise<boolean> => {
        if (!VALID_PG_PATH_REGEX.test(problemPath)) {
            logger.debug(`${problemPath} failed the regex test and will never be accessible to the Renderer.`);
            return false;
        }

        try {
            const catalogResult = await this.catalog({
                basePath: problemPath,
                maxDepth: 0
            });

            // right now catalog returns empty string if you catalog a pg file
            return catalogResult as unknown === '';
        } catch (err) {
            const errorMessagePrefix = `Could not check path accessibility "${problemPath}"`;
            const e = err.cause;
            if(isAxiosError(e) && e.response?.status === 403) {
                logger.debug('Path forbidden');
                return false;
            }
            // Some application error occurred
            throw new WrappedError(errorMessagePrefix, e);
        }
    }

    uploadAsset = async ({
        rendererPath,
        filePath
    }: UploadAssetOptions): Promise<string> => {
        const resultFormData = formHelper.objectToFormData({
            object: {
                path: rendererPath,
                file: fs.createReadStream(filePath)    
            }
        });
        
        try {
            const resp = await rendererAxios.post<string>(RENDERER_UPLOAD_ENDPOINT, resultFormData, {
                headers: resultFormData?.getHeaders(),
            });

            return resp.data;
        } catch (e) {
            const errorMessagePrefix = `Could not upload "${rendererPath}"`;
            if(isAxiosError(e)) {
                throw new WrappedError(`${errorMessagePrefix}; response: ${JSON.stringify(e.response?.data ?? e.stack)}`, e);
            }
            // Some application error occurred
            throw new WrappedError(errorMessagePrefix, e);
        }
    }

    showMeAnother = async ({
        sourceFilePath,
        avoidSeeds,
        maxIterations
    }: ShowMeAnotherOptions): Promise<ShowMeAnotherResponse | null> => {
        const requestFormData = formHelper.objectToFormData({
            object: {
                sourceFilePath,
                avoidSeeds: _.join(avoidSeeds, ','),
                maxIterations
            }
        });

        try {
            const response = await rendererAxios.post(RENDERER_SMA_ENDPOINT, requestFormData, {
                headers: requestFormData.getHeaders(),
            });

            return response.data as ShowMeAnotherResponse;
        } catch (e) {
            const errorMessagePrefix = 'Request for SMA failed';
            if (isAxiosError(e)) {
                if (e.response?.status === 404) {
                    return null;
                } else {
                    throw new WrappedError(`${errorMessagePrefix}; response: ${JSON.stringify(e.response?.data ?? e.stack)}`, e);
                }
            }
            throw new WrappedError(errorMessagePrefix, e);
        }
    }
}

const rendererHelper = new RendererHelper();
export default rendererHelper;
