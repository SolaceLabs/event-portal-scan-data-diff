import React from 'react';
import { useState, useEffect } from "react";
import Link from "next/link";
import Layout, { siteTitle } from '../../components/layout'
import Head from 'next/head'
import { useRouter } from 'next/router'

const EventMeshList = () => {
    const router = useRouter();
    const [mems, setMems] = useState([]);
    useEffect(() => getMems(), []);

    const getMems = async () => {
        const responseRaw = await fetch(`/api/eventmeshes?envId=${router.query.envId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Accept: '*/*',
            }
        });
        const response = await responseRaw.json();
        console.log("Response from backend", JSON.stringify(response, null, 3));
        setMems(response);
    }

    const listItems = mems.map((mem, idx) =>
        <Link href={{ pathname: '/messagingservices', query: { envName: router.query.envName, memId: mem.id, memName: mem.name } }}>
            <div className = "grid-item" key={idx}>{mem.name}</div>
        </Link>
    );

    return (
        <Layout home>
            <Head>
                <title>{siteTitle}</title>
            </Head>
                <div>
                    <span className="env">{router.query.envName}</span>
                    <h2>Event Meshes</h2>
                    <div className = "grid-container">{listItems}</div>
                </div>
        </Layout>
    );
};

export default EventMeshList;