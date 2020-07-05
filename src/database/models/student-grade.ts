import { Model, DataTypes, BelongsToGetAssociationMixin } from 'sequelize';
import appSequelize from '../app-sequelize'

export default class StudentGrade extends Model {
  public id!: number; // Note that the `null assertion` `!` is required in strict mode.
  public userId!: number;
  public courseWWTopicQuestionId!: number;
  public randomSeed!: number;
  public bestScore!: number;
  public numAttempts!: number;
  public firstAttempts!: number;
  public latestAttempts!: number;

  public getUser!: BelongsToGetAssociationMixin<User>;
  public getCourseWWTopicQuestion!: BelongsToGetAssociationMixin<CourseWWTopicQuestion>;

  public user!: User;
  public courseWWTopicQuestion!: CourseWWTopicQuestion;


  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  static createAssociations(): void {
    // This is a hack to add the associations later to avoid cyclic dependencies
    /* eslint-disable @typescript-eslint/no-use-before-define */
    // // Here we associate which actually populates out pre-declared `association` static and other methods.
    // User.hasMany(Session, {
    //   sourceKey: 'id',
    //   foreignKey: 'user_id',
    //   as: 'user' // this determines the name in `associations`!
    // });

    StudentGrade.belongsTo(User, {
      foreignKey: 'userId',
      targetKey: 'id',
      as: 'user'
    });
    
    StudentGrade.belongsTo(CourseWWTopicQuestion, {
      foreignKey: 'courseWWTopicQuestionId',
      targetKey: 'id',
      as: 'question'
    });

    StudentGrade.hasMany(StudentWorkbook, {
      foreignKey: 'studentGradeId',
      sourceKey: 'id',
      as: 'workbooks'
    });
    /* eslint-enable @typescript-eslint/no-use-before-define */
  }

}

StudentGrade.init({
  id: {
    field: 'student_grade_id',
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    field: 'user_id',
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  courseWWTopicQuestionId: {
    field: 'student_grade_course_ww_topic_question_id',
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  randomSeed: {
    field: 'student_grade_random_seed',
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  bestScore: {
    field: 'student_grade_best_score',
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  numAttempts: {
    field: 'student_grade_num_attempts',
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  firstAttempts: {
    field: 'student_grade_first_attempts',
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  latestAttempts: {
    field: 'student_grade_latest_attempts',
    type: DataTypes.FLOAT,
    allowNull: true,
  },
}, {
  tableName: 'student_grade',
  sequelize: appSequelize, // this bit is important
});

import CourseWWTopicQuestion from './course-ww-topic-question';
import User from './user';import StudentWorkbook from './student-workbook';

