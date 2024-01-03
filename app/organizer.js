let instances = [];

Handlebars.registerHelper("isFirstInList", function (values) {
  return values.index === 0;
});

Handlebars.registerHelper("isLastInList", function (values) {
  return values.index === instances.length - 1;
});

function setUp(index) {
  window.electron.ipcRenderer.sendMessage("set-up", index);
}

function setDown(index) {
  window.electron.ipcRenderer.sendMessage("set-down", index);
}

function listDofusPids(pids) {
  const template = document.getElementById("list-instances").innerHTML;
  const compiled = Handlebars.compile(template);

  instances = pids;
  const rendered = compiled({ instances: instances });

  document.getElementById("instances").innerHTML = rendered;
}

function openWindow(pid) {
  window.electron.ipcRenderer.sendMessage("open-window", pid);
}

function refresh() {
  window.electron.ipcRenderer.sendMessage("refresh-pids");
}

window.electron.ipcRenderer.on("get-pids-response", (event, arg) => {
  listDofusPids(event);
});
