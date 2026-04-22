@echo off
kubectl run curl-test --image=curlimages/curl --restart=Never -n knative-fn --rm -i -- curl -s -o /dev/null -w "%%{http_code}" -X POST http://google-accesseasy.knative-fn.knative-fn.svc.cluster.local -H "Content-Type: application/json" -d "{\\"type\\":\\"google\\"}"
