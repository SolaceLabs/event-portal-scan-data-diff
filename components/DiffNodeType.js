import React from 'react';
import { useState, useEffect } from "react";
import * as Diff2Html from 'diff2html/lib/ui/js/diff2html-ui-slim';
import 'diff2html/bundles/css/diff2html.min.css';
import parse from 'html-react-parser';

const DiffNodeType = ({diffResult}) => {
    const [activeName, setActiveName] = useState("");
    const [filter, setFilter] = useState("");


    const handleClick = (nodeName) => {
        if (activeName === nodeName) {
            setActiveName("");
        } else {
            setActiveName(nodeName);
        }
    }

    const configuration = {
        drawFileList: false,
        matching: 'lines',
        highlight: true,
        fileListToggle: false,
        outputFormat: 'side-by-side',
    };

    return (
        <div>
            <ul>
                <input type="text" width="40" onChange={event => setFilter(event.target.value)}/>
                {diffResult
                        .filter(diff => diff.name.toLowerCase().includes(filter.toLowerCase()))
                        .map(diff => 
                    <div key={diff.name}>
                        <li onClick={() => handleClick(diff.name)} className={"list-item diff-" + diff.changeType + ((activeName === diff.name)?" active-list-item":"")} >{diff.name}</li>
                        <div className="diff-result">
                        {(activeName === diff.name && diff.changeType !== "nochange") &&  
                            parse(new Diff2Html.Diff2HtmlUI(null, diff.changeDetails, configuration).diffHtml)
                        }
                        </div>
                    </div>
                )}
            </ul>
        </div>
    );
};

export default DiffNodeType;