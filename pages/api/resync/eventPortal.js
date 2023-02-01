import { api } from "../../../utils/prismaClient2";
import uuid from "short-uuid";
import chalk from "chalk";

const epUrl = process.env.SOLACE_URL || "https://api.solace.cloud";
const GET_MESSAGING_SERVICES_URL = "/api/v2/architecture/messagingServices";
const GET_ENVIRONMENTS_URL = "/api/v2/architecture/environments";
const GET_EVENT_MESHES_URL = "/api/v2/architecture/eventMeshes";
const GET_SCANS_URL = "/api/v2/architecture/messagingServiceScans";

const pageSize = 100;

const syncWithEp = async () => {
    console.log("Syncing with EP");
    await getAllEnvironments();
    await getAllEventMeshes();
    await getAllMessagingServices();
    await getAllMessagingServiceScans();
    console.log(chalk.blue("Sync with Event Portal Complete"));
}

const getAllEnvironments = async () => {
    var nextPage = 1;
    do {
        const environments = await getEnvironments(nextPage);
        for (var env in environments.data) {
            const envId = environments.data[env].id;
            console.log(`Found environment ${envId}`);
            const environment = await api.getEnvironment(envId);
            if (environment == null) {
                await api.saveEnvironment({
                    id: environments.data[env].id,
                    name: environments.data[env].name
                });
            }
        }
        if (environments.hasOwnProperty('meta') && environments.meta.hasOwnProperty('pagination')) {
            nextPage = environments.meta.pagination.nextPage;
        } else {
            throw `Encountered error trying to get environments from Event Portal: ${JSON.stringify(environments, null, 3)}`;
        }

    } while (nextPage != null)
}

const getAllEventMeshes = async () => {
    var nextPage = 1;
    do {
        const eventMeshes = await getEventMeshes(nextPage);
        for (var mem in eventMeshes.data) {
            //console.log("Event mesh", JSON.stringify(eventMeshes.data[mem]));
            const memId = eventMeshes.data[mem].id;
            if (await api.getMEM(memId) == null) {
                await api.saveMEM({
                    id: memId,
                    name: eventMeshes.data[mem].name,
                    envId: eventMeshes.data[mem].environmentId
                });  
            }
            console.log("Mem Id", memId);
        }
        nextPage = eventMeshes.meta.pagination.nextPage;

    } while (nextPage != null)
}

const getAllMessagingServices = async () => {
    var nextPage = 1;
    do {
        const messagingServices = await getMessagingServices(nextPage);

        for (var ms in messagingServices.data) {
            const msId = messagingServices.data[ms].id;
            if (await api.getMS(msId) == null) {
                await api.saveMS({
                    id: msId,
                    name: messagingServices.data[ms].name,
                    memId: messagingServices.data[ms].eventMeshId
                });  
            }
            console.log("Messaging Service Id", msId);
        }
        nextPage = messagingServices.meta.pagination.nextPage;

    } while (nextPage != null)
}

const getAllMessagingServiceScans = async () => {
    var nextPage = 1;
    do {
        const scans = await getScans(nextPage);

        for (var scan in scans.data) {
            const scanId = scans.data[scan].id;
            if (await api.getScan(scanId) == null) {
                await api.saveScan({
                    id: scanId,
                    name: scans.data[scan].name,
                    createdTime: scans.data[scan].createdTime,
                    status: scans.data[scan].status,
                    statusDescription: scans.data[scan].statusDescription,
                    msId: scans.data[scan].messagingServiceId
                });

                // create a job to run the mapper on this scan
                await api.saveJob({
                    id: uuid.generate(),
                    type: 'mapScan',
                    relatedId: scanId
                });

                await processScans(scanId);

            }
            console.log("Scan Id", scanId);
        }
        nextPage = scans.meta.pagination.nextPage;

    } while (nextPage != null)
}

const processScans = async (scanId) => {
    var nextPage = 1;
    do {
        const collection = await getScanData(nextPage, scanId);

        for (var datum in collection.data) {
            const collectionId = collection.data[datum].id;
            if (await api.getEntity(collectionId) == null) {
                await api.saveEntity({
                    id: collectionId,
                    name: collection.data[datum].name,
                    data: collection.data[datum].data,
                    type: collection.data[datum].type,
                    dataCollectionType: collection.data[datum].dataCollectionType,
                    scanId: scanId
                });  
            }

            console.log("Collection Id", collectionId);
        }
        nextPage = collection.meta.pagination.nextPage;

    } while (nextPage != null)

}

const getEnvironments = async (page = 1) => {
    console.log("Getting environments");
    return await getURL(GET_ENVIRONMENTS_URL, page);
}

const getEventMeshes = async (page = 1) => {
    return await getURL(GET_EVENT_MESHES_URL, page);
}

const getMessagingServices = async (page = 1) => {
    return await getURL(GET_MESSAGING_SERVICES_URL, page);
}

const getScans = async (page = 1) => {
    return await getURL(GET_SCANS_URL, page);
}

const getScanData = async (page = 1, scanId) => {
    const GET_SCANS_DATA_URL = `/api/v2/architecture/messagingServiceScans/${scanId}/dataCollection`;
    return await getURL(GET_SCANS_DATA_URL, page);
}



const getURL = async (url, page, urlParams) => {
    const params = urlParams || {};
    params.pageSize = pageSize;
    params.pageNumber = page;
    const response = await fetch(epUrl + url + "?" + new URLSearchParams(params),
        {
            method: 'GET',
            headers: {
               // "Accept": "application/json;charset=UTF-8",
                "Accept": "*/*",
                "authorization": `Bearer ${process.env.SOLACE_CLOUD_TOKEN}`
            }
        } 
    );
    return await response.json();
}

export default syncWithEp;