import requests
import json

BACKEND_URL="http://localhost:3001/api"
USER = "re"

def url(x):
    return BACKEND_URL+x

def headers():
    return {
        "Content-Type":"application/json"
        }

def body(x):
    return json.dumps(x)

def req(x):
    data = x.json()
    if ('error' in data):
        raise Exception("Backend returned error: " + json.dumps(data))
    return (x, data)


print("Retrieving token...", end="")
x, data = req(requests.post(url("/debug/log_as"), headers=headers(), data=body({
    "username":USER
})))
token = data['access_token']






