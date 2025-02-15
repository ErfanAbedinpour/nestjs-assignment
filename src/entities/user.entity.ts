import { Collection, Entity, Enum, OneToMany, Property } from "@mikro-orm/core";
import { Task } from "./task.entity";
import { Profile } from "./profile.entity";
import { BaseEntity } from "./base.entity";

export enum UserRole {
    ADMIN = 'admin',
    USER = 'user'
}


@Entity({ tableName: "user" })
export class User extends BaseEntity {

    @Property({ nullable: false, unique: true })
    email: string

    @Property({ nullable: false })
    password: string;

    @Property({ nullable: false, unique: true })
    phone: string

    @Property({ nullable: false, unique: true })
    username: string

    @Enum({ items: () => UserRole, nullable: false, default: UserRole.USER })
    role: UserRole


    @OneToMany(() => Task, task => task.user)
    tasks = new Collection<Task>(this)

    @OneToMany(() => Profile, profile => profile.user)
    profiles = new Collection<Profile>(this)
}

