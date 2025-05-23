// src/config/site.ts
export const siteConfig = {
  name: 'mifa tokyoのウェブサイトです。',
  siteDomain: 'https://mifa.tokyo',
  ogImage: '/assets/images/common/ogp.jpg',
  fcImage: '/favicon.svg',
  siteCopy: `©mifa all right reserved.`,

  pages: {
    index: {
      path: '/',
      jaLabel: 'トップページ',
      label: 'Home',
      title: 'Portfolio Site',
      description: 'Welcome to my portfolio site',
      inNav: true, // ナビゲーションに表示するかどうか
      order: 1, // ナビゲーションの順序
    },
    about: {
      path: '/about',
      jaLabel: 'mifaについて',
      label: 'About',
      title: 'About',
      description: 'About me and my skills',
      inNav: true,
      order: 2,
    },
    works: {
      path: '/works',
      jaLabel: '作ったもの',
      label: 'Works',
      title: 'Works',
      description: 'My creative works and projects',
      inNav: true,
      order: 3,
    },
    memo: {
      path: '/memo',
      jaLabel: '備忘録',
      label: 'memo',
      title: 'memo',
      description: 'My thoughts and articles',
      inNav: true,
      order: 4,
    },
    contact: {
      path: '/contact',
      jaLabel: 'ご連絡',
      label: 'Contact',
      title: 'mifaへのお問い合わせ、ご連絡はこちら',
      description: 'Get in touch with me',
      inNav: true,
      order: 5,
    },
    notFound: {
      path: '/404',
      jaLabel: 'Page Not Found',
      label: '404',
      title: '35152424221132244345251142113311251144441154344514154345',
      description: 'Get in touch with me',
      inNav: false,
      order: 6,
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
