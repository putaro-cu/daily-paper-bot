# daily-paper-bot
PubMedで文献検索&アブストラクトをGemini 1.5 Flashを使って翻訳したものを、LINEへ通知してくれる。

# 概説
- Google Spreadsheetに記入したキーワードをランダムで一つ選び、PubMedで検索する (by Entrez API)。
- 関連順で上位20件から3件をランダムに選び、そのタイトルやアブストラクトの情報を取得する (by Entrez API)。
- 抽出したアブストラクトの文章をGemini 1.5 Flash (Googleの生成AI)で翻訳する (by Gemini API)
- 得られた情報をLINEに送信 (by LINE Notify)。
