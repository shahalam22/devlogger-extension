// Import required VS Code and Node.js modules
const vscode = require('vscode');
const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

let logFilePath;
let logInterval;
const repoCloneDir = path.join(require('os').homedir(), 'developer_repo');
let repoCloned = false;
let logFileUpdated = false; // Tracks if the log file has been updated

// Activate the extension
function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand('devlog.start', startTracking),
    vscode.commands.registerCommand('devlog.terminate', terminateTracking)
  );

  // Register event handlers for workspace and file operations
  registerLogHandlers();

  // Finalize logs during shutdown
  context.subscriptions.push({
    dispose: finalizeLogsOnShutdown,
  });
}

// Start tracking developer logs
function startTracking() {
  if (fs.existsSync(repoCloneDir)) {
    exec(`git rev-parse --is-inside-work-tree`, { cwd: repoCloneDir }, (err, stdout) => {
      if (!err && stdout.trim() === 'true') {
        vscode.window.showInformationMessage('Repository already exists. Starting log tracking.');
        repoCloned = true;
        startTrackingLogs();
      } else {
        cloneRepository();
      }
    });
  } else {
    cloneRepository();
  }
}

// Clone repository if not already cloned
function cloneRepository() {
  vscode.window.showInputBox({ prompt: 'Enter the GitHub repository URL to clone:' }).then(repoUrl => {
    if (!repoUrl) {
      vscode.window.showErrorMessage('No repository URL provided. Cannot start tracking.');
      return;
    }

    fs.mkdirSync(repoCloneDir, { recursive: true });

    exec(`git clone ${repoUrl} ${repoCloneDir}`, (err) => {
      if (err) {
        vscode.window.showErrorMessage(`Error cloning repository: ${err.message}`);
        return;
      }

      vscode.window.showInformationMessage('Repository cloned successfully. Tracking will now start.');
      repoCloned = true;
      startTrackingLogs();
    });
  });
}

// Start tracking logs in the developer logs folder
function startTrackingLogs() {
  const logDirInsideRepo = path.join(repoCloneDir, 'developer_logs');

  if (!fs.existsSync(logDirInsideRepo)) {
    fs.mkdirSync(logDirInsideRepo, { recursive: true });
  }

  const currentDate = getDateInLocalTimezone();
  logFilePath = path.join(logDirInsideRepo, `${currentDate}.log`);

  vscode.window.showInformationMessage('Tracking started. Logs will be saved periodically.');

  logInterval = setInterval(() => {
    if (logFileUpdated && fs.existsSync(logFilePath) && fs.statSync(logFilePath).size > 0) {
      commitLogUpdates('Periodic auto-update of developer logs.');
    }
  }, 3600000); // Commit logs every 1 hour
}

// Universal logging condition check
function shouldLog() {
  return vscode.workspace.textDocuments.length > 0; // Log only if there are open files
}

// Register handlers for file and workspace events
function registerLogHandlers() {
  const handlers = [
    {
      event: vscode.workspace.onDidChangeTextDocument,
      message: 'Modified',
    },
    {
      event: vscode.workspace.onDidOpenTextDocument,
      message: 'Opened',
    },
    {
      event: vscode.workspace.onDidCloseTextDocument,
      message: 'Closed',
    },
    {
      event: vscode.workspace.onDidSaveTextDocument,
      message: 'Saved',
    },
    {
      event: vscode.workspace.onDidChangeWorkspaceFolders,
      message: 'Workspace folders changed',
    },
    {
      event: vscode.workspace.onDidCreateFiles,
      message: 'Created',
    },
    {
      event: vscode.workspace.onDidDeleteFiles,
      message: 'Deleted',
    },
    {
      event: vscode.workspace.onDidRenameFiles,
      message: 'Renamed',
    },
  ];

  handlers.forEach(({ event, message }) => {
    event((args) => {
      if (logFilePath && shouldLog()) {
        const time = getLocalTime();
        const logEntry = `${time} - ${message}: ${args.fileName || 'Workspace event'}\n`;
        fs.appendFileSync(logFilePath, logEntry);
        logFileUpdated = true;
      }
    });
  });
}

// Commit only the log updates
function commitLogUpdates(message) {
  if (!logFileUpdated) {
    vscode.window.showInformationMessage('No changes to commit.');
    return;
  }

  const logDirInsideRepo = path.join(repoCloneDir, 'developer_logs');

  exec(`git add ${logDirInsideRepo}`, { cwd: repoCloneDir }, (err) => {
    if (err) {
      vscode.window.showErrorMessage(`Error adding log files: ${err.message}`);
      return;
    }

    exec(`git commit -m "${message}"`, { cwd: repoCloneDir }, (err) => {
      if (err) {
        vscode.window.showErrorMessage(`Error committing log files: ${err.message}`);
        return;
      }

      exec('git push', { cwd: repoCloneDir }, (err) => {
        if (err) {
          vscode.window.showErrorMessage(`Error pushing log changes: ${err.message}`);
        } else {
          vscode.window.showInformationMessage('Developer logs updated and pushed successfully.');
          logFileUpdated = false; // Reset update flag after a successful push
        }
      });
    });
  });
}

// Terminate tracking developer logs
function terminateTracking() {
  if (!logFilePath) {
    vscode.window.showErrorMessage('Tracking was not started!');
    return;
  }

  clearInterval(logInterval);
  finalizeLogs('Final update of developer logs before termination.');
  vscode.window.showInformationMessage('Tracking terminated.');
  logFilePath = null;
}

// Finalize logs during shutdown
function finalizeLogsOnShutdown() {
  if (logFileUpdated && logFilePath && fs.existsSync(logFilePath) && fs.statSync(logFilePath).size > 0) {
    commitLogUpdates('Final update of developer logs before VS Code shutdown.');
  } else {
    vscode.window.showInformationMessage('No changes to commit during shutdown.');
  }
}

// Get the current date in the developer's local timezone (YYYY-MM-DD format)
function getDateInLocalTimezone() {
  const now = new Date();
  return now.toLocaleDateString('en-CA'); // Format: YYYY-MM-DD
}

// Get the current time in developer's local timezone (HH:MM:SS format)
function getLocalTime() {
  const now = new Date();
  return now.toLocaleTimeString('en-US', { hour12: false }); // Format: HH:MM:SS
}

// Deactivate the extension
function deactivate() {
  if (logInterval) {
    clearInterval(logInterval);
  }
}

// Finalize logs helper
function finalizeLogs(message) {
  if (logFileUpdated && fs.existsSync(logFilePath) && fs.statSync(logFilePath).size > 0) {
    commitLogUpdates(message);
  }
}

module.exports = {
  activate,
  deactivate,
};
