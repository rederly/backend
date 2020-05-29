import { Model, DataTypes } from 'sequelize';
import appSequelize from '../app-sequelize'
import CurriculumTopicContent from './curriculum-topic-content';

export default class CourseWWTopicQuestion extends Model {
    public id!: number; // Note that the `null assertion` `!` is required in strict mode.
    public curriculumTopicContentId!: number;
    public problemNumber!: number;
    public webworkQuestionWWPath!: string;
    public weight!: number;
    public maxAttempts!: number;
    public hidden!: boolean;
    public active!: boolean;

    // timestamps!
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

CourseWWTopicQuestion.init({
    id: {
        field: 'course_ww_topic_question_id',
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    courseTopicContentId: {
        field: 'course_topic_content_id',
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    problemNumber: {
        field: 'course_ww_topic_question_problem_number',
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    webworkQuestionPath: {
        field: 'course_ww_topic_question_webwork_question_ww_path',
        type: DataTypes.TEXT,
        allowNull: false,
    },
    weight: {
        field: 'course_ww_topic_question_weight',
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    maxAttempts: {
        field: 'course_ww_topic_question_max_attempts',
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    hidden: {
        field: 'course_ww_topic_question_hidden',
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
    active: {
        field: 'course_ww_topic_question_active',
        type: DataTypes.BOOLEAN,
        allowNull: false,
    },
}, {
    tableName: 'course_ww_topic_question',
    sequelize: appSequelize, // this bit is important
});

CourseWWTopicQuestion.belongsTo(CurriculumTopicContent, {
    foreignKey: 'curriculumTopicContentId',
    targetKey: 'id',
    as: 'curriculumTopicContent'
});