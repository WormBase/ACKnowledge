export const WIDGET = Object.freeze({
    OVERVIEW: "overview",
    GENETICS: "genetics",
    REAGENT: "reagent",
    EXPRESSION: "expression",
    INTERACTIONS: "interactions",
    PHENOTYPES: "phenotypes",
    DISEASE: "disease",
    COMMENTS: "comments",
    ABOUT: "about",
    HELP: "help",
    RELEASE_NOTES: "release_notes"
});

export const MENU_INDEX = {};
MENU_INDEX[WIDGET.OVERVIEW] = 1;
MENU_INDEX[WIDGET.GENETICS] = 2;
MENU_INDEX[WIDGET.REAGENT] = 3;
MENU_INDEX[WIDGET.EXPRESSION] = 4;
MENU_INDEX[WIDGET.INTERACTIONS] = 5;
MENU_INDEX[WIDGET.PHENOTYPES] = 6;
MENU_INDEX[WIDGET.DISEASE] = 7;
MENU_INDEX[WIDGET.COMMENTS] = 8;
MENU_INDEX[WIDGET.ABOUT] = 9;
MENU_INDEX[WIDGET.HELP] = 10;
MENU_INDEX[WIDGET.RELEASE_NOTES] = 11;

export const WIDGET_TITLE = {};
WIDGET_TITLE[WIDGET.OVERVIEW] = "Overview (genes and species)";
WIDGET_TITLE[WIDGET.GENETICS] = "Genetics";
WIDGET_TITLE[WIDGET.REAGENT] = "Reagent";
WIDGET_TITLE[WIDGET.EXPRESSION] = "Expression";
WIDGET_TITLE[WIDGET.INTERACTIONS] = "Interactions";
WIDGET_TITLE[WIDGET.PHENOTYPES] = "Phenotypes and function";
WIDGET_TITLE[WIDGET.DISEASE] = "Disease";
WIDGET_TITLE[WIDGET.COMMENTS] = "Comments and submit";
WIDGET_TITLE[WIDGET.ABOUT] = "About";
WIDGET_TITLE[WIDGET.HELP] = "FAQ";
WIDGET_TITLE[WIDGET.RELEASE_NOTES] = "Release Notes";

export const pages = [WIDGET.OVERVIEW, WIDGET.GENETICS, WIDGET.REAGENT, WIDGET.EXPRESSION,
        WIDGET.INTERACTIONS, WIDGET.PHENOTYPES, WIDGET.DISEASE, WIDGET.COMMENTS];