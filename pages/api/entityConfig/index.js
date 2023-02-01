import { api } from "../../../utils/prismaClient2";

const pageSize = 20;

export default async (req, res) => {
    console.log("Getting config entities", req.query.scanId);

    if (req.query.typesOnly != null && req.query.typesOnly) {
        const types = await api.getMappedEntityDataTypesForScan(req.query.scanId)
        //console.log("Got types", types);
        return res.status(200).json(types);
    }

    if (req.query.dataCollectionType !== undefined) {
        const entities = await api.getMappedEntitiesByDataCollectionType(req.query.scanId, req.query.dataCollectionType, parseInt(req.query.pageNumber), pageSize);
        //console.log("Got config entities", entities);
        return res.status(200).json(entities);

    } else {
        const entities = await api.getMappedEntities(req.query.scanId, parseInt(req.query.pageNumber), pageSize);
        //console.log("Got config entities", entities);
        return res.status(200).json(entities);
    }
};