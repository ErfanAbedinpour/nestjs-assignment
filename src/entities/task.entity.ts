import { Collection, Entity, ManyToOne, OneToMany, Property } from "@mikro-orm/core";
import { User } from "./user.entity";
import { Attached } from "./attached.entity";
import { BaseEntity } from "./base.entity";

@Entity({ tableName: "task" })
export class Task extends BaseEntity {
    @Property({ nullable: false, length: 100 })
    name: string;

    @Property({ nullable: false })
    description: string

    @OneToMany(() => Attached, attach => attach.task)
    attached = new Collection<Attached>(this)

    @ManyToOne(() => User, { updateRule: "cascade", deleteRule: "cascade", nullable: false })
    user: User
}