# wordbook

英単語フラッシュカードアプリ。ビジネス英語・TOEIC頻出語彙 300語収録。

🌐 **https://wordbook-tan.vercel.app/**

---

## 機能

- **フラッシュカード** — タップでカードをめくって意味を確認
- **音声読み上げ** — カード表示時に自動で発音。🔊ボタンで再生
- **例文ハイライト** — 例文中の対象単語を強調表示
- **学習記録** — 「わかった！」「わからない」で仕分け、ブラウザに自動保存
- **フィルター** — 覚えた単語・要復習の単語だけ絞り込んで復習
- **ランダム出題** — 毎回違う順番で出題
- **PWA対応** — iPhoneのホーム画面に追加してアプリとして使用可能

## iPhoneへのインストール

1. Safari で https://wordbook-tan.vercel.app/ を開く
2. 画面下の共有ボタン（□↑）をタップ
3. 「ホーム画面に追加」→「追加」

## 開発

```bash
npm install
npm run dev
```

単語は `src/data/words.ts` に追加できます。

## 技術スタック

- [Vite](https://vitejs.dev/) + [React](https://react.dev/) + TypeScript
- Web Speech API（音声読み上げ）
- LocalStorage（学習進捗の保存）
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)（PWA対応）
- [Vercel](https://vercel.com/)（ホスティング）
