const { remote } = require('electron');
const preparedApi = remote.require('./services/prepared-api-service');

const userInfo = preparedApi.getUserInfo();

window.addEventListener('DOMContentLoaded', () => {
    // Document ready setup
    userInfo.then((user) => {
        document.getElementById('content-name').innerText = user.name;
    });
});