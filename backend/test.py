import requests

token = input('Token: ')

x = requests.get("http://localhost:3001/api/chat/me", headers={"Authorization": f"Bearer {token}"})
print(x.json())