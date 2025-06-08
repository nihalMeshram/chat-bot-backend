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
import { HasMany } from 'sequelize-typescript';
import { Document } from '../documents/document.model';

@Table({
  timestamps: true,
  paranoid: true,
  tableName: 'users',
  defaultScope: {
    attributes: { exclude: ['password', 'deletedAt'] },
  },
  scopes: {
    withPassword: {
      attributes: { include: ['password', 'deletedAt'] },
    },
  },
})
export class User extends Model<User> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Column
  declare fullName: string;

  @Column({ unique: true })
  declare email: string;

  @Column
  declare password: string;

  @Default(UserRole.VIEWER)
  @Column(DataType.ENUM(...Object.values(UserRole)))
  declare role: UserRole;

  @HasMany(() => Document, 'createdBy')
  documents: Document[];

  @BeforeCreate
  @BeforeUpdate
  static async hashPassword(instance: User) {
    if (instance.changed('password')) {
      const salt = await bcrypt.genSalt(10);
      instance.password = await bcrypt.hash(instance.password, salt);
    }
  }
}
