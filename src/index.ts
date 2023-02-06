import 'dotenv/config'
import { getAllCardsUseCase } from './api/use-cases/get-all-cards-use-case'
import { getAllSetsUseCase } from './api/use-cases/get-all-sets-use-case'
import './sequelize/databases'
import { Card } from './sequelize/entities/card'
import { Set } from './sequelize/entities/set'
import * as fastq from "fastq";
import type { queueAsPromised } from "fastq";
import { logger } from './utils/logger'
import { Loading } from './utils/loading'
import { DownloadImagesProps, downloadImagesUseCase } from './use-cases/download-images-use-case'
import { Image, ImageType } from './sequelize/entities/image'

async function main(){
 
  logger.success(`Script Iniciado 🔥`)
  logger.timer.start('script')
  
  //-------------------------- DELETE DATA --------------------------
  logger.warn(`Apagando registros nas tabelas` )  
  await Set.destroy({where: {}})
  await Image.destroy({where:{}})

  //-------------------------- GET DATA --------------------------
  logger.message('Buscando e instanciando as informações')
  const { sets, images: setsImages } = await getAllSetsUseCase()
  const { cards, images: cardsImages } = await getAllCardsUseCase()
  logger.message(`Foram encontrados ${sets.length} coleções e ${cards.length} cartas`)
  
  
  //-------------------------- INSERT SET AND CARDS DATA --------------------------
  async function insertDataWorker(set: Set){
    
    await set.save() // Save set in db
    const setCards = cards.filter(card => card.setId === set.id) // get cards of set to save in db
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

  //-------------------------- INSERT IMAGE DATA --------------------------
  async function downloadImagesWorker(image: DownloadImagesProps){
    // await downloadImagesUseCase(image);
    await Image.create({
      id: image.id,
      type: ImageType[image.type],
      path: image.uri
    })
  } 
  const downloadImagesQueue: queueAsPromised<DownloadImagesProps> = fastq.promise(downloadImagesWorker, 100)
  const allImages = [...setsImages, ...cardsImages]
  const downloadImagesLoad = Loading.start()
  logger.timer.start('Imagens')
  await Promise.all(allImages.map(async image => {
    try {
      await downloadImagesQueue.push(image)
    } catch (error) {
      logger.error(error)
    }
  }))
  Loading.stop(downloadImagesLoad)
  logger.timer.stop('Imagens')
  
  //-------------------------- LOGGERS --------------------------
  logger.success('Todas as informações inseridas com sucesso!')
  
  logger.warn('Verifique a pasta se a pasta "logs" foi criada. Caso isso aconteça, algum download falhou!')
  
  const cardsCount = await Card.count()
  
  const setsCount = await Set.count()

  const imagesCount = await Image.count()
  
  logger.success(`${setsCount} coleções inseridas`)
  
  logger.success(`${cardsCount} cartas inseridas`)

  logger.success(`${imagesCount} imagens inseridas`)
  
  logger.timer.stop('script')
}

main()