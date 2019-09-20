import React from 'react';
import LoadingOverlay from 'react-loading-overlay';
import {
    Badge, Button, Col, Container,
    Form, FormControl,
    ListGroup,
    ListGroupItem,
    Pagination, Row
} from "react-bootstrap";
import {Link} from "react-router-dom";

function withPaginatedList(WrappedComponent, DataManager) {

    return class extends React.Component {
        constructor(props, context) {
            super(props, context);
            this.state = {
                list_elements: [],
                num_elements: 0,
                from_offset: 0,
                active_page: 1,
                cx: 0,
                isLoading: false,
                refresh_list: this.props.refreshList,
                pageValidationState: false
            };
            this.refreshData = this.refreshData.bind(this);
            this.refreshList = this.refreshList.bind(this);
            this.goToPage = this.goToPage.bind(this);
        }

        componentDidMount() {
            this.refreshData();
        }

        componentDidUpdate() {
            if (this.state.refresh_list === true) {
                this.refreshData();
                this.setState({refresh_list: false});
            }
        }

        componentWillReceiveProps(nextProps, nextContext) {
            this.refreshData();
        }

        refreshList() {
            this.setState({active_page: 1, from_offset: 0, refresh_list: true});
        }

        goToPage() {
            if (this.state.pageValidationState) {
                this.setState({
                    active_page: this.state.active_page_tmp,
                    from_offset: (this.state.active_page_tmp - 1) * this.props.elemPerPage,
                    refresh_list: true
                });
            }
        }

        refreshData() {
            this.setState({isLoading: true});
            let payload = {
                from: this.state.from_offset,
                count: this.props.papersPerPage,
                list_type: this.props.listType,
                svm_filters: [...this.props.svmFilters].join(','),
                manual_filters: [...this.props.manualFilters].join(',')
            };
            DataManager.loadDataFromAPI();
            this.setState({
                list_elements: DataManager.getListFromAPI(),
                num_elements: DataManager.getNumFromAPI(),
                isLoading: false
            });
        }

        render() {
            const maxNumPagesToDisplay = 5;
            const totNumPages = Math.ceil(this.state.num_elements / this.props.elemPerPage);
            const firstDisplayedPage = Math.max(Math.min(this.state.active_page -
                Math.floor(maxNumPagesToDisplay / 2), totNumPages - maxNumPagesToDisplay + 1), 1);
            const lastDisplayedPage = Math.min(totNumPages, firstDisplayedPage + maxNumPagesToDisplay - 1);
            let items = [];
            if (firstDisplayedPage > 1) {
                items.push(
                    <Pagination.Ellipsis onClick={() => {
                        this.setState({
                            active_page: firstDisplayedPage - 1,
                            from_offset: (firstDisplayedPage - 2) * this.props.elemPerPage,
                            refresh_list: true
                        });
                    }}/>);
            }

            for (let number = firstDisplayedPage; number <= lastDisplayedPage; number++) {
                items.push(
                    <Pagination.Item key={number} active={number === this.state.active_page}
                                     onClick={() => {
                                         this.setState({
                                             active_page: number,
                                             from_offset: (number - 1) * this.props.elemPerPage,
                                             refresh_list: true
                                         });
                                     }}>
                        {number}
                    </Pagination.Item>,
                );
            }
            if (totNumPages > lastDisplayedPage) {
                items.push(
                    <Pagination.Ellipsis onClick={() => {
                        this.setState({
                            active_page: lastDisplayedPage + 1,
                            from_offset: (lastDisplayedPage) * this.props.elemPerPage,
                            refresh_list: true
                        });
                    }}/>);
            }
            return (
                <Container>
                    <LoadingOverlay
                        active={this.state.isLoading}
                        spinner
                        text='Loading paper data...'
                        styles={{
                            overlay: (base) => ({
                                ...base,
                                background: 'rgba(65,105,225,0.5)'
                            })
                        }}
                    >
                        <Row>
                            <Col sm="12">
                                <Form.Label># of papers in this list:</Form.Label> <Badge
                                variant="secondary">{this.state.num_elements}</Badge>
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
                                        this.setState({
                                            active_page: 1,
                                            from_offset: 0,
                                            refresh_list: true
                                        })
                                    }}/>
                                    <Pagination.Prev onClick={() => {
                                        if (this.state.active_page > 1) {
                                            this.setState({
                                                active_page: this.state.active_page - 1,
                                                from_offset: parseInt(this.state.from_offset) - parseInt(this.props.elemPerPage),
                                                refresh_list: true
                                            })
                                        }
                                    }}/>
                                    {items}
                                    <Pagination.Next onClick={() => {
                                        if (this.state.active_page < Math.ceil(this.state.num_elements / this.props.elemPerPage)) {
                                            this.setState({
                                                active_page: this.state.active_page + 1,
                                                from_offset: parseInt(this.state.from_offset) + parseInt(this.props.elemPerPage),
                                                refresh_list: true
                                            });
                                        }
                                    }}/>
                                    <Pagination.Last onClick={() => {
                                        this.setState({
                                            active_page: Math.ceil(this.state.num_elements / this.props.elemPerPage),
                                            from_offset: (Math.ceil(this.state.num_elements / this.props.elemPerPage) - 1) * this.props.elemPerPage,
                                            refresh_list: true
                                        })
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
                                                            active_page_tmp: parseFloat(event.target.value),
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
                                                    this.goToPage()
                                                }
                                            }}
                                        />
                                        <Button variant="outline-primary" size="sm" onClick={() => {
                                            this.goToPage()
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
                                    {[...this.state.list_elements].map(item =>
                                        <ListGroupItem>
                                            <WrappedComponent item={item}/>
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