import { api } from "../../../utils/prismaClient2";
import uuid from "short-uuid";
import chalk from "chalk";
const crypto = require('crypto'); 

const remapScans = async () => {
    const allScans = await api.getAllScans();

    for (var scanIdx in allScans) {
        const scanId = allScans[scanIdx].id
        console.log("Reprocessing scan", scanId);
        await api.deleteAllMappedEntitiesInScan(scanId);
        await api.saveJob({
            id: uuid.generate(),
            type: 'mapScan',
            relatedId: scanId
        });
    }
    await processJobs();
}

const processJobs = async () => {
    const jobs = await api.getJobs();

    for (var job in jobs) {
        switch(jobs[job].type) {
            case 'mapScan': {
                await mapJob(jobs[job]);
                break;
            }
            default: {
                console.error ("Unknown job type", jobs[job].type);
            }
        }
        await api.deleteJob(jobs[job].id);
    }
    console.log(chalk.blue("Mapping completed"));
}

const mapJob = async (job) => {
    console.log("Running map job for scan", job.relatedId);
    await mapQueues(job.relatedId);
    await mapKafkaCusters(job.relatedId);
    await mapKafkaTopics(job.relatedId);
    await mapKafkaConsumerGroups(job.relatedId);
}

function compare( a, b ) {
    if ( a.name < b.name ){
      return -1;
    }
    if ( a.name > b.name ){
      return 1;
    }
    return 0;
  }
  
const mapKafkaCusters = async (scanId) => {
    const brokerList = await api.getEntityByType(scanId, 'brokerConfiguration');
    for (var brokerIndex in brokerList) {
        const brokerConfig = brokerList[brokerIndex].rawData;

        // Map the configurations into a more concise form
        const mappedConfig = {};
        brokerConfig.configurations
            .sort(compare)
            .forEach(config => mappedConfig[config.name] = config.value);
        const name = brokerConfig.name;
        const entityToSave = {
            id: brokerList[brokerIndex].id,
            name: name,
            rawData: mappedConfig,
            hash: crypto.createHash('sha256').update(JSON.stringify(brokerConfig)).digest('hex'),
            type: brokerList[brokerIndex].type,
            dataCollectionType: brokerList[brokerIndex].dataCollectionType,
            scanId: brokerList[brokerIndex].scanId
        }
        await api.saveMappedEntity(entityToSave);
    }
}

const mapQueues = async (scanId) => {
    const queueConfigList = await api.getEntityByType(scanId, 'queueConfiguration');
    for (var queueIndex in queueConfigList) {
        const queueConfig = queueConfigList[queueIndex].rawData;
        const queueName = queueConfig.queueName;
        const subscriptions = await api.getEntityByTypeAndJson(scanId, 'subscriptionConfiguration', 'queueName', queueName);
        const mappedEntity = JSON.parse(JSON.stringify(queueConfig));
        mappedEntity.subscriptions = subscriptions.map(sub => sub.rawData.subscriptionTopic).sort();

        const entityToSave = {
            id: queueConfigList[queueIndex].id,
            name: queueName,
            rawData: mappedEntity,
            hash: crypto.createHash('sha256').update(JSON.stringify(mappedEntity)).digest('hex'),
            type: queueConfigList[queueIndex].type,
            dataCollectionType: queueConfigList[queueIndex].dataCollectionType,
            scanId: queueConfigList[queueIndex].scanId
        }
        await api.saveMappedEntity(entityToSave)
    }
}

const mapKafkaTopics = async (scanId) => {
    const topicConfigList = await api.getEntityByType(scanId, 'topicConfiguration');
    for (var topicIndex in topicConfigList) {
        const topicConfiguration = topicConfigList[topicIndex].rawData;
        const topicName = topicConfiguration.name;
        if (!topicName.startsWith('_confluent')) {
            const topicOverride = await api.getEntityByTypeAndJson(scanId, 'overrideTopicConfiguration', 'topicName', topicName);
            if (topicOverride != null && Array.isArray(topicOverride) && topicOverride.length == 1) {
                const overrideConfig = topicOverride[0].rawData.configurations;
                overrideConfig.forEach((item) => {topicConfiguration[item.name] = getOverrideValue(item)});
            }

            const entityToSave = {
                id: topicConfigList[topicIndex].id,
                name: topicName,
                rawData: topicConfiguration,
                hash: crypto.createHash('sha256').update(JSON.stringify(topicConfiguration)).digest('hex'),
                type: topicConfigList[topicIndex].type,
                dataCollectionType: topicConfigList[topicIndex].dataCollectionType,
                scanId: topicConfigList[topicIndex].scanId
            }
            await api.saveMappedEntity(entityToSave)
        }
    }
}

const mapKafkaConsumerGroups = async (scanId) => {
    const consumerGroupList = await api.getEntityByType(scanId, 'consumerGroupConfiguration');
    for (var cgIndex in consumerGroupList) {
        const cgConfiguration = consumerGroupList[cgIndex].rawData;
        const groupId = cgConfiguration.kafkaConsumerGroupEvent.groupId;
        const derivedSubscriptions = [];
        cgConfiguration.members.forEach(mem => { mem.partitions.forEach(part => {derivedSubscriptions.push(part.topic)})});
        cgConfiguration.subscriptions = [...new Set(derivedSubscriptions.sort())];
        const entityToSave = {
            id: consumerGroupList[cgIndex].id,
            name: groupId,
            rawData: cgConfiguration,
            hash: crypto.createHash('sha256').update(JSON.stringify(cgConfiguration)).digest('hex'),
            type: consumerGroupList[cgIndex].type,
            dataCollectionType: consumerGroupList[cgIndex].dataCollectionType,
            scanId: consumerGroupList[cgIndex].scanId
        }
        await api.saveMappedEntity(entityToSave);
    }
}

const getOverrideValue = (override) => {
    switch (override.type) {
        case 'INT':
        case 'LONG': {
            return parseInt(override.value)
        }
        case 'FLOAT':
        case 'DOUBLE': {
            return parseFloat(override.value)
        }

        case 'BOOLEAN': {
            return override.value === 'true';
        }
        case 'STRING':
        default: {
            return override.value;
        }
    }
}

const mapper = {
    processJobs: processJobs,
    remapScans: remapScans
}
export default mapper;