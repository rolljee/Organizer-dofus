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

function getDofusPids() {
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

      resolve(pids);
    });
  });
}

module.exports = {
  getDofusPids,
  bringWindowToFront,
};
