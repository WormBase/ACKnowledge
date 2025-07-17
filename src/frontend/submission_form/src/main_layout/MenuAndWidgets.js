import React, {useState, useEffect} from 'react';
import {withRouter} from "react-router-dom";
import {SectionsNotCompletedModal, WelcomeModal, CompletedSubmissionModal} from "../components/modals/MainModals";
import DataSavedModal from "../components/modals/DataSavedModal";
import ProgressSavedModal from "../components/modals/ProgressSavedModal";
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
    const [showCompletedModal, setShowCompletedModal] = useState(false);
    const [initialPerson, setInitialPerson] = useState(null);
    const selectedWidget = useSelector((state) => state.widget.selectedWidget);
    
    // Check if all sections are saved
    const allSectionsSaved = useSelector((state) => 
        state.overview.isSavedToDB &&
        state.genetics.isSavedToDB &&
        state.reagent.isSavedToDB &&
        state.expression.isSavedToDB &&
        state.interactions.isSavedToDB &&
        state.phenotypes.isSavedToDB &&
        state.disease.isSavedToDB &&
        state.comments.isSavedToDB
    );
    
    // Get the current person from state
    const currentPerson = useSelector((state) => state.person.person);
    
    // Check if data is loaded
    const paperDataLoaded = useSelector((state) => !state.paper.paperData.isLoading);
    const personDataLoaded = useSelector((state) => !state.person.person.isLoading);
    
    useEffect(() => {
        // When data is loaded and we haven't set the initial person yet
        if (paperDataLoaded && personDataLoaded && currentPerson.name && !initialPerson) {
            setInitialPerson(currentPerson);
            
            // If all sections are saved, show the completed modal instead of welcome
            if (allSectionsSaved) {
                setShowCompletedModal(true);
                setShowPopup(false);
            }
        }
    }, [paperDataLoaded, personDataLoaded, allSectionsSaved, currentPerson, initialPerson]);

    const goToNextSection = () => {
        const newSelectedMenu = Math.min(selectedWidget + 1, pages.length);
        dispatch(setSelectedWidget(newSelectedMenu));
        dispatch(hideDataSaved());
        props.history.push(pages[newSelectedMenu - 1] + props.location.search);
        window.scrollTo(0, 0)
    }

    return (
        <div className="container" style={{maxWidth: '1400px', padding: '0 10px'}}>
            <div className="row" style={{margin: '0 -5px'}}>
                <div className="col-sm-3" style={{padding: '0 5px'}}>
                    <div className="panel panel-default" style={{marginBottom: '10px'}}>
                        <div className="panel-body" style={{padding: '8px'}}>
                            <PersonSelector/>
                        </div>
                    </div>
                    <Menu urlQuery={props.location.search}/>
                </div>
                <div className="col-sm-9" style={{padding: '0 5px', paddingLeft: '15px'}}>
                    <div className="panel panel-default">
                        <div className="panel-body" style={{padding: '12px'}}>
                            <WidgetArea urlQuery={props.location.search} history={props.history}/>
                        </div>
                    </div>
                </div>
                <WelcomeModal show={showPopup && !showCompletedModal} onHide={() => setShowPopup(false)}/>
                <CompletedSubmissionModal 
                    show={showCompletedModal} 
                    onHide={() => setShowCompletedModal(false)}
                    previousAuthor={initialPerson ? initialPerson.name : ""}
                />
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
                <ProgressSavedModal show={useSelector((state) => state.display.progressSaved)} />
            </div>
        </div>
    );
}

export default withRouter(MenuAndWidgets);
