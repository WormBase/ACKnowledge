import axios from "axios";
import {extractEntitiesFromTfpString} from "../AFPValues";

export const SET_SELECTED_PAPER_ID = "SET_SELECTED_PAPER_ID";

export const setSelectedPaperID = (paperID) => ({
    type: SET_SELECTED_PAPER_ID,
    payload: { paperID }
});

export const fetchEntityLists = (paperID) => {
    return new Promise((resolve, reject) => {
        if (paperID !== undefined) {
            axios.post(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/lists", {paper_id: paperID})
                .then(data => {
                    let tfp_genestudied = data.data.tfp_genestudied;
                    if (tfp_genestudied !== '' && tfp_genestudied !== 'null') {
                        tfp_genestudied = extractEntitiesFromTfpString(tfp_genestudied, "WBGene");
                    } else {
                        tfp_genestudied = [];
                    }
                    let afp_genestudied = data.data.afp_genestudied;
                    if (afp_genestudied === 'null') {
                        afp_genestudied = undefined
                    } else if (afp_genestudied !== '') {
                        afp_genestudied = extractEntitiesFromTfpString(afp_genestudied, "WBGene");
                    } else {
                        afp_genestudied = [];
                    }
                    let tfp_species = data.data["tfp_species"];
                    if (tfp_species !== '' && tfp_species !== 'null') {
                        tfp_species = tfp_species.split(" | ");
                    } else {
                        tfp_species = [];
                    }
                    let afp_species = data.data["afp_species"];
                    if (afp_species === 'null') {
                        afp_species = undefined
                    } else if (afp_species !== '') {
                        afp_species = afp_species.split(" | ");
                    } else {
                        afp_species = [];
                    }
                    let tfp_alleles = data.data["tfp_alleles"];
                    if (tfp_alleles !== 'null' && tfp_alleles !== '') {
                        tfp_alleles = extractEntitiesFromTfpString(tfp_alleles, "");
                    } else {
                        tfp_alleles = [];
                    }
                    let afp_alleles = data.data["afp_alleles"];
                    if (afp_alleles === 'null') {
                        afp_alleles = undefined
                    } else if (afp_alleles !== '') {
                        afp_alleles = extractEntitiesFromTfpString(afp_alleles, "");
                    } else {
                        afp_alleles = [];
                    }
                    let tfp_strains = data.data["tfp_strains"];
                    if (tfp_strains !== 'null' && tfp_strains !== '') {
                        if (tfp_strains.includes(";%;")) {
                            tfp_strains = extractEntitiesFromTfpString(tfp_strains, "");
                        } else {
                            tfp_strains = tfp_strains.split(" | ");
                        }
                    } else {
                        tfp_strains = [];
                    }
                    let afp_strains = data.data["afp_strains"];
                    if (afp_strains === 'null') {
                        afp_strains = undefined
                    } else if (afp_strains !== '') {
                        if (afp_strains.includes(";%;")) {
                            afp_strains = extractEntitiesFromTfpString(afp_strains, "");
                        } else {
                            afp_strains = afp_strains.split(" | ");
                        }
                    } else {
                        afp_strains = [];
                    }
                    let tfp_transgenes = data.data["tfp_transgenes"];
                    if (tfp_transgenes !== '' && tfp_transgenes !== 'null') {
                        tfp_transgenes = extractEntitiesFromTfpString(tfp_transgenes, "");
                    } else {
                        tfp_transgenes = [];
                    }
                    let afp_transgenes = data.data["afp_transgenes"];
                    if (afp_transgenes === 'null') {
                        afp_transgenes = undefined
                    } else if (afp_transgenes !== '') {
                        afp_transgenes = extractEntitiesFromTfpString(afp_transgenes, "");
                    } else {
                        afp_transgenes = [];
                    }
                    resolve({tfp_genestudied, afp_genestudied, tfp_species, afp_species, tfp_alleles, afp_alleles,
                        tfp_strains, afp_strains, tfp_transgenes, afp_transgenes});
                })
                .catch((err) => {
                    reject(err);
                });
        } else {
            reject("undefined paperID");
        }
    });
}

export const fetchFlaggedData = (paperID) => {
    return new Promise((resolve, reject) => {
        if (paperID !== undefined) {
            axios.post(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/flagged", {paper_id: paperID})
                .then(data => {
                    resolve(data);
                }).catch((err) => {
                reject(err);
            });
        } else {
            reject("undefined paperID");
        }
    });
}