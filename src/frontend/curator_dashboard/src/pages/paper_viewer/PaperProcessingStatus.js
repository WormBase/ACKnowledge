import React from "react";
import {Badge, Card, Alert} from "react-bootstrap";
import {useSelector} from "react-redux";
import {useQuery} from "react-query";
import axios from "axios";

const PaperProcessingStatus = () => {
    const paperID = useSelector((state) => state.paperID);
    const queryRes = useQuery('paperData' + paperID, () =>
        axios.post(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/status", {paper_id: paperID}));
    return(
        <Card>
            <Card.Header>Paper Status</Card.Header>
            <Card.Body>
                {queryRes.data.data.is_old_afp ? 
                    <Alert variant="info">
                        <Alert.Heading>Old AFP System</Alert.Heading>
                        This paper was processed using the old AFP (Author First Pass) system, not the current ACKnowledge system. 
                        Author submission details are not available for display.
                    </Alert>
                    : null
                }
                Processed by ACKnowledge: &nbsp; <Badge variant="secondary">{queryRes.data.data.afp_processed && !queryRes.data.data.is_old_afp ? "TRUE" : "FALSE"}</Badge><br/>
                {queryRes.data.data.afp_processed === 'TRUE' ? <div>Processed on: {queryRes.data.data.afp_processed_date}<br/></div> : ''}
                Final data submitted by author: &nbsp; <Badge variant="secondary">{queryRes.data.data.author_submitted ? "TRUE" : "FALSE"}</Badge><br/>
                Author has modified any data (including partial submissions): &nbsp; <Badge variant="secondary">{queryRes.data.data.author_modified ? "TRUE" : "FALSE"}</Badge>
            </Card.Body>
        </Card>
    );
}

export default PaperProcessingStatus;