import type { IDateValue } from './common';

export type PhotoTag = {
  id: string;
  name: string;
  photoCount?: number;
};

export type PhotoItem = {
  id: string;
  title: string;
  description: string;
  fileName: string;
  mimeType: string;
  size: number;
  width: number;
  height: number;
  url: string;
  tags: PhotoTag[];
  createdAt: IDateValue;
  updatedAt: IDateValue;
};
