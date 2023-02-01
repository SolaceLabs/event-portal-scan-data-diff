import React from 'react';
import { useState, useEffect } from "react";
import Pagination from './paging/Pagination';
import parse from 'html-react-parser';
import * as Diff2Html from 'diff2html/lib/ui/js/diff2html-ui-slim';
import 'diff2html/bundles/css/diff2html.min.css';


const DiffView = ({oldScanId, newScanId, configType: dataCollectionType}) => {
    const [prevDataCollectionType, setPrevDataCollectionType] = useState("");
    const [mappedEntities, setMappedEntities] = useState([]);
    const [activeName, setActiveName] = useState("");
    const [filter, setFilter] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [meta, setMeta] = useState({nextPage: null});

    useEffect(() => getMappedEntities(), [oldScanId, newScanId, dataCollectionType, currentPage]);


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
        console.log(oldScanId, newScanId, dataCollectionType);
        const responseRaw = await fetch(`/api/diffs?oldScanId=${oldScanId}&newScanId=${newScanId}&dataCollectionType=${dataCollectionType}&pageNumber=${pageToRetrieve}`, {
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

    // TODO: This is copied from EntityView - This should go into a utility function and be shared by both
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

    const configuration = {
        drawFileList: false,
        matching: 'lines',
        highlight: true,
        fileListToggle: false,
        outputFormat: 'side-by-side',
    };

    const configs = mappedEntities
        .filter(me => me.name !== "")
        .map(mappedEntity =>
        <div>
            <li className={"list-item diff-" + mappedEntity.changeType + ((activeName === mappedEntity.name)?" active-list-item":"")} onClick={() => handleClick(mappedEntity.name)}>{mappedEntity.name}</li>
            {(activeName === mappedEntity.name && mappedEntity.changeType === "diff") &&  
                <div className="diff-result">
                    { parse(new Diff2Html.Diff2HtmlUI(null, mappedEntity.diff, configuration).diffHtml) }
                </div>
            }
            {(activeName === mappedEntity.name && (mappedEntity.changeType === "created" || mappedEntity.changeType === "deleted" || mappedEntity.changeType === "nodiff")) &&  
                <pre className={mappedEntity.changeType}>{parse(syntaxHighlight(JSON.stringify(mappedEntity.entity, null, 3)))}</pre>
            }
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

export default DiffView;