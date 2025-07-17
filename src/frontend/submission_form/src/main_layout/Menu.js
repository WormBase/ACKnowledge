import React from 'react';
import {Nav, NavItem} from "react-bootstrap";
import {IndexLinkContainer} from "react-router-bootstrap";
import Glyphicon from "react-bootstrap/lib/Glyphicon";
import {MENU_INDEX, WIDGET, WIDGET_TITLE} from "../constants";
import {useDispatch, useSelector} from "react-redux";
import {setSelectedWidget} from "../redux/actions/widgetActions";

const Menu = ({urlQuery}) => {
    const dispatch = useDispatch();
    return (
        <div>
            <div className="panel panel-default" style={{marginBottom: '10px'}}>
                <div className="panel-body">
                    <Nav bsStyle="pills" stacked onSelect={(sel) => dispatch(setSelectedWidget(sel))}>
                        <IndexLinkContainer to={WIDGET.OVERVIEW + urlQuery}
                                            active={useSelector((state) => state.widget.selectedWidget) === MENU_INDEX[WIDGET.OVERVIEW]}>
                            <NavItem
                                eventKey={MENU_INDEX[WIDGET.OVERVIEW]}>{WIDGET_TITLE[WIDGET.OVERVIEW]}
                                &nbsp;{useSelector((state) => state.overview.isSavedToDB) ?
                                    <Glyphicon glyph="ok"/> : false}
                            </NavItem></IndexLinkContainer>
                        <IndexLinkContainer to={WIDGET.GENETICS + urlQuery}
                                            active={useSelector((state) => state.widget.selectedWidget) === MENU_INDEX[WIDGET.GENETICS]}>
                            <NavItem
                                eventKey={MENU_INDEX[WIDGET.GENETICS]}>{WIDGET_TITLE[WIDGET.GENETICS]}
                                &nbsp;{useSelector((state) => state.genetics.isSavedToDB) ?
                                    <Glyphicon glyph="ok"/> : false}
                            </NavItem>
                        </IndexLinkContainer>
                        <IndexLinkContainer to={WIDGET.REAGENT + urlQuery}
                                            active={useSelector((state) => state.widget.selectedWidget) === MENU_INDEX[WIDGET.REAGENT]}>
                            <NavItem
                                eventKey={MENU_INDEX[WIDGET.REAGENT]}>{WIDGET_TITLE[WIDGET.REAGENT]}
                                &nbsp;{useSelector((state) => state.reagent.isSavedToDB) ?
                                    <Glyphicon glyph="ok"/> : false}</NavItem>
                        </IndexLinkContainer>
                        <IndexLinkContainer to={WIDGET.EXPRESSION + urlQuery}
                                            active={useSelector((state) => state.widget.selectedWidget) === MENU_INDEX[WIDGET.EXPRESSION]}>
                            <NavItem
                                eventKey={MENU_INDEX[WIDGET.EXPRESSION]}>{WIDGET_TITLE[WIDGET.EXPRESSION]}
                                &nbsp;{useSelector((state) => state.expression.isSavedToDB) ?
                                    <Glyphicon glyph="ok"/> : false}</NavItem>
                        </IndexLinkContainer>
                        <IndexLinkContainer to={WIDGET.INTERACTIONS + urlQuery}
                                            active={useSelector((state) => state.widget.selectedWidget) === MENU_INDEX[WIDGET.INTERACTIONS]}>
                            <NavItem
                                eventKey={MENU_INDEX[WIDGET.INTERACTIONS]}>{WIDGET_TITLE[WIDGET.INTERACTIONS]}
                                &nbsp;{useSelector((state) => state.interactions.isSavedToDB) ?
                                    <Glyphicon glyph="ok"/> : false}</NavItem>
                        </IndexLinkContainer>
                        <IndexLinkContainer to={WIDGET.PHENOTYPES + urlQuery}
                                            active={useSelector((state) => state.widget.selectedWidget) === MENU_INDEX[WIDGET.PHENOTYPES]}>
                            <NavItem
                                eventKey={MENU_INDEX[WIDGET.PHENOTYPES]}>{WIDGET_TITLE[WIDGET.PHENOTYPES]}
                                &nbsp;{useSelector((state) => state.phenotypes.isSavedToDB) ?
                                    <Glyphicon glyph="ok"/> : false}</NavItem>
                        </IndexLinkContainer>
                        <IndexLinkContainer to={WIDGET.DISEASE + urlQuery}
                                            active={useSelector((state) => state.widget.selectedWidget) === MENU_INDEX[WIDGET.DISEASE]}>
                            <NavItem
                                eventKey={MENU_INDEX[WIDGET.DISEASE]}>{WIDGET_TITLE[WIDGET.DISEASE]}&nbsp;
                                {useSelector((state) => state.disease.isSavedToDB) ?
                                    <Glyphicon glyph="ok"/> : false}</NavItem>
                        </IndexLinkContainer>
                        <IndexLinkContainer to={WIDGET.COMMENTS + urlQuery}
                                            active={useSelector((state) => state.widget.selectedWidget) === MENU_INDEX[WIDGET.COMMENTS]}>
                            <NavItem
                                eventKey={MENU_INDEX[WIDGET.COMMENTS]}>{WIDGET_TITLE[WIDGET.COMMENTS]}
                                &nbsp;{useSelector((state) => state.comments.isSavedToDB) ?
                                    <Glyphicon glyph="ok"/> : false}</NavItem>
                        </IndexLinkContainer>
                    </Nav>
                </div>
            </div>
            
            <div className="panel panel-default">
                <div className="panel-body">
                    <Nav bsStyle="pills" stacked onSelect={(sel) => dispatch(setSelectedWidget(sel))}>
                        <IndexLinkContainer to={WIDGET.ABOUT + urlQuery}
                                            active={useSelector((state) => state.widget.selectedWidget) === MENU_INDEX[WIDGET.ABOUT]}>
                            <NavItem
                                eventKey={MENU_INDEX[WIDGET.ABOUT]}>{WIDGET_TITLE[WIDGET.ABOUT]}
                            </NavItem></IndexLinkContainer>
                        <IndexLinkContainer to={WIDGET.HELP + urlQuery}
                                            active={useSelector((state) => state.widget.selectedWidget) === MENU_INDEX[WIDGET.HELP]}>
                            <NavItem
                                eventKey={MENU_INDEX[WIDGET.HELP]}>{WIDGET_TITLE[WIDGET.HELP]}
                            </NavItem></IndexLinkContainer>
                        <NavItem href="https://www.youtube.com/embed/ZONK4qe_-w8?start=86&end=1011" target="_blank">
                            WormBase Community Curation Webinar <Glyphicon glyph="new-window"/>
                        </NavItem>
                        <NavItem href="mailto:help.acknowledge@wormbase.org">
                            Contact us <Glyphicon glyph="envelope"/>
                        </NavItem>
                        <IndexLinkContainer to={WIDGET.RELEASE_NOTES + urlQuery}
                                            active={useSelector((state) => state.widget.selectedWidget) === MENU_INDEX[WIDGET.RELEASE_NOTES]}>
                            <NavItem
                                eventKey={MENU_INDEX[WIDGET.RELEASE_NOTES]}>{WIDGET_TITLE[WIDGET.RELEASE_NOTES]}
                            </NavItem></IndexLinkContainer>
                    </Nav>
                </div>
            </div>
        </div>
    );
}

export default Menu;