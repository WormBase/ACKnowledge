import React from 'react';
import {Button, ControlLabel, Form, FormControl, FormGroup, Panel, Tab, Tabs} from "react-bootstrap";
import PanelBody from "react-bootstrap/es/PanelBody";
import PanelHeading from "react-bootstrap/es/PanelHeading";
import PaginatedPapersList from "../page_components/PaginatedPapersList";
import {Link, withRouter} from "react-router-dom";



class Lists extends React.Component {
    constructor(props, context) {
        super(props, context);
        let url = document.location.toString();
        let activeTabKey = 1;
        if (url.match('#')) {
            activeTabKey = parseInt(url.split('#')[1])
        }
        const defNumPapersPerPage = 10;
        this.state = {
            list_papers_processed: [],
            list_papers_submitted: [],
            num_papers_processed: 0,
            num_papers_submitted: 0,
            processed_from_offset: 0,
            processed_count: 5,
            submitted_from_offset: 0,
            submitted_count: defNumPapersPerPage,
            active_page_processed: 1,
            active_page_submitted: 1,
            cx: 0,
            isLoading: false,
            activeTabKey: activeTabKey,
            papersPerPage: defNumPapersPerPage,
            tmp_count: defNumPapersPerPage,
            paper_id: undefined
        };
    }

    render() {
        return(
            <div className="container-fluid">
                <div className="row">
                    <div className="col-sm-12">
                        &nbsp;
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-12 text-right">
                        <Form inline onSubmit={e => e.preventDefault()}>
                            <FormControl type="text" placeholder="Paper ID - 8 digits"
                                         onChange={(e) => {this.setState({paper_id: e.target.value})}} onSubmit=""/>
                            <Link to={
                                {
                                    pathname: '/paper',
                                    search: '?paper_id=' + this.state.paper_id
                                }
                            }><Button>
                                Load in Paper Status Page
                            </Button></Link>
                        </Form>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-12">
                        <Form onSubmit={e => e.preventDefault()} inline>
                            <FormGroup controlId="formValidationError2"
                                       validationState={this.state.countValidationState}>
                                <ControlLabel>Papers per page: &nbsp;</ControlLabel>
                                <FormControl
                                    type="text" autoComplete="off" maxLength="3" bsSize="small"
                                    placeholder={this.state.papersPerPage}
                                    onInput={(event) => {
                                        if (event.target.value !== "" && !isNaN(parseFloat(event.target.value)) && isFinite(event.target.value) && parseFloat(event.target.value) > 0) {
                                            this.setState({
                                                tmp_count: event.target.value,
                                                countValidationState: null
                                            })
                                        } else if (event.target.value !== "") {
                                            this.setState({
                                                countValidationState: "error"
                                            })
                                        } else {
                                            this.setState({
                                                countValidationState: null
                                            })
                                        }
                                    }}
                                    onKeyPress={(target) => {if (target.key === 'Enter' && this.state.tmp_count > 0) {
                                        this.setState({
                                            papersPerPage: this.state.tmp_count,
                                        });
                                        this.processedList.refreshList();
                                        this.submittedList.refreshList();
                                        this.partialList.refreshList();
                                    }}}
                                />
                                <Button bsStyle="primary" bsSize="small" onClick={() => { if (this.state.tmp_count > 0) {
                                    this.setState({
                                        papersPerPage: this.state.tmp_count,
                                    });
                                    this.processedList.refreshList();
                                    this.submittedList.refreshList();
                                    this.partialList.refreshList();
                                }}}>Refresh</Button>
                            </FormGroup>
                        </Form>
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-12">
                        &nbsp;
                    </div>
                </div>
                <div className="row">
                    <div className="col-sm-4">
                        <Panel className="listPanel">
                            <PanelHeading>Papers processed by the new AFP</PanelHeading>
                            <PanelBody>
                                <PaginatedPapersList listType="processed"
                                                     papersPerPage={this.state.papersPerPage}
                                                     ref={instance => {this.processedList = instance}}
                                />
                            </PanelBody>
                        </Panel>
                    </div>
                    <div className="col-sm-4">
                        <Panel className="listPanel">
                            <PanelHeading>Papers with final data submitted by authors</PanelHeading>
                            <PanelBody>
                                <PaginatedPapersList listType="submitted"
                                                     papersPerPage={this.state.papersPerPage}
                                                     ref={instance => {this.submittedList = instance}}
                                />
                            </PanelBody>
                        </Panel>
                    </div>
                    <div className="col-sm-4">
                        <Panel className="listPanel">
                            <PanelHeading>Papers with partially submitted data</PanelHeading>
                            <PanelBody>
                                <PaginatedPapersList listType="partial"
                                                     papersPerPage={this.state.papersPerPage}
                                                     ref={instance => {this.partialList = instance}}
                                />
                            </PanelBody>
                        </Panel>
                    </div>
                </div>
            </div>
        );
    }
}

export default withRouter(Lists);