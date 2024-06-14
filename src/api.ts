import algoliasearch, { SearchIndex } from "algoliasearch/lite";
import { IconDetails } from "./types";

const client = algoliasearch("P1TXH7ZFB3", "372f49b3eff864ccc6f268a82f1901cc");
const index: SearchIndex = client.initIndex("macOSicons");

export const COLUMNS = 6;
export const ROWS = 30;

export const ICONS_PER_PAGE = COLUMNS * ROWS;

export function fetchPage(query: string, page: number) {
  return index.search<IconDetails>(query, {
    page,
    hitsPerPage: COLUMNS * ROWS,
    filters: "approved: true",
  });
}

export function getItemPageProgress(index: number): number {
  return (index + 1) / ICONS_PER_PAGE;
}

export function getItemPage(index: number): number {
  return Math.ceil(getItemPageProgress(index)) - 1;
}
