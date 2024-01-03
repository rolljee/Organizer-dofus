const { Organizer } = require("./src/organizer");
try {
  require('electron-reloader')(module)
} catch (_) {}

const Application = new Organizer();

Application.start();
