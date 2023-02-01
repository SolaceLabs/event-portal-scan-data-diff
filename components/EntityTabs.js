import React from 'react';
import { useState, useEffect } from "react";
import EntityView from "./EntityView";

const EntityTabs = ({envName, memName, msName, entityTypes, scanId}) => {
    
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
            <span className="env">{envName}</span>
            <span className="hseparator">/</span>
            <span className="env">{memName}</span>
            <span className="hseparator">/</span>
            <span className="env">{msName}</span>

            <h2>Configuration</h2>
            <div className ="Tabs">
                {tabs}
                {(activeTabName !== undefined) && <EntityView scanId={scanId} configType={activeTabName}/>}
            </div>
        </div>
    )
}

export default EntityTabs;
