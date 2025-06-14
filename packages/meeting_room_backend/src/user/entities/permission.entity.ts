import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
@Entity({
  name: 'permissions',
})
export class Permission extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 20,
    comment: '权限代码',
  })
  code: string;
  @Column({
    length: 255,
    comment: '权限描述',
  })
  description: string;
}
