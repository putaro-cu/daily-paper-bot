# daily-paper-bot
PubMedで文献検索&アブストラクトをGemini 1.5 Flashを使って翻訳したものを、LINEへ通知する。

# 概説
- Google Spreadsheetに記入したキーワードをランダムで一つ選び、PubMedで検索する (by Entrez API)。
- 関連順で上位20件から3件をランダムに選び、そのタイトルやアブストラクトの情報を取得する (by Entrez API)。
- 抽出したアブストラクトの文章をGemini 1.5 Flash (Googleの生成AI)で翻訳する (by Gemini API)
- 得られた情報をLINEに送信 (by LINE Notify)。
![Fig 1](/image/fig1.png)

# 準備
## 目次
1. PubMedのアカウント登録と設定
2. Geminiのアカウント登録と設定
3. LINE Notifyの設定
4. Google Apps Script (GAS)の定期実行

## 1. PubMed側の設定 (APIキーの取得)
参考: https://qiita.com/kujira_0120/items/fdb77d1956e8582ff86c  
[!NOTE] APIキーなしでも検索可能だが、アクセス上限が増える  
