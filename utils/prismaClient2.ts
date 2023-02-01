import { Prisma } from "@prisma/client";
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const pageSize = 100;

const init = async () => {
  console.log("Init code");
};

const saveEnvironment = async (body) => {
  console.log("Saving env:", body.id);
  await prisma.Environment.create({
    data: {
      id: body.id,
      name: body.name,
    },
  });
};

const getEnvironments = async (envId) => {
    const env = await prisma.Environment.findMany();
    //console.log("Env");
    return env;
}

const getEnvironment = async (envId) => {
    const env = await prisma.Environment.findUnique({
        where: {
            id: envId,
        },
    });
    //console.log("Env");
    return env;
}

const saveMEM = async (body) => {
    console.log("Saving MEM:", body.id);
    await prisma.MEM.create({
      data: {
        id: body.id,
        name: body.name,
        envId: body.envId
      },
    });
  };
  
const getMEM = async (memId) => {
const mem = await prisma.MEM.findUnique({
    where: {
        id: memId,
    }
});
//console.log("Env");
return mem;
}

const getMEMs = async (envId) => {
    const env = await prisma.MEM.findMany({
        where: {
            envId: envId,
        }
    });
    return env;
}

const saveMS = async (body) => {
    console.log("Saving MS:", body.id);
    await prisma.MessagingService.create({
        data: {
        id: body.id,
        name: body.name,
        memId: body.memId
        },
    });
};
  
const getMS = async (msId) => {
    const mem = await prisma.MessagingService.findUnique({
        where: {
            id: msId,
        }
    });
    //console.log("Env");
    return mem;
}

const getMSs = async (memId) => {
    const messagingServices = await prisma.MessagingService.findMany({
        where: {
            memId: memId,
        }
    });
    //console.log("Env");
    return messagingServices;
}

const saveScan = async (body) => {
    console.log("Saving Scan:", body.id);
    await prisma.MsScan.create({
        data: {
            id: body.id,
            name: body.name,
            createdTime: new Date(body.createdTime),
            status: body.status,
            statusDescription: body.statusDescription,
            msId: body.msId
        },
    });
};
  
const getAllScans = async () => {
    return await prisma.MsScan.findMany({});
}

const getScan = async (scanId) => {
    const scan = await prisma.MsScan.findUnique({
        where: {
            id: scanId,
        }
    });
    return scan;
}

const getScans = async (msId, pageNumber, pageSize) => {

    const scanCount = await getScanCountForMsId(msId);
    const totalPages = Math.floor((scanCount - 1) / pageSize) + 1;
    const meta = {
        totalPages: totalPages,
        nextPage: (pageNumber < totalPages) ? (pageNumber + 1): null
    }

    console.log("Scan count", scanCount);

    const scans = await prisma.MsScan.findMany({
        where: {
            msId: msId,
        },
        orderBy: {
            createdTime: 'desc'
        },
        take: pageSize,
        skip: (pageNumber - 1) * pageSize
    });

    return {
        data: scans,
        meta: meta
    };
}


const getScanCountForMsId = async (msId) => {

    const scansWithCount = await prisma.MsScan.count({
        where: {
            msId: msId,
        }
    });

    return scansWithCount;
}
  
const saveJob = async (body) => {
    console.log("Saving Job:", body.id);
    await prisma.Jobs.create({
        data: {
            id: body.id,
            type: body.type,
            relatedId: body.relatedId
        },
    });
};

const deleteJob = async (idToDelete) => {
    console.log("Deleting Job:", idToDelete);
    await prisma.Jobs.delete({
        where: {
            id: idToDelete
        }
    });

}

const getJob = async (jobId) => {
    const mem = await prisma.Jobs.findUnique({
        where: {
            id: jobId,
        }
    });
    //console.log("Env");
    return mem;
}

const getJobs = async (jobId) => {
    return await prisma.Jobs.findMany({});
}

const saveEntity = async (body) => {
    console.log("Saving Entity:", body.id);
    await prisma.Entity.create({
        data: {
            id: body.id,
            name: body.name,
            rawData: JSON.parse(body.data) as Prisma.JsonObject,
            type: body.type,
            dataCollectionType: body.dataCollectionType,
            scanId: body.scanId
        },
    });
};
  
const getEntity = async (entityId) => {
    const entity = await prisma.Entity.findUnique({
        where: {
            id: entityId,
        }
    });
    return entity;
}

const getEntityByType = async (scanId, collectionType) => {
    const entityList = await prisma.Entity.findMany({
        where: {
            dataCollectionType: collectionType,
            scanId: scanId
        }
    });
    return entityList;
}

const getEntityByTypeAndJson = async (scanId, collectionType, jsonKey, jsonValue) => {
    const entityList = await prisma.Entity.findMany({
        where: {
            dataCollectionType: collectionType,
            scanId: scanId,
            rawData: {
                path: `$.${jsonKey}`,
                equals: jsonValue,
            }
        }
    });
    //console.log("Env");
    return entityList;
}

const saveMappedEntity = async (body) => {
    console.log("Saving Mapped Entity:", body.id);
    await prisma.MappedEntity.upsert({
        where: {
            id: body.id,
          },
          update: {
          },
          create: {
            id: body.id,
            name: body.name,
            rawData: body.rawData as Prisma.JsonObject,
            hash: body.hash,
            type: body.type,
            dataCollectionType: body.dataCollectionType,
            scanId: body.scanId
          },        
    })
};

const deleteAllMappedEntitiesInScan = async (scanId) => {
    await prisma.MappedEntity.deleteMany({
        where: {
            scanId: scanId
        }
    });
}

const getMappedEntityDataTypesForScan = async (scanId) => {
    const result = await prisma.MappedEntity.findMany({
        where: {
            scanId: scanId,
        },
        distinct: ['dataCollectionType'],
      });
      const uniqueTypes = result.map(ent => ent.dataCollectionType);
      return uniqueTypes;
}

const getMappedEntitiesByDataCollectionType = async (scanId, dataCollectionType, pageNumber, pageSize) => {

    const scanCount = await getMappedEntityCountForScanIdAndDataCollectionType(scanId, dataCollectionType);
    const totalPages = Math.floor((scanCount - 1) / pageSize) + 1;
    const meta = {
        totalPages: totalPages,
        nextPage: (pageNumber < totalPages) ? (pageNumber + 1): null
    }

    console.log("Scan count", scanCount);

    const scans = await prisma.MappedEntity.findMany({
        where: {
            scanId: scanId,
            dataCollectionType: dataCollectionType
        },
        orderBy: [
            {
                dataCollectionType: 'asc'
            },
            {
                name: 'asc'
            }
        ],
        take: pageSize,
        skip: (pageNumber - 1) * pageSize
    });

    return {
        data: scans,
        meta: meta
    };
}

const getMappedEntities = async (scanId, pageNumber, pageSize) => {

    const scanCount = await getMappedEntityCountForScanId(scanId);
    const totalPages = Math.floor((scanCount - 1) / pageSize) + 1;
    const meta = {
        totalPages: totalPages,
        nextPage: (pageNumber < totalPages) ? (pageNumber + 1): null
    }

    console.log("Scan count", scanCount);

    const scans = await prisma.MappedEntity.findMany({
        where: {
            scanId: scanId,
        },
        orderBy: [
            {
                dataCollectionType: 'asc'
            },
            {
                name: 'asc'
            }
        ],
        take: pageSize,
        skip: (pageNumber - 1) * pageSize
    });

    return {
        data: scans,
        meta: meta
    };
}

const getMappedEntityCountForScanId = async (scanId) => {

    const scansWithCount = await prisma.MappedEntity.count({
        where: {
            scanId: scanId,
        }
    });

    return scansWithCount;
}

const getMappedEntityCountForScanIdAndDataCollectionType = async (scanId, dataCollectionType) => {

    const scansWithCount = await prisma.MappedEntity.count({
        where: {
            scanId: scanId,
            dataCollectionType: dataCollectionType
        }
    });

    return scansWithCount;
}

const getMappedEntityNamesForScanAndCollectionTypeAndNames = async (scanId, dataCollectionType, namesList) => {

    const entityResults = await prisma.MappedEntity.findMany({
        where: {
            scanId: scanId,
            dataCollectionType: dataCollectionType,
            name: {
                in: namesList
            }
        }
    });

    return entityResults;
}

const getMappedEntityNamesForScanAndCollectionType = async (scanId, dataCollectionType) => {

    const scansWithCount = await prisma.MappedEntity.findMany({
        select: {
            name: true
        },
        where: {
            scanId: scanId,
            dataCollectionType: dataCollectionType
        }
    });

    return scansWithCount;
}

const api = {
    saveEnvironment: saveEnvironment,
    getEnvironment: getEnvironment,
    getEnvironments: getEnvironments,
    saveMEM: saveMEM,
    getMEM: getMEM,
    getMEMs: getMEMs,
    saveMS: saveMS,
    getMS: getMS,
    getMSs: getMSs,
    saveScan: saveScan,
    getScan: getScan,
    getScans: getScans,
    getAllScans: getAllScans,
    saveEntity: saveEntity,
    getEntity: getEntity,
    saveJob: saveJob,
    getJob: getJob,
    getJobs: getJobs,
    deleteJob: deleteJob,
    getEntityByType: getEntityByType,
    getEntityByTypeAndJson: getEntityByTypeAndJson,
    getMappedEntityDataTypesForScan: getMappedEntityDataTypesForScan,
    getMappedEntityCountForScanId: getMappedEntityCountForScanId,
    getMappedEntitiesByDataCollectionType: getMappedEntitiesByDataCollectionType,
    getMappedEntityNamesForScanAndCollectionType: getMappedEntityNamesForScanAndCollectionType,
    getMappedEntityNamesForScanAndCollectionTypeAndNames: getMappedEntityNamesForScanAndCollectionTypeAndNames,
    saveMappedEntity: saveMappedEntity,
    getMappedEntities: getMappedEntities,
    deleteAllMappedEntitiesInScan: deleteAllMappedEntitiesInScan,
    init: init,
};

export { api };
