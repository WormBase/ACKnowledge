import React from 'react';
import {Button, Form, FormControl, InputGroup, Navbar} from "react-bootstrap";

class PaperViewer extends React.Component {

    render() {
        return(
            <div className="container-fluid">
                <div className="row">
                    <div className="col-sm-12">
                        &nbsp;
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-8">
                        &nbsp;
                    </div>
                    <div className="col-sm-4">
                        <Form inline>
                            <FormControl type="text" placeholder="Paper ID" />
                            <Button type="submit">Load Paper</Button>
                        </Form>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-12">
                        <h2>List of Entities</h2>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-12">
                        <h3>Genes</h3>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-3">
                        Extracted by AFP
                    </div>
                    <div className="col-sm-3">
                        Final list submitted by author
                    </div>
                    <div className="col-sm-3">
                        Added by author wrt AFP
                    </div>
                    <div className="col-sm-3">
                        Removed by author wrt AFP
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-12">
                        <h3>Species</h3>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-3">
                        Extracted by AFP
                    </div>
                    <div className="col-sm-3">
                        Final list submitted by author
                    </div>
                    <div className="col-sm-3">
                        Added by author wrt AFP
                    </div>
                    <div className="col-sm-3">
                        Removed by author wrt AFP
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-12">
                        <h3>Alleles</h3>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-3">
                        Extracted by AFP
                    </div>
                    <div className="col-sm-3">
                        Final list submitted by author
                    </div>
                    <div className="col-sm-3">
                        Added by author wrt AFP
                    </div>
                    <div className="col-sm-3">
                        Removed by author wrt AFP
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-12">
                        <h3>Transgenes</h3>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-3">
                        Extracted by AFP
                    </div>
                    <div className="col-sm-3">
                        Final list submitted by author
                    </div>
                    <div className="col-sm-3">
                        Added by author wrt AFP
                    </div>
                    <div className="col-sm-3">
                        Removed by author wrt AFP
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-12">
                        <h3>Strains</h3>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-3">
                        Extracted by AFP
                    </div>
                    <div className="col-sm-3">
                        Final list submitted by author
                    </div>
                    <div className="col-sm-3">
                        Added by author wrt AFP
                    </div>
                    <div className="col-sm-3">
                        Removed by author wrt AFP
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-12">
                        <hr/>
                    </div>
                </div>

            </div>
        );
    }
}

export default PaperViewer;