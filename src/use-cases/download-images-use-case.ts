import axios from "axios";
import { createWriteStream, existsSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { Stream } from "node:stream";
import { logger } from "../utils/logger";

export interface DownloadImagesProps {
  uri: string,
  type: 'cards' | 'sets';
  fileType: 'svg' | 'png'
  path: string | null
  id: string
}
export async function downloadImagesUseCase({type, path, id, fileType, uri}: DownloadImagesProps){
  try {
  const folderPath = resolve(__dirname, `../../images/${type}/${path ?? ''}`)
  if(!existsSync(folderPath)){
    mkdirSync(folderPath, { recursive: true })
  }
  const imagePath = resolve(`${folderPath}/${id}.${fileType}`)

  const writer = createWriteStream(imagePath)
      
  const response = await axios.get<Stream>(uri, {
    responseType: 'stream'
  })
      
  response.data.pipe(writer)

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve)
      writer.on('error', reject)
    })
  } catch (error) {
    logger.file.write(`[DownloadImagesUseCase] - Erro ao tentar baixar a imagem. Parâmetros: ${JSON.stringify({type, path, id, fileType, uri})}`)
  }
}