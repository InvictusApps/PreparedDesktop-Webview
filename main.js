const { app } = require('electron');
const googleAuthProcess = require('./main/google-auth-process');
const appProcess = require('./main/app-process');
const preparedApi = require('./services/prepared-api-service');

async function startup() {
    googleAuthProcess.createAuthWindow();

    // try {
    //     await preparedApi.refreshTokens();
    //     return appProcess.createAppWindow();
    // } catch (err) {
    //     googleAuthProcess.createAuthWindow();
    // }
}

app.on('ready', startup);