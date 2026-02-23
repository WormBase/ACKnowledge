import React from 'react';
import FAQsingle from "../components/FAQsingle";
import './FAQ.css';

const FAQ = () => {

    return (
        <div>
            <h4><strong>Frequently Asked Questions</strong></h4>
            <h4>General Information on ACKnowledge and Community Curation</h4>
            <ol>
                <li><FAQsingle question={"What is ACKnowledge and why is it helpful to WormBase and the Alliance of Genome Resources (the Alliance)?"}
                               answer={"<a target='_blank' href='https://wormbase.github.io/ACKnowledge/'>ACKnowledge</a> is a community curation pipeline that helps alert <a target='_blank' href='https://www.alliancegenome.org/'>Alliance of Genome Resources</a> curators, including WormBase curators, to the relevant entities, e.g. genes and alleles, and types of data in published papers. Entity and data type identification is a key step in the Alliance literature curation process, so by participating in the ACKnowledge pipeline you ensure that published data becomes available at the Alliance in a timely manner."}/></li>
                <li><FAQsingle question={"I need help filling out the ACKnowledge form."}
                               answer={"We're happy to help you with your submission. Below are answers to some of the questions we've received. If you can't find an answer to your question, however, please feel free to <a target='_blank' href='mailto:help.acknowledge@wormbase.org'>contact us</a>."}/></li>
                <li><FAQsingle question={"What happens to my submitted ACKnowledge data?"}
                               answer={"After you submit your ACKnowledge data, WormBase curators at the Alliance will be alerted to the information you provide. They will then curate the data as soon as possible and it will be included in a future Alliance release."}/></li>
                <li><FAQsingle question={"How are my curation contributions recognized?"}
                               answer={"Authors who contributed to ACKnowledge through August 2025 are recognized on the relevant WormBase person and paper pages in our final WS298 release (for example, see Paul Sternberg's <a target='_blank' href='https://wormbase.org/resources/person/WBPerson625#01--10'>person page</a> and <a target='_blank' href='https://wormbase.org/resources/paper/WBPaper00056939#0--10'>a paper page</a>). We plan to implement similar mechanisms at the Alliance to recognize ACKnowledge contributors."}/></li>
                <li><FAQsingle question={"Can I submit a paper for which I haven't received an ACKnowledge link?"}
                               answer={"If you would like to submit an ACKnowledge form for other papers, please <a target='_blank' href='mailto:help.acknowledge@wormbase.org'>contact us</a> with a list of PubMed identifiers (PMIDs, e.g. PMID:25281934) and/or WormBase paper identifiers (WBPaper IDs, e.g. WBPaper00045833) so we can process the papers and email you links to the corresponding ACKnowledge forms."}/></li>
                <li><FAQsingle question={"How can I find my other papers that are in the ACKnowledge system?"}
                               answer={"You can access all your papers that have been processed by the ACKnowledge system via the <a target='_blank' href='https://acp.acknowledge.textpressolab.com/'>Author Curation Portal</a>."}/></li>
                <li><FAQsingle question={"Does ACKnowledge process supplementary data and text or only the main paper?"}
                               answer={"Supplementary data in PDF format are processed by the ACKnowledge system. Unfortunately, at this time, we are not processing other file formats (e.g. images, videos, Excel files)."}/></li>
            </ol>
            <h4>Who Can Submit the ACKnowledge Form</h4>
            <ol>
                <li><FAQsingle question={"Who can submit data through ACKnowledge?"}
                               answer={"Any author of a publication can submit data, but they must have a WormBase person ID (WBPerson ID) so we can properly track and credit submissions. You can request a WBPersonID <a target='_blank' href='https://wormbase.org/submissions/person.cgi'>here</a>."}/></li>
                <li><FAQsingle question={"Can someone other than the original recipient of an ACKnowledge email request submit the form?"}
                               answer={"The ACKnowledge form can be filled out by any of the authors of a paper. If possible, we send an email containing a link to the form to all authors. If you did not receive an email with the link, you may <a target='_blank' href='mailto:help.acknowledge@wormbase.org'>contact us</a> or you may use the link sent to one of your co-authors. If you use a link forwarded by a co-author, please be sure to change the submitter name in the ACKnowledge form so you can be properly credited for your contribution.<br/><br/>To change the submitter name, click on '<i>Change User</i>' on the top left corner of the form, type your name in the pop-up window, and then select the correct match from the autocomplete results. If there are multiple matches to your name, please double-check your <a target='_blank' href='https://www.wormbase.org'>WormBase</a> person page to make sure you select the correct person from the list. Remember: you need to be a registered WormBase person to see your name on the list. If you don't have a WBPerson ID, you can request one <a target='_blank' href='https://wormbase.org/submissions/person.cgi'>here</a>."}/></li>
                <li><FAQsingle question={"How do I get a WBPerson ID?"}
                               answer={"You can request a WBPersonID in the ACKnowledge form by clicking on '<i>Request WBPerson</i>' on the top left of the screen or you can click <a target='_blank' href='https://wormbase.org/submissions/person.cgi'>here</a>."}/></li>
            </ol>
            <h4>Entities Submitted through the ACKnowledge Form</h4>
            <p style={{marginLeft:"25px"}}><h5>Always remember to use the correct nomenclature! For <i>C. elegans</i> and other nematodes' nomenclature guidelines please refer to <a target='_blank' href='https://wormbase.org/about/userguide/nomenclature#4m-b1-5'>this page</a>.</h5></p>
            <ol>
                <li><FAQsingle question={"What types of entities are included in the ACKnowledge form?"}
                               answer={"The Alliance collects different types of entities, such as genes, species, alleles, strains, and transgenes. By validating the entities that we extracted, you are helping us to integrate valuable information into the Alliance and make the correct entity-paper connections."}/></li>
                <li><FAQsingle question={"Which entities should I submit?"}
                               answer={"The Alliance curates entities that are experimentally studied in the paper. For example, if your paper describes the biological function of a specific gene, you should submit that gene with the paper.<br/><br/>Genes that are used as '<i>reagents</i>', e.g. tissue specific promoters or expression or genetic markers, are not typically associated with the papers where they are used.<br/><br/>Our text-mining approaches are good but not perfect; that is why we need your help! We might miss entities, or we might include entities, such as reagents, that should not be included. In both cases you can help us improve our methods by adding what we have missed or removing what we have erroneously extracted.<br/><br/>In doubt? Refer to question marks on the form that provide more detailed information. If you have suggestions on how we can improve the text in the pop-ups do not hesitate to <a target='_blank' href='mailto:help.acknowledge@wormbase.org'>contact us</a>."}/></li>
                <li><FAQsingle question={"How are the pre-populated entity lists generated?"}
                               answer={"We use text mining approaches to pre-populate the lists. We match the names of entities and then apply other rules to try to filter for only those that are experimentally studied. For example, genes and alleles are filtered using <a target='_blank' href='https://en.wikipedia.org/wiki/Tf%E2%80%93idf'>TFIDF</a> (term frequency-inverse document frequency, a numerical statistic) while species, strains, and transgenes are filtered using empirically determined thresholds. Each method used is based on our analysis of what provides the most accurate entity list."}/></li>
                <li><FAQsingle question={"How do I add missing entities?"}
                               answer={"To add missing entities, click on the '<i>Add</i>' buttons in each respective entity box. A new box will appear. Here you can start typing in the entity name and the list will auto populate on existing WormBase entities. If the entity you are looking for does not appear, make sure you are typing it in correctly. If it is still not there, it means that the entity is not yet in the Alliance and needs to be added (see below)."}/></li>
                <li><FAQsingle question={"How do I submit new entities?"}
                               answer={"<strong>Genes</strong>: To request a '<i>New Gene Name</i>' click on the '<i>Can't find a gene? Request new gene name</i>' in the '<i>Genes</i>' section of the Overview (genes and species) widget. Once the text expands, click on '<a target='_blank' href='https://www.wormbase.org/submissions/gene_name.cgi'>Request new gene name or report gene-sequence connections</a>' to submit a request to the nomenclature committee.<br/><br/>" +
                               "<strong>Species</strong>: You can enter species not yet in our system by clicking on '<i>Can't find a species? Add new species not yet in WormBase</i>' in the '<i>Species</i>' section of the Overview (genes and species) widget. Enter one species per line.<br/><br/>" +
                               "<strong>Alleles</strong>: You can enter new alleles by clicking on '<i>Can't find an allele? Add new alleles not yet in WormBase</i>' in the '<i>Alleles</i>' section of the Genetics widget. Enter one allele per line.<br/><br/>" +
                               "<strong>Strains</strong>: You can enter new strains by clicking on '<i>Can't find a strain? Add new strains not yet in WormBase</i>' in the '<i>Strains</i>' section of the Genetics widget. Enter one strain per line.<br/><br/>" +
                               "<strong>Transgenes</strong>: You can enter new Transgenes by clicking on '<i>Can't find a transgene? Add new transgenes not yet in WormBase</i>' in the '<i>Transgenes</i>' section of the Reagents widget. Enter one Transgene per line.<br/><br/>" +
                               "<strong>Antibodies</strong>: You can enter information about new antibodies in the '<i>Antibodies in the paper</i>' section of the Reagents widget. Click the '<i>Newly generated antibodies</i>' checkbox, then enter the antibody details in the text box that appears below."}/></li>
                <li><FAQsingle question={"How do I release a new gene name held in confidence?"}
                               answer={"Please <a target='_blank' href='mailto:genenames@wormbase.org'>contact WormBase</a> to authorize public release of a previously approved gene name held in confidence."}/></li>
                <li><FAQsingle question={"How do I propose a new gene name?"}
                               answer={"Please <a target='_blank' href='mailto:genenames@wormbase.org'>contact WormBase</a> to propose a new gene name. Ideally, gene names are proposed and approved prior to publication so we can include them in the Alliance as soon as possible. For additional information on nomenclature please refer to <a target='_blank' href='https://wormbase.org/about/userguide/nomenclature#4m-b1-5'>this page</a>."}/></li>
                <li><FAQsingle question={"How do I submit large entity (e.g. genes, alleles, strains) lists?"}
                               answer={"For genes: Our submission form displays lists of up to 100 genes, but if your paper refers to more than 100 genes, you can submit the full list by <a target='_blank' href='mailto:help.acknowledge@wormbase.org'>contacting us</a>. Since genes are sometimes renamed, merged, split, or share sequence with another gene, you can validate your gene list by using the <a target='_blank' href='https://wormbase.org/tools/mine/gene_sanitizer.cgi'>WormBase Gene Name Sanitizer</a>.<br/><br/>For alleles, strains, or transgenes: click on, for example, '<i>Upload Allele Spreadsheet (for large lists)</i>'. This link will open a new tab with a Google Sheet that provides detailed instructions on how to submit your large list for these entities."}/></li>
                <li><FAQsingle question={"Should I submit both extrachromosomal and inserted transgenes?"}
                               answer={"Yes, we curate information about extrachromosomal, as well as, inserted transgenes, so please include both in your submission."}/></li>
                <li><FAQsingle question={"How do I view selected entities in WormBase?"}
                               answer={"To view selected entities in the identified entity lists click on the entities you want to view and then click on the '<i>View in WB</i>' link at the top right of the entity box. Note that some browsers, e.g. Chrome, will require that you allow pop-ups from 'https://acknowledge.textpressolab.com' to open a new WormBase tab."}/></li>
            </ol>
            <h4>Types of Data Submitted through the ACKnowledge Form</h4>
            <ol>
                <li><FAQsingle question={"How are the different types of data identified?"}
                               answer={"Wherever possible, we use machine learning to automate identification of different types of data, e.g. anatomical expression patterns, RNAi phenotypes, and genetic interactions. Automatically identified data types are indicated on the form with the <span style=\"display:inline-flex;align-items:center;font-size:12px;color:#333;background-color:#ffffff;padding:4px 8px;border-radius:12px;border:2px solid #ddd;font-weight:normal;box-shadow:0 1px 2px rgba(0, 0, 0, 0.1);vertical-align:middle\"><span style=\"margin-right:6px;color:#ffd700;font-size:14px\">&#9889;</span>Auto-identified</span> tag. More information about some of our approaches can be found in the <a href='/about'><strong>About Section</strong></a>."}/></li>
                <li><FAQsingle question={"Can I submit other types of data not listed in the ACKnowledge form?"}
                               answer={"If your paper includes data types not listed in the ACKnowledge form, please let us know by adding a note in the '<i>Please give us your feedback</i>' field in the '<i>Comments and submit</i>' widget."}/></li>
            </ol>
            <h4>Updating ACKnowledge Submissions</h4>
            <ol>
                <li><FAQsingle question={"Can I make changes to my ACKnowledge entries after submission of the form?"}
                               answer={"Yes, you can update your submission at any time. Just click on the link to the form in the original email message we sent and modify your entries, as needed.<br/><br/>You must still click on the '<i>Save and go to next section</i>' button at the bottom of each updated page, and also click on the '<i>Finish and Submit</i>' button on the final '<i>Comments and submit</i>' widget to submit your updates.<br/><br/>If you no longer have the original ACKnowledge email, please go to the <a target='_blank' href='https://acp.acknowledge.textpressolab.com/'>Author Curation Portal page</a> or <a target='_blank' href='mailto:help.acknowledge@wormbase.org'>contact us</a>."}/></li>
            </ol>
            <h4>Submitting Additional Data to the Alliance</h4>
            <ol>
                <li><FAQsingle question={"Can I submit additional experimental details to the Alliance?"}
                               answer={"If you wish to contribute more detailed curation to the Alliance, we also provide several data type-specific curation forms, notably:" +
                               "<ul><li><a target='_blank' href='https://wormbase.org//submissions/gene_name.cgi'>Gene-sequence data submission</a></li>" +
                               "<li><a target='_blank' href='https://wormbase.org/submissions/allele_sequence.cgi'>Allele-sequence data submission</a></li>" +
                               "<li><a target='_blank' href='https://wormbase.org/submissions/phenotype.cgi'>Phenotype data submission</a></li></ul>" +
                               "For other data types, please refer to our list of <a target='_blank' href='https://wormbase.org/about/userguide/submit_data#01--10'>online submission forms</a>. If you do not find a relevant form, but would like to submit data to the Alliance, please <a target='_blank' href='mailto:help.acknowledge@wormbase.org'>contact us</a>."}/></li>
                <li><FAQsingle question={"Can I submit large-scale data sets?"}
                               answer={"The Alliance curates some types of large-scale data, e.g. genome-wide RNAi screens. If you would like to alert us to these types of experiments in your paper, please <a target='_blank' href='mailto:help.acknowledge@wormbase.org'>contact us</a> so we can be sure to incorporate your data as efficiently as possible."}/></li>
                <li><FAQsingle question={"What if we'd like to submit unpublished data?"}
                               answer={"If you have unpublished brief findings that you would like to publish, we encourage you to submit an article to <a target='_blank' href='https://www.micropublication.org/'>microPublication Biology</a>."}/></li>
            </ol>
            <h4>Multi-organism Papers</h4>
            <ol>
                <li><FAQsingle question={"What happens to the non-<i>C. elegans</i> data in my paper?"}
                               answer={"Currently, we prioritize curation of <i>C. elegans</i> data. If you have questions about curation of data for other species, please <a target='_blank' href='mailto:help.acknowledge@wormbase.org'>contact us</a>."}/></li>
            </ol>
        </div>
    );
}

export default FAQ;
