const { googleClientId, redirectScheme } = require('../env-variables');
const request = require('request');
const crypto = require('crypto');

const redirectUri = redirectScheme + ":/oauth2redirect";

function base64URLEncode(str) {
    return str.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

function sha256(buffer) {
    return crypto.createHash('sha256').update(buffer).digest();
}

function getAuthenticationInfo() {
    const googleAuthorizationEndpoint = "https://accounts.google.com/o/oauth2/v2/auth";

    const state = base64URLEncode(crypto.randomBytes(32));

    const verifier = base64URLEncode(crypto.randomBytes(32));
    const challenge = base64URLEncode(sha256(verifier));
    const codeChallengeMethod = 'S256';

    const authUrl = googleAuthorizationEndpoint + '?' +
        'response_type=code&' +
        'scope=openid%20profile%20email&' +
        'client_id=' + googleClientId + '&' +
        'state=' + state + '&' +
        'code_challenge=' + challenge + '&' +
        'code_challenge_method=' + codeChallengeMethod + '&' +
        'redirect_uri=' + encodeURIComponent(redirectUri);

    return {
        'url': authUrl,
        'state': state,
        'verifier': verifier
    }
}

function getIdToken(state, verifier, qs) {
    return new Promise((resolve, reject) => {
        const googleTokenEndpoint = "https://www.googleapis.com/oauth2/v4/token";

        if (qs.state !== state) {
            return reject(`Received request with invalid state (${qs.state})`);
        }

        const exchangeOptions = {
            'grant_type': 'authorization_code',
            'client_id': googleClientId,
            'code_verifier': verifier,
            'code': qs.code,
            'redirect_uri': redirectUri
        };

        const requestOptions = {
            method: 'POST',
            url: googleTokenEndpoint,
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(exchangeOptions)
        };

        request(requestOptions, async (error, resp, body) => {
            if (error || body.error) {
                return reject(error || body.error);
            }

            const responseBody = JSON.parse(body);

            if ('error' in responseBody) {
                if ('error_description' in responseBody) {
                    return reject(`[${responseBody.error}]: ${responseBody.error_description}`);
                }

                return reject(responseBody.error);
            }

            if (!('id_token' in responseBody)) {
                return reject('Missing id token');
            }

            resolve(responseBody.id_token);
        })
    })
}

module.exports = {
    getAuthenticationInfo,
    getIdToken
};