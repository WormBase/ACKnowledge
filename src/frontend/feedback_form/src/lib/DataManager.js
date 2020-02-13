import {
    CheckboxWithDetails, EntityList,
    getCheckbxOrSingleFieldFromWBAPIData,
    getSetOfEntitiesFromWBAPIData, getTableValuesFromWBAPIData
} from "../AFPValues";

export class DataManager {
    constructor(apiEndpoint) {
        if (!!DataManager.instance) {
            return DataManager.instance;
        }

        DataManager.instance = this;
        this.apiEndpoint = apiEndpoint;
        let emptyVal = [ { id: 1, name: "" } ];
        this.genesList = new EntityList(new Set(), false);
        this.speciesList = new EntityList(new Set(), false);
        this.structCorrcb = new CheckboxWithDetails(false, "", false);
        this.variationsList = new EntityList(new Set(), false);
        this.strainsList = new EntityList(new Set(), false);
        this.seqChange = new CheckboxWithDetails(false, "", false);
        this.otherVariations = new EntityList(emptyVal, false);
        this.otherStrains = new EntityList(emptyVal, false);
    }

    getPaperData() {
        return new Promise((resolve, reject ) => {
            this.fetchGETData(this.apiEndpoint)
                .then(result => {
                    this.genesList = getSetOfEntitiesFromWBAPIData(result.genestudied, result.genestudied, "WBGene");
                    this.speciesList = getSetOfEntitiesFromWBAPIData(result.species, result.species, undefined);
                    this.structCorrcb = getCheckbxOrSingleFieldFromWBAPIData(result.structcorr, undefined);
                    this.variationsList = getSetOfEntitiesFromWBAPIData(result.variation, result.variation, "");
                    this.strainsList = getSetOfEntitiesFromWBAPIData(result.strain, result.strain, undefined);
                    this.seqChange = getCheckbxOrSingleFieldFromWBAPIData(result.seqchange, result.seqchange);
                    this.otherVariations = getTableValuesFromWBAPIData(result.othervariation, false);
                    this.otherStrains = getTableValuesFromWBAPIData(result.otherstrain, false);
                    resolve();
                })
                .catch(error => {
                    reject();
                });
        });
    }

    static fetchPOSTData(endpoint, payload) {
        return new Promise((resolve, reject ) => {
            fetch(endpoint, {
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
                    reject("Error")
                }
            }).then(data => {
                if (data === undefined) {
                    reject("Empty response")
                }
                resolve(data);
            }).catch((err) => {
                reject(err);
            });
        });
    }

    fetchGETData(endpoint, payload) {
        return new Promise((resolve, reject ) => {
            fetch(endpoint)
                .then(res => {
                    if (res.status === 200) {
                        return res.json()
                    } else {

                    }
                }).then(data => {
                if (data !== undefined) {
                    resolve(data);
                }
            }).catch((err) => {
                reject(err);
            });
        });
    }
}