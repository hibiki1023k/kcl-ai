package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"
)

// 環境変数から設定を読み込む
func getEnvVars() (string, string, string) {
	apiKey := os.Getenv("OPENAI_API_KEY")
	searchKey := os.Getenv("SEARCH_KEY")
	ipAddress := os.Getenv("IP_ADDRESS")
	return apiKey, searchKey, ipAddress
}

// OpenAI APIにリクエストを送信する
func sendRequest(apiKey, searchKey string, question string, w http.ResponseWriter, r *http.Request) {
	apiBase := "https://oai1-0.openai.azure.com/"
	deploymentID := "deploy0304"
	searchEndpoint := "https://search0123.search.windows.net"
	searchIndex := "index0206-mitani-tel"

	data := map[string]interface{}{
		"dataSources": []map[string]interface{}{
			{
				"type": "AzureCognitiveSearch",
				"parameters": map[string]interface{}{
					"endpoint":              searchEndpoint,
					"indexName":             searchIndex,
					"semanticConfiguration": nil,
					"queryType":             "simple",
					"fieldsMapping": map[string]interface{}{
						"contentFieldsSeparator": "\n",
						"contentFields":          []string{"content"},
						"filepathField":          "metadata_storage_name",
						"titleField":             nil,
						"urlField":               "metadata_storage_path",
						"vectorFields":           []interface{}{},
					},
					"inScope":         true,
					"roleInformation": "",
					"filter":          nil,
					"strictness":      3,
					"topNDocuments":   5,
					"key":             searchKey,
				},
			},
		},
		"messages": []map[string]string{
			{
				"role":    "system",
				"content": "あなたは九州工業大学のホームページに埋め込まれたチャットボットです。データソースに基づき、ユーザーからの問い合わせに対して日本語で応答してください。",
			},
			{
				"role":    "user",
				"content": question,
			},
			{
				"role":    "user",
				"content": question,
			},
			{
				"role":    "user",
				"content": question,
			},
		},
		"deployment":  deploymentID,
		"temperature": 0.5,
		"top_p":       0.95,
		"max_tokens":  800,
		"stop":        nil,
		"stream":      false,
	}

	jsonData, err := json.Marshal(data)
	if err != nil {
		log.Fatalf("Error occurred during marshaling. Error: %s", err.Error())
	}

	requestURL := fmt.Sprintf("%sopenai/deployments/%s/extensions/chat/completions?api-version=2023-08-01-preview", apiBase, deploymentID)
	req, err := http.NewRequest("POST", requestURL, bytes.NewBuffer(jsonData))
	if err != nil {
		log.Fatalf("Error occurred during request creation. Error: %s", err.Error())
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("api-key", apiKey)

	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		log.Fatalf("Error occurred during sending request. Error: %s", err.Error())
	}
	defer resp.Body.Close()

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		log.Fatalf("Error occurred during reading response. Error: %s", err.Error())
	}

	// レスポンスをクライアントに返す
	w.Header().Set("Content-Type", "application/json")
	w.Write(body)

	// レスポンスをログに出力
	log.Printf("Response: %s", string(body))
}

func handleRequests(apiKey, searchKey, ipAddress string) {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		sendRequest(apiKey, searchKey, r.URL.Query().Get("question"), w, r)
	})

	log.Fatal(http.ListenAndServe(ipAddress+":8081", nil))
}

func main() {
	apiKey, searchKey, ipAddress := getEnvVars()
	handleRequests(apiKey, searchKey, ipAddress)
}
