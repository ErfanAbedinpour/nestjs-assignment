import { Entity, PrimaryKey, Property } from "@mikro-orm/core";

@Entity({ abstract: true })
export abstract class BaseEntity {
    @PrimaryKey()
    id!: number

    @Property({ nullable: true, columnType: 'bigint', type: 'bigint' })
    createdAt? = Date.now()

    @Property({ nullable: true, columnType: 'bigint', type: "bigint", onUpdate: () => Date.now() })
    updatedAt? = Date.now()
}