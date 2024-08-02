function main() {
    const line_token = '自分のものに置き換えてください'; // LINE Notifyのトークン
    const sheetUrl = '自分のものに置き換えてください'; // スプレッドシートのURL
    const lineNotifyApi = 'https://notify-api.line.me/api/notify';
    const sheet = SpreadsheetApp.openByUrl(sheetUrl).getSheets()[0];


    // 検索ワードを決定する
    const values = sheet.getDataRange().getValues();
    const term = values[Math.floor(values.length * Math.random())];

    // PubMed IDを取得
    const idList = getPubmedID(term);

    if (idList < 1) {
        Logger.log("No results");
    }

    // 各PubMed IDに対してメッセージをLINEに送信
    idList.map(id => {
        const message = [getSummary(id), getGeminiSummary(getFetch(id))];

        message.map(part => {
            const options = {
                "method": "post",
                "payload": { "message": "\n" + part },
                "headers": { "Authorization": "Bearer " + line_token }
            };

            UrlFetchApp.fetch(lineNotifyApi, options);
        });

    });
}

function getPubmedID(term) {// pubmedでの検索実行
    const pubmed_key = '自分のものに置き換えてください'; // PubMedのAPIキー
    const retMax = 20;
    const range = 5;
    const baseUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi';

    const today = new Date();

    const params = {
        db: 'pubmed',
        term: term,
        retmode: 'json',
        retstart: 0,
        retmax: retMax,
        datetype: 'pdat',
        mindate: [today.getFullYear() - range, today.getMonth(), today.getDay()].join("/"),
        maxdate: [today.getFullYear(), today.getMonth(), today.getDay()].join("/"),
        apikey: pubmed_key,
        sort: 'relevance'
    };

    const response = UrlFetchApp.fetch(baseUrl + '?' + encodeParams(params));
    const data = JSON.parse(response.getContentText());
    const array = data.esearchresult.idlist;

    if (array.length > 3) {
        const shuffledArray = durstenfeldShuffle([...array]);
        return shuffledArray.slice(0, 3);
    } else {
        return array;
    }

}

function getSummary(id) {
    const baseUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi';
    const pubmed_key = '自分のものに置き換えてください'; // PubMedのAPIキー
    const params = {
        db: 'pubmed',
        id: id,
        retmode: 'json',
        api_key: pubmed_key
    };

    const response = UrlFetchApp.fetch(baseUrl + '?' + encodeParams(params));
    const json = JSON.parse(response.getContentText()).result;

    const title = (json[id].title)
        ? json[id].title
        : "Title not available";

    const authors = (json[id].authors)
        ? json[id].authors.map(author => author.name).join(", ")
        : "Authors not available";

    const date = (json[id].epubdate)
        ? json[id].epubdate
        : "Dates not available";

    const pubtype = (json[id].pubtype)
        ? json[id].pubtype
        : "pubtype not available";

    const source = (json[id].source)
        ? json[id].source
        : "Source not available";

    const doi = (json[id].elocationid)
        ? json[id].elocationid.split(" ")[1]
        : "DOI not available";

    return `タイトル: ${title}\n著者: ${authors}\n出版日: ${date}\n種類: ${pubtype}\n出典: ${source}\n LINK: https://doi.org/${doi}`
}

function getFetch(id) {//pubmedID -> abstruct
    const baseUrl = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi';
    const pubmed_key = '自分のものに置き換えてください'; // pubmedのAPIキー

    const params = {
        db: 'pubmed',
        id: id,
        retmode: 'xml',
        api_key: pubmed_key
    };

    const response = UrlFetchApp.fetch(baseUrl + '?' + encodeParams(params));
    
    const xml = XmlService.parse(response.getContentText());
    const root = xml.getRootElement();

    try {
        const abstractElement = root.getChild('PubmedArticle')
            .getChild('MedlineCitation')
            .getChild('Article')
            .getChild('Abstract');

        const abstractText = abstractElement.getValue();
        return abstractText;

    } catch (e) {
        return "no abstruct available";
    }
}

function getGeminiSummary(abst) {
    const gemini_key = '自分のものに置き換えてください'; // GeminiのAPIキー
    const baseUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${gemini_key}`;
    
    const payload = {
        'contents': [
            {
                'parts': [{
                    'text': `Please summarize this abstract of the research article in Japanese. The maximum of characters is 950. The maximum of characters is 950. No need to itemize. Exclude the part of copyright. \n ${abst}`
                }]
            }
        ],
        "safetySettings": [
            {
                "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                "threshold": "BLOCK_NONE"
            },
            {
                "category": "HARM_CATEGORY_HATE_SPEECH",
                "threshold": "BLOCK_NONE"
            },
            {
                "category": "HARM_CATEGORY_HARASSMENT",
                "threshold": "BLOCK_NONE"
            },
            {
                "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                "threshold": "BLOCK_NONE"
            }
        ]
    };

    const options = {
        'method': 'post',
        'contentType': 'application/json',
        'payload': JSON.stringify(payload)
    };

    const response = UrlFetchApp.fetch(baseUrl, options);
    const json = JSON.parse(response.getContentText())

    if ('content' in json.candidates[0]) {
        return json.candidates[0].content.parts[0].text;
    } else {
        return 'No answer from Gemini';
    }

}

function encodeParams(params) {
    return Object.keys(params).map(key => encodeURIComponent(key) + '=' + encodeURIComponent(params[key])).join('&');
}

// ダステンフェルドのシャッフルアルゴリズム
function durstenfeldShuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]]; // 要素の交換
    }
    return array;
}
