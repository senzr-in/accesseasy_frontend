@echo off
kubectl run curl-test3 --image=curlimages/curl --restart=Never -n knative-fn --rm -i -- curl -s -X POST http://10.0.2.220:8080 -H "Content-Type: application/json" -d "{\\"action\\":\\"authorize\\", \\"type\\":\\"google\\"}"
