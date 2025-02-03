export type IconDetails = {
  timeStamp: number;
  icnsUrl: string;
  downloads: number;
  usersName: string;
  category: string;
  lowResPngUrl: string;
  uploadedBy: string;
  objectID: string;
  iOSUrl: string;
  name: string;
};

export type AppliedIconDetails = IconDetails & {
  appPath: string;
};

export type SearchData = {
  hits: Array<IconDetails>;
  hitsPerPage: number;
  totalHits: number;
  totalDocuments: number;
  query: string;
  totalPages: number;
  page: number;
};

export type SearchResponse = Omit<SearchData, "hits"> & {
  hits: Array<Omit<IconDetails, "name"> & { appName: string }>;
};
