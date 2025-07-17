/**
 * generic AFP value object
 */
export class AFPValues {
    constructor(prevSaved) {
        this._prevSaved = prevSaved;
    }

    prevSaved() {
        return this._prevSaved;
    }
}

/**
 * AFP value object containing list of elements
 */
export class EntityList extends AFPValues{
    constructor(entities, prevSaved) {
        super(prevSaved);
        this._entities = entities;
    }
    entities() {
        return this._entities;
    }
}

/**
 * AFP value object representing a checkbox value with its detail text
 */
export class CheckboxWithDetails extends AFPValues{
    constructor(isCheched, details, prevSaved) {
        super(prevSaved);
        this._isChecked = isCheched;
        this._details = details;
    }
    isChecked() {
        return this._isChecked;
    }
    details() {
        return this._details;
    }
}

/**
 * get the value to be stored in the data base from a checkbox and its details field
 *
 * @param {boolean} checkbox
 * @param {string} details
 */
export function getCheckboxDBVal(checkbox, details = "") {
    if (details !== "") {
        return details;
    } else {
        return checkbox ? "checked" : "";
    }
}

/**
 * extract an array of entities from a string read from TFP tables in WB data base.
 *
 * list of entities in TFP tables in WB DB  in string format, separated by pipes with whitespaces (" | "). Each
 * entity can also have an ID or other additional information within it. The special character separator ;%; is used
 * to separate entities from their respective additional data.
 *
 * @param {string} entitiesString a string containing a list of entities, in WB data base format
 * @param {string} prefix an optional prefix to be added to the additional information in the entities (e.g., WBGene for gene
 * ids, which are usually stored in the DB without prefix)
 * @returns {string[]} an array of entities, in the form "entity_name ( entity_extra_info )", where the round
 * brackets and the extra_info field are returned only if additional information is present for the entities
 */
export function extractEntitiesFromTfpString(entitiesString, prefix) {
    let entities_split = entitiesString.split(" | ");
    let final_entities_list = [];
    for (let i in entities_split) {
        let entity_split = entities_split[i].split(";%;");
        if (entity_split.length > 1) {
            final_entities_list.push(entity_split[1] + " ( " + prefix + entity_split[0] + " )");
        } else {
            final_entities_list.push(entity_split[0])
        }
    }
    return final_entities_list;
}

/**
 * create a string in AFP format from an array of entities.
 *
 * @param {string[]} entitiesList a list of entities
 * @param {string} prefix an optional prefix to be removed from the additional information in the entities (e.g.,
 * WBGene for gene ids, which are usually stored in the DB without prefix)
 * @returns {string} a string containing the list of entities in AFP format, ready to be stored in the DB
 */
export function transformEntitiesIntoAfpString(entitiesList, prefix) {
    const addInfoRegex = / \( ([^ ]+) \)( \[[^ ]+\])?$/;
    let entity;
    let addInfo = "";
    let results = [];
    for (entity of entitiesList) {
        // Trim whitespace to handle trailing spaces
        entity = entity.trim();
        if (addInfoRegex.test(entity)) {
            addInfo = addInfoRegex.exec(entity)[1];
            entity = entity.replace(addInfoRegex, "");
            addInfo = addInfo.replace(prefix, "");
            results.push(addInfo + ";%;" + entity);
        } else {
            results.push(entity);
        }
    }
    return results.join(" | ");
}

/**
 * get a set of entities for a specific data type from a data object returned by WB API
 *
 * WB API returns a data object with all tfp_*, afp_*, and svm_* tables and their values for a specific paper. This
 * function extracts a set of entities for a data type if the latter has values in afp_ or tfp_ tables. Afp tables
 * are searched first; if their values are undefined or null, tfp tables are searched next.
 *
 * @param {string} afpString string containing data for a data type coming from afp tables
 * @param {string} tfpString string containing data for a data type coming from tfp tables
 * @param {string} entityPrefix optional prefix to be attached to additional information for each entity
 * @returns {EntityList} an object containing the set of entities in first position and a boolean indicating
 * whether the data came from afp tables
 */
export function getSetOfEntitiesFromWBAPIData(afpString, tfpString, entityPrefix) {
    if (afpString !== undefined && afpString.afp !== undefined && afpString.afp !== null) {
        if (afpString.afp !== "") {
            if (entityPrefix !== undefined) {
                return new EntityList(extractEntitiesFromTfpString(afpString.afp, entityPrefix),
                    true);
            } else {
                return new EntityList(afpString.afp.split(" | "), true);
            }
        } else {
            return new EntityList(new Set(), true);
        }
    } else if (tfpString !== undefined && tfpString.tfp !== undefined && tfpString.tfp !== "" &&
        tfpString.tfp !== null) {
        if (entityPrefix !== undefined) {
            return new EntityList(extractEntitiesFromTfpString(tfpString.tfp, entityPrefix), false);
        } else {
            return new EntityList(tfpString.tfp.split(" | "), false);
        }
    } else {
        return new EntityList(new Set(), false)
    }
}

/**
 * get a checkbox value with its associated text for a specific data type from a data object returned by WB API
 *
 * WB API returns a data object with all tfp_*, afp_*, and svm_* tables and their values for a specific paper. This
 * function extracts a checkbox value with its optional text for a data type if the latter has values in afp_ or
 * svm_ tables. Afp tables are searched first; if their values are undefined or null, svm tables are searched next.
 *
 * This function can be used also to retrieve the value of a textual field. In this case the checkbox value is
 * set to true if the text is not empty.
 *
 * @param {string} afpString string containing data for a data type coming from afp tables
 * @param {string} svmString string containing data for a data type coming from svm tables
 * @returns {CheckboxWithDetails} an object containing the checkbox value, the text associated with the checkbox
 * or the value of a textual field in second position, and whether the values come from afp tables
 */
export function getCheckbxOrSingleFieldFromWBAPIData(afpString, svmString) {
    if (afpString !== undefined && afpString.afp !== undefined && afpString.afp !== null) {
        if (afpString.afp !== "") {
            let details = afpString.afp === "checked" ? "" : afpString.afp;
            return new CheckboxWithDetails(true, details, true);
        } else {
            return new CheckboxWithDetails(false, "", true);
        }
    } else if (svmString !== undefined && svmString !== null && svmString.blackbox !== null &&
        svmString.blackbox !== undefined && (svmString.blackbox.toUpperCase() === "HIGH" || svmString.blackbox.toUpperCase() === "MEDIUM")) {
        return new CheckboxWithDetails(true, "", false);
    } else {
        return new CheckboxWithDetails(false, "", false);
    }
}

/**
 * get table records for a specific data type from a data object returned by WB API
 *
 * WB API returns a data object with all tfp_*, afp_*, and svm_* tables and their values for a specific paper. This
 * function extracts an array of table records for a data type if the latter has values in afp_.
 *
 * @param {string} afpString string containing data for a data type coming from afp tables
 * @param {boolean} multicolumn whether the table contains two columns
 * @returns {EntityList}
 */
export function getTableValuesFromWBAPIData(afpString, multicolumn) {
    let emptyVal = [ { id: 1, name: "" } ];
    if (multicolumn) {
        emptyVal = [ { id: 1, name: "", publicationId: "" } ];
    }
    if (afpString !== undefined && afpString.afp !== null) {
        if (afpString.afp !== "") {
            return new EntityList(JSON.parse(afpString.afp), true);
        } else {
            return new EntityList(emptyVal, true);
        }
    } else {
        return new EntityList(emptyVal, false);
    }
}