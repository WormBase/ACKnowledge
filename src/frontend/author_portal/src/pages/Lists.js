import React, {useEffect} from 'react';
import {Alert} from "react-bootstrap";
import {useDispatch, useSelector} from "react-redux";
import {validateToken} from "../redux/actions/lists";
import TabbedPaperLists from "../components/TabbedPaperLists";

const Lists = () => {
    const dispatch = useDispatch();
    const token = useSelector((state) => state.login.token);
    const tokenIsValid = useSelector((state) => state.lists.tokenIsValid);
    const tokenIsValidating = useSelector((state) => state.lists.tokenIsValidating);
    const error = useSelector((state) => state.lists.error);

    useEffect(() => {
        dispatch(validateToken(token));
    }, []);

    return(
        <div>
            {tokenIsValidating ? <Alert variant="info">Validating token...</Alert> : null}
            {error ? <Alert variant="danger">Error: An error occurred</Alert> : null}
            {tokenIsValid ? <TabbedPaperLists/> : null}
            {tokenIsValid === false ? <Alert variant="danger">Error: The provided token is not valid or expired</Alert> : null}
        </div>
    );
}

export default Lists;