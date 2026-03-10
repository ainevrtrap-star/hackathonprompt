import requests
import json

# Your actual API key (without < and > symbols)
API_KEY = "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"

response = requests.get(
  url="https://openrouter.ai/api/v1/key",
  headers={
    "Authorization": f"Bearer {API_KEY}"
  }
)

print(json.dumps(response.json(), indent=2))