import React from 'react';
import { useState, useEffect } from "react";
import DiffView from "./DiffView";

const DiffTabs = ({entityTypes, oldScanId, newScanId}) => {
    
    const [activeTabName, setActiveTabName] = useState(entityTypes[0]);
    useEffect(() => initialize(), [entityTypes]);

    const initialize = () => {
        setActiveTabName(entityTypes[0]);
    }

    const handleClick = (tabName) => {
        if (activeTabName !== tabName) {
            setActiveTabName(tabName);
        }
    }

    const tabs =
        <ul className="nav">
            {entityTypes.map(tabName =>
                <li key={tabName} onClick={() => handleClick(tabName)} className={(tabName === activeTabName)?"active":"non-active"}>{tabName}
                </li>
            )}
        </ul>

    return (
        <div className="scan-list">
            <h2>Configuration Diff</h2>
            <div className ="Tabs">
                {tabs}
                {(activeTabName !== undefined) && <DiffView oldScanId={oldScanId} newScanId={newScanId} configType={activeTabName} initialPage={1}/>}
            </div>
        </div>
    )
}

export default DiffTabs;
