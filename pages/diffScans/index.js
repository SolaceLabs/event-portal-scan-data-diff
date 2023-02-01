import React from 'react';
import { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import DiffTabs from '../../components/DiffTabs';

const DiffScans = () => {
    const router = useRouter();
    const [newScan, setNewScan] = useState({});
    const [oldScan, setOldScan] = useState({});
    const [commonComponentTypes, setCommonComponentTypes] = useState([]);
    useEffect(() => getScanMetadata(), []);

    const getScanMetadata = async () => {
        console.log(`scan1 = ${router.query.scanId1} scan2 = ${router.query.scanId2}`);

        // Get the data for each scan
        const firstScan = await getScanData(router.query.scanId1);
        const secondScan = await getScanData(router.query.scanId2);
        const oldScanData = {}, newScanData = {};
        if (new Date(firstScan.createdTime) > new Date(secondScan.createdTime)) {
            newScanData = firstScan;
            oldScanData = secondScan;
        } else {
            newScanData = secondScan;
            oldScanData = firstScan;
        }

        setNewScan(newScanData);
        setOldScan(oldScanData);

        // Get the component types for each scan
        const oldComponentTypes = await getDataComponentTypes(oldScanData.id);
        const newComponentTypes = await getDataComponentTypes(newScanData.id);
        setCommonComponentTypes(intersect(oldComponentTypes, newComponentTypes));
    }

    function intersect(a, b) {
        return a.filter(Set.prototype.has, new Set(b));
      }
      
    const getScanData = async (scanId) => {
        const responseRaw = await fetch(`/api/msScans?scanId=${scanId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Accept: '*/*',
            }
        });
        const response = await responseRaw.json();
        //console.log("scan data", JSON.stringify(response, null, 3));
        return response;
    }

    const getDataComponentTypes = async (scanId) => {
        const responseRaw = await fetch(`/api/entityConfig?scanId=${scanId}&typesOnly=true`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Accept: '*/*',
            }
        });
        const response = await responseRaw.json();
        //console.log("component types", JSON.stringify(response, null, 3));
        return response;
    }

    return (
        <div>
            <DiffTabs entityTypes={commonComponentTypes} oldScanId={oldScan.id} newScanId={newScan.id}/>
        </div>
    );
};

export default DiffScans;