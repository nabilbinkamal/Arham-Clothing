# 🧠 Workspace Rules for Antigravity

## 1. Mandatory First Step: Read Project Memory
At the very beginning of **every new conversation**, before taking any action or answering any user request, you **MUST** read the file `PROJECT_MEMORY.md` using the `view_file` tool.
This file contains the critical context, roadmap, and live server deployment rules for the "AUREON" project. 

Do not proceed with any implementation until you have fully internalized the contents of `PROJECT_MEMORY.md`.

## 2. Deployment Protocol
Always remember that the user has a live Oracle VM Server. Deployments must be done automatically by you (the AI Agent) using SSH/SCP as documented in `PROJECT_MEMORY.md`. Never ask the user to manually copy files to the live server.
