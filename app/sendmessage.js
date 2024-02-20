import dotenv from "dotenv";
const axios = require("axios");

// 環境変数からAPIキーと検索キーを取得
dotenv.load();
const api_key = process.env.OPENAI_API_KEY;
const search_key = process.env.SEARCH_KEY;

// APIの設定
const api_base = "https://oai1-0.openai.azure.com/";
const deployment_id = "deploy0123";
const search_endpoint = "https://search0123.search.windows.net";
const search_index = "index0206-mitani-tel";

// ヘッダー
const headers = {
  "Content-Type": "application/json",
  "api-key": api_key,
};

function sanitize(input) {
  var div = document.createElement("div");
  div.appendChild(document.createTextNode(input));
  return div.innerHTML;
}

var messages = [
  {
    role: "system",
    content:
      "あなたは九州工業大学のホームページに埋め込まれたチャットボットです。データソースに基づき、ユーザーからの問い合わせに対して日本語で応答してください。",
  },
];

//sendボタンを押したかどうかの判定
document.addEventListener("DOMContentLoaded", function () {
  var button = document.querySelector("#send");
  button.addEventListener("click", function () {
    var input = document.querySelector("#req");
    if (input.value != "") {
      send(input.value);
    }
  });
});

//refreshボタンを押したかどうかの判定
document.addEventListener("DOMContentLoaded", function () {
  var button = document.querySelector("#refresh");
  button.addEventListener("click", function () {
    clearChildren();
  });
});

// テキストエリアの内容をクリア
function clearText() {
  var textForm = document.getElementById("req");
  textForm.value = "";
}

//会話を削除
function clearChildren() {
  var resDiv = document.getElementById("res");
  messages = [
    {
      role: "system",
      content:
        "あなたは九州工業大学のホームページに埋め込まれたチャットボットです。データソースに基づき、ユーザーからの問い合わせに対して日本語で応答してください。",
    },
  ];
  while (resDiv.firstChild) {
    resDiv.removeChild(resDiv.firstChild);
  }
}

//  backendにリクエストを送信
async function send(input) {
  const req = sanitize(input);
  const messageReq = {
    role: "user",
    content: req,
  };
  messages.push(messageReq);
  console.log("Sending Reqeust");
  const requestData = {
    dataSources: [
      {
        type: "AzureCognitiveSearch",
        parameters: {
          endpoint: search_endpoint,
          indexName: search_index,
          semanticConfiguration: null,
          queryType: "simple",
          fieldsMapping: {
            contentFieldsSeparator: "\n",
            contentFields: ["content"],
            filepathField: "metadata_storage_name",
            titleField: null,
            urlField: "metadata_storage_path",
            vectorFields: [],
          },
          inScope: true,
          roleInformation: "",
          filter: null,
          strictness: 3,
          topNDocuments: 5,
          key: search_key,
        },
      },
    ],
    messages: messages,
    deployment: deployment_id,
    temperature: 0.5,
    top_p: 0.95,
    max_tokens: 800,
    stop: null,
    stream: false,
  };

  // 送信したリクエストを表示
  var newDiv = document.createElement("div");
  newDiv.className = "message";
  var newContent = document.createTextNode(req);
  newDiv.appendChild(newContent);
  var currentDiv = document.querySelector("#res");
  currentDiv.appendChild(newDiv);
  clearText();

  // POSTリクエストの実行
  axios
    .post(
      `${api_base}/openai/deployments/${deployment_id}/extensions/chat/completions?api-version=2023-08-01-preview`,
      requestData,
      { headers: headers }
    )
    .then((response) => {
      console.log(response.data.choices[0].message.content);
      const res = response.data.choices[0].message.content;
      messageRes = {
        role: "system",
        content: res,
      };
      messages.push(messageRes);
      // 新しいdiv要素を作成
      var newDiv = document.createElement("div");

      // 新しいdiv要素にclassを追加
      newDiv.className = "gpt_res";

      // 新しいdiv要素にテキストノードを追加
      var newContent = document.createTextNode(res);
      newDiv.appendChild(newContent);

      // 既存のdiv要素を取得
      var currentDiv = document.querySelector("#res");

      // 新しいdiv要素を既存のdiv要素の子として追加
      currentDiv.appendChild(newDiv);
    })
    .catch((error) => {
      console.error(error);
      var newDiv = document.createElement("div");
      newDiv.className = "error_message";
      var newContent = document.createTextNode("エラーが発生しました");
      newDiv.appendChild(newContent);
      var currentDiv = document.querySelector("#res");
      currentDiv.appendChild(newDiv);
    });
}
