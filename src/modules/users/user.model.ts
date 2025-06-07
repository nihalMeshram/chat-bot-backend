import {
  Table,
  Model,
} from 'sequelize-typescript';

@Table({ timestamps: true, paranoid: true, tableName: 'users' })
export class User extends Model<User> {}
