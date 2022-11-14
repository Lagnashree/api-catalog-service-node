const axios = require('axios');
const https = require('https');
const gcsAdapter = require("../repository/gcsRepository");
const pubsubRepository = require("../repository/pubsubRepository");
const { BaseError, notFound, internalServerError, serviceUnavailable, badRequest} = require('../utils/error')

let kongConfig = {
    headers: {
        'Kong-Admin-Token': 'apimrbac3fwe3434'
    }
}

exports.deleteApiInfo = async function (apiName, apiVersion, environment) {
    try {
        const instance = axios.create({
            httpsAgent: new https.Agent({
                rejectUnauthorized: false
            })
        });


        try {
            let gatewayDeleteResponse = await instance.delete(`https://ctf.admin.api.ingka.com/services/${apiName}`, kongConfig);
            if (gatewayCreateResponse.status == 20)
                console.log('gateway service deletion is successsful');
        }
        catch (error) {
            console.log(error)
            throw new BaseError(internalServerError, `unable to delete from kong gateway for API ${apiName}`)
        }

        try{
        await gcsAdapter.deleteFile(apiName, apiVersion, environment);
        }
        catch (error){
            console.log(error)
            throw new BaseError(internalServerError, `unable to delete from GCS bucket for API ${apiName}`)
        }
    
        const eventData = {
            apiTitle: apiName,
            apiVersion: apiVersion,
            environment: environment,
            event: 'delete'
        }

        try{
        await pubsubRepository.postEvent(eventData);
        }
        catch (error){
            console.log(error)
            throw new BaseError(internalServerError, `unable to publish deletion message in pubsub for API ${apiName}`)
        }

        return { status: 200, detail: 'The API has been successfully deleted ' }
}


catch (error) {
    console.log('error in delete service');
    throw error;
}
}
