rm index.zip 
cd lambda 
zip -r -X ../index.zip *
cd .. 
aws lambda update-function-code --function-name Miracle --zip-file fileb://index.zip