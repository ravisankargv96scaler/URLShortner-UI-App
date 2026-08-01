export interface UrlMappingDTO {
  id?: number;
  originalUrl?: string;
  shortUrl?: string;
  clickCount?: number;
  createdDate?: string;
  username?: string;
}

export interface ClickEventDTO {
  clickDate?: string;
  count?: number;
}
