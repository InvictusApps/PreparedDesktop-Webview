const { remote } = require('electron');
const preparedApi = remote.require('./services/prepared-api-service');

const webContents = remote.getCurrentWebContents();

webContents.on('dom-ready', () => {
    // Document ready setup
    preparedApi.getUserInfo().then((user) => {
        document.getElementById('content-name').innerText = user.name;
    });
});