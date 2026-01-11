// src/config/site.ts
export const siteConfig = {
  name: 'mifa.tokyo',
  siteDomain: 'https://mifa.tokyo',
  ogImage: '/ogp.jpg',
  fcImage: '/favicon.svg',
  siteCopy: `©mifa all right reserved.`,

  pages: {
    index: {
      path: '/',
      jaLabel: 'トップページ',
      label: 'Home',
      title: 'masahiro imai Portfolio Site',
      description: 'mifa tokyoのポートフォリオサイトへようこそ。個人でお受けしたプロジェクトやメモブログなどを掲載しています。',
      inNav: true, // ナビゲーションに表示するかどうか
      order: 1, // ナビゲーションの順序
    },
    about: {
      path: '/about',
      jaLabel: 'mifaについて',
      label: 'About',
      title: 'mifa.tokyoについて',
      description: 'mifa tokyoのポートフォリオサイトへようこそ。mifa tokyoの中の人について、少しだけ詳しく説明します。',
      inNav: true,
      order: 2,
    },
    works: {
      path: '/works',
      jaLabel: '作ったもの',
      label: 'Works',
      title: 'mifa.tokyoが作ったもの',
      description: 'mifa tokyoのポートフォリオサイトへようこそ。mifaとして制作に携わった作品をご紹介します。',
      inNav: true,
      order: 3,
    },
    memo: {
      path: '/memo',
      jaLabel: '備忘録',
      label: 'memo',
      title: 'mifa.tokyoの備忘録',
      description: 'mifa tokyoのポートフォリオサイトへようこそ。制作に関連する事柄を備忘録として書き留めています。',
      inNav: true,
      order: 4,
    },
    contact: {
      path: '/contact',
      jaLabel: 'ご連絡について',
      label: 'Contact',
      title: 'mifaへのお問い合わせ、ご連絡はこちら',
      description: 'mifa tokyoのポートフォリオサイトへようこそ。mifaへのお問い合わせ、ご連絡はこちらからどうぞ。可能な限り早めに返信しますので、お気軽にお声がけください。',
      inNav: true,
      order: 5,
    },
    notFound: {
      path: '/404',
      jaLabel: 'Page Not Found',
      label: '404',
      title: '35152424221132244345251142113311251144441154344514154345',
      description: 'ページが見つかりませんでした。',
      inNav: false,
      order: 6,
    },
    deviceInfo: {
      path: '/tools/device-info',
      label: 'デバイス情報チェッカー',
      title: 'デバイス情報チェッカー',
      description: 'mifa.tokyoでの活動の中で、『こんなのがあったらいいな』と思った便利道具を作りました。今回は、クライアントワークなどのデバッグ時に必要な、ブラウザの種類やOSなど一覧で確認ができるツールです。テキストコピーか画像での書き出しが可能です。',
      inNav: false,
      order: 7,
    },
    imageConverter: {
      path: '/tools/image-converter',
      label: '画像変換ツール',
      title: '画像変換ツール',
      description: 'mifa.tokyoでの活動の中で、『こんなのがあったらいいな』と思った便利道具を作りました。今回は、画像の変換ツールです。画像の形式変換、リサイズ、フィルター適用、回転・反転が可能です。PNG、JPG、WebP、新進気鋭のAVIFにも対応しています。',
      inNav: false,
      order: 7,
    },
  },
  // SNSリンク
  socialLinks: {
    twitter: 'https://x.com/_________mashi',
    github: 'https://github.com/youraccount',
    note: 'https://github.com/youraccount',
    // 他のSNSリンク
  },
} as const;

// ナビゲーション用のデータを生成するユーティリティ関数
export function getNavigationItems() {
  return Object.values(siteConfig.pages)
    .filter((page) => page.inNav)
    .sort((a, b) => a.order - b.order)
    .map(({ path, label, jaLabel }) => ({
      href: path,
      label,
      jaLabel,
    }));
}

// メタデータ生成用のユーティリティ関数
export function generateMetadata(pageName: keyof typeof siteConfig.pages) {
  const page = siteConfig.pages[pageName];
  return {
    title: `${page.title} | ${siteConfig.name}`,
    description: page.description,
    ogImage: siteConfig.ogImage,
    fcImage: siteConfig.fcImage,
    label: page.label,
    siteCopy: siteConfig.siteCopy,
  };
}
