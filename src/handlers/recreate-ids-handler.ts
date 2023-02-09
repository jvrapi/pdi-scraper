
import { randomUUID } from "node:crypto"
import { QueryTypes }  from "sequelize"
import { cardsConnection, imagesConnection } from "../sequelize/databases"
import { logger } from "../utils/logger"

interface Set {
  id: string,
  code: string,
  name: string,
  released_at: string,
  type: string,
  is_digital: boolean,
  is_foil_only: boolean,
  created_at: Date,
  updated_at: Date
}

async function recreateIdsUseCase(){

    
  
   

    const sets = await cardsConnection.query<Set>('SELECT * FROM sets', {
      type: QueryTypes.SELECT,
    
    })



    await Promise.all(sets.map(async set => {
      try{
        const newId = randomUUID()
        await cardsConnection.query('UPDATE sets SET id = :newId WHERE id = :id', {
          type: QueryTypes.UPDATE,
          replacements: {
            newId,
            id: set.id
          }
        })
    
    
        await imagesConnection.query('UPDATE images SET id = :newId WHERE id = :id', {
          type: QueryTypes.UPDATE,
          replacements: {
            newId,
            id: set.id
          }
        })
      } catch(error){
        logger.error(`Erro ao tentar atualizar o id ${set.id}`)
      }
    }))

 
}

recreateIdsUseCase()