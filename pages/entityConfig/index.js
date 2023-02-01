import React from 'react';
import { useState, useEffect } from "react";
import { useRouter } from 'next/router'
import EntityTabs from '../../components/EntityTabs';

const EntityList = () => {
    const router = useRouter();
    const [entityTypes, setEntityTypes] = useState([]);
    useEffect(() => getEntityTypes(), []);

    const getEntityTypes = async () => {
        console.log(`Current entity types ${entityTypes}`);
        const responseRaw = await fetch(`/api/entityConfig?scanId=${router.query.scanId}&typesOnly=true`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Accept: '*/*',
            }
        });
        const response = await responseRaw.json();
        setEntityTypes(response);
        console.log("Response from backend entity types", JSON.stringify(response, null, 3));
    }

    return (
        <div>
            <EntityTabs envName={router.query.envName} memName={router.query.memName} msName={router.query.msName} entityTypes={entityTypes} scanId={router.query.scanId}/>
        </div>
    );
};

export default EntityList;