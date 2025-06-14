import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from '../users/user.model';
import { DocumentStatus } from './types/document.status.type';

@Table({
  timestamps: true,
  paranoid: true,
  tableName: 'documents',
})
export class Document extends Model<Document> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  declare id: string;

  @Column(DataType.STRING)
  declare fileName: string;

  @Column(DataType.STRING)
  declare type: string;

  @Default(DocumentStatus.PENDING)
  @Column(DataType.ENUM(...Object.values(DocumentStatus)))
  declare status: DocumentStatus;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  declare createdBy: string;

  @BelongsTo(() => User, 'createdBy')
  declare creator: User;
}
