import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { BaseEntity } from '@/common/entities/base.entity';
import { Permission } from './permission.entity';
import { User } from './user.entity';
@Entity({
  name: 'roles',
})
export class Role extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({
    length: 50,
    comment: '角色名称',
  })
  name: string;
  @Column({
    length: 255,
    comment: '角色描述',
    nullable: true,
  })
  description: string;

  @ManyToMany(() => Permission)
  @JoinTable({
    name: 'role_permissions',
  })
  permissions: Permission[];

  @ManyToMany(() => User, (user) => user.roles) // 反向关联 User 的 roles 字段
  users: User[];
}
