export interface UpdateShorlogRequest {
  content: string;
  imageIds: number[];
  hashtags: string[];
  linkedBlogId?: number | null;
}

export interface UpdateShorlogResponse {
  id: number;
  userId: number;
  content: string;
  hashtags: string[];
  linkedBlogId: number | null;
}

