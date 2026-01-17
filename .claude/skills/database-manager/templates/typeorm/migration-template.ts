import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from "typeorm";

/**
 * Migration Template for TypeORM
 * Generated: {TIMESTAMP}
 * Description: {DESCRIPTION}
 */
export class MigrationTemplate{TIMESTAMP} implements MigrationInterface {
    name = 'MigrationTemplate{TIMESTAMP}'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create Table
        await queryRunner.createTable(
            new Table({
                name: "{TABLE_NAME}",
                columns: [
                    {
                        name: "id",
                        type: "int",
                        isPrimary: true,
                        isGenerated: true,
                        generationStrategy: "increment",
                    },
                    {
                        name: "created_at",
                        type: "timestamp",
                        default: "now()",
                    },
                    {
                        name: "updated_at",
                        type: "timestamp",
                        default: "now()",
                    },
                ],
            }),
            true
        );

        // Create Index
        await queryRunner.createIndex(
            "{TABLE_NAME}",
            new TableIndex({
                name: "IDX_{TABLE_NAME}_created_at",
                columnNames: ["created_at"],
            })
        );

        // Add Foreign Key (example)
        // await queryRunner.createForeignKey(
        //     "{TABLE_NAME}",
        //     new TableForeignKey({
        //         columnNames: ["{COLUMN}"],
        //         referencedColumnNames: ["{REFERENCED_COLUMN}"],
        //         referencedTableName: "{REFERENCED_TABLE}",
        //         onDelete: "CASCADE",
        //     })
        // );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop Foreign Key (example)
        // const table = await queryRunner.getTable("{TABLE_NAME}");
        // const foreignKey = table.foreignKeys.find(
        //     fk => fk.columnNames.indexOf("{COLUMN}") !== -1
        // );
        // await queryRunner.dropForeignKey("{TABLE_NAME}", foreignKey);

        // Drop Index
        await queryRunner.dropIndex("{TABLE_NAME}", "IDX_{TABLE_NAME}_created_at");

        // Drop Table
        await queryRunner.dropTable("{TABLE_NAME}");
    }
}
