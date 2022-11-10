const path = require("path");
const { PubSub } = require("@google-cloud/pubsub");
const topicName = 'api-catalog-topic';

exports.postEvent = async function (eventData) {
    const projectId = 'testpoc-361819';
    let serviceKey = "";

    //if (process.env.ENVIRONMENT === "LOCAL") {
    serviceKey = path.join(__dirname, "..", "/service-account.json"
    );
    //}


    let pubsub = new PubSub({ projectId: projectId, keyFilename: serviceKey });

    try {
        const data = JSON.stringify(eventData);
        const dataBuffer = Buffer.from(data);
        await pubsub
            .topic(topicName)
            .publish(dataBuffer);
    } catch (err) {
        console.log(err)
    }
};
