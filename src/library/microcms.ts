// src/library/microcms.ts
import { createClient } from 'microcms-js-sdk';

export type Post = {
  id: string;
  title: string;
  contents?: string;
  description?: string;
  thumbnail?: {
    url: string;
    width: number;
    height: number;
  };
  datepick: string;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
};

if (!import.meta.env.MICROCMS_API_KEY) {
  throw new Error('MICROCMS_API_KEY is required');
}

export const client = createClient({
  serviceDomain: import.meta.env.MICROCMS_SERVICE_DOMAIN || '',
  apiKey: import.meta.env.MICROCMS_API_KEY,
});

// ブログ記事取得用の関数
export const getBlogs = async () => {
  try {
    const response = await client.getList<Post>({
      endpoint: 'post',
    });
    return response.contents;
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return [];
  }
};
// 日付フォーマット用の関数
export function formatDate(dateString: string) {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
}
// 記事詳細を取得する関数を追加
export const getBlogDetail = async (contentId: string) => {
  try {
    const post = await client.get<Post>({
      endpoint: 'post',
      contentId,
    });
    return post;
  } catch (error) {
    console.error('Error fetching blog detail:', error);
    throw error;
  }
};
