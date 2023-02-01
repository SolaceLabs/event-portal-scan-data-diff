import { useState, useEffect } from "react";
import Link from "next/link";
import uuid from "short-uuid";

export default function Scans(props) {
    const environment = 'production';
    const mem = 'default';

    const [scanContents, setScanContents] = useState(null);
    const [showSaveScan, setShowSaveScan] = useState(false);
    const [showDiff, setShowDiff] = useState(false);
    const [scanList, setScanList] = useState([]);
    const [diffList, setDiffList] = useState([]);


    const refreshData = async () => {
        const res = await fetch(`/api/scans?environment=${environment}&mem=${mem}`);
        const scans = await res.json();
        console.log("Scan list", scans.data);
        setScanList(scans.data);
    }

    useEffect(() => refreshData(), []);

    const uploadToClient = (event) => {
        if (event.target.files && event.target.files[0]) {
            const reader = new FileReader()
            reader.onload = handleFileLoad;
            reader.readAsText(event.target.files[0])
        }
    };

    function handleFileLoad(event) {
        const scanFileResult = JSON.parse(event.target.result);
        if ('data' in scanFileResult) {
            const scanData = scanFileResult.data;
            scanData.environment = environment;
            scanData.mem = mem;
            setScanContents(scanData);
            const brokerType = scanData.brokerType;
            let host = scanData.pluginInputs.brokerIdentity.host;
            if (host !== undefined && host.includes(':')) {
                host = host.split([':'])[0];
            } else {
                host = scanData.pluginInputs.brokerIdentity.brokerAlias;
            }
            console.log("Info", brokerType, host);
            setShowSaveScan(true);
        }
    }


    const uploadToServer = async (event) => {
        //console.log("Sending", JSON.stringify(scanContents));
        const scanId = uuid.generate();

        const batchSize = 50;
        const configNodes = scanContents.configuration.nodes;
        const configKeys = Object.keys(configNodes);
        console.log("Config keys", configKeys);
        let allNodes = [];
        for (let keyIndex in configKeys) {
            console.log("Config category:", configKeys[keyIndex]);
            allNodes = allNodes.concat(configNodes[configKeys[keyIndex]]);
        }

        console.log("AllNodes", allNodes);

        const numberOfPages = Math.ceil(allNodes.length / batchSize);

        let host = scanContents.pluginInputs.brokerIdentity.host;
        if (host !== undefined && host.includes(':')) {
          host = host.split([':'])[0];
        } else {
          host = scanContents.pluginInputs.brokerIdentity.brokerAlias;
        }
      
        // Page through and send batches to back-end
        for (let pageNumber = 1; pageNumber <= numberOfPages; pageNumber++) {
            const response = await fetch("/api/scans/", {
                body: JSON.stringify({
                    scanId: scanId,
                    saveScan: (pageNumber == 1),
                    environment: environment,
                    mem: mem,
                    name: scanContents.name ?? "Unnamed",
                    host: host,
                    scanEndTime: scanContents.discoveryEndTime,
                    brokerType: scanContents.brokerType,
                    nodes: paginate(allNodes, batchSize, pageNumber)
                }),
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                }
            });
            console.log(response);
        }
        setShowSaveScan(false);
        refreshData();
    };

    const paginate = (array, pageSize, pageNumber) => {
        return array.slice((pageNumber - 1) * pageSize, pageNumber * pageSize);
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

    return (
        <div>
            <div className="scan-list">
                <span className="env">production</span>
                <span className="hseparator">/</span>
                <span className="env">default</span>
                <span className="hseparator">/</span>
                <span className="env">myKafkaCluster</span>
                <h2>Scans</h2>
                <label>Upload scan file</label>
                <input type="file" name="myScan" onChange={uploadToClient} className="button" />
                {showSaveScan &&
                    <button
                        className="button button2"
                        type="submit"
                        onClick={uploadToServer}
                    >
                        Upload to Server
                    </button>
                }
                <div>
                    <table className="scan-table">
                        <thead className="scan-thead">
                            <tr><th></th><th>Name</th><th>Scan Time</th><th>UploadTime</th></tr>
                        </thead>
                        <tbody>
                            {
                                (scanList != null && Array.isArray(scanList)) ? scanList.sort((a, b) => (new Date(a.scanEndTime) < new Date(b.scanEndTime)) ? 1 : -1)
                                    .map((scan, idx) => {
                                        const uploadTime = new Date(scan.uploadTime);
                                        const scanTime = new Date(scan.scanEndTime);
                                        return <tr key={idx} className="scan-row">
                                            <td><input type="checkbox" id={scan.id} onClick={() => checkBoxClicked(scan.id)}></input></td>
                                            <td>{<Link href={{ pathname: '/config', query: { scanid: scan.id } }}><a>{scan.name}</a></Link>}</td>
                                            <td>{scanTime.toISOString().slice(0, 19).replace('T', ' ')}</td>
                                            <td>{uploadTime.toISOString().slice(0, 19).replace('T', ' ')}</td>
                                        </tr>
                                    }) : ''
                            }
                        </tbody>
                    </table>
                </div>
                {showDiff && <Link href={{ pathname: '/diff', query: { scan1: diffList[0], scan2: diffList[1] } }}><a className="button button2">Diff</a></Link>}
            </div>
        </div>
    );
}
