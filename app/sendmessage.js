document.addEventListener("DOMContentLoaded", function () {
  // Sendボタンにイベントリスナーを設定
  var sendButton = document.querySelector("#send");
  sendButton.addEventListener("click", function () {
    var input = document.querySelector("#req").value;
    if (input) {
      send(input);
    }
  });

  // Refreshボタンにイベントリスナーを設定
  var refreshButton = document.querySelector("#refresh");
  refreshButton.addEventListener("click", function () {
    clearChildren();
  });
});

// テキストエリアの内容をクリア
function clearText() {
  document.getElementById("req").value = "";
}

function showText() {
  var newDiv = document.createElement("div");
  newDiv.className = "message";
  var newContent = document.createTextNode(req);
  newDiv.appendChild(newContent);
  var currentDiv = document.querySelector("#res");
  currentDiv.appendChild(newDiv);
  clearText();
}

// 会話を削除
function clearChildren() {
  var resDiv = document.getElementById("res");
  while (resDiv.firstChild) {
    resDiv.removeChild(resDiv.firstChild);
  }
}

// バックエンドにリクエストを送信
async function send(input) {
  req = sanitize(input);
  const sanitizedInput = sanitize(input);
  // ユーザーの入力を表示
  var newDiv = document.createElement("div");
  newDiv.className = "message";
  var newContent = document.createTextNode(req);
  newDiv.appendChild(newContent);
  var currentDiv = document.querySelector("#res");
  currentDiv.appendChild(newDiv);
  clearText();
  fetch(`http://localhost:8081/?question=${encodeURIComponent(sanitizedInput)}`)
    .then((response) => response.json())
    .then((data) => {
      // ここでdataを使用してUIに表示する処理を行います
      // 例えばdataの内容をログに表示
      console.log(data);

      // ボットの返答を表示

      const content = data.choices[0].message.content;

      var newDiv = document.createElement("div");
      newDiv.className = "message";
      var newContent = document.createTextNode(content);
      newDiv.appendChild(newContent);
      var currentDiv = document.querySelector("#res");
      currentDiv.appendChild(newDiv);

      // TODO: data.choicesの配列番号を更新
    })
    .catch((error) => {
      console.error("Error:", error);
    });
}

// 入力値のサニタイズ（XSS対策）
function sanitize(input) {
  var div = document.createElement("div");
  div.appendChild(document.createTextNode(input));
  return div.innerHTML;
}
