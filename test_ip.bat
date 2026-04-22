@echo off
kubectl run curl-test --image=curlimages/curl --restart=Never -n knative-fn --rm -i -- curl -s -w "\\nHTTP_CODE: %%{http_code}" -X POST http://10.0.2.220:8080 -H "Content-Type: application/json" -d "{\\"type\\":\\"google\\"}"
