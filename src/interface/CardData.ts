export interface CardData {
  img: string;
  edition: string;
  cardEditionImg: string;
  price: Price;
}

export interface Price {
  low: PriceVariance;
  med: PriceVariance;
  high: PriceVariance;
}

export interface PriceVariance {
  priceNormal: number;
  priceFoil: number;
}
