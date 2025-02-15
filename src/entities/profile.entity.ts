import { Entity, ManyToOne, Property } from "@mikro-orm/core";
import { User } from "./user.entity";
import { BaseEntity } from "./base.entity";

@Entity({ tableName: "profiles" })
export class Profile extends BaseEntity {
    @Property()
    src: string

    @ManyToOne(() => User, { deleteRule: "cascade", updateRule: "cascade" })
    user: User
}