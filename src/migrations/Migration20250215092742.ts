import { Migration } from '@mikro-orm/migrations';

export class Migration20250215092742 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table \`user\` (\`id\` int unsigned not null auto_increment primary key, \`created_at\` bigint not null, \`updated_at\` bigint not null, \`email\` varchar(255) not null, \`password\` varchar(255) not null, \`phone\` varchar(255) not null, \`username\` varchar(255) not null, \`role\` enum('admin', 'user') not null default 'user') default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`user\` add unique \`user_email_unique\`(\`email\`);`);
    this.addSql(`alter table \`user\` add unique \`user_phone_unique\`(\`phone\`);`);
    this.addSql(`alter table \`user\` add unique \`user_username_unique\`(\`username\`);`);

    this.addSql(`create table \`task\` (\`id\` int unsigned not null auto_increment primary key, \`created_at\` bigint not null, \`updated_at\` bigint not null, \`name\` varchar(100) not null, \`description\` varchar(255) not null, \`user_id\` int unsigned not null) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`task\` add index \`task_user_id_index\`(\`user_id\`);`);

    this.addSql(`create table \`attached\` (\`id\` int unsigned not null auto_increment primary key, \`created_at\` bigint not null, \`updated_at\` bigint not null, \`src\` varchar(255) not null, \`task_id\` int unsigned not null) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`attached\` add index \`attached_task_id_index\`(\`task_id\`);`);

    this.addSql(`create table \`profiles\` (\`id\` int unsigned not null auto_increment primary key, \`created_at\` bigint not null, \`updated_at\` bigint not null, \`src\` varchar(255) not null, \`user_id\` int unsigned not null) default character set utf8mb4 engine = InnoDB;`);
    this.addSql(`alter table \`profiles\` add index \`profiles_user_id_index\`(\`user_id\`);`);

    this.addSql(`alter table \`task\` add constraint \`task_user_id_foreign\` foreign key (\`user_id\`) references \`user\` (\`id\`) on update cascade on delete cascade;`);

    this.addSql(`alter table \`attached\` add constraint \`attached_task_id_foreign\` foreign key (\`task_id\`) references \`task\` (\`id\`) on update cascade on delete cascade;`);

    this.addSql(`alter table \`profiles\` add constraint \`profiles_user_id_foreign\` foreign key (\`user_id\`) references \`user\` (\`id\`) on update cascade on delete cascade;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`task\` drop foreign key \`task_user_id_foreign\`;`);

    this.addSql(`alter table \`profiles\` drop foreign key \`profiles_user_id_foreign\`;`);

    this.addSql(`alter table \`attached\` drop foreign key \`attached_task_id_foreign\`;`);

    this.addSql(`drop table if exists \`user\`;`);

    this.addSql(`drop table if exists \`task\`;`);

    this.addSql(`drop table if exists \`attached\`;`);

    this.addSql(`drop table if exists \`profiles\`;`);
  }

}
