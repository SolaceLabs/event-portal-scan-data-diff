import React from 'react';
import { useState, useEffect } from "react";
import Pagination from './paging/Pagination';
import parse from 'html-react-parser';

const EntityView = ({scanId, configType: dataCollectionType}) => {
    const [mappedEntities, setMappedEntities] = useState([]);
    const [activeName, setActiveName] = useState("");
    const [prevDataCollectionType, setPrevDataCollectionType] = useState("");
    const [filter, setFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [meta, setMeta] = useState({nextPage: null});

    useEffect(() => getMappedEntities(), [scanId, dataCollectionType, currentPage]);


    const getMappedEntities = async () => {
        const pageToRetrieve = 1;
        if (prevDataCollectionType === dataCollectionType) {
            pageToRetrieve = currentPage;
        } else {
            setPrevDataCollectionType(dataCollectionType);

            // TODO: This results in a double fetch. Find a way to reset the
            // page without causing another fetch
            setCurrentPage(1);
        }

        const responseRaw = await fetch(`/api/entityConfig?scanId=${scanId}&dataCollectionType=${dataCollectionType}&pageNumber=${pageToRetrieve}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Accept: '*/*',
            }
        });
        const response = await responseRaw.json();
        console.log("Entities from backend", response);
        setMappedEntities(response.data);
        setMeta(response.meta);
    }

    const handleClick = (entityName) => {
        if (activeName === entityName) {
            setActiveName("");
        } else {
            setActiveName(entityName);
        }
    }

    const changePage = async (newPage) => {
        console.log("Change page to", newPage);
        setCurrentPage(newPage);
    }

    function syntaxHighlight(json) {
        json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
            var cls = 'number';
            if (/^"/.test(match)) {
                if (/:$/.test(match)) {
                    cls = 'key';
                } else {
                    cls = 'string';
                }
            } else if (/true|false/.test(match)) {
                cls = 'boolean';
            } else if (/null/.test(match)) {
                cls = 'null';
            }
            return '<span class="' + cls + '">' + match + '</span>';
        });
    }
    
    const configs = mappedEntities.map(mappedEntity =>
        <div>
            <li className={(activeName === mappedEntity.name)?"active-list-item list-item":"list-item"} onClick={() => handleClick(mappedEntity.name)}>{mappedEntity.name}</li>
            {(activeName !== "" && activeName === mappedEntity.name) && <pre>{parse(syntaxHighlight(JSON.stringify(mappedEntity.rawData, null, 3)))}</pre>}
        </div>
    );

    return (
        <div>
            <Pagination currentPage={currentPage} nextPage={meta.nextPage} totalPages={meta.totalPages} changePage={changePage}/>
                <ul>
                    {configs}
                </ul>
            {mappedEntities.length > 5 && <Pagination currentPage={currentPage} nextPage={meta.nextPage} totalPages={meta.totalPages} changePage={changePage}/>}
        </div>
    );
};

export default EntityView;