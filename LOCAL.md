# NXG on your Mac

Open http://localhost:4174 or double-click Open NXG.command.

NXG and Ollama start automatically when you log in and restart if they exit. Closing the browser or terminal does not stop them. The Mac must be awake and you must be logged in. After the model download, AI replies run offline without OpenAI billing. Gemma 3 4B is a compact model; its accuracy and coding ability differ from larger hosted models. There is no live web search.

The app only listens on loopback, not the Wi-Fi network. The local server never loads the OpenAI key. Chats are saved in browser storage at localhost:4174; the hosted site's history remains separate. Use the same browser and localhost address to retain history. Ollama cloud features are disabled for this service.

Runtime: ~/Library/Application Support/NXG
Model files: ~/.ollama/models
Logs: ~/Library/Logs/NXG
Login services: ~/Library/LaunchAgents/com.nxg.assistant.plist and com.nxg.ollama.plist

Stop until the next login:
```
launchctl bootout gui/$(id -u) ~/Library/LaunchAgents/com.nxg.assistant.plist
launchctl bootout gui/$(id -u) ~/Library/LaunchAgents/com.nxg.ollama.plist
```
To disable automatic startup permanently, move those two plist files out of LaunchAgents after stopping them.

For development, run `node scripts/local-server.mjs` while Ollama is running. To update the installed runtime after editing this checkout, run `python3 scripts/install-local.py`.
