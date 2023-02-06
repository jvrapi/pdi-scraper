import Sequelize, { Model } from "sequelize"
import { imagesConnection } from "../databases"

export enum ImageType {
  cards = 'card',
  sets = 'set'
}


interface ImagesProps{ 
  id: string
  type: ImageType
  path: string | null
}

export class Image extends Model<ImagesProps> implements ImagesProps {
  type: ImageType
  path: string | null
  id: string
}

Image.init({
  id:{
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true
  },
  path: Sequelize.STRING,
  type: {
    type: Sequelize.ENUM('card', 'set'),
    allowNull: false
  }
},{
  sequelize: imagesConnection,
  underscored: true,
  tableName: 'images',
  timestamps: true
})