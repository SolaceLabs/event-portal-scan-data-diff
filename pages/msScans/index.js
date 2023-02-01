import React from 'react';
import { useState, useEffect } from "react";
import Link from "next/link";
import Layout, { siteTitle } from '../../components/layout'
import Head from 'next/head'
import { useRouter } from 'next/router'
import Pagination from '../../components/paging/Pagination';

const EventMeshList = () => {
    const router = useRouter();
    const [envs, setEnvs] = useState([]);
    const [meta, setMeta] = useState({nextPage: null});
    const [currentPage, setCurrentPage] = useState(1);
    const [diffList, setDiffList] = useState([]);
    const [showDiff, setShowDiff] = useState(false);
    useEffect(() => getEnvs(), [currentPage]);

    const getEnvs = async () => {
        console.log(`Getting scans with page ${currentPage}`);
        const responseRaw = await fetch(`/api/msScans?msId=${router.query.msId}&pageNumber=${currentPage}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Accept: '*/*',
            }
        });
        const response = await responseRaw.json();
        console.log("Response from backend scans", JSON.stringify(response, null, 3));
        setEnvs(response.data);
        setMeta(response.meta);
    }

    const changePage = async (newPage) => {
        console.log("Change page to", newPage);
        setCurrentPage(newPage);
    }

    const checkBoxClicked = (scanId) => {
        console.log("You clicked", scanId, diffList);
        if (diffList.includes(scanId)) {
            setDiffList(diffList.filter(scan => scan !== scanId));
            setShowDiff(false);
        } else {
            setDiffList([scanId, ...diffList]);
            console.log(diffList, [...diffList, scanId]);
            if ([scanId, ...diffList].length === 2) {
                setShowDiff(true);
            }
        }
    }

    const tableItems = envs
       .map((scan, idx) => 
            <tr key = {idx} className="scan-row">
                <td><input type="checkbox" id={scan.id} onClick={() => checkBoxClicked(scan.id)} disabled={(scan.status==="COMPLETE")?false:true}></input></td>
                <Link href={{ pathname: '/entityConfig', query: {envName: router.query.envName, memName: router.query.memName, msName: router.query.msName, scanId: scan.id}}}>
                    <td>{new Date(scan.createdTime).toISOString().slice(0, 19).replace('T', ' ')}</td>
                </Link>
                <Link href={{ pathname: '/entityConfig', query: {envName: router.query.envName, memName: router.query.memName, msName: router.query.msName, scanId: scan.id}}}>
                    <td>{scan.count}</td>
                </Link>
                <Link href={{ pathname: '/entityConfig', query: {envName: router.query.envName, memName: router.query.memName, msName: router.query.msName, scanId: scan.id}}}>
                    <td>{scan.status}</td>
                </Link>
               <Link href={{ pathname: '/entityConfig', query: {envName: router.query.envName, memName: router.query.memName, msName: router.query.msName, scanId: scan.id}}}>
                    <td>{scan.statusDescription}</td>
                </Link>
            </tr>
        //</Link>

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
                    <span className="hseparator">/</span>
                    <span className="env">{router.query.msName}</span>
                    <h2>Scans</h2>
                    <Pagination currentPage={currentPage} nextPage={meta.nextPage} totalPages={meta.totalPages} changePage={changePage}/>
                    <table className="scan-table">
                        <thead className="scan-thead">
                            <tr><th></th><th>Created Time</th><th>Entity Count</th><th>Status</th><th>Status Description</th></tr>
                        </thead>
                        <tbody>
                            {tableItems}
                        </tbody>
                    </table>
                </div>
                {showDiff && <Link href={{ pathname: '/diffScans', query: { scanId1: diffList[0], scanId2: diffList[1] } }}><a className="button button2">Diff</a></Link>}
                <Pagination currentPage={currentPage} nextPage={meta.nextPage} totalPages={meta.totalPages} changePage={changePage}/>
        </Layout>
    );
};

export default EventMeshList;