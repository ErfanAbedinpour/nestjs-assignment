import { Migration } from '@mikro-orm/migrations';

export class Migration20250215110319 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table \`user\` modify \`created_at\` bigint null, modify \`updated_at\` bigint null;`);

    this.addSql(`alter table \`task\` modify \`created_at\` bigint null, modify \`updated_at\` bigint null;`);

    this.addSql(`alter table \`attached\` modify \`created_at\` bigint null, modify \`updated_at\` bigint null;`);

    this.addSql(`alter table \`profiles\` modify \`created_at\` bigint null, modify \`updated_at\` bigint null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table \`user\` modify \`created_at\` bigint not null, modify \`updated_at\` bigint not null;`);

    this.addSql(`alter table \`task\` modify \`created_at\` bigint not null, modify \`updated_at\` bigint not null;`);

    this.addSql(`alter table \`attached\` modify \`created_at\` bigint not null, modify \`updated_at\` bigint not null;`);

    this.addSql(`alter table \`profiles\` modify \`created_at\` bigint not null, modify \`updated_at\` bigint not null;`);
  }

}
