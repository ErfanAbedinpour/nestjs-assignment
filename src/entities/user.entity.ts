import { BeforeCreate, Collection, Entity, Enum, EventArgs, OneToMany, Property } from "@mikro-orm/core";
import { Task } from "./task.entity";
import { Profile } from "./profile.entity";
import { BaseEntity } from "./base.entity";
import { ArgonService } from "../modules/auth/hashService/argon.service";

export enum UserRole {
    ADMIN = 'admin',
    USER = 'user'
}


@Entity({ tableName: "user" })
export class User extends BaseEntity {

    private argonService = new ArgonService();

    @Property({ nullable: false, unique: true })
    email: string

    @Property({ nullable: false, hidden: true })
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

    @BeforeCreate()
    async beforeCreateHandler(arg: EventArgs<this>) {
        arg.entity.password = await this.argonService.hash(arg.entity.password)
        arg.entity.email = arg.entity.email.toLowerCase();
        return arg;
    }
}

