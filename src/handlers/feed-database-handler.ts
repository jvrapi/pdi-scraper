import '../sequelize/databases'
import { getAllCardsUseCase } from '../api/use-cases/get-all-cards-use-case'
import { getAllSetsUseCase } from '../api/use-cases/get-all-sets-use-case'
import { Card } from '../sequelize/entities/card'
import { Set } from '../sequelize/entities/set'
import * as fastq from "fastq";
import type { queueAsPromised } from "fastq";
import { logger } from '../utils/logger'
import { Loading } from '../utils/loading'
async function main(){
  logger.success(`Script Iniciado 🔥`)
  logger.timer.start('script')
  
  //-------------------------- DELETE DATA --------------------------
  logger.warn(`Apagando registros nas tabelas` )  
  await Set.destroy({where: {}})

  //-------------------------- GET DATA --------------------------
  logger.message('Buscando e instanciando as informações')
  logger.timer.start('Informações da API')
  const { sets } = await getAllSetsUseCase()
  const { cards } = await getAllCardsUseCase()
  logger.timer.stop('Informações da API')
  logger.message(`Foram encontrados ${sets.length} coleções e ${cards.length} cartas`)
  
  
  //-------------------------- INSERT SET AND CARDS DATA --------------------------
  async function insertDataWorker(set: Set){
    const setCards = cards
    .filter(card => card.setId === set.id) // get cards of set to save in db
    await set.save() // Save set in db
    await Promise.all(setCards.map(async card => await card.save())) // save all set cards in db       
  }
  const insertDataQueue: queueAsPromised<Set> = fastq.promise(insertDataWorker, 100)
  logger.message('Inserindo dados no banco de dados')
  const insertDataLoad = Loading.start()
  logger.timer.start('Coleções e cartas')
  await Promise.all(sets.map(async set => {
      try {
        await insertDataQueue.push(set)
      } catch (error) {
        console.error(error)
      }
  }))
  Loading.stop(insertDataLoad)
  logger.timer.stop('Coleções e cartas')



  
  //-------------------------- LOGGERS --------------------------
  logger.success('Todas as informações inseridas com sucesso!')
   
  const cardsCount = await Card.count()
  
  const setsCount = await Set.count()

  
  logger.success(`${setsCount} coleções inseridas`)
  
  logger.success(`${cardsCount} cartas inseridas`)

  
  logger.timer.stop('script')
}

main()