# daily-paper-bot
PubMedで文献検索&アブストラクトをGemini 1.5 Flashを使って翻訳したものを、LINEへ通知する。有償のサービスは利用しない。

# 概説
- Google Spreadsheetに記入したキーワードをランダムで一つ選び、PubMedで検索する (by Entrez API)。
- 関連順で上位20件から3件をランダムに選び、そのタイトルやアブストラクトの情報を取得する (by Entrez API)。
- 抽出したアブストラクトの文章をGemini 1.5 Flash (Googleの生成AI)で翻訳する (by Gemini API)
- 得られた情報をLINEに送信 (by LINE Notify)。
![Fig 1](/image/fig1.png)

# 準備
> [!CAUTION]
> **以下で作成するAPIキーやトークンは他者に絶対に公開しないこと**

## 目次
1. PubMed APIの設定
2. Geminiの設定
3. LINE Notifyの設定
4. 検索キーワードリストの作成
5. Google Apps Script (GAS)の定期実行

## 1. PubMed APIの設定 (APIキーの取得)
> [!NOTE]
> APIキーなしでも検索可能だが、アクセス上限が増える  

- [NCBI](https://www.ncbi.nlm.nih.gov/)にログイン
- Account Settings>API Key ManagementのCreate API Keyというボタンを押し、API Keyを生成する
- 生成したAPI keyをGASコード上のpubmed_keyにコピペ (3箇所)

## 2. Geminiの設定
- [Google AI Studio](https://ai.google.dev/aistudio?hl=ja)にログイン
- 左上のGet API keyを押して、API keyを作成する
- 表示されるホップアップは適宜承認
- 生成したAPI keyをGASコード上のgemini_keyにコピペ (1箇所)

## 3. LINE Notifyの設定

参考:  
https://qiita.com/frozencatpisces/items/679d66ab1d617b7a40cb  
https://zenn.dev/miya_akari/articles/e4541d7ac84921

- LINEで通知を受け取るトークルームを作成
- [LINE Notify](https://notify-bot.line.me/ja/)にログインし、マイページからアクセストークンを発行 (送信するトークルームごとに作成される)
- トークルームにLINE Notifyを招待
- 発行したトークンをGASコード上のline_tokenにコピペ (1箇所)
  
## 4. 検索キーワードリストの作成
- 自分のGoogle Accountからマイドライブにアクセス
- 画面を右クリックし、Google スプレッドシートから新規のスプレッドシートを作成する  
![Fig 3](/image/fig3.png)
- 作成したスプレッドシートのA列に検索したいキーワードリストを入力
![Fig 4](/image/fig4.png)

## 5. GASの定期実行

- 自分のGoogle Accountからマイドライブにアクセス
- 画面を右クリックし、Google Apps Scriptから新規のGASプロジェクトを作成する
![Fig 2](/image/fig2.png)
- GASコード([paper_bot.js](/paper_bot.js))をコピペ
- 