import emailHelper from '../../utilities/email-helper';
import logger from '../../utilities/logger';
import { v4 as uuidv4 } from 'uuid';
import User from '../../database/models/user';
import Bluebird = require('bluebird');
import universityController from '../universities/university-controller';
import { hashPassword, comparePassword } from '../../utilities/encryption-helper';
import Session from '../../database/models/session';
import moment = require('moment');
import configurations from '../../configurations';
import NoAssociatedUniversityError from '../../exceptions/no-associated-university-error';
import { UniqueConstraintError } from 'sequelize';
import AlreadyExistsError from '../../exceptions/already-exists-error';
import Role from '../permissions/roles';

interface RegisterUserOptions {
    userObject: User;
    baseUrl: string;
}

interface RegisterUserResponse {
    id: number;
    roleId: number;
    emailSent: boolean;
}

const {
    sessionLife
} = configurations.auth;

class UserController {
    getUserByEmail(email: string): Bluebird<User> {
        return User.findOne({
            where: {
                email
            }
        })
    }

    getUserById(id: number): Bluebird<User> {
        return User.findOne({
            where: {
                id
            }
        })
    }

    createUser(userObject: User): Bluebird<User> {
        return User.create(userObject);
    }

    getSession(uuid: string): Bluebird<Session> {
        return Session.findOne({
            where: {
                uuid,
                active: true
            }
        })
    }

    createSession(userId: number): Bluebird<Session> {
        const expiresAt: Date = moment().add(sessionLife, 'hour').toDate();
        return Session.create({
            userId,
            uuid: uuidv4(),
            expiresAt: expiresAt,
            active: true
        })
    }

    async login(email: string, password: string): Promise<Session> {
        const user: User = await this.getUserByEmail(email);
        if (user == null)
            return null;

        if (!user.verified) {
            return null;
        }

        if (await comparePassword(password, user.password)) {
            return this.createSession(user.id);
        }
        return null;
    }

    async logout(uuid: string): Promise<[number, Session[]]> {
        return Session.update({
            active: false
        }, {
            where: {
                uuid
            }
        });
    }

    async registerUser(options: RegisterUserOptions): Promise<RegisterUserResponse> {
        const {
            baseUrl,
            userObject
        } = options;

        const emailDomain = userObject.email.split('@')[1];

        let newUser;

        const universities = await universityController.getUniversitiesAssociatedWithEmail({
            emailDomain
        });
        if (universities.length < 1) {
            throw new NoAssociatedUniversityError(`There is no university associated with the email domain ${emailDomain}`);
        }
        if (universities.length > 1) {
            logger.error(`Multiple universities found ${universities.length}`);
        }
        const university = universities[0];


        if (university.studentEmailDomain === emailDomain) {
            userObject.roleId = Role.STUDENT;
        } else if (university.profEmailDomain === emailDomain) {
            userObject.roleId = Role.PROFESSOR;
        } else {
            throw new Error('This should not be possible since the email domain came up in the university query');
        }

        userObject.universityId = university.id;
        userObject.verifyToken = uuidv4();
        userObject.password = await hashPassword(userObject.password);
        try {
            newUser = await this.createUser(userObject);
        } catch (e) {
            if (e instanceof UniqueConstraintError) {
                if (Object.keys(e.fields).includes('email')) {
                    throw new AlreadyExistsError(`The email ${e.fields.email} already exists`);
                }
            }
            throw e;
        }

        let emailSent = false;
        try {
            await emailHelper.sendEmail({
                content: `Hello,

                Please verify your account by clicking this url: ${baseUrl}/users/verify?verify_token=${newUser.verifyToken}
                `,
                email: newUser.email,
                subject: 'Please veryify account'
            });
            emailSent = configurations.email.enabled;
        } catch (e) {
            logger.error(e);
        }

        return {
            id: newUser.id,
            roleId: newUser.roleId,
            emailSent
        }
    }

    async verifyUser(verifyToken: string): Promise<boolean> {
        const updateResp = await User.update({
            verified: true
        }, {
            where: {
                verifyToken,
                verified: false
            }
        });
        return updateResp[0] > 0;
    }
}
const userController = new UserController();
export default userController;