const gitFileDownloader = require("../utils/gitFileDownloader");
const axios = require('axios');
const https = require('https');
const gcsAdapter = require("../repository/gcsRepository");
const pubsubRepository = require("../repository/pubsubRepository");
const yaml = require('js-yaml');
const { BaseError, notFound, internalServerError, serviceUnavailable, badRequest} = require('../utils/error')

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
                const obj = yaml.load(specFileFromGit);
            console.log('downloading spec file from GIT is successsful', obj);
        }
        catch (error) {
            console.log(error)
            throw new BaseError(internalServerError, `unable to download spec file for API ${apiName}`)
        }

        
    
        try {
            let gatewayCreateResponse = await instance.post(`https://ctf.admin.api.ingka.com/services/`, gatewayCreateServiceReqBody, kongConfig);
            if (gatewayCreateResponse.status == 201)
                console.log('await gateway service creation is successsful');
        }
        catch (error) {
            console.log(error)
            throw new BaseError(internalServerError, `unable to create service in kong gateway for API ${apiName}`)
        }


        try{
        await gcsAdapter.postFile(reqBody.apiName, reqBody.apiVersion, reqBody.environment, specFileFromGit);
        }
        catch (error){
            console.log(error)
            throw new BaseError(internalServerError, `unable to store spec file in GCS for API ${apiName}`)
        }
        
        
        const eventData = {
            apiTitle: reqBody.apiName,
            apiVersion: reqBody.apiVersion,
            environment: reqBody.environment,
            catalog: reqBody.catalogName,
            event: 'create'
        }
        try{
        await pubsubRepository.postEvent(eventData);
        }
        catch (error){
            console.log(error)
            throw new BaseError(internalServerError, `unable to publish creation message in pubsub for API ${apiName}`)
        }
        return { status: 201, detail: 'success' }
    }



    catch (error) {
        console.log('error in create service');
        throw error;
    }
}    
