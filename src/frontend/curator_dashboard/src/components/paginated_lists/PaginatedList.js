import React from 'react';
import LoadingOverlay from 'react-loading-overlay';
import {
    Badge, Button, Col, Container,
    Form, FormControl,
    ListGroup,
    ListGroupItem,
    Pagination, Row
} from "react-bootstrap";

function withPaginatedList(WrappedComponent) {

    return class extends React.Component {
        constructor(props, context) {
            super(props, context);
            this.state = {
                elements: [],
                totNumElements: 0,
                cx: 0,
                isLoading: false,
                pageValidationState: false,
                activePage: 1
            };
            this.loadData = this.loadData.bind(this);
            this.resetList = this.resetList.bind(this);
            this.goToPage = this.goToPage.bind(this);
        }

        componentDidMount() {
            this.loadData(0);
        }

        componentWillReceiveProps(nextProps, nextContext) {
            this.resetList();
        }

        resetList() {
            this.setState({activePage: 1});
            this.loadData(0);
        }

        goToPage(pageNum) {
            if (this.state.pageValidationState) {
                this.setState({
                    activePage: pageNum});
                this.loadData((pageNum - 1) * this.props.elemPerPage);
            }
        }

        loadData(offset) {
            this.setState({isLoading: true});
            let svmFilters = "";
            if (this.props.svmFilters !== undefined) {
                svmFilters = [...this.props.svmFilters].join(',');
            }
            let manualFilters = "";
            if (this.props.manualFilters !== undefined) {
                manualFilters = [...this.props.manualFilters].join(',');
            }
            let curationFilters = "";
            if (this.props.curationFilters !== undefined) {
                curationFilters = [...this.props.curationFilters].join(',');
            }
            let listType = "";
            if (this.props.listType !== undefined) {
                listType = this.props.listType;
            }
            let payload = {
                from: offset,
                count: this.props.elemPerPage,
                list_type: listType,
                svm_filters: svmFilters,
                manual_filters: manualFilters,
                curation_filters: curationFilters
            };
            fetch(this.props.endpoint, {
                method: 'POST',
                headers: {
                    'Accept': 'text/html',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            }).then(res => {
                if (res.status === 200) {
                    return res.json();
                } else {
                        alert("Error")
                }
            }).then(data => {
                if (data === undefined) {
                    alert("Empty response")
                }
                this.setState({
                    elements: data["list_elements"],
                    totNumElements: data["total_num_elements"],
                    isLoading: false
                });
            }).catch((err) => {
                alert(err);
            });
        }

        render() {
            const maxNumPagesToDisplay = 5;
            const totNumPages = Math.ceil(this.state.totNumElements / this.props.elemPerPage);
            const firstDisplayedPage = Math.max(Math.min(this.state.activePage -
                Math.floor(maxNumPagesToDisplay / 2), totNumPages - maxNumPagesToDisplay + 1), 1);
            const lastDisplayedPage = Math.min(totNumPages, firstDisplayedPage + maxNumPagesToDisplay - 1);
            let items = [];
            if (firstDisplayedPage > 1) {
                items.push(
                    <Pagination.Ellipsis onClick={() => {
                        this.setState({
                            activePage: firstDisplayedPage - 1,
                        });
                        this.loadData((firstDisplayedPage - 2) * this.props.elemPerPage);
                    }}/>);
            }

            for (let number = firstDisplayedPage; number <= lastDisplayedPage; number++) {
                items.push(
                    <Pagination.Item key={number} active={number === this.state.activePage}
                                     onClick={() => {
                                         this.setState({
                                             activePage: number
                                         });
                                         this.loadData((number - 1) * this.props.elemPerPage);
                                     }}>
                        {number}
                    </Pagination.Item>,
                );
            }
            if (totNumPages > lastDisplayedPage) {
                items.push(
                    <Pagination.Ellipsis onClick={() => {
                        this.setState({
                            activePage: lastDisplayedPage + 1
                        });
                        this.loadData((lastDisplayedPage) * this.props.elemPerPage);
                    }}/>);
            }
            return (
                <Container>
                    <LoadingOverlay
                        active={this.state.isLoading}
                        spinner
                        text='Loading data...'
                        styles={{
                            overlay: (base) => ({
                                ...base,
                                background: 'rgba(65,105,225,0.5)'
                            })
                        }}
                    >
                        <Row>
                            <Col sm="12">
                                <Form.Label># of elements in this list:</Form.Label> <Badge
                                variant="secondary">{this.state.totNumElements}</Badge>
                            </Col>
                        </Row>
                        <Row>
                            <Col sm="12">
                                &nbsp;
                            </Col>
                        </Row>
                        <Row>
                            <Col sm="12">
                                <Pagination size="sm">
                                    <Pagination.First onClick={() => {
                                        this.resetList();
                                    }}/>
                                    <Pagination.Prev onClick={() => {
                                        if (this.state.activePage > 1) {
                                            this.setState({
                                                activePage: this.state.activePage - 1});
                                            this.loadData(parseInt(this.state.offset) - parseInt(this.props.elemPerPage));
                                        }
                                    }}/>
                                    {items}
                                    <Pagination.Next onClick={() => {
                                        if (this.state.activePage < Math.ceil(this.state.totNumElements / this.props.elemPerPage)) {
                                            this.setState({
                                                activePage: this.state.activePage + 1});
                                            this.loadData(parseInt(this.state.offset) + parseInt(this.props.elemPerPage));
                                        }
                                    }}/>
                                    <Pagination.Last onClick={() => {
                                        this.setState({
                                            activePage: Math.ceil(this.state.totNumElements / this.props.elemPerPage)});
                                        this.loadData((Math.ceil(this.state.totNumElements / this.props.elemPerPage) - 1) * this.props.elemPerPage);
                                    }}/>
                                </Pagination>
                            </Col>
                        </Row>
                        <Row>
                            <Col sm="12">
                                Go to page:
                                <Form onSubmit={e => e.preventDefault()} inline>
                                    <Form.Group>
                                        <FormControl
                                            type="text" autoComplete="off" size="sm"
                                            placeholder={"1.." + totNumPages} style={{maxWidth: '80px'}}
                                            onInput={(event) => {
                                                if (event.target.value !== "") {
                                                    let pageNum = parseFloat(event.target.value);
                                                    if (!event.target.value.includes(",") && !event.target.value.includes(".") &&
                                                        !isNaN(pageNum) && isFinite(pageNum) && pageNum > 0 && pageNum <= totNumPages) {
                                                        this.setState({
                                                            activePageTmp: parseFloat(event.target.value),
                                                            pageValidationState: true
                                                        })
                                                    } else {
                                                        this.setState({
                                                            pageValidationState: false
                                                        })
                                                    }
                                                } else {
                                                    this.setState({
                                                        pageValidationState: true
                                                    })
                                                }
                                            }}
                                            onKeyPress={(target) => {
                                                if (target.key === 'Enter') {
                                                    this.goToPage(this.state.activePageTmp)
                                                }
                                            }}
                                        />
                                        <Button variant="outline-primary" size="sm" onClick={() => {
                                            this.goToPage(this.state.activePageTmp)
                                        }}>Go</Button>
                                    </Form.Group>
                                </Form>
                            </Col>
                        </Row>
                        <Row>
                            <Col sm="12">
                                &nbsp;
                            </Col>
                        </Row>
                        <Row>
                            <Col sm="12">
                                <ListGroup>
                                    {[...this.state.elements].map(element =>
                                        <ListGroupItem>
                                            <WrappedComponent element={element}/>
                                        </ListGroupItem>)
                                    }
                                </ListGroup>
                            </Col>
                        </Row>
                    </LoadingOverlay>
                </Container>
            );
        }
    }
}

export default withPaginatedList;