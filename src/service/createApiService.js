  const gitFileDownloader = require("../utils/gitFileDownloader");
const axios = require('axios');
const https = require('https');
const gcsAdapter = require("../repository/gcsRepository");
const pubsubRepository = require("../repository/pubsubRepository");

let adminUrl = ''
let kongConfig = {
    headers: {
        'Kong-Admin-Token': 'apimrbac3fwe3434',
        'Content-Type': 'application/json'
    }
}
let gitConfig = {
    headers: {
        'Authorization': 'token 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',
        'Accept': 'application/vnd.github.v3.raw'
    }
}


exports.postApiInvoker = async function (reqBody) {
    try {
        const instance = axios.create({
            httpsAgent: new https.Agent({
                rejectUnauthorized: false
            })
        });

        let gatewayCreateServiceReqBody = {
            name: reqBody.apiName,
            protocol: 'http',
            host: 'localhost.com',
            port: 80
        }

        let specFileFromGit = '';

        try {
            let downloadFileFromGit = await instance.get(reqBody.specUrl, gitConfig);
            if (downloadFileFromGit.status == 200)
                specFileFromGit = downloadFileFromGit.data;
            console.log('downloading spec file from GIT is successsful');
        }
        catch (error) {
            console.log(error)
        }

        try {
            let gatewayCreateResponse = await instance.post(`https://ctf.admin.api.ingka.com/services/`, gatewayCreateServiceReqBody, kongConfig);
            if (gatewayCreateResponse.status == 201)
                console.log('await gateway service creation is successsful');
        }
        catch (error) {
            console.log(error)
        }

        await gcsAdapter.postFile(reqBody.apiName, reqBody.apiVersion, reqBody.environment, specFileFromGit);

        const eventData = {
            apiTitle: reqBody.apiName,
            apiVersion: reqBody.apiVersion,
            environment: reqBody.environment,
            catalog: reqBody.catalogName,
            event: 'create'
        }
        await pubsubRepository.postEvent(eventData);
        return { status: 201, detail: 'success' }
    }
    catch (error) {
        console.log('error');
        throw error;
    }
}    
