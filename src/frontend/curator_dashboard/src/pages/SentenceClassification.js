import React, {useState} from 'react';
import {Button, FormControl, Spinner, Tab, Table, Tabs} from "react-bootstrap";
import {withRouter} from "react-router-dom";
import queryString from "query-string";
import {useDispatch} from "react-redux";
import {setSelectedPaperID} from "../redux/actions";
import PaperNotLoaded from "./paper_viewer/PaperNotLoaded";
import axios from "axios";
import {useQuery} from "react-query";
import Form from "react-bootstrap/Form";
import {downloadSentenceClassificationCSV} from "../lib/file";


const SentenceClassification = () => {
    const dispatch = useDispatch();
    const [classifierType, setClassifierType] = useState("all_info");
    const [resultType, setResultType] = useState(1);
    const [dataType, setDataType] = useState('expression');
    const [isSpreadsheetLoading, setIsSpreadsheetLoading] = useState(false);

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
                            <h6>Classifier type</h6>
                            <Form.Check inline label="Has all info for curation" defaultChecked={true} name="group1"
                                        type="radio" onClick={() => setClassifierType("all_info")}/>
                            <Form.Check inline label="Curatable" name="group1" type="radio"
                                        onClick={() => setClassifierType("curatable")}/>
                            <Form.Check inline label="Contains language" name="group1" type="radio"
                                        onClick={() => setClassifierType("language")}/>
                            <br/>
                            <br/>
                            <h6>Result type</h6>
                            <Form.Check inline label="Positive" defaultChecked={true} name="group2" type="radio"
                                        onClick={() => setResultType(1)}/>
                            <Form.Check inline label="Negative" name="group2" type="radio"
                                        onClick={() => setResultType(0)}/>
                            <br/>
                            <br/>
                            <h6>Datatype</h6>
                            <Form.Control as="select" value={dataType}
                                          onChange={(e) => setDataType(e.target.value)}>
                                <option>Expression</option>
                                <option>Kinase Activity</option>
                            </Form.Control>
                            <br/>
                            <Button size="sm" onClick={() => {
                                setIsSpreadsheetLoading(true);
                                downloadSentenceClassificationCSV(paperID, queryRes.data.data, dataType).finally(() => setIsSpreadsheetLoading(false));
                            }} variant="outline-primary">Download as CSV {isSpreadsheetLoading ? <Spinner animation="border" size="sm"/> : null}</Button>
                            <br/>
                            <br/>
                            {queryRes.data.data.fulltext ?
                                <Table>
                                    <th>Sentence</th><th>Counter</th>
                                    {queryRes.data.data.sentences.map((sent, idx) =>
                                        queryRes.data.data.classes[dataType][classifierType][idx] === resultType ?
                                        <tr>
                                            <td>{sent}</td><td>{queryRes.data.data.counters[idx]}</td>
                                        </tr> : null )
                                    }
                                </Table>
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