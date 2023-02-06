import { randomUUID } from "node:crypto";
import Sequelize, { Model } from "sequelize";
import { cardsConnection } from "../databases";
import { Card } from "./card";

export interface SetsProps {
  code: string;
  name: string;
  type: string;
  releasedAt: string;
  isDigital: boolean;
  isFoilOnly: boolean;
  id: string
}


export class Set extends Model<SetsProps> implements SetsProps{
  code: string;
  name: string;
  type: string;
  releasedAt: string;
  isDigital: boolean;
  isFoilOnly: boolean;
  id: string;
}


Set.init({
  id: {
    type: Sequelize.STRING,
    allowNull: false,
    primaryKey: true
  },
  code: {
    type: Sequelize.STRING,
    allowNull: false
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false
  },
  type: {
    type: Sequelize.STRING,
    allowNull: false
  },
  releasedAt: {
    type: Sequelize.STRING,
    allowNull: false
  },
  isDigital: {
    type: Sequelize.BOOLEAN,
    allowNull: false
  },
  isFoilOnly: {
    type: Sequelize.BOOLEAN,
    allowNull: false
  }
}, {
  sequelize: cardsConnection,
  underscored: true,
  tableName: 'sets',
  timestamps: true
})

Set.hasMany(Card, {
  as: 'cards',
  onDelete: 'cascade',
  foreignKey: {
    field: 'set_id'
  }
})

Card.belongsTo(Set, {
  as: 'collection',
  onDelete: 'cascade',
  foreignKey: {
    field: 'set_id'
  }
})

