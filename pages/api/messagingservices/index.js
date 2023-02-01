import { api } from "../../../utils/prismaClient2";

export default async (req, res) => {
    //console.log("Getting messaging services for memId", req.query.memId);
    const messagingServices = await api.getMSs(req.query.memId);
    //console.log("Got messaging services", messagingServices);
    return res.status(200).json(messagingServices);
  };