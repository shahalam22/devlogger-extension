# Developer Activity Logger for VS Code

**Developer Activity Logger** is a Visual Studio Code extension designed to track and log all developer activity, including file changes, workspace updates, and configurations. It ensures a seamless logging process and integrates with a Git repository to periodically save and push the logs for review and analysis.

---

## Features

1. **Activity Tracking**:
   - Logs file open, close, save, and modification events.
   - Tracks workspace folder changes, file creation, deletion, and renaming.
   - Captures configuration changes and document state transitions.

2. **Git Integration**:
   - Automatically commits and pushes logs to a remote Git repository.
   - Hourly updates with customizable intervals.
   - Final log commits during VS Code shutdown or extension termination.

3. **Smart Logging**:
   - Avoids logging if no files are open in the workspace.
   - Skips redundant Git operations when no updates have occurred in the log file.

4. **User-Friendly Commands**:
   - Start and stop tracking with easy-to-use commands:
     - `Devlog: Start` to begin logging.
     - `Devlog: Terminate` to stop logging.

5. **Configurable Log Directory**:
   - Logs are saved in a structured `developer_logs` folder inside a cloned Git repository.
   - Log files are named by date for easy organization.

---

## Installation

1. **Download and Install**: 
   - Install the extension from the Visual Studio Code marketplace (if available) or clone this repository.

2. **Activate the Extension**:
   - Open the command palette (`Ctrl+Shift+P` or `Cmd+Shift+P`) in VS Code.
   - Use the `Devlog: Start` command to begin tracking.

3. **Repository Setup**:
   - When starting for the first time, provide a Git repository URL (Where all the logs of vscode activity according to the day will be saved) for cloning.
   - Ensure you have appropriate permissions to push changes to the remote repository.

---

## Usage

### Starting the Logger
1. Open the command palette (`Ctrl+Shift+P` or `Cmd+Shift+P`).
2. Run the command `Devlog: Start`.
3. Enter your GitHub repository URL when prompted.

### Stopping the Logger
1. Open the command palette.
2. Run the command `Devlog: Terminate`.

### Log File Format
Logs are stored in a file named by the current date (e.g., `2024-12-28.log`) and include:
- Timestamps in your local timezone.
- Events such as file modifications, openings, closings, saves, and more.

Example log file content:
```
10:12:34 - Opened: /path/to/file.js
10:15:12 - Modified: /path/to/file.js
10:16:45 - Saved: /path/to/file.js
```

---

## Requirements

- **Node.js**: Ensure you have Node.js installed to run the extension.
- **Git**: Required for repository cloning, committing, and pushing logs.
- **GitHub Repository Access**: Necessary for setting up the log storage.

---

## Log Files Location
Logs are stored in:
```
~/developer_repo/developer_logs/
```

---

## Error Handling

### Common Issues
1. **No Open Files in Workspace**:
   - Logs will not be updated or committed if no files are open.
   
2. **No Updates in Log File**:
   - Git operations are skipped if no changes have been logged.

3. **Git Lock File Error**:
   - If another Git process is running, ensure it is terminated, or manually remove the `.git/index.lock` file from the repository directory.

4. **Cloning Errors**:
   - Verify the provided Git repository URL and your network connection.

---

## Contributing

Contributions are welcome! To contribute:
1. Fork the repository.
2. Create a feature branch (`git checkout -b feature-branch`).
3. Commit your changes (`git commit -m 'Add feature'`).
4. Push to the branch (`git push origin feature-branch`).
5. Open a pull request.

---

## Future Enhancements

- Add a settings panel for customizing the log directory and commit interval.
- Implement advanced analytics for developer productivity.
- Support for multi-repository tracking.

---

Enjoy seamless and efficient developer activity tracking with **Developer Activity Logger**! 🎉
