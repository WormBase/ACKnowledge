import React, {useState} from "react";
import {
    Alert,
    Button,
    FormControl,
    Glyphicon,
    Modal, OverlayTrigger, Tooltip
} from "react-bootstrap";
import {setPerson} from "../redux/actions/personActions";
import {useDispatch, useSelector} from "react-redux";

const PersonSelector = () => {
    const dispatch = useDispatch();

    const [show_fetch_data_error, setShow_fetch_data_error] = useState(false);
    const [show, setShow] = useState(false);
    const [tmp_person_name, setTmp_person_name] = useState(undefined);
    const [tmp_person_id, setTmp_person_id] = useState(undefined);
    const [availableItems, setAvailableItems] = useState(new Set());
    const [showMore, setShowMore] = useState(false);

    const person = useSelector((state) => state.person.person);

    const sampleQuery = "Type your name";

    const handleClose = () => {
        setShow(false);
        setShow_fetch_data_error(false);
        setTmp_person_id(undefined);
        setTmp_person_name(undefined);
    }

    const searchWB = (searchString, searchType) => {
        if (searchString !== "") {
            fetch(process.env.REACT_APP_API_AUTOCOMPLETE_ENDPOINT + '?objectType=' + searchType + '&userValue=' + searchString)
                .then(res => {
                    if (res.status === 200) {
                        return res.text();
                    } else {
                        setShow_fetch_data_error(true);
                    }
                }).then(data => {
                if (data === undefined) {
                    setShow_fetch_data_error(true);
                } else {
                    setAvailableItemsFunction(data, false);
                }
            }).catch(() => setShow_fetch_data_error(true));
        } else {
            setAvailableItemsFunction("");
        }
    }

    const setAvailableItemsFunction = (wbItems, removeAddInfo = false) => {
        const addInfoRegex = / \( ([^ ]+) \)[ ]+$/;
        if (wbItems !== undefined && wbItems !== "\n") {
            let newAvailItems = new Set(wbItems.split("\n").filter((item) => item !== ''));
            if (removeAddInfo) {
                newAvailItems = new Set([...newAvailItems].map((elem) => elem.replace(addInfoRegex, "")));
            }
            if (newAvailItems.has("more ...")) {
                newAvailItems.delete("more ...");
                setShowMore(true);
            } else {
                setShowMore(false);
            }
            setAvailableItems(newAvailItems);
        } else {
            setAvailableItems(new Set());
            setShowMore(false);
        }
    }

    let data_fetch_err_alert = false;
    if (show_fetch_data_error) {
        data_fetch_err_alert = <Alert bsStyle="danger">
            <Glyphicon glyph="warning-sign"/> <strong>Error</strong><br/>
            Can't download WormBase data. Try again later or contact <a href="mailto:help@wormbase.org">
            Wormbase Helpdesk</a>.
        </Alert>;
    }
    let more = false;
    if (showMore) {
        more =
            <div className="row">
                <div className="col-sm-12">
                    Some results matching the query have been omitted. Try a different query to narrow down the results.
                </div>
            </div>
    }
    return (
        <div className="container-fluid">
            <div className="row">
                <div className="col-sm-6">
                    WormBase User: <strong>{person.name}</strong> (WBPerson{person.personId})
                </div>
                <div className="col-sm-6" align="right">
                    <Button bsSize="xsmall" bsStyle="primary" onClick={() => setShow(true)}>Change user</Button>
                    &nbsp;<Button bsSize="xsmall" bsStyle="primary" onClick={() => {window.open('https://wormbase.org/submissions/person.cgi', '_blank')}}>
                        Request new WB Person
                    </Button>
                </div>
            </div>
            <div className="row">
                <div>
                    &nbsp;
                </div>
            </div>
            <div className="row">

                <div className="col-sm-12" align="left">
                    <OverlayTrigger overlay={<Tooltip id="tooltip">Access the author portal to curate information for your other papers</Tooltip>}>
                        <Button
                            onClick={() => {window.open('https://acp.acknowledge.textpressolab.com', '_blank')}}
                        >ACKnowledge author portal</Button>
                    </OverlayTrigger>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12">
                </div>
            </div>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Select from Wormbase User list</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {data_fetch_err_alert}
                    <div className="container-fluid">
                        <div className="row">
                            <div className="col-sm-12">
                                <input className="form-control"
                                       placeholder={sampleQuery}
                                       onChange={(e) => {searchWB(e.target.value, "person")}}
                                />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-12">
                                &nbsp;
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-sm-12">
                                <FormControl componentClass="select" multiple
                                             style={{height: '200px'}}
                                             defaultValue=""
                                             onDoubleClick={(e) => {
                                                 let fullData = e.target.label;
                                                 let wbRx = / \( WBPerson([0-9]+) \)/;
                                                 let arr = wbRx.exec(fullData);
                                                 fullData = fullData.replace(wbRx, "");
                                                 dispatch(setPerson(fullData, arr[1]));
                                                 handleClose();
                                             }}
                                             onClick={(e) => {
                                                 let fullData = e.target.label;
                                                 let wbRx = / \( WBPerson([0-9]+) \)/;
                                                 let arr = wbRx.exec(fullData);
                                                 fullData = fullData.replace(wbRx, "");
                                                 setTmp_person_name(fullData);
                                                 setTmp_person_id(arr[1]);
                                             }}
                                >
                                    {[...availableItems].map(item =>
                                        <option>{item}</option>)}
                                </FormControl>
                            </div>
                        </div>
                        {more}
                    </div>
                </Modal.Body>
                <Modal.Footer>
                    <Button onClick={() =>{
                        if (tmp_person_id !== undefined && tmp_person_name !== undefined) {
                            dispatch(setPerson(tmp_person_name, tmp_person_id));
                            handleClose();
                        }
                    }}>Select</Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
}

export default PersonSelector;


