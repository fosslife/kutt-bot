
const BASE_URL = 'https://kutt.it/api/url/'

const api = {
    postUrl: (apikey, target) => {
        return {
            method: 'POST',
            url: BASE_URL + 'submit',
            headers: {
                'x-api-key': apikey
            },
            data: {
                target,
            }
        }
    },
    getUrls: (apikey, count, page) => {
        return {
            method: 'GET',
            url: BASE_URL + 'geturls',
            headers: {
                'x-api-key': apikey
            },
            params: {
                count,
                page,
            }
        }
    }
}

module.exports = api
