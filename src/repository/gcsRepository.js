const path = require("path");
const { Storage } = require("@google-cloud/storage");



exports.postFile = async function (apiName, apiVersion, environment, fileContent) {
    let serviceKey = "";
    const projectId = 'testpoc-361819';
    let bucketName = "api_catalog_bucket";
    serviceKey = path.join(__dirname, "..", "/service-account.json");
    const storage = new Storage({ projectId: projectId, keyFilename: serviceKey });
    let fileName = apiName + "_" + apiVersion + "_" + environment + ".yml";
    await storage
        .bucket(bucketName)
        .file(fileName)
        .save(fileContent)
    console.log("file successfully uploaded to gcs bucket");
}



