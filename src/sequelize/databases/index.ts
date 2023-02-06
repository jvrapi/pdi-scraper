import { Sequelize } from "sequelize";

const cardsDatabaseUrl = process.env.CARDS_DATABASE_URL as string
const imagesDatabaseUrl = process.env.IMAGES_DATABASE_URL as string

export const cardsConnection = new Sequelize(cardsDatabaseUrl, {dialect: 'mysql', logging: false})
export const imagesConnection = new Sequelize(imagesDatabaseUrl, {dialect: 'mysql', logging: false})

cardsConnection.query('SELECT 1+1 as cards_database_verification').catch(console.error)
imagesConnection.query('SELECT 1+1 as images_database_verification').catch(console.error)