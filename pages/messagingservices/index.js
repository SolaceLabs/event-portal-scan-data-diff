import React from 'react';
import { useState, useEffect } from "react";
import Link from "next/link";
import Layout, { siteTitle } from '../../components/layout'
import Head from 'next/head'
import { useRouter } from 'next/router'

const EventMeshList = () => {
    const router = useRouter();
    const [envs, setEnvs] = useState([]);
    useEffect(() => getEnvs(), []);

    const getEnvs = async () => {
        const responseRaw = await fetch(`/api/messagingservices?memId=${router.query.memId}`, {
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

    const listItems = envs.map((ms, idx) =>
        <Link href={{ pathname: '/msScans', query: { envName: router.query.envName, memName: router.query.memName, msId: ms.id, msName: ms.name } }}>
            <div className = "grid-item" key={idx}>{ms.name}</div>
        </Link>
    );

    return (
        <Layout home>
            <Head>
                <title>{siteTitle}</title>
            </Head>
                <div>
                    <span className="env">{router.query.envName}</span>
                    <span className="hseparator">/</span>
                    <span className="env">{router.query.memName}</span>
                    <h2>Messaging Services</h2>
                    <div className = "grid-container">{listItems}</div>
                </div>
        </Layout>
    );
};

export default EventMeshList;