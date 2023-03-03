import 'dotenv/config'
import { Sequelize } from "sequelize";
import { logger } from "../../utils/logger";

const cardsDatabaseUrl = process.env.CARDS_DATABASE_URL as string

export const cardsConnection = new Sequelize(cardsDatabaseUrl, {dialect: 'mysql', logging: false})

cardsConnection.query('SELECT 1+1 as cards_database_verification').catch(logger.error)