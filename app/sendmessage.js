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

// 会話を削除
function clearChildren() {
    var resDiv = document.getElementById("res");
    while (resDiv.firstChild) {
        resDiv.removeChild(resDiv.firstChild);
    }
}

// バックエンドにリクエストを送信
async function send(input) {
    const sanitizedInput = sanitize(input);
    fetch(`http://192.168.11.4:8081/?question=${encodeURIComponent(sanitizedInput)}`)
        .then(response => response.json())
        .then(data => {
            // ここでdataを使用してUIに表示する処理を行います
            // 例えばdataの内容をログに表示
            console.log(data);
            // 応答をページに表示する処理をここに追加
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

// 入力値のサニタイズ（XSS対策）
function sanitize(input) {
    var div = document.createElement("div");
    div.appendChild(document.createTextNode(input));
    return div.innerHTML;
}
