import syncWithEp from "./eventPortal";
import mapper from "./mapper";

export default async (req, res) => {

    if (req.query.remap != null && req.query.remap) {
        await mapper.remapScans();
    } else {
        await syncWithEp();
        await mapper.processJobs();
    }

    return res.status(201).json({});
};
