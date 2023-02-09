import * as Scry from 'scryfall-sdk';
import { randomUUID as uuid } from 'node:crypto';

import * as dateFns from 'date-fns'
import { Card } from '../../sequelize/entities/card';
import { Color } from '../../sequelize/entities/color';
import { Format, FormatName } from '../../sequelize/entities/format';
import { Version, VersionName } from '../../sequelize/entities/version';
import { Stream } from "stream";
import { DownloadImagesProps } from '../../use-cases/download-images-use-case';


interface ApiVersion {
  oversized: boolean;
  promo: boolean;
  textLess: boolean;
}

export async function getAllCardsUseCase() {
  const currentDate = dateFns.format(new Date(),"yyyy-MM-dd")
  let defaultCards: Stream | undefined
  
  defaultCards = await Scry.BulkData.downloadByType('default_cards', currentDate)
  
  if(!defaultCards){
    const yesterdayDate = dateFns.sub(new Date(), {days: 1})
    const dateFormatted = dateFns.format(yesterdayDate,"yyyy-MM-dd")
    defaultCards = await Scry.BulkData.downloadByType('default_cards', dateFormatted)
  }
  
  const cards =  await new Promise<Scry.Card[]>((resolve, reject) => {
  
    const chunks: Buffer[] = []
  
    defaultCards?.on('data', (data: Buffer) => {chunks.push(data)})
    
    defaultCards?.on('end', () => {
      const data = Buffer.concat(chunks)
      const cards = JSON.parse(data.toString()) as Scry.Card[]
      resolve(cards)
    })

    defaultCards?.on('error', reject)
  })

  const cardsImages: DownloadImagesProps[] = []
  const faces: Card[] = []
  const sequelizeCards: Card[] = []


  cards.forEach(card => {
    const cardId = uuid()
    const imageUri = getImageUri(card)
    if(imageUri) {
      cardsImages.push({
        fileType: 'png',
        id: cardId,
        path: card.set,
        type: 'cards',
        uri: imageUri
      })
    }
    if (card.card_faces && card.card_faces?.length > 0) {

      // These filters is necessary because api returns cards with same name in card_faces field.
      card.card_faces
        .filter(
          (cardFace) => card.name.toLowerCase() !== cardFace.name.toLowerCase() // get card face with different name of their "parent"
        )
        .filter((cardFace) => {
          const nameAsArray = card.name.split('//').map((name) => name.trim()); // multifaceted cards has '//' in their name to separate both sides

          if (nameAsArray.length === 2) {
            return (
              nameAsArray[0].toLowerCase() !== nameAsArray[1].toLowerCase() // Only return if both card side has different names. 
            );
          }
          return cardFace; // will return any card if it is not multifaceted
        })
        .forEach(cardFace => { // build sequelize Card Object
          const face = Card.build({
            id: uuid(),
            name: cardFace.name,
            manaCost: cardFace.mana_cost ?? null,
            borderColor: null,
            cmc: cardFace.cmc ?? null,
            collectionId: null,
            effectText: cardFace.oracle_text ?? null,
            flavorText: cardFace.flavor_text ?? null,
            frame: null,
            isFoundInBooster: null,
            isReprint: null,
            isReserved: null,
            isStorySpotlight: null,
            isVariant: null,
            language: card.lang,
            layout: null,
            loyalty: null,
            rarity: null,
            securityStamp: null,
            typeLine: cardFace.type_line,
            setId: card.set_id,
            colors: parseColors(cardFace.colors),
            formats: [],
            versions: [],
            faceOfId: cardId
          })
          faces.push(face) 
        })

    }
    const sequelizeCard =  Card.build({
      id: cardId,
      name: chooseBestName(card),
      manaCost: card.mana_cost ?? null,
      borderColor: card.border_color,
      cmc: card.cmc ?? null,
      collectionId: card.collector_number,
      effectText: card.oracle_text ?? null,
      flavorText: card.flavor_text ?? null,
      frame: card.frame,
      isFoundInBooster: card.booster,
      isReprint: card.reprint,
      isReserved: card.reserved,
      isStorySpotlight: card.story_spotlight,
      isVariant: card.variation,
      language: card.lang,
      layout: card.layout,
      loyalty: card.layout,
      rarity: card.rarity,
      securityStamp: card.security_stamp?.toString() ?? null,
      typeLine: chooseBestTypeLine(card),
      setId: card.set_id,
      colors: parseColors(card.colors),
      formats: parseFormats(card.legalities),
      versions: parseVersions(card.finishes, {
        oversized: card.oversized,
        promo: card.promo,
        textLess: card.textless
      }),
    })

    sequelizeCards.push(sequelizeCard)

  })

 return {
  cards: [...sequelizeCards, ...faces],
  images: cardsImages
 }
    
}

/* 
  Function to get a card name. The api return some cards with repeated names (e.g creature // creature ).
  This function choose which name the Card will have. If card is multifaceted, the card will have all faces name.
  Other side, he get the unique face card name
*/
function chooseBestName(card: Scry.Card) {
  let { name } = card;

  const cardNameAsArray = card.name.split('//').map((name) => name.trim());

  if (
    cardNameAsArray.length === 2 &&
    cardNameAsArray[0] === cardNameAsArray[1]
  ) {
    const [cardName1] = cardNameAsArray;
    name = cardName1;
  }

  return name;
}
// Same logic of chooseBestName function, but applied to type_line field
function chooseBestTypeLine(card: Scry.Card) {
  let { type_line: typeLine } = card;

  if (typeLine) {
    const cardTypeLineAsArray = card.type_line
      ?.split('//')
      ?.map((type_line) => type_line.trim());
    if (
      cardTypeLineAsArray.length === 2 &&
      cardTypeLineAsArray[0] === cardTypeLineAsArray[1]
    ) {
      const [cardName1] = cardTypeLineAsArray;
      typeLine = cardName1;
      // applicationCard.imageUri = card.getImageURI('png');
    }

    return typeLine;
  }
  return null;
}

function getImageUri(card: Scry.Card) {
  const cardNameAsArray = card.name.split('//').map((name) => name.trim());

  if (
    cardNameAsArray.length === 2 &&
    cardNameAsArray[0] === cardNameAsArray[1]
  ) {
    return card.card_faces[0].image_uris
      ? card.card_faces[0].image_uris.png
      : null;
  }

  return card.image_uris ? card.image_uris.png : null;
}

function parseColors(colors?: Scry.Color[] | null){
  if (!colors) {
    return [];
  }

  return colors.map((color) => new Color(color)).map(color => color.value);
}

function parseFormats(legalities: Scry.Legalities){
  const cardFormats = Object.keys(legalities);
    const formats: Format[] = [];

    cardFormats.forEach((format) => {
      const isLegal = legalities[format as keyof typeof Scry.Format] === 'legal';
      formats.push(new Format({format: format as FormatName, isLegal}));
    });
    return formats.filter(format => format.isLegal).map(format => format.value);
}

function parseVersions(finishes: (keyof typeof Scry.CardFinish)[],
apiVersion: ApiVersion){
  const versions: Version[] = [];
  const finishedValues = Object.values(finishes);
  const apiVersionKeys = Object.keys(apiVersion);

  finishedValues.forEach((value) => {
    if (value === 'foil') {
      versions.push(new Version('foil'));
    }

    if (value === 'nonfoil') {
      versions.push(new Version('nonFoil'));
    }
  });

  apiVersionKeys.forEach((key) => {
    if (apiVersion[key as keyof ApiVersion]) {
      versions.push(new Version(key as VersionName));
    }
  });

  return versions.map(version => version.value);
}