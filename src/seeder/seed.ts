import { EntityManager, Dictionary } from "@mikro-orm/core";
import { Seeder } from "@mikro-orm/seeder";
import { User, UserRole } from "../entities/user.entity";
import e from "express";

export class DatabaseSeeder extends Seeder {
    run(em: EntityManager, context?: Dictionary | undefined): void | Promise<void> {
        // create role
        const admin = em.create(User, { email: "admin@gmail.com", password: "admin1234", phone: "09117897203", role: UserRole.ADMIN, username: "admin" });
        em.persistAndFlush(admin)
    }
}