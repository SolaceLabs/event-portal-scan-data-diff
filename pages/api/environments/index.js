import { api } from "../../../utils/prismaClient2";

export default async (req, res) => {
    const envs = await api.getEnvironments();
    //console.log("Got environments", envs);
    return res.status(200).json(envs);
  };
  