import configurations from './configurations';
import logger from './utilities/logger';
import bodyParser = require('body-parser');
import cookieParser = require('cookie-parser');
// Switching to import caused errors
// eslint-disable-next-line @typescript-eslint/no-var-requires
const router = require('./routes');

import express = require('express');
import { Request, Response, NextFunction } from 'express';

import morgan = require('morgan');
import passport = require('passport');
import rateLimit = require('express-rate-limit');
import Boom = require('boom');
import AlreadyExistsError from './exceptions/already-exists-error';
import NotFoundError from './exceptions/not-found-error';
import IllegalArgumentException from './exceptions/illegal-argument-exception';
import ForbiddenError from './exceptions/forbidden-error';
import * as _ from 'lodash';
import * as nodeUrl from 'url';
import { rederlyRequestNamespaceMiddleware } from './middleware/rederly-request-namespace';

interface ErrorResponse {
    statusCode: number;
    status: string;
    rederlyReference: string;
    error?: unknown;
}

const { port, basePath } = configurations.server;

const {
    windowLength,
    maxRequests
} = configurations.server.limiter;

const app = express();

app.use(rederlyRequestNamespaceMiddleware);

app.use(morgan((tokens, req, res) => {
    const responseTime = parseInt(tokens['response-time'](req, res) ?? '', 10);
    const shouldWarn = !_.isNumber(responseTime) || responseTime > configurations.server.logAccessSlowRequestThreshold;
    const message = [
        tokens.method(req, res),
        tokens.url(req, res),
        tokens.status(req, res),
        tokens.res(req, res, 'content-length'), '-',
        responseTime, 'ms'
    ].join(' ');

    return JSON.stringify({
        shouldWarn: shouldWarn,
        responseTime: responseTime,
        message: message
    });
}, {
    stream: {
        write: (message): void => {
            const obj = JSON.parse(message);
            const output = obj.message;
            if (obj.shouldWarn) {
                logger.warn(`Slow request: Access log: ${output}`);
            } else if (configurations.server.logAccess) {
                logger.info(`Access log: ${output}`);
            }
        }
    }
}));

const generatePathRegex = (pathRegex: string): RegExp => new RegExp(`^${basePath}${pathRegex}$`);
const baseUrlRegex = generatePathRegex('.*');

// If these configurations aren't used there is no need to bog down the middlewares
if (configurations.server.logInvalidlyPrefixedRequests || configurations.server.blockInvalidlyPrefixedRequests) {
    app.use((req: Request, _res: Response, next: NextFunction) => {
        const { path: reqPath } = req;
        
        const isInvalid = baseUrlRegex.test(reqPath) === false;

        if (configurations.server.logInvalidlyPrefixedRequests && isInvalid) {
            logger.warn(`A request came in that did not match the baseURL; This could be sign of an intrusion attempt! ${reqPath}`);
        }
    
        if (configurations.server.blockInvalidlyPrefixedRequests && isInvalid) {
            req.socket.end();
        } else {
            next();
        }
    });
}

const rateLimiterWhiteList: Array<RegExp> = [
    // Dev route, comment in if you are using scheduler test routes
    // generatePathRegex('/schedule/hook'),
    generatePathRegex('/courses/assessment/topic/\\d+/submit/\\d+/auto'),
];

const limiter = rateLimit({
    windowMs: windowLength,
    max: maxRequests,
    handler: (_req, _res, next) => next(Boom.tooManyRequests()),
    skip: (req: Request): boolean => {
        const { path: reqPath } = req;

        let result = false;
        rateLimiterWhiteList.some((r: RegExp): boolean => {
            if (r.test(reqPath)) {
                logger.debug(`${reqPath} bypasses rate limiting`);
                result = true;
                // break out of forEach
                return true;
            }
            // keep going
            return false;
        });

        return result;
    }
});

app.use(limiter);

const apiTimeout = configurations.server.requestTimeout;
app.use((req, res, next) => {
    const timeoutHandler = (): void => {
        const url = nodeUrl.format({
            protocol: req.protocol,
            host: req.get('host'),
            pathname: req.originalUrl
        });
        logger.error(`Request timed out ${url}`);
        next(Boom.clientTimeout());
    };

    // Set the timeout for all HTTP requests
    req.setTimeout(apiTimeout, timeoutHandler);
    // Set the server response timeout for all HTTP requests
    res.setTimeout(apiTimeout, timeoutHandler);
    next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(passport.initialize());

app.use(basePath, router);


// General Exception Handler
// next is a required parameter, without having it requests result in a response of object
// TODO: err is Boom | Error | any, the any is errors that we have to define
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
app.use((obj: any, req: Request, res: Response, next: NextFunction) => {
    if (obj instanceof AlreadyExistsError || obj instanceof NotFoundError || obj instanceof IllegalArgumentException) {
        next(Boom.badRequest(obj.message, obj.data));
    } else if (obj instanceof ForbiddenError) {
        next(Boom.forbidden());
    } else {
        next(obj);
    }
});

// General Exception Handler
// next is a required parameter, without having it requests result in a response of object
// TODO: err is Boom | Error | any, the any is errors that we have to define
// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
app.use((obj: any, req: Request, res: Response, next: NextFunction) => {
    if (obj.output) {
        return res.status(obj.output.statusCode).json({
            data: obj.data,
            ...obj.output.payload
        });
    }
    else if (obj.statusCode) {
        return res.status(obj.statusCode).json(obj);
    } else if (obj.status) {
        return res.status(obj.status).json(obj);
    } else {
        const rederlyReference = `rederly-reference-${new Date().getTime()}-${Math.floor(Math.random() * 1000000)}`;
        logger.error(`${rederlyReference} - ${obj.stack}`);
        const data: ErrorResponse = {
            statusCode: 500,
            status: 'Internal Server Error',
            rederlyReference
        };

        if (process.env.NODE_ENV !== 'production') {
            data.error = obj;
        }

        return res.status(data.statusCode).json(data);
    }
});

export const listen = (): Promise<null> => {
    return new Promise((resolve) => {
        app.listen(port, () => {
            logger.info(`Server started up and listening on port: ${port}`);
            resolve();
        });
    });
};
