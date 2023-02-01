import React from 'react';
import { useState, useEffect } from "react";
import Link from "next/link";

const EnvList = () => {
    const [envs, setEnvs] = useState([]);
    useEffect(() => getEnvs(), []);

    const getEnvs = async () => {
        const responseRaw = await fetch(`/api/environments`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Accept: '*/*',
            }
        });
        const response = await responseRaw.json();
        console.log("Response from backend", JSON.stringify(response, null, 3));
        setEnvs(response);
    }

    const listItems = envs.map((env, idx) =>
        <Link href={{ pathname: '/eventmeshes', query: { envId: env.id, envName: env.name } }}>
            <div className = "grid-item" key={idx}>{env.name}</div>
        </Link>
    );

    return (
        <div>
            <h2>Environments</h2>
            <div className = "grid-container">{listItems}</div>
        </div>
    );
};

export default EnvList;