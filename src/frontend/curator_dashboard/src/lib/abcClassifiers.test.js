import {authorChanged, classifierValue, isChecked, isUnavailable, MANUAL_ONLY,
    predictedFlagsUnavailable} from "./abcClassifiers";

it("only counts True as checked", () => {
    expect(isChecked("True")).toBe(true);
    expect(isChecked(true)).toBe(true);
    ["False", "N/A", MANUAL_ONLY, "null", undefined, false].forEach(value => expect(isChecked(value)).toBe(false));
});

it("shows the pre-check value or manual only", () => {
    expect(classifierValue("True", false)).toBe("True");
    expect(classifierValue("False", false)).toBe("False");
    expect(classifierValue("True", true)).toBe(MANUAL_ONLY);
});

it("says whether the author changed an automated value", () => {
    expect(authorChanged("True", "False", "")).toBe("Yes");
    expect(authorChanged("True", "True", "")).toBe("No");
    expect(authorChanged("True", "True", "null")).toBe("N/A");
    expect(authorChanged(MANUAL_ONLY, "True", "details")).toBe("N/A");
});

it("detects unavailable statistics", () => {
    expect(isUnavailable({data: {unavailable: true, reason: "x"}})).toBe(true);
    expect(isUnavailable({data: {"Expression": {}}})).toBe(false);
    expect(isUnavailable(undefined)).toBe(false);
    expect(predictedFlagsUnavailable([["2025", {flags_pred_vs_author_accuracy: null}]])).toBe(true);
    expect(predictedFlagsUnavailable([["2025", {flags_pred_vs_author_accuracy: 80}]])).toBe(false);
});
