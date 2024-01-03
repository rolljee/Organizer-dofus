const { exec } = require("child_process");
const appleScript = require("applescript");

function bringWindowToFront(targetPID) {
  const script = `
tell application "System Events"
  set frontmost of every process whose unix id is ${targetPID} to true
end tell
  `;

  appleScript.execString(script, (err, rtn) => {
    if (err) {
      console.error("Error occurred:", err);
    }
  });
}

function getDofusInstances() {
  const command =
    "ps aux | grep './Dofus.app/Contents/MacOS/Dofus' | grep -v grep | awk '{print $2}'";

  return new Promise((resolve, reject) => {
    exec(command, (err, stdout) => {
      if (err) {
        reject(err);
      }

      const pids = stdout
        .split("\n")
        .filter((pid) => pid !== "")
        .map((pid) => parseInt(pid, 10))
        .sort((a, b) => b - a);

      const promises = pids.map((pid) => getDofusWindowName(pid));

      Promise.all(promises)
        .then((pair) => {
          pair.forEach((obj, index) => {
            obj.index = index;
          });

          resolve(pair);
        })
        .catch((err) => {
          reject(err);
        });
    });
  });
}

function getDofusWindowName(pid) {
  return new Promise((resolve, reject) => {
    const script = `
  set targetPID to ${pid}
  
  tell application "System Events"
      set windowName to name of first window of (every process whose unix id is targetPID)
  end tell
  
  return windowName
      `;

    appleScript.execString(script, (err, rtn) => {
      if (err) {
        reject(err);
      }

      resolve({ pid, name: rtn[0].split("-")[0].trim() });
    });
  });
}

module.exports = {
  getDofusInstances,
  bringWindowToFront,
  getDofusWindowName,
};
