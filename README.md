# Frontend-fraud_test-assignment

This project includes JavaScript code with modular structure, and the ability to run a live server for development.

---

## Requirements

Before starting, make sure you have the following tools installed:

1. **Node.js** (recommended: latest LTS version)
   [Download Node.js](https://nodejs.org/)

2. **npm** (comes with Node.js)

3. **Live Server** (install globally via npm):

   ```bash
   npm install -g live-server
   ```

4. **esbuild** (install globally via npm):
   ```bash
   npm install -g esbuild
   ```

---


## Running a Live Server

You can use `live-server` to serve your project locally for development.

### 1. **Using VS Code**

To set up Live Server in **Visual Studio Code**:

1. Install the **Live Server** extension:
   - Open the Extensions view (`Ctrl+Shift+X` or `Cmd+Shift+X` on macOS).
   - Search for "Live Server" and install it.

2. Open your project folder in VS Code.

3. Right-click on `index.html` in the Explorer and select **"Open with Live Server"**.

4. The project will open in your default browser at `http://127.0.0.1:8080` (or a similar port).

### 2. **Using Zed Editor**

If you're using **Zed Editor**, you can configure Live Server as follows:

1. Add the following configuration to your `.zedconfig` file:

   ```json
   {
     // live server (must install npm live server globally)
     "label": "Live Server",
     "command": "live-server",
     "use_new_terminal": true,
     "reveal": "never"
   }
   ```

2. Open terminal `CTRL + J`

3. Run `live-server .`

4. The project will open in your default browser at `http://127.0.0.1:8080` (or a similar port).

---
