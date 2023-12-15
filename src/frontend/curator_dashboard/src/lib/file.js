import {extractEntitiesFromTfpString} from "../AFPValues";

export const downloadFile = async (fileContent, fileName, fileType, fileExtension) => {
        const blob = new Blob([fileContent], {type: fileType});
        const href = await URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = href;
        link.download = fileName + '.' + fileExtension;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
}

export const downloadCSVSpreadsheet = async (paperID) => {
        let formContent = "WormBase ACKnowledge\n\nSome of the results provided in this form (marked as TPC powered) have been automatically extracted by our text mining methods\nPlease add any entity we might have missed and remove those that were erroneously extracted\n\n*** Section 1: Entities identified in the paper ***\n\n";
        let payload = {
                paper_id: paperID
        };
        if (payload.paper_id !== undefined) {
                let responseEntities = await fetch(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/lists", {
                        method: 'POST',
                        headers: {
                                'Accept': 'text/html',
                                'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(payload)
                });
                let entities = await responseEntities.json();
                let responseFlags = await fetch(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/flagged", {
                        method: 'POST',
                        headers: {
                                'Accept': 'text/html',
                                'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(payload)
                });
                let flags = await responseFlags.json();
                let tfp_genestudied = entities["tfp_genestudied"];
                if (tfp_genestudied !== '' && tfp_genestudied !== 'null') {
                        tfp_genestudied = extractEntitiesFromTfpString(entities["tfp_genestudied"], "WBGene");
                } else {
                        tfp_genestudied = [];
                }
                let tfp_species = entities["tfp_species"];
                if (tfp_species !== '' && tfp_species !== 'null') {
                        tfp_species = entities["tfp_species"].split(" | ");
                } else {
                        tfp_species = [];
                }
                let tfp_alleles = entities["tfp_alleles"];
                if (tfp_alleles !== 'null' && tfp_alleles !== '') {
                        tfp_alleles = extractEntitiesFromTfpString(entities["tfp_alleles"], "");
                } else {
                        tfp_alleles = [];
                }
                let tfp_strains = entities["tfp_strains"];
                if (tfp_strains !== 'null' && tfp_strains !== '') {
                        tfp_strains = entities["tfp_strains"].split(" | ");
                } else {
                        tfp_strains = [];
                }
                let tfp_transgenes = entities["tfp_transgenes"];
                if (tfp_transgenes !== '' && tfp_transgenes !== 'null') {
                        tfp_transgenes = extractEntitiesFromTfpString(entities["tfp_transgenes"], "");
                } else {
                        tfp_transgenes = [];
                }
                formContent += "GENES (TPC powered)\n";
                formContent += tfp_genestudied.join("\n") + "\n\n";
                formContent += "SPECIES (TPC powered)\n";
                formContent += tfp_species.join("\n") + "\n\n";
                formContent += "ALLELES (TPC powered)\n";
                formContent += tfp_alleles.join("\n") + "\n\n";
                formContent += "STRAINS (TPC powered)\n";
                formContent += tfp_strains.join("\n") + "\n\n";
                formContent += "TRANSGENES (TPC powered)\n";
                formContent += tfp_transgenes.join("\n") + "\n\n";
                formContent += "New Genes reported\nList here\n\n";
                formContent += "New Alleles reported\nList here\n\n";
                formContent += "New Strains reported\nList here\n\n";
                formContent += "New Transgenes reported\nList here\n\n";
                formContent += "Known Antobodies used in the study\nList here\n\n";
                formContent += "Are you reporting an allele sequence change? (TPC powered)\n" + (flags["svm_seqchange_checked"] ? "Yes" : "No") + "\n\n";
                formContent += "Are you reporting a Gene model update and gene sequence connection?\nNo\n\n";
                formContent += "Did you generate a new antibody? If yes specify\nNo\n\n";

                formContent += "*** Section 2: Datatypes ***\nConfirm if your paper contains any of the data types below\n\n";
                formContent += "Anatomic Expression data in WT condition (TPC powered)\n" + (flags["svm_otherexpr_checked"] ? "Yes": "No") + "\n\n";
                formContent += "Site of action data\nNo\n\n";
                formContent += "Time of action data\nNo\n\n";
                formContent += "RNAseq data\nNo\n\n";
                formContent += "Genetic Interactions (TPC powered)\n" + (flags["svm_geneint_checked"] ? "Yes": "No") + "\n\n";
                formContent += "Physical Interactions (TPC powered)\n" + (flags["svm_geneprod_checked"] ? "Yes": "No") + "\n\n";
                formContent += "Regulatory Interactions (TPC powered)\n" + (flags["svm_genereg_checked"] ? "Yes": "No") + "\n\n";
                formContent += "Allele-Phenotype data (TPC powered)\n" + (flags["svm_newmutant_checked"] ? "Yes": "No") + "\n\n";
                formContent += "Allele-RNAi data (TPC powered)\n" + (flags["svm_rnai_checked"] ? "Yes": "No") + "\n\n";
                formContent += "Transgene Overexpression Phenotype data (TPC powered)\n" + (flags["svm_overexpr_checked"] ? "Yes": "No") + "\n\n";
                formContent += "Chemical Induced Phenotype Data\nNo\n\n";
                formContent += "Environmental Induced Phenotype Data\nNo\n\n";
                formContent += "Enzymatic activity Data\nNo\n\n";

                formContent += "*** Section 3: Other data ***\n\n";

                formContent += "Does the paper report Disease Model data?\nNo\n\n";
                formContent += "Are there additional types of expression data? e.g. qPCR or proteomics\nNo\n\n";
                formContent += "Add any additional comment here\n";

                downloadFile(formContent, "ACKnowledge_manual_form", "text/plain", "csv");
        }
}

export const downloadSentenceClassificationTSV = async (paperID, data, dataType) => {
        let formContent = "SENTENCE\tCOUNTER\tHAS_ALL_INFO_FOR_CURATION\tIS_CURATABLE\tCONTAINS_LANGUAGE\n";
        data.sentences.forEach((sentence, idx) => formContent += "\"" + sentence + "\"\t" + data.counters[idx] + "\t" + Boolean(data.classes[dataType]['all_info'][idx]) + "\t" + Boolean(data.classes[dataType]['curatable'][idx]) + "\t" + Boolean(data.classes[dataType]['language'][idx]) + "\t\n");
        downloadFile(formContent, "Sentence_level_classification_" + dataType + "_" + paperID, "text/plain", "tsv");
}