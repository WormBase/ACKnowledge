import React from 'react';
import {Redirect, Route, withRouter} from "react-router-dom";
import Overview from "../pages/Overview";
import Expression from "../pages/Expression";
import {Nav, NavItem} from "react-bootstrap";
import {IndexLinkContainer} from "react-router-bootstrap";
import Other from "../pages/Other";
import Reagent from "../pages/Reagent";
import Phenotypes from "../pages/Phenotypes";
import Interactions from "../pages/Interactions";
import Genetics from "../pages/Genetics";
import Glyphicon from "react-bootstrap/es/Glyphicon";
import ContactInfo from "../pages/ContactInfo";

class MenuAndWidgets extends React.Component {
    constructor(props) {
        super(props);
        let currSelectedMenu = 1;
        const currentLocation = props.location.pathname;
        switch (currentLocation) {
            case "/overview":
                currSelectedMenu = 1;
                break;
            case "/expression":
                currSelectedMenu = 2;
                break;
            case "/genetics":
                currSelectedMenu = 3;
                break;
            case "/interactions":
                currSelectedMenu = 4;
                break;
            case "/phenotypes":
                currSelectedMenu = 5;
                break;
            case "/reagent":
                currSelectedMenu = 6;
                break;
            case "/other":
                currSelectedMenu = 7;
                break;
            case "/contact_info":
                currSelectedMenu = 8;
                break;
            default:
                currSelectedMenu = 1;
        }
        this.state = {
            pages: ["overview", "expression", "genetics", "interactions", "phenotypes", "reagent", "other",
                "contact_info"],
            selectedMenu: currSelectedMenu,
            completedSections: {"overview": false, "expression": false, "genetics": false, "interactions": false,
                "phenotypes": false, "reagent": false, "other": false, "contact_info": false}
        };
        this.handleSelectMenu = this.handleSelectMenu.bind(this);
        this.handleFinishedSection = this.handleFinishedSection.bind(this);
    }

    handleSelectMenu(selected) {
        this.setState({
            selectedMenu: selected
        });
    }

    handleFinishedSection(section) {
        const newCompletedSections = this.state.completedSections;
        newCompletedSections[section] = true;
        const newSelectedMenu = Math.min(this.state.selectedMenu + 1, this.state.pages.length);
        this.setState({completedSections: newCompletedSections, selectedMenu: newSelectedMenu});
        this.props.history.push(this.state.pages[newSelectedMenu - 1]);
    }

    render() {
        let overviewOk = false;
        if (this.state.completedSections["overview"]) {
            overviewOk = <Glyphicon glyph="ok"/>;
        }
        let expressionOk = false;
        if (this.state.completedSections["expression"]) {
            expressionOk = <Glyphicon glyph="ok"/>;
        }
        let geneticsOk = false;
        if (this.state.completedSections["genetics"]) {
            geneticsOk = <Glyphicon glyph="ok"/>;
        }
        let interactionsOk = false;
        if (this.state.completedSections["interactions"]) {
            interactionsOk = <Glyphicon glyph="ok"/>;
        }
        let phenotypesOk = false;
        if (this.state.completedSections["phenotypes"]) {
            phenotypesOk = <Glyphicon glyph="ok"/>;
        }
        let reagentOk = false;
        if (this.state.completedSections["reagent"]) {
            reagentOk = <Glyphicon glyph="ok"/>;
        }
        let otherOk = false;
        if (this.state.completedSections["other"]) {
            otherOk = <Glyphicon glyph="ok"/>;
        }
        let contact_infoOk = false;
        if (this.state.completedSections["contact_info"]) {
            contact_infoOk = <Glyphicon glyph="ok"/>;
        }
        return (
            <div>
                <div className="col-sm-4">
                    <div className="panel panel-default">
                        <div className="panel-body">
                            <Nav bsStyle="pills" stacked onSelect={this.handleSelectMenu}>
                                <IndexLinkContainer to="overview"
                                                    active={this.state.selectedMenu === 1}>
                                    <NavItem eventKey={1}>Overview (Genes and Species)
                                        &nbsp;{overviewOk}
                                    </NavItem></IndexLinkContainer>
                                <IndexLinkContainer to="genetics" active={this.state.selectedMenu === 3}>
                                    <NavItem eventKey={3}>Genetics&nbsp;{geneticsOk}</NavItem></IndexLinkContainer>
                                <IndexLinkContainer to="reagent" active={this.state.selectedMenu === 6}>
                                    <NavItem eventKey={6}>Reagent&nbsp;{reagentOk}</NavItem></IndexLinkContainer>
                                <IndexLinkContainer to="expression" active={this.state.selectedMenu === 2}>
                                    <NavItem eventKey={2}>Expression&nbsp;{expressionOk}</NavItem>
                                </IndexLinkContainer>
                                <IndexLinkContainer to="interactions" active={this.state.selectedMenu === 4}>
                                    <NavItem eventKey={4}>Interactions&nbsp;{interactionsOk}</NavItem>
                                </IndexLinkContainer>
                                <IndexLinkContainer to="phenotypes" active={this.state.selectedMenu === 5}>
                                    <NavItem eventKey={5}>Phenotypes and function&nbsp;{phenotypesOk}</NavItem>
                                </IndexLinkContainer>
                                <IndexLinkContainer to="other" active={this.state.selectedMenu === 7}>
                                    <NavItem eventKey={7}>Anything else?&nbsp;{otherOk}</NavItem></IndexLinkContainer>
                                <IndexLinkContainer to="contact_info" active={this.state.selectedMenu === 8}>
                                    <NavItem eventKey={8}>Update contact info&nbsp;{contact_infoOk}</NavItem>
                                </IndexLinkContainer>
                            </Nav>
                        </div>
                    </div>
                </div>
                <div className="col-sm-8">
                    <div className="panel panel-default">
                        <div className="panel-body">
                            <Route exact path="/" render={() => (<Redirect to="/overview"/>)}/>
                            <Route path="/overview"
                                   render={() => <Overview callback={this.handleFinishedSection}/>}/>
                            <Route path="/genetics" render={() => <Genetics callback={this.handleFinishedSection}/>}/>
                            <Route path="/reagent" render={() => <Reagent callback={this.handleFinishedSection}/>}/>
                            <Route path="/expression"
                                   render={() => <Expression callback={this.handleFinishedSection}/>}/>
                            <Route path="/interactions" render={() => <Interactions
                                callback={this.handleFinishedSection}/>}/>
                            <Route path="/phenotypes" render={() => <Phenotypes
                                callback={this.handleFinishedSection}/>}/>
                            <Route path="/other" render={() => <Other callback={this.handleFinishedSection}/>}/>
                            <Route path="/contact_info" render={() => <ContactInfo callback={this.handleFinishedSection}/>}/>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default withRouter(MenuAndWidgets);