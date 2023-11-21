import React from 'react';
import {Spinner} from "react-bootstrap";
import {withRouter} from "react-router-dom";
import queryString from "query-string";
import TopSearchBar from "./paper_viewer/TopSearchBar";
import {useDispatch} from "react-redux";
import {setSelectedPaperID} from "../redux/actions";
import TabsArea from "./paper_viewer/TabsArea";
import PaperNotLoaded from "./paper_viewer/PaperNotLoaded";
import axios from "axios";
import PaperInfo from "./paper_viewer/PaperInfo";
import PaperProcessingStatus from "./paper_viewer/PaperProcessingStatus";
import {useQuery} from "react-query";


const SentenceClassification = () => {
    const dispatch = useDispatch();
    let paperID = undefined;
    let url = document.location.toString();
    if (url.match("\\?")) {
        paperID = queryString.parse(document.location.search).paper_id
    }
    dispatch(setSelectedPaperID(paperID));
    const queryRes = useQuery('fulltext' + paperID, () =>
        axios.post(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/converted_text", {paper_id: paperID}));

    return(
        <div>
            {paperID === undefined || paperID === "undefined" || paperID === "" ? <PaperNotLoaded/> :
                <div>
                    {queryRes.isLoading ? <Spinner animation="border"/> : null}
                    {queryRes.isSuccess ?
                        <div>
                            {queryRes.data.data.fulltext ?
                                queryRes.data.data.sentences.map((sent, idx) => {
                                    if (queryRes.data.data.classes["expression"]["all_info"][idx] === 1) {
                                        return sent
                                    }
                                    else {
                                        return null
                                    }
                                }) : null}
                        </div>
                        : null}
                </div>
            }
        </div>
    );
}

export default withRouter(SentenceClassification);