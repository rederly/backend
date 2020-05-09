import { Model, DataTypes, HasOneGetAssociationMixin, BelongsToGetAssociationMixin } from 'sequelize';
import appSequelize from '../app-sequelize'
import University from './university';
// import Session from './session';
import Permission from './permission';

export default class User extends Model {
  public id!: number; // Note that the `null assertion` `!` is required in strict mode.
  public universityId!: number;
  public roleId!: number;
  public username!: string;
  public email!: string;
  public password!: string;
  public verifyToken?: string;
  public verified!: boolean;

  public getUniversity!: HasOneGetAssociationMixin<University>;
  public getRole!: BelongsToGetAssociationMixin<Permission>;

  public readonly university!: University;
  public readonly role!: Permission;

  // timestamps!
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init({
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  universityId: {
    field: 'university_id',
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  roleId: {
    field: 'role_id',
    type: DataTypes.INTEGER,
    allowNull: false,
  },  
  username: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  email: {
    type: DataTypes.TEXT,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  verifyToken: {
    field: 'verify_token',
    type: DataTypes.TEXT,
    allowNull: true,
  },
  verified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  tableName: 'users',
  sequelize: appSequelize, // this bit is important
});

// // Here we associate which actually populates out pre-declared `association` static and other methods.
// User.hasMany(Session, {
//   sourceKey: 'id',
//   foreignKey: 'user_id',
//   as: 'user' // this determines the name in `associations`!
// });

User.belongsTo(Permission, {
  foreignKey: 'roleId',
  targetKey: 'id',
  as: 'role'
});

User.belongsTo(University, {
  foreignKey: 'university_id',
  targetKey: 'id',
  as: 'university'
});