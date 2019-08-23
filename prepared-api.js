const request = require('request');
const keytar = require('keytar');
const os = require('os');

const keytarService = 'invictus-prepared-desktop';
const keytarAccount = os.userInfo().username;

let accessToken = null;

const environment = {
    local: {
        endpoint: "http://localhost:9292",
        client_id: "tmqd76Y4njQhfEf54FHAQvbKuDjd3gGRX_wdu5XYImw"
    },
    staging: {
        endpoint: "https://school-safety-staging.herokuapp.com",
        client_id: ""
    },
    production: {
        endpoint: "https://api.preparedapp.com",
        client_id: "cSnVtOg4LpbITUBmYpkv0dvtQ7HwIVYy_x4G6uOZL_Y"
    }
};

const envInfo = environment.production;

function login(idToken) {
    return new Promise((resolve, reject) => {
        const params = {
            client_id: envInfo.client_id,
            origin: 'desktop',
            grant_type: 'assertion',
            assertion: idToken,
            provider: 'google'
        };

        const requestOptions = {
            method: 'POST',
            url: envInfo.endpoint + '/oauth/token',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(params)
        };

        request(requestOptions, async (error, resp, body) => {
            if (error || body.error) {
                return reject(error || body.error);
            }

            const responseBody = JSON.parse(body);
            if (!('access_token' in responseBody) || !('refresh_token' in responseBody)) {
                return reject('Tokens are not present');
            }

            accessToken = responseBody.access_token;
            let refreshToken = responseBody.refresh_token;

            await keytar.setPassword(keytarService, keytarAccount, refreshToken);

            resolve();
        });
    });
}

function logout() {
    return new Promise(async (resolve, reject) => {
        if (accessToken == null) {
            return reject('No access token set');
        }

        const params = {
            client_id: envInfo.client_id,
            token: accessToken
        };

        const requestOptions = {
            method: 'POST',
            url: envInfo.endpoint + '/oauth/revoke',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(params)
        };

        request(requestOptions, async (error, resp, body) => {
            if (error || body.error) {
                return reject(error || body.error);
            }

            await keytar.deletePassword(keytarService, keytarAccount);
            accessToken = null;
        });
    });
}

function refreshTokens() {
    return new Promise(async (resolve, reject) => {
        const refreshToken = await keytar.getPassword(keytarService, keytarAccount);

        if (!refreshToken) return reject();

        const refreshOptions = {
            method: 'POST',
            url: envInfo.endpoint + '/oauth/token',
            headers: { 'content-type': 'application/json' },
            body: {
                grant_type: 'refresh_token',
                origin: 'desktop',
                client_id: envInfo.client_id,
                refresh_token: refreshToken
            },
            json: true
        };

        request(refreshOptions, async function (error, response, body) {
            if (error || body.error) {
                await logout();
                return reject(error || body.error);
            }

            const responseBody = JSON.parse(body);
            if (!('access_token' in responseBody) || !('refresh_token' in responseBody)) {
                await logout();
                return reject('Tokens are not present');
            }

            accessToken = responseBody.access_token;
            let refreshToken = responseBody.refresh_token;

            await keytar.setPassword(keytarService, keytarAccount, refreshToken);

            resolve();
        })
    });
}

module.exports = {
    login,
    logout
};