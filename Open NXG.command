#!/bin/zsh
launchctl kickstart "gui/$(id -u)/com.nxg.ollama" 2>/dev/null
launchctl kickstart "gui/$(id -u)/com.nxg.assistant" 2>/dev/null
open http://localhost:4174
