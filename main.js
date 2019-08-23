const { app, BrowserWindow } = require('electron');
const { createAuthWindow } = require('./google-auth-process');

function createWindow() {
    // Create the browser window.
    // let win = new BrowserWindow({
    //     width: 800,
    //     height: 600,
    //     webPreferences: {
    //         nodeIntegration: true
    //     }
    // });
    //
    // // and load the index.html of the app.
    // win.loadFile('index.html');

    createAuthWindow();
}

app.on('ready', createWindow);