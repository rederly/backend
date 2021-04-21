import { Model, DataTypes } from 'sequelize';
import appSequelize from '../app-sequelize';

interface TopicDescriptionProblemAttachmentInterface {
    id: number;
    topicId: number;
    problemAttachmentId: number;
    createdAt: Date;
    updatedAt: Date;
    active: boolean;
}

export default class TopicDescriptionProblemAttachment extends Model implements TopicDescriptionProblemAttachmentInterface {
    public id!: number;
    public topicId!: number;
    public problemAttachmentId!: number;
    public active!: boolean;
    
    // timestamps!
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;

    static constraints = {
    }

    static createAssociations(): void {
        // This is a hack to add the associations later to avoid cyclic dependencies
        /* eslint-disable @typescript-eslint/no-use-before-define */
        TopicDescriptionProblemAttachment.belongsTo(ProblemAttachment, {
            foreignKey: 'problemAttachmentId',
            targetKey: 'id',
            as: 'problemAttachment'
        });
        TopicDescriptionProblemAttachment.belongsTo(CourseTopicContent, {
            foreignKey: 'topicId',
            targetKey: 'id',
            as: 'topic'
        });
        /* eslint-enable @typescript-eslint/no-use-before-define */
    }
}

TopicDescriptionProblemAttachment.init({
    id: {
        field: 'id',
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    topicId: {
        field: 'topic_id',
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    problemAttachmentId: {
        field: 'problem_attachment_id',
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    active: {
        field: 'active',
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    updatedAt: {
        field: 'updated_at',
        type: DataTypes.DATE,
        allowNull: false,
    },
    createdAt: {
        field: 'created_at',
        type: DataTypes.DATE,
        allowNull: false,
    },
}, {
    tableName: 'topic_description_problem_attachment',
    sequelize: appSequelize, // this bit is important
});

import ProblemAttachment from './problem-attachment';
import CourseTopicContent from './course-topic-content';
