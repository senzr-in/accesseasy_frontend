@echo off
kubectl run curl-test3 --image=curlimages/curl --restart=Never -n knative-fn --rm -i -- curl -s -w "\\nHTTP_CODE: %%{http_code}" -X POST http://kourier-internal.kourier-system.svc.cluster.local:80 -H "Host: google-accesseasy.knative-fn.svc.cluster.local" -H "Content-Type: application/json" -d "{\\"type\\":\\"google\\"}"
