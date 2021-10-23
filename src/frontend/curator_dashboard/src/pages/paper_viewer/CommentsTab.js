import React from 'react';
import axios from "axios";
import {Spinner} from "react-bootstrap";
import {useSelector} from "react-redux";
import {useQuery} from "react-query";

const CommentsTab = () => {
    const paperID = useSelector((state) => state.paperID);
    const queryRes = useQuery('paperComments' + paperID, () =>
        axios.post(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/comments", {paper_id: paperID}))

    return(
        <div>
            {queryRes.isLoading ? <Spinner animation="border"/> : null}
            {queryRes.isSuccess ?
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-sm-12">
                            &nbsp;
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-sm-12">
                            {queryRes.data.data.afp_comments !== null && queryRes.data.data.afp_comments !== '' ? queryRes.data.data.afp_comments : 'Null'}
                        </div>
                    </div>
                </div>
                : null}
        </div>
    );
}

export default CommentsTab;
