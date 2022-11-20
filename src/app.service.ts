import { Injectable, Logger, NotFoundException, Query } from '@nestjs/common';
import { CardData } from './interface/CardData';
import axios from 'axios';
import * as cheerio from 'cheerio';

@Injectable()
export class AppService {
  async getScrapper(@Query() query): Promise<CardData[]> {
    Logger.log(`🗃️  Looking for card name: "${query.q}"`);

    const url = `https://ligamagic.com.br/?view=cards/card&card=${query.q}`;
    const { data: body } = await axios.get(url);
    const cardData: CardData[] = [];
    const $ = cheerio.load(body);

    //Check for card
    if (body.indexOf('vetPorEdicao') == -1) {
      Logger.log(`😞  Card "${query.q}" not found`);
      throw new NotFoundException(`Card *${query.q}* not found`);
    }

    //Check for price
    if (body.indexOf('var g_avgprice') == -1) {
      Logger.log(`💸  Price for card "${query.q}" not found`);
      throw new NotFoundException(`Price for card *${query.q}* not found`);
    }

    //Scrap price vector
    const extractRegex = /g_avgprice='.*?'/gm;
    const pricesString = extractRegex.exec(body);
    const avgprice = JSON.parse(
      pricesString[0].substring(12, pricesString[0].length - 1),
    );

    //Scrap card versions and match with name
    $('.card-image .edicoes li').each(function (i, elem) {
      var regexSetInfo = new RegExp(
        'vetPorEdicao\\[' + i.toString() + '\\]=\\[(.*?)\\];',
        'i',
      );
      var setInfo = JSON.parse('[' + body.match(regexSetInfo)[1] + ']');

      cardData.push({
        img: `//repositorio.sbrauble.com/arquivos/up/ed_mtg/${setInfo[3].toUpperCase()}_R.gif`,
        edition: $.parseHTML(setInfo[5]).values().next().value.data,
        price: {
          low: {
            priceNormal: avgprice[setInfo[7]].precoMenor,
            priceFoil:
              avgprice[setInfo[7]].extras != undefined
                ? avgprice[setInfo[7]].extras['2'].precoMenor
                : 0,
          },
          med: {
            priceNormal: avgprice[setInfo[7]].precoMedio,
            priceFoil:
              avgprice[setInfo[7]].extras != undefined
                ? avgprice[setInfo[7]].extras['2'].precoMedio
                : 0,
          },
          high: {
            priceNormal: avgprice[setInfo[7]].precoMaior,
            priceFoil:
              avgprice[setInfo[7]].extras != undefined
                ? avgprice[setInfo[7]].extras['2'].precoMaior
                : 0,
          },
        },
      });
    });

    Logger.log(`🧧  Card and price found: "${query.q}"`);

    return cardData;
  }

  async timeout(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
