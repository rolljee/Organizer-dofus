const { app, BrowserWindow, globalShortcut, ipcMain } = require("electron");
const { getDofusInstances, bringWindowToFront } = require("./utils");
const { menubar } = require("menubar");

class Organizer {
  constructor() {
    this.pids = [];
    this.lastOpened = 0;
  }

  start() {
    const mb = menubar({
      browserWindow: {
        alwaysOnTop: true,
        width: 400,
        height: 400,
        webPreferences: {
          preload: `${__dirname}/preload.js`,
          nodeIntegration: true,
          contextIsolation: true,
          enableRemoteModule: true,
        }
      }
    });

    mb.on('ready', () => {
      app.whenReady().then(() => {
        this.addShotcuts();
        this.addListeners();
      });
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
    app.on("will-quit", () => {
      globalShortcut.unregisterAll();
    });

    ipcMain.on("refresh-pids", (event) => {
      getDofusInstances().then((pids) => {
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

    ipcMain.on("set-up", (event, index) => {
      this.setUp(event, index);
    });

    ipcMain.on("set-down", (event, index) => {
      this.setDown(event, index);
    });
  }

  setUp(event, index) {
    const instance = this.pids.find((instance) => instance.index === index);
    instance.index -= 1;

    const instanceAbove = this.pids.find(
      (instance) => instance.index === index - 1
    );
    instanceAbove.index += 1;

    this.pids.sort((a, b) => a.index - b.index);

    event.reply("get-pids-response", this.pids);
  }

  setDown(event, index) {
    const instanceUpper = this.pids.find(
      (instance) => instance.index === index + 1
    );

    instanceUpper.index -= 1;

    const instance = this.pids.find((instance) => instance.index === index);
    instance.index += 1;

    this.pids.sort((a, b) => a.index - b.index);

    event.reply("get-pids-response", this.pids);
  }
}

module.exports = { Organizer };
