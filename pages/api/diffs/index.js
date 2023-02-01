import { api } from "../../../utils/prismaClient2";
const Diff = require("diff");

const pageSize = 20;

export default async (req, res) => {
    console.log("Getting diff", req.query.oldScanId, req.query.newScanId, req.query.dataCollectionType, req.query.pageNumber);

    // TODO: Optimization: We're re-calculating the list of entitys every time. Since the data is immutable
    // we could calculate this once and store it in the database.
    const newScanNames = await api.getMappedEntityNamesForScanAndCollectionType(req.query.newScanId, req.query.dataCollectionType);
    const oldScanNames = await api.getMappedEntityNamesForScanAndCollectionType(req.query.oldScanId, req.query.dataCollectionType);

    const newScanNamesList = new Set(newScanNames.map(e => e.name));
    const oldScanNamesList = new Set(oldScanNames.map(e => e.name));

    const allNamesSet = new Set([...newScanNamesList, ...oldScanNamesList]);
    const allNamesList = Array.from(allNamesSet).sort();
    const totalSize = allNamesList.length;
    const currentPage = parseInt(req.query.pageNumber);
    const namesForPage = allNamesList.slice(pageSize * (currentPage - 1), currentPage * pageSize);

    const totalPages = Math.floor((totalSize - 1) / pageSize) + 1;

    const meta = {
        totalPages: totalPages,
        nextPage: (currentPage < totalPages) ? (currentPage + 1): null
    }

    // Get the raw results for the oldScan
    const oldEntities = await api.getMappedEntityNamesForScanAndCollectionTypeAndNames(req.query.oldScanId, req.query.dataCollectionType, namesForPage);
    const newEntities = await api.getMappedEntityNamesForScanAndCollectionTypeAndNames(req.query.newScanId, req.query.dataCollectionType, namesForPage);

    const entityList = [];

    // Determine which of the scans have the data for the list of names
    namesForPage
        .forEach(currentName => {
        const oldEntity = oldEntities.find(e => e.name === currentName);
        const newEntity = newEntities.find(e => e.name === currentName);
        entityList.push({
            name: currentName,
            oldEntity: oldEntity,
            newEntity: newEntity
        });
    });

    // Calculate the diff
    const response = [];

    entityList.forEach(e => {
        const newEntry = {
            name: e.name
        }
        if (e.oldEntity !== undefined && e.newEntity !== undefined) {
            // Use the hash to determine if the raw data is the same
            if (e.oldEntity.hash === e.newEntity.hash) {
                newEntry.changeType = "nodiff";
                newEntry.entity = e.oldEntity.rawData;
            } else {
                const diff = Diff.createPatch(e.name,
                    JSON.stringify(e.oldEntity.rawData, null, 3),
                    JSON.stringify(e.newEntity.rawData, null, 3));
                newEntry.changeType = "diff";
                newEntry.diff = diff;
                newEntry.newEntity = e.newEntity.rawData;
                newEntry.oldEntity = e.oldEntity.rawData;
            }

            // Alternatively, compute the diff every time
            
            // const diff = Diff.createPatch(e.name,
            //     JSON.stringify(e.oldEntity.rawData, null, 3),
            //     JSON.stringify(e.newEntity.rawData, null, 3));
            // if (diff.split(/\r\n|\r|\n/).length === 5) {
            //     newEntry.changeType = "nodiff";
            //     newEntry.entity = e.oldEntity.rawData;
            // } else {
            //     newEntry.changeType = "diff";
            //     newEntry.diff = diff;
            //     newEntry.newEntity = e.newEntity.rawData;
            //     newEntry.oldEntity = e.oldEntity.rawData;
            // }
        } else if (e.oldEntity !== undefined && e.newEntity === undefined) {
            newEntry.changeType = "deleted";
            newEntry.entity = e.oldEntity.rawData;
        } else if (e.oldEntity === undefined && e.newEntity !== undefined) {
            newEntry.changeType = "created";
            newEntry.entity = e.newEntity.rawData;
        } else {
            newEntry.changeType = "error";
        }

        response.push(newEntry);
    });

    return res.status(200).json({data: response, meta: meta});
}