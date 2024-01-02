const { app, BrowserWindow, globalShortcut, ipcMain } = require("electron");
const {
  getDofusPids,
  bringWindowToFront,
  getDofusWindowName,
} = require("./utils");

class Organizer {
  constructor() {
    this.pids = [];
    this.lastOpened = 0;
  }

  start() {
    const createWindow = () => {
      const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
          preload: `${__dirname}/preload.js`,
          nodeIntegration: true,
          contextIsolation: true,
          enableRemoteModule: true,
        },
      });

      win.loadFile("index.html");

      win.webContents.openDevTools();
    };

    app.whenReady().then(() => {
      createWindow();
    });

    app.whenReady().then(async () => {
      this.addShotcuts();
      this.addListeners();
    });

    app.on("will-quit", () => {
      globalShortcut.unregisterAll();
    });
  }

  processShortcut() {
    if (this.lastOpened === 0) {
      bringWindowToFront(this.pids[0].pid);
      this.lastOpened = 1;
    } else {
      bringWindowToFront(this.pids[this.lastOpened].pid);

      if (this.lastOpened === this.pids.length - 1) {
        this.lastOpened = 0;
      } else {
        this.lastOpened += 1;
      }
    }
  }

  addShotcuts() {
    globalShortcut.register(
      "CommandOrControl+1",
      this.processShortcut.bind(this)
    );
  }

  addListeners() {
    ipcMain.on("refresh-pids", (event) => {
      getDofusPids().then((pids) => {
        this.pids = pids;
        event.reply("get-pids-response", this.pids);
      });
    });

    ipcMain.on("get-pids", (event) => {
      event.reply("get-pids-response", this.pids);
    });

    ipcMain.on("open-window", (event, pid) => {
      bringWindowToFront(pid);
    });
  }
}

module.exports = { Organizer };
