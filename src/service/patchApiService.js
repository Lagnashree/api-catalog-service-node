const axios = require('axios');
const https = require('https');
const patchAdapter = require("../repository/patchRepository");
const { BaseError, notFound, internalServerError, serviceUnavailable, badRequest} = require('../utils/error')

exports.patchApiInfo = async function (apiName, apiVersion, environment, reqBody) {
    try {
        const instance = axios.patch({
            httpsAgent: new https.Agent({
                rejectUnauthorized: false
            })
        });

        let apiId = apiName + "_" + apiVersion + "_" + environment;

        await patchAdapter.patchApiState(req.params.apiName, req.params.apiVersion, req.params.environment, reqBody.apiState);

    }

    catch (error) {
        console.log('error in delete service');
        throw error;
    }
}
