#!/bin/bash

token=`node utils.js`
resourceGroups="guwe0"
namespaceName="guwensp7"
apiversion="2015-08-01"
echo "############## Creating namespace ####################"
curl -X PUT -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d '{
	"location": "eastus",
	"kind": "Messaging",
	"sku": {
		"name": "Basic",
		"tier": "Basic",
	},
	"tags": {
		"key1": "value 1",
		"key2": "value 2"
       }
}' https://management.azure.com/subscriptions/4be8920b-2978-43d7-ab14-04d8549c1d05/resourceGroups/$resourceGroups/providers/Microsoft.ServiceBus/namespaces/$namespaceName?api-version=$apiversion


echo
echo "############## Checking namespace status ####################"
while true; do
  body=`curl -X GET -H "Content-Type: application/json" -H "Authorization: Bearer $token" https://management.azure.com/subscriptions/4be8920b-2978-43d7-ab14-04d8549c1d05/resourceGroups/$resourceGroups/providers/Microsoft.ServiceBus/namespaces/$namespaceName?api-version=$apiversion 2>/dev/null`
  echo $body
  status=`echo $body | jq ".properties .provisioningState"`
  if [ $status = '"Succeeded"' ]; then
    break
  else
    echo ${status}
  fi
  sleep 1
done


echo "############## Creating Queue ####################"
curl -X PUT -H "Content-Type: application/json" -H "Authorization: Bearer $token" -d '{  
   "name":"queueName",
   "type":"Microsoft.ServiceBus/Queues",
   "location":"eastus"
}' https://management.azure.com/subscriptions/4be8920b-2978-43d7-ab14-04d8549c1d05/resourceGroups/$resourceGroups/providers/Microsoft.ServiceBus/namespaces/$namespaceName/queues/queueName?api-version=$apiversion
 
