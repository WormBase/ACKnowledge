import React, {useState} from "react";
import ReactHtmlParser from "html-react-parser";
import {useQuery} from "react-query";
import axios from "axios";
import {useSelector} from "react-redux";
import Button from "react-bootstrap/Button";
import {downloadCSVSpreadsheet} from "../../lib/file";
import {Card, Spinner} from "react-bootstrap";
import {IndexLinkContainer} from "react-router-bootstrap";

const PaperInfo = () => {
    const paperID = useSelector((state) => state.paperID);
    const [isSpreadsheetLoading, setIsSpreadsheetLoading] = useState(false);
    const queryRes = useQuery('paperData' + paperID, () =>
        axios.post(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/status", {paper_id: paperID}));
    let url = document.location.toString();
    let args = "";
    if (url.match('\\?')) {
        args = "?" + url.split('?')[1]
    }

    return (
        <div>
            <Card>
                <Card.Header>Paper Info</Card.Header>
                <Card.Body>
                    <strong>Title:</strong> &nbsp; {ReactHtmlParser(queryRes.data.data.title)}<br/>
                    <strong>Journal:</strong> &nbsp; {queryRes.data.data.journal}<br/>
                    <strong>Email:</strong> &nbsp; {queryRes.data.data.email} <br/>
                    <strong>Link to pubmed source:</strong> &nbsp; <a href={"https://www.ncbi.nlm.nih.gov/pubmed/" + queryRes.data.data.pmid.replace("PMID:", "")} target="blank_">{"https://www.ncbi.nlm.nih.gov/pubmed/" + queryRes.data.data.pmid}</a> <br/>
                    <strong>Link to doi source:</strong> &nbsp; <a href={"https://doi.org/" + queryRes.data.data.doi} target="blank_">{"https://doi.org/" + queryRes.data.data.doi}</a><br/>
                    {!queryRes.data.data.is_old_afp && queryRes.data.data.afp_form_link !== "" ? <div><br/><a href={queryRes.data.data.afp_form_link} target="_blank"><strong>Link to ACKnowledge form</strong></a></div> : null}
                    {!queryRes.data.data.is_old_afp ? (
                        <>
                            <br/>
                            <Button size="sm" onClick={() => {
                                setIsSpreadsheetLoading(true);
                                downloadCSVSpreadsheet(paperID).finally(() => setIsSpreadsheetLoading(false));
                            }} variant="outline-primary">Download manual submission form {isSpreadsheetLoading ? <Spinner animation="border" size="sm"/> : null}</Button>
                            <br/>
                            <br/>
                            <IndexLinkContainer to={"sentence_classification" + args}
                                                active={true}>
                                <a><h6>Sentence Level Classification</h6></a>
                            </IndexLinkContainer>
                        </>
                    ) : null}
                </Card.Body>
            </Card>
        </div>
    );
}

export default PaperInfo;