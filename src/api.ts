import got from "got";
import { IconDetails, SearchData, SearchResponse } from "./types.js";

export async function search(
  page: number,
  query?: string,
): Promise<SearchData> {
  const response = await got
    .post("https://api.macosicons.com/api/search", {
      http2: true,
      json: {
        query,
        searchOptions: {
          hitsPerPage: 50,
          filters: ["", ""],
          sort: ["timeStamp:desc"],
          page: page + 1,
          apiKey: "m6CDglgxjbC14JOUlwzdl5Yjp2TCMvHJJfnT0H4L",
        },
      },
      headers: {
        Origin: "https://macosicons.com/",
        "User-Agent":
          "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:134.0) Gecko/20100101 Firefox/134.0",
        Host: "api.macosicons.com",
        // Connection: 'keep-alive',
      },
    })
    .json<SearchResponse>();

  return {
    ...response,
    hits: response.hits.map((icon) => {
      const result = { ...icon, name: icon.appName };
      delete (result as IconDetails & { appName?: string }).appName;
      return result;
    }),
  };
}
