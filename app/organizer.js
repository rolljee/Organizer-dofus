function listDofusPids(pids) {
  const template = document.getElementById("list-instances").innerHTML;
  const compiled = Handlebars.compile(template);

  const rendered = compiled({ instances: pids });

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
