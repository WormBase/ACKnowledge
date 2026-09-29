export const CLASSIFIER_STATS_WARNING = "Classifier statistics are unavailable until the ABC statistics endpoints " +
    "are available (SCRUM-6600).";
export const CLASSIFICATION_FILTERS_WARNING = "Automated classification filters are unavailable until ACKnowledge " +
    "status is available as workflow tags in the ABC (SCRUM-6594, SCRUM-6599).";
export const MANUAL_ONLY = "manual only";

// the dashboard API sends booleans as the strings "True" and "False"
export const isChecked = (value) => value === true || value === "True";

// the value shown in the "Extracted by ACKnowledge" column of the flagged tab
export const classifierValue = (svmChecked, manualOnly) => {
    if (manualOnly) {
        return MANUAL_ONLY;
    }
    return isChecked(svmChecked) ? "True" : "False";
};

// "N/A" when the author didn't answer or there is no automated value to compare with
export const authorChanged = (tfpChecked, afpChecked, afpDetails) => {
    const hasAuthorAnswer = afpDetails !== "'null'" && afpDetails !== "null";
    const hasAutomatedValue = tfpChecked === "True" || tfpChecked === "False";
    if (!hasAuthorAnswer || !hasAutomatedValue) {
        return "N/A";
    }
    return tfpChecked !== afpChecked ? "Yes" : "No";
};

export const isUnavailable = (response) => Boolean(response && response.data && response.data.unavailable);

export const predictedFlagsUnavailable = (tsData) =>
    tsData.some(item => item[1].flags_pred_vs_author_accuracy === null);
