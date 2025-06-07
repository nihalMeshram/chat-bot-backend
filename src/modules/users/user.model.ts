import {
  Table,
  Column,
  Model,
  PrimaryKey,
  Default,
  DataType,
  BeforeCreate,
  BeforeUpdate,
} from 'sequelize-typescript';
import * as bcrypt from 'bcrypt';
import { UserRole } from './types/user-role.type';

@Table({ timestamps: true, paranoid: true, tableName: 'users' })
export class User extends Model<User> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Column
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column
  password: string;

  @Column(DataType.ENUM(...Object.values(UserRole)))
  role: UserRole;

  @BeforeCreate
  @BeforeUpdate
  static async hashPassword(instance: User) {
    if (instance.changed('password')) {
      const salt = await bcrypt.genSalt(10);
      instance.password = await bcrypt.hash(instance.password, salt);
    }
  }
}
