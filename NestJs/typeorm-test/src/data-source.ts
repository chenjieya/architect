import "reflect-metadata"
import { DataSource } from "typeorm"
// import { User } from "./entity/User"

export const AppDataSource = new DataSource({
    type: "mysql",
    database: 'typeorm-test',
    host: "localhost",
    port: 3306,
    username: "root",
    password: "chenjie+00",
    synchronize: true,
    logging: true,
    // entities: [User],
    entities: ['./**/entity/*.ts'],
    migrations: [],
    subscribers: [],
})
