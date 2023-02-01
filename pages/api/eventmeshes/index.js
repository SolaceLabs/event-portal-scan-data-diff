import { api } from "../../../utils/prismaClient2";

export default async (req, res) => {
    //console.log("Get event meshses", req.query.envId);
    const eventmeshes = await api.getMEMs(req.query.envId);
    //console.log("Got eventmeshes", eventmeshes);
    return res.status(200).json(eventmeshes);
  };