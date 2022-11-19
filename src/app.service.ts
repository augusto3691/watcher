import { Injectable, Query } from '@nestjs/common';
import { CardData } from './interface/CardData';
import puppeteer from 'puppeteer';

@Injectable()
export class AppService {
  //TODO: Create a interface for the return type
  async getScrapper(@Query() query): Promise<CardData[]> {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(
      `https://www.ligamagic.com.br?view=cards%2Fsearch&card=${query.q}`,
    );
    await page.waitForSelector('.edicoes');
    const editions = await page.evaluate(async () => {
      const results = Array.from(document.querySelectorAll('.edicoes li')).map(
        (li) => {
          return {
            id: li.id,
            img: li.querySelector('img').src,
            edition: '',
            price: {
              low: {
                priceNormal: 0,
                priceFoil: 0,
              },
              med: {
                priceNormal: 0,
                priceFoil: 0,
              },
              high: {
                priceNormal: 0,
                priceFoil: 0,
              },
            },
          };
        },
      );

      return results;
    });

    for await (const edition of editions) {
      let editionIcon = await page.$(`#${edition.id}`);
      await editionIcon.click();
      await page.waitForSelector('#ed-nome a');

      let editionText = await page.$eval(
        '#ed-nome a',
        (editionElement) => editionElement.textContent,
      );

      let editionLowPriceElement = await page.$$eval(
        '.col-prc-menor',
        (editionPriceElement) => {
          return {
            priceNormal: Number(
              editionPriceElement[0].textContent
                .replace(/[^0-9,-]+/g, '')
                .replace(',', '.'),
            ),
            priceFoil: Number(
              editionPriceElement[1].textContent
                .replace(/[^0-9,-]+/g, '')
                .replace(',', '.'),
            ),
          };
        },
      );
      let editionMedPriceElement = await page.$$eval(
        '.col-prc-medio',
        (editionPriceElement) => {
          return {
            priceNormal: Number(
              editionPriceElement[0].textContent
                .replace(/[^0-9,-]+/g, '')
                .replace(',', '.'),
            ),
            priceFoil: Number(
              editionPriceElement[1].textContent
                .replace(/[^0-9,-]+/g, '')
                .replace(',', '.'),
            ),
          };
        },
      );
      let editionHighPriceElement = await page.$$eval(
        '.col-prc-maior',
        (editionPriceElement) => {
          return {
            priceNormal: Number(
              editionPriceElement[0].textContent
                .replace(/[^0-9,-]+/g, '')
                .replace(',', '.'),
            ),
            priceFoil: Number(
              editionPriceElement[1].textContent
                .replace(/[^0-9,-]+/g, '')
                .replace(',', '.'),
            ),
          };
        },
      );

      //add info to editions
      edition.edition = editionText;
      edition.price = {
        low: editionLowPriceElement,
        med: editionMedPriceElement,
        high: editionHighPriceElement,
      };
    }

    return editions;
  }

  async timeout(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
