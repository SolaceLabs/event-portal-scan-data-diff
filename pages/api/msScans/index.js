import { api } from "../../../utils/prismaClient2";

export default async (req, res) => {
    console.log("Getting scan for scanId", req.query.scanId);

    if (req.query.scanId !== undefined) {
        console.log("Getting scanId");
        return res.status(200).json(await api.getScan(req.query.scanId));
    }

    console.log("Getting messaging services for memId", req.query.msId);
    const scans = await api.getScans(req.query.msId, parseInt(req.query.pageNumber), 10);

    console.log("Got scans", scans);
    // Get counts
    for (var scanIdx in scans.data) {
        if (scans.data[scanIdx] !== null && scans.data[scanIdx].status !== null && scans.data[scanIdx].status === 'COMPLETE') {
            const scanId = scans.data[scanIdx].id;
            scans.data[scanIdx].count = await api.getMappedEntityCountForScanId(scanId);
        } else {
            scans.data[scanIdx].count = "";
        }
        
    }
    
    //console.log("Got scans", scans);
    return res.status(200).json(scans);
};