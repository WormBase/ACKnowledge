import React, {useState} from 'react';
import {withRouter} from "react-router-dom";
import {SectionsNotCompletedModal, WelcomeModal} from "../components/modals/MainModals";
import DataSavedModal from "../components/modals/DataSavedModal";
import PersonSelector from "../components/PersonSelector";
import {MENU_INDEX, pages, WIDGET, WIDGET_TITLE} from "../constants";
import {useDispatch, useSelector} from "react-redux";
import {hideDataSaved, hideSectionsNotCompleted} from "../redux/actions/displayActions";
import Menu from "./Menu";
import {setSelectedWidget} from "../redux/actions/widgetActions";
import WidgetArea from "./WidgetArea";

const MenuAndWidgets = (props) => {
    const dispatch = useDispatch();
    const currentLocation = props.location.pathname;
    if (currentLocation !== "" && currentLocation !== "/") {
        dispatch(setSelectedWidget(MENU_INDEX[currentLocation.substring(1)]));
    }
    const [showPopup, setShowPopup] = useState(true);
    const selectedWidget = useSelector((state) => state.widget.selectedWidget);

    const goToNextSection = () => {
        const newSelectedMenu = Math.min(selectedWidget + 1, pages.length);
        dispatch(setSelectedWidget(newSelectedMenu));
        dispatch(hideDataSaved());
        props.history.push(pages[newSelectedMenu - 1] + props.location.search);
        window.scrollTo(0, 0)
    }

    return (
        <div className="container">
            <div className="row">
                <div className="col-sm-4">
                    <Menu urlQuery={props.location.search}/>
                </div>
                <div className="col-sm-8">
                    <div className="panel panel-default">
                        <div className="panel-body">
                            <PersonSelector/>
                        </div>
                    </div>
                    <div className="panel panel-default">
                        <div className="panel-body">
                            <WidgetArea urlQuery={props.location.search} history={props.history}/>
                        </div>
                    </div>
                </div>
                <WelcomeModal show={showPopup} onHide={() => setShowPopup(false)}/>
                <DataSavedModal show={useSelector((state) => state.display.dataSaved).showMessage} goToNextSection={goToNextSection}
                                success={useSelector((state) => state.display.dataSaved).success}
                                last_widget={useSelector((state) => state.display.dataSaved).lastWidget}/>
                <SectionsNotCompletedModal show={useSelector((state) => state.display.sectionsNotCompleted)}
                                           onHide={() => dispatch(hideSectionsNotCompleted())}
                                           sections={[
                                               useSelector((state) => state.overview.isSavedToDB) ? -1 : WIDGET.OVERVIEW,
                                               useSelector((state) => state.genetics.isSavedToDB) ? -1 : WIDGET.GENETICS,
                                               useSelector((state) => state.reagent.isSavedToDB) ? -1 : WIDGET.REAGENT,
                                               useSelector((state) => state.expression.isSavedToDB) ? -1 : WIDGET.EXPRESSION,
                                               useSelector((state) => state.interactions.isSavedToDB) ? -1 : WIDGET.INTERACTIONS,
                                               useSelector((state) => state.phenotypes.isSavedToDB) ? -1 : WIDGET.PHENOTYPES,
                                               useSelector((state) => state.disease.isSavedToDB) ? -1 : WIDGET.DISEASE,
                                               useSelector((state) => state.comments.isSavedToDB) ? -1 : WIDGET.COMMENTS
                                           ].filter((widgetIdx) => widgetIdx !== -1 && widgetIdx !== WIDGET.COMMENTS).map((idx) => WIDGET_TITLE[idx])}/>
            </div>
        </div>
    );
}

export default withRouter(MenuAndWidgets);
