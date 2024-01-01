const { app, BrowserWindow, globalShortcut } = require("electron");
const { getDofusPids, bringWindowToFront } = require("./organizer");

const createWindow = () => {
  const win = new BrowserWindow({
    width: 400,
    height: 200,
  });

  win.loadFile("index.html");
};

app.whenReady().then(() => {
  createWindow();
});

app.whenReady().then(async () => {
  let lastOpened = 0;
  const pids = await getDofusPids();

  globalShortcut.register("CommandOrControl+1", () => {
    if (lastOpened === 0) {
      bringWindowToFront(pids[0]);
      lastOpened = 1;
    } else {
      bringWindowToFront(pids[lastOpened]);
      if (lastOpened === pids.length - 1) {
        lastOpened = 0;
      } else {
        lastOpened += 1;
      }
    }
  });
});

app.on("will-quit", () => {
  globalShortcut.unregisterAll();
});
