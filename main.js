const { app, ipcMain, Menu, dialog } = require('electron');
const googleAuthProcess = require('./main/google-auth-process');
const appProcess = require('./main/app-process');
const preparedApi = require('./services/prepared-api-service');
const { autoUpdater } = require('electron-updater');
const { clone } = require('ramda');

const template = [{
    label: app.getName(),
    submenu: [
        { label: `Version ${app.getVersion()}`, enabled: false },
        { label: 'Check for updates', enabled: false, click: () => checkForUpdates({ silent: false }) },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' }
    ]
}];
const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);

const changeUpdaterMenu = ({ label, enabled }) => {
    const newTemplate = clone(template);
    newTemplate[0].submenu[1].label = label;
    newTemplate[0].submenu[1].enabled = enabled;
    const menu = Menu.buildFromTemplate(newTemplate);
    Menu.setApplicationMenu(menu);
};

// autoUpdater.autoDownload = false;
let isSilent = false;
let updateDownloaded = false;

async function startup() {
    googleAuthProcess.createAuthWindow();

    // Check for any available updates
    autoUpdater.checkForUpdatesAndNotify();

    // try {
    //     await preparedApi.refreshTokens();
    //     return appProcess.createAppWindow();
    // } catch (err) {
    //     googleAuthProcess.createAuthWindow();
    // }
}

app.on('ready', startup);

// ipcMain.on('app_version', (event) => {
//     event.sender.send('app_version', { version: app.getVersion() });
// });

// autoUpdater.on('update-available', () => {
//     if (isSilent) {
//         autoUpdater.downloadUpdate();
//         return;
//     }
//
//     dialog.showMessageBox({
//         type: 'info',
//         title: 'Found Updates',
//         message: 'New updates are available, do you want to update now?',
//         defaultId: 0,
//         cancelId: 1,
//         buttons: ['Yes', 'No']
//     }, (buttonIndex) => {
//         if (buttonIndex === 0)
//             autoUpdater.downloadUpdate();
//         else
//             changeUpdaterMenu({ label: 'Check for updates', enabled: true });
//     });
// });
//
// autoUpdater.on('update-not-available', () => {
//     changeUpdaterMenu({ label: 'Check for updates', enabled: true });
//     if (isSilent) return;
//     dialog.showMessageBox({
//         title: 'No Updates',
//         message: 'Current version is up-to-date.'
//     });
// });
//
// autoUpdater.on('update-downloaded', () => {
//     updateDownloaded = true;
//     changeUpdaterMenu({ label: 'Updates available', enabled: true });
//     if (isSilent) return;
//     dialog.showMessageBox({
//         title: 'Install Updates',
//         message: 'Updates are ready to be installed.',
//         defaultId: 0,
//         cancelId: 1,
//         buttons: ['Install and restart', 'Close']
//     }, (buttonIndex) => {
//         if (buttonIndex === 0)
//             setImmediate(() => autoUpdater.quitAndInstall());
//         else
//             changeUpdaterMenu({ label: 'Updates available', enabled: true });
//     })
// });

autoUpdater.on('updated-downloaded', () => {
    autoUpdater.quitAndInstall();
});

function checkForUpdates({ silent }) {
    isSilent = silent;
    changeUpdaterMenu({ label: 'Checking for updates...', enabled: false });
    if (updateDownloaded) {
        dialog.showMessageBox({
            title: 'Available Updates',
            message: 'New updates are available and ready to be installed.',
            defaultId: 0,
            cancelId: 1,
            buttons: ['Install and restart', 'Close']
        }, (buttonIndex) => {
            if (buttonIndex === 0)
                setImmediate(() => autoUpdater.quitAndInstall());
            else
                changeUpdaterMenu({ label: 'Updates available', enabled: true });
        })
    } else {
        autoUpdater.checkForUpdates();
    }
}