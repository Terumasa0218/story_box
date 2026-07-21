# story_box

`story_box` は、大切だけどずっと持ち続けるのは難しい品を、写真・一言メモ・行き先と一緒に整理するアプリです。

終活という言葉を前面に出さず、これから高齢期に入っていくスマホ世代が、自分の持ち物を家族にゆるく引き継ぐための道具として設計します。

## Core Concept

大切な物を、家族に迷惑をかけず、でも雑に捨てずに整理する。

## Target

- 50代から70代前半のスマホに慣れた層
- 親の家の片付けを経験し、自分の物も少しずつ整理したい人
- 子ども世代に迷惑をかけたくないが、思い出まで雑に捨てられるのは嫌な人
- 実家片付けを担う40代から60代の子ども世代

## MVP

- 物カード作成
- 写真登録
- 一言思い出メモ
- 音声メモからの文章化
- 行き先ステータス管理
- LINEなどで家族に共有
- 家族から「欲しい / いらない / 写真だけ見たい / 相談したい」の回答を集める
- 処分ガイドの簡易表示
- 手放した後の「ありがとうカード」生成

## Differentiation

写真整理アプリ、持ち物管理アプリ、断捨離SNSではなく、物の行き先を家族で決めるための思い出整理アプリとして差別化します。

海外競合の参考:

- Artifcts: 物ごとのストーリー、QR、共有、会員プラン
- Declutter: 手放す品の記憶を美しく残す
- Airloom: 音声質問とAIストーリーテリング
- Telloom / GenerationStory系: 質問テンプレート、家族への共有、誰に渡すかの整理
- Heirlo / FairShare系: 家族間で品物を分ける体験

## Docs

- [Product Brief](docs/product-brief.md)
- [Feature Spec](docs/feature-spec.md)

## Prototype

Live prototype:

- https://storybox-eta.vercel.app

```bash
npm install
npm run dev
```

The current prototype is a Vite + React web app. It focuses on the first product loop:

- Register an item card
- Add a short memory note
- Choose the item's future status
- Draft a LINE-friendly family share message
- Collect simple family responses
- Show disposal guidance without making region-specific claims
- Generate a thank-you card and masked SNS draft
