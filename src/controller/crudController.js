const express = require('express');
const router = express.Router();
const postApi = require('../service/createApiService');
const StatusCodes = require('http-status-codes');
const { BaseError, notFound, internalServerError, serviceUnavailable, badRequest} = require('../utils/error')

router.post('/', async (req, res) => {
    console.log("post");
    let responsePayload = {};
    let statusCode = 500;
    let reasonPhrase;
    try {
        console.log('req body', req.body);
        if (typeof req.body.apiVersion == 'undefined' || req.body.apiVersion == '' || typeof req.body.environment == 'undefined' || req.body.environment == '' || typeof req.body.apiName == 'undefined' || req.body.apiName == '' || typeof req.body.catalogName == 'undefined' || req.body.catalogName == '' || typeof req.body.apiSecurity == 'undefined' || req.body.apiSecurity == '' || typeof req.body.specUrl == 'undefined' || req.body.specUrl == '') {
            //statusCode = StatusCodes.BAD_REQUEST;
            throw new BaseError(badRequest, "apiVersion, environment, apiName, catalogName, apiSecurity and specUrl are a manadatory field");
        }
        else if (req.body.environment && !['dev', 'stage', 'prod'].includes(req.body.environment.toLowerCase())) {
            reasonPhrase = 'BAD_REQUEST';
            statusCode = 400;
            //statusCode = StatusCodes.BAD_REQUEST;
            throw new BaseError(badRequest,"Invalid environment field. Value should be one of dev, stage, prod");
        }
        if (req.body.apiSecurity && !['apiKey', 'bearer'].includes(req.body.apiSecurity.toLowerCase())) {
            reasonPhrase = 'BAD_REQUEST';
            statusCode = 400;
            //statusCode = StatusCodes.BAD_REQUEST;
            throw new BaseError(badRequest,"Invalid apiSecurity value. Value should be apiKey or bearer");
        }
        const postAPIResult = await postApi.postApiInvoker(req.body);
        console.log(postAPIResult);
        if (postAPIResult.status === 201) {
            statusCode = postAPIResult.status;
            responsePayload = postAPIResult.detail;
        }

    }
    catch (error) {
        console.log(error);
        responsePayload = {
            "title": reasonPhrase,
            "detail": error.message,
            "instance": '/api/v1/catalog-service',
            "operation": 'POST'
        }
    }
    res.status(statusCode).send(responsePayload);
})



router.get('/', async (req, res) => {
    console.log("get");
    let responsePayload = {};
    let statusCode = 404;
    let reasonPhrase;
    let page = req.query.page;
    let limit = req.query.limit;

    let apiInfo = await getApiService.getApiInfo(page, limit);
    if (apiInfo.status === 200) {
        console.log('apiInfo', apiInfo.detail);
        statusCode = apiInfo.status;
        responsePayload = apiInfo.detail;
    }
    else {
        statusCode = apiInfo.status;
        responsePayload = {
            "type": apiInfo.detail.errorType,
            "title": apiInfo.detail.reasonPhrase,
            "status": statusCode,
            "detail": apiInfo.detail.statusMessage,
            "operation": 'get'
        }
    }
    statusCode = StatusCodes.OK;
    res.status(statusCode).send(responsePayload);

})



router.delete('/:apiName/:apiVersion/:environment', async (req, res) => {
    let statusCode = 404;
    let reasonPhrase = 'BAD_REQUEST';
    try {
        if (typeof req.params.apiName == 'undefined' || req.params.apiName == '' || typeof req.params.apiVersion == 'undefined' || req.params.apiVersion == '' || typeof req.params.environment == 'undefined' || req.params.environment == '') {
            statusCode = StatusCodes.BAD_REQUEST;
            reasonPhrase = 'BAD_REQUEST';
            throw new BaseError(badRequest,"apiName, apiVersionn and environment are manadatory field");
        }
        else if (req.params.environment && !['prod', 'ppe', 'cte-f'].includes(req.params.environment.toLowerCase())) {
            statusCode = StatusCodes.BAD_REQUEST;
            reasonPhrase = 'BAD_REQUEST';
            throw new BaseError(badRequest,"Invalid environment field. Value should be one of cte-f, ppe, prod");
        }
        let deleteInfo = await deleteApiService.deleteApiInfo(req.params.apiName, req.params.apiVersion, req.params.environment.toUpperCase());
        if (subscriptionInfo.status === 200) {
            console.log('deleteInfo', deleteInfo.detail);
            statusCode = deleteInfo.status;
        }
        statusCode = StatusCodes.OK;
    }
    catch (error) {
        responsePayload = {
            "type": errorType,
            "title": reasonPhrase,
            "status": statusCode,
            "operation": 'delete'
        }
    }
    res.status(statusCode).send(responsePayload);
})


router.patch('/:apiName/:apiVersion/:environment', async (req, res) => {
    let statusCode = 404;
    let reasonPhrase = 'BAD_REQUEST';
    try {
        if (typeof req.params.apiName == 'undefined' || req.params.apiName == '' || typeof req.params.apiVersion == 'undefined' || req.params.apiVersion == '' || typeof req.params.environment == 'undefined' || req.params.environment == '') {
            statusCode = StatusCodes.BAD_REQUEST;
            reasonPhrase = 'BAD_REQUEST';
            throw new BaseError(badRequest,"apiName, apiVersionn and environment are manadatory field");
        }
        else if (req.params.environment && !['prod', 'ppe', 'cte-f'].includes(req.params.environment.toLowerCase())) {
            statusCode = StatusCodes.BAD_REQUEST;
            reasonPhrase = 'BAD_REQUEST';
            throw new BaseError(badRequest,"Invalid environment field. Value should be one of cte-f, ppe, prod");
        }
        let patchInfo = await patchApiService.patchApiInfo(req.params.apiName, req.params.apiVersion, req.params.environment.toUpperCase(), req.body);
        if (subscriptionInfo.status === 200) {
            console.log('patchInfo', patchInfo.detail);
            statusCode = patchInfo.status;
        }
        statusCode = StatusCodes.OK;
    }
    catch (error) {
        responsePayload = {
            "type": errorType,
            "title": reasonPhrase,
            "status": statusCode,
            "operation": 'patch'
        }
    }
    res.status(statusCode).send(responsePayload);
})


module.exports = router;
