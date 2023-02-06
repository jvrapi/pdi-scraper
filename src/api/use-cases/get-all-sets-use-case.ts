import * as Scry from 'scryfall-sdk'
import { Set } from '../../sequelize/entities/set';
import { DownloadImagesProps } from '../../use-cases/download-images-use-case';

export async function getAllSetsUseCase(){
  const sets = await Scry.Sets.all();
  const sequelizeSets: Set[] = []
  const setsImages: DownloadImagesProps[] = []
  
  sets.forEach(set => {
    const sequelizeSet = Set.build({
      id: set.id,
      name: set.name,
      code: set.code,
      isDigital: set.digital,
      isFoilOnly: set.foil_only,
      releasedAt: set.released_at!,
      type: set.set_type,
    })

    setsImages.push({
      fileType: 'svg',
      id: set.id,
      path: null,
      type: 'sets',
      uri: set.icon_svg_uri
    })
    sequelizeSets.push(sequelizeSet)
  })

  return {
    sets: sequelizeSets,
    images: setsImages
  }
}