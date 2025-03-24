// src/library/newt.ts
import { createClient } from 'newt-client-js';

export async function getStaticPaths() {
  const articles = await getArticles();

  return articles.map((article) => {
    // タイトルをスラッグ化する（スペースをハイフンに変更、特殊文字を削除など）
    const titleSlug = article.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // 特殊文字を削除
      .replace(/\s+/g, '-') // スペースをハイフンに変換
      .replace(/--+/g, '-'); // 複数のハイフンを1つに

    return {
      params: { slug: `${titleSlug}-${article._id.slice(-8)}` }, // タイトル+IDの一部
    };
  });
}

export type NewtImage = {
  _id: string;
  src: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  width: number;
  height: number;
  title: string;
  altText: string;
  description: string;
  metadata: Record<string, any>;
};

export type Article = {
  _id: string;
  _sys: {
    createdAt: string;
    updatedAt: string;
    customOrder: number;
    raw: {
      createdAt: string;
      updatedAt: string;
      firstPublishedAt: string;
      publishedAt: string;
    };
  };
  title: string;
  category: string;
  tag: string[];
  url: string;
  close?: boolean;
  content: string;
  slug?: string; // slugフィールドを追加
  thumbnail?: NewtImage;
};

export const newtClient = createClient({
  spaceUid: import.meta.env.NEWT_SPACE_UID,
  token: import.meta.env.NEWT_CDN_API_TOKEN,
  apiType: 'cdn',
});

export const getArticles = async () => {
  try {
    const { items } = await newtClient.getContents({
      appUid: import.meta.env.NEWT_APP_UID,
      modelUid: 'works', // モデル名に合わせて変更
    });
    return items as Article[];
  } catch (error) {
    console.error('Error fetching Newt articles:', error);
    return [];
  }
};

export const getArticle = async (id: string) => {
  try {
    const article = await newtClient.getContent({
      appUid: import.meta.env.NEWT_APP_UID,
      modelUid: 'works', // モデル名に合わせて変更
      contentId: id,
    });
    return article as Article;
  } catch (error) {
    console.error(`Error fetching Newt article with id ${id}:`, error);
    throw error;
  }
};

// タグでフィルタリングする関数
export const getArticlesByTag = async (tag: string) => {
  try {
    const { items } = await newtClient.getContents({
      appUid: import.meta.env.NEWT_APP_UID,
      modelUid: 'article',
      query: {
        tag: tag,
      },
    });
    return items as Article[];
  } catch (error) {
    console.error(`Error fetching articles with tag ${tag}:`, error);
    return [];
  }
};

// すべてのタグを取得する関数（ユニークなタグのリスト）
export const getAllTags = async () => {
  try {
    const { items } = await newtClient.getContents({
      appUid: import.meta.env.NEWT_APP_UID,
      modelUid: 'article',
    });

    // すべての記事からユニークなタグのセットを作成
    const articles = items as Article[];
    const uniqueTags = new Set<string>();

    articles.forEach((article) => {
      if (article.tag && Array.isArray(article.tag)) {
        article.tag.forEach((tag) => uniqueTags.add(tag));
      }
    });

    return Array.from(uniqueTags);
  } catch (error) {
    console.error('Error fetching all tags:', error);
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
