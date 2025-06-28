import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Role } from './role.entity';
import { BaseEntity } from '@/common/entities/base.entity';
import { ApiProperty } from '@nestjs/swagger';
@Entity({
  name: 'users',
})
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  @ApiProperty()
  id: number;

  @Column({
    length: 50,
    comment: '用户名',
  })
  @ApiProperty()
  username: string;

  @Column({
    length: 50,
    comment: '密码',
  })
  @ApiProperty()
  password: string;

  @Column({
    name: 'nick_name',
    length: 50,
    comment: '昵称',
  })
  @ApiProperty()
  nickName: string;

  @Column({
    length: 50,
    comment: '邮箱',
  })
  @ApiProperty()
  email: string;

  @Column({
    comment: '头像',
    length: 255,
    nullable: true,
  })
  @ApiProperty()
  headPic: string;

  @Column({
    comment: '手机号',
    length: 20,
    nullable: true,
  })
  @ApiProperty()
  phoneNumber: string;

  @Column({
    comment: '是否冻结',
    default: false,
  })
  @ApiProperty()
  isFrozen: boolean;

  @Column({
    comment: '是否是管理员',
    default: false,
  })
  @ApiProperty()
  isAdmin: boolean;

  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable({
    name: 'user_roles',
  })
  @ApiProperty()
  roles: Role[];
}
