import React, {useState} from 'react';
import {Spinner, Tab, Table, Tabs} from "react-bootstrap";
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
import Form from "react-bootstrap/Form";


const SentenceClassification = () => {
    const dispatch = useDispatch();
    const [classifierType, setClassifierType] = useState("all_info");
    const [resultType, setResultType] = useState(1);
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
                            <h4>Classifier type</h4>
                            <Form.Check inline label="Has all info for curation" defaultChecked={true} name="group1" type="radio" onClick={()=> setClassifierType("all_info")}/>
                            <Form.Check inline label="Curatable" name="group1" type="radio" onClick={()=> setClassifierType("curatable")}/>
                            <Form.Check inline label="Contains language" name="group1" type="radio" onClick={()=> setClassifierType("language")}/>
                            <br/>
                            <h4>Result type</h4>
                            <Form.Check inline label="Positive" defaultChecked={true} name="group2" type="radio" onClick={()=> setResultType(1)}/>
                            <Form.Check inline label="Negative" name="group2" type="radio" onClick={()=> setResultType(0)}/>
                            <br/>
                            {queryRes.data.data.fulltext ?
                                <Tabs defaultActiveKey="profile" id="uncontrolled-tab-example">
                                    <Tab eventKey="home" title="Gene Expression">
                                        <Table>
                                            {queryRes.data.data.sentences.filter((sent, idx) =>
                                                queryRes.data.data.classes["expression"][classifierType][idx] === resultType).map(sent => <tr><td>{sent}</td></tr>)
                                            }
                                        </Table>
                                    </Tab>
                                    <Tab eventKey="profile" title="Kinase Activity">
                                        <Table>
                                            {queryRes.data.data.sentences.filter((sent, idx) =>
                                                queryRes.data.data.classes["kinase"][classifierType][idx] === resultType).map(sent => <tr><td>{sent}</td></tr>)
                                            }
                                        </Table>
                                    </Tab>

                                </Tabs>
                                : null
                            }
                        </div>
                        : null}
                </div>
            }
        </div>
    );
}

export default withRouter(SentenceClassification);