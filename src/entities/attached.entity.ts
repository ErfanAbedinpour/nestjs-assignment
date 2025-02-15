import { Entity, ManyToOne, Property } from "@mikro-orm/core";
import { Task } from "./task.entity";
import { BaseEntity } from "./base.entity";

@Entity({ tableName: "attached" })
export class Attached extends BaseEntity {
    @Property({ nullable: false })
    src: string

    @ManyToOne(() => Task, { deleteRule: "cascade", updateRule: "cascade", nullable: false })
    task: Task
}
