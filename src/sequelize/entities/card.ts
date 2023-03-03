import Sequelize, { Model } from 'sequelize';
import { cardsConnection } from '../databases';
import { Set } from './set';

interface CardProps {
  setId: string;
  name: string;
  language: string;
  layout: string | null;
  cmc: number | null;
  typeLine: string | null;
  faceOfId: string | null;
  collectionId: string | null;
  frame: string | null;
  borderColor: string | null;
  manaCost: string | null;
  loyalty: string | null;
  securityStamp: string | null;
  effectText: string | null;
  flavorText: string | null;
  rarity: string | null;
  isReserved: boolean | null;
  isReprint: boolean | null;
  isVariant: boolean | null;
  isFoundInBooster: boolean | null;
  isStorySpotlight: boolean | null;
  colors: String[];
  formats: String[];
  versions: String[];
  id: string
  imageUri: string | null
}



export class Card extends Model<CardProps> implements CardProps{
  setId: string;
  name: string;
  language: string;
  layout: string | null;
  cmc: number | null;
  typeLine: string | null;
  collectionId: string | null;
  frame: string | null;
  borderColor: string | null;
  manaCost: string | null;
  loyalty: string | null;
  securityStamp: string | null;
  effectText: string | null;
  flavorText: string | null;
  rarity: string | null;
  isReserved: boolean | null;
  isReprint: boolean | null;
  isVariant: boolean | null;
  isFoundInBooster: boolean | null;
  isStorySpotlight: boolean | null;
  colors: String[];
  formats: String[];
  versions: String[];
  id: string;
  faceOfId: string
  faces: Card[]
  faceOf: Card
  collection: Set
  imageUri: string | null;
}

Card.init({
  id: {
    type: Sequelize.STRING,
    primaryKey: true,
    allowNull: false
  },
  setId: {
    type: Sequelize.STRING,
    allowNull: false
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  language: {
    type: Sequelize.STRING,
    allowNull: false
  },
  layout: Sequelize.STRING,
  cmc: Sequelize.FLOAT,
  typeLine: Sequelize.STRING,
  collectionId: Sequelize.STRING,
  frame: Sequelize.STRING,
  borderColor: Sequelize.STRING,
  manaCost: Sequelize.STRING,
  loyalty: Sequelize.STRING,
  securityStamp: Sequelize.STRING,
  effectText: Sequelize.STRING,
  flavorText: Sequelize.STRING,
  rarity: Sequelize.STRING,
  faceOfId: Sequelize.STRING,
  isReserved: Sequelize.BOOLEAN,
  isReprint: Sequelize.BOOLEAN,
  isVariant: Sequelize.BOOLEAN,
  isFoundInBooster: Sequelize.BOOLEAN,
  isStorySpotlight: Sequelize.BOOLEAN,
  colors: Sequelize.JSON,
  formats: Sequelize.JSON,
  versions: Sequelize.JSON,
  imageUri: {
    type: Sequelize.STRING,
    allowNull: true
  }
},
  {
    sequelize: cardsConnection,
    underscored: true,
    tableName: 'cards',
    timestamps: true
  }
)

Card.hasMany(Card, {
  as: 'faces',
  foreignKey: {
    field: 'face_of_id',
  }
})

Card.belongsTo(Card,{
  as: 'faceOf',
  foreignKey: {
    field: 'face_of_id',
  }
})

