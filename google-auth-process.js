const { BrowserWindow, protocol } = require('electron');
const { redirectScheme } = require('./env-variables');
const googleAuthService = require('./google-auth-service');
const url = require('url');
const querystring = require('querystring');

let win = null;

function createAuthWindow() {
    destroyAuthWin();

    // Create the browser window.
    win = new BrowserWindow({
        width: 1000,
        height: 600,
    });

    let authInfo = googleAuthService.getGoogleAuthenticationInfo();

    win.loadURL(authInfo.url);

    protocol.registerHttpProtocol(redirectScheme, async (request) => {
        const rawUrl = request.url;
        const parsedUrl = url.parse(rawUrl);
        const parsedQs = querystring.parse(parsedUrl.query);

        googleAuthService
            .getIdToken(authInfo.state, authInfo.verifier, parsedQs)
            .then((idToken) => { console.log(idToken); })
            .then(() => {
                return destroyAuthWin();
            })
            .catch((error) => {
                console.log("Error in login flow: " + error);
            });
    });

    win.on('authenticated', () => {
        destroyAuthWin();
    });

    win.on('closed', () => {
        win = null;
    });
}

function destroyAuthWin() {
    if (!win) return;
    win.close();
    win = null;
}

module.exports = {
    createAuthWindow
};