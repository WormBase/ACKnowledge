import React from 'react';
import Panel from "react-bootstrap/lib/Panel";
import FAQsingle from "../components/FAQsingle";
import './FAQ.css';

const FAQ = () => {

    return (
        <div>
            <h4><strong>Frequently Asked Questions</strong></h4>
            <h4>General Information on Author First Pass and Community Curation</h4>
            <ol>
                <li><FAQsingle question={"What is Author First Pass and why is it helpful to WB and the worm community?"}
                               answer={"Author First Pass (AFP) is a community curation pipeline that helps alert WormBase curators to relevant entities and data types in published papers.  Entity and data type identification is the first step in the WormBase curation process, so by participating in the AFP pipeline you ensure that published data becomes available in WormBase in a timely manner."}/></li>
                <li><FAQsingle question={"I need help filling out the Author First Pass form."}
                               answer={"Please refer to the FAQs below.  If you have additional questions, please feel free to <a target='_blank' href='mailto:help.afp@wormbase.org'>contact us</a>.  We’d be happy to help you with your submission."}/></li>
                <li><FAQsingle question={"What happens to my submitted AFP data?"}
                               answer={"After you submit your AFP data, WormBase curators will be alerted to the information you provide.  They will then curate the data as soon as possible and it will be included in a subsequent WormBase release.  The WormBase release schedule can be found <a target='_blank' href='https://wormbase.org/about/release_schedule'>here</a>."}/></li>
                <li><FAQsingle question={"How is my curation acknowledged in WB?"}
                               answer={"Authors who contribute to Author First Pass are acknowledged on the relevant WormBase paper and person pages."}/></li>
                <li><FAQsingle question={"Can I submit a paper for which I haven't received an Author First Pass link?"}
                               answer={"If you would like to submit an Author First Pass (AFP) form for other papers, please <a target='_blank' href='mailto:help.afp@wormbase.org'>contact us</a> with a list of PubMed identifiers (PMIDs, e.g. PMID:25281934) and/or WormBase paper identifiers (WBPaper IDs, e.g. WBPaper00045833) so we can process them and email you links to the corresponding AFP forms."}/></li>
                <li><FAQsingle question={"Does AFP process supplementary data and text or only the main paper?"}
                               answer={"Supplementary data is processed by AFP, as long as it is in PDF format. Other formats (e.g., images, videos, Excel files) are not included."}/></li>
            </ol>
            <h4>Who Can Submit the Author First Pass Form</h4>
            <ol>
                <li><FAQsingle question={"Who are community curators and what do you have to do to become one?"}
                               answer={"Any author of the publication can be a community curator. You do not have to do anything specific to become one. If you are not a PI or a corresponding author please ask your PI to forward you the Author First Pass link."}/></li>
                <li><FAQsingle question={"Can someone other than the original recipient of the Author First Pass email submit the form?"}
                               answer={"The Author First Pass (AFP) form can be filled out by anyone in your lab. You can forward the email containing the link you receive. The new submitter then just needs to change the submitter name by clicking on ‘Change User’ on the Overview widget and by typing their name in the pop-up window and selecting the correct match from the autocomplete results. If there are multiple matches to your name, please double-check your WormBase person page to make sure you select the correct person from the list. Remember: you need to be a registered WormBase person to see your name on the list. If you don’t have a WBPerson ID, you can request one <a target='_blank' href='https://wormbase.org/submissions/person.cgi'>here</a>."}/></li>
                <li><FAQsingle question={"How do I get a WBPerson ID?"}
                               answer={"You can request a WBPersonID in the Author First Pass form by clicking on ‘Request new WBPerson’ button on the top right of the screen or you can click <a target='_blank' href='https://wormbase.org/submissions/person.cgi'>here</a>."}/></li>
            </ol>
            <h4>Entities Submitted through the Author First Pass Form</h4>
            <p style={{marginLeft:"25px"}}><h5>Always remember to use the correct nomenclature! For nomenclature guidelines please refer to <a target='_blank' href='https://wormbase.org/about/userguide/nomenclature#4m-b1-5'>this page</a>.</h5></p>
            <ol>
                <li><FAQsingle question={"What types of entities are included in the Author First Pass form?"}
                               answer={"WormBase collects different types of entities, such as genes, species, alleles, strains, and transgenes. By validating the entities that we extracted, you are helping us to integrate valuable information into WormBase and make the right entity-paper connections."}/></li>
                <li><FAQsingle question={"Which entities should I submit?"}
                               answer={"WormBase curates entities that are experimentally studied in the paper. For example, if your paper describes the biological function of a specific gene, you should submit that gene with the paper. Genes that are used as ‘reagents’, e.g. tissue specific promoters, expression or genetic markers, are not typically associated with the papers where they are used. Our text-mining approaches are good but not perfect; that is why we need your help! We might miss entities or we might include entities, such as reagents, that should not be included. In both cases you can help us improve our lists by adding what we have missed or removing what we have erroneously extracted. <ol type='i'><li>In doubt?  Refer to <span class=\"glyphicon glyphicon-question-sign\"></span> marks on the form that provide more detailed information. If you have suggestions on how we can improve the text in the pop-ups do not hesitate to <a href='mailto:help.afp@wormbase.org'>contact us</a>.)</li></ol>"}/></li>
                <li><FAQsingle question={"How are the pre-populated entity lists generated?"}
                               answer={"We use text mining approaches, and other methods, to pre-populate the lists. For instance, genes and alleles are identified using <a target='_blank' href='https://en.wikipedia.org/wiki/Tf–idf'>TFIDF</a> (term frequency–inverse document frequency, a numerical statistic). Species, strains, and transgenes are identified using empirically determined thresholds. The method used is based on our analysis of what provides the most accurate entity list."}/></li>
                <li><FAQsingle question={"How do I add missing entities?"}
                               answer={"To add missing entities, click on the ‘Add’ blue buttons (e.g. Add Genes) in each respective entity box. A pop up window will appear. Here you can start typing in the entity name and the list will auto populate on existing WormBase entities. If the entity  you are looking for does not appear, make sure you are typing it in correctly. If it is still not there, it means that the entity is not yet in WormBase and needs to be added -see below."}/></li>
                <li><FAQsingle question={"How do I submit new entities?"}
                               answer={"<ol type='a'><li><strong>Genes</strong>: To request a ‘New Gene Name’ click on the ‘Request new gene name’ button in the gene section of the Overview widget of the AFP form. This will bring you to a separate form that will be submitted to the nomenclature committee. The link to the ‘New Gene Name’ form is also <a target='_blank' href='https://wormbase.org//submissions/gene_name.cgi'>here</a>." +
                               "<li><strong>Alleles</strong>: You can enter new alleles in the ‘New Alleles’ box in the alleles section of the Genetics widget of the AFP form. Enter one allele per line.</li>" +
                               "<li><strong>Strains</strong>: You can enter new strains in the ‘New Strains’ box in the strains section of the Genetics widget of the AFP form. Enter one strain per line.</li>" +
                               "<li><strong>Transgenes</strong>: You can enter new Transgenes in the ‘New Transgenes’ box in the transgenes section of the Reagents widget of the AFP form. Enter one Transgene per line.</li>" +
                               "<li><strong>Antibodies</strong>: You can enter information on newly generated antibodies in the section ‘Antibodies in the paper’ in the antibodies section of the Reagents widget of the AFP form.</li>"}/></li>
                <li><FAQsingle question={"How do I release a new gene name held in confidence?"}
                               answer={"Please contact <a target='_blank' href='mailto:genenames@wormbase.org'>WormBase</a> to authorize public release of a previously approved gene name held in confidence."}/></li>

                <li><FAQsingle question={"How do I propose a new gene name?"}
                               answer={"Please contact <a target='_blank' href='mailto:genenames@wormbase.org'>WormBase</a> to propose a new gene name.  Ideally, gene names are proposed and approved prior to publication so we can include them in WormBase as soon as possible.  For additional information on WormBase nomenclature please refer to <a target='_blank' href='https://wormbase.org/about/userguide/nomenclature#4m-b1-5'>this page</a>."}/></li>
                <li><FAQsingle question={"How do I submit large entity (e.g. genes, alleles, strains) lists?"}
                               answer={"Our submission form displays lists of up to 100 entities, but if your paper refers to more than 100 entities, you can submit the full list by <a href='mailto:help.afp@wormbase.org'>contacting us</a>. Since genes are sometimes renamed, merged, split, or share sequence with another gene, you can validate your gene list by using the <a target='_blank' href='https://wormbase.org/tools/mine/gene_sanitizer.cgi'>WormBase Gene Name Sanitizer</a>. Once you open the Gene Name Sanitizer page, paste the WBGeneID list in the box and click on the ‘query list’ button."}/></li>
                <li><FAQsingle question={"Should I submit both extrachromosomal and inserted transgenes?"}
                               answer={"Yes, WormBase curates information about extrachromosomal, as well as, inserted transgenes, so please include both in your submission."}/></li>
                <li><FAQsingle question={"How do I view multiple selected entities in WormBase?"}
                               answer={"To view multiple selected entities in the identified entity lists click on the entities you want to view and then click on the ‘Show selected in WB’ link at the bottom of the entity box. Note that some browsers, e.g. Chrome, will require that you allow pop-ups from 'https://afp.textpressolab.com' to open more than one WormBase tab.<br/><br/>To allow pop-ups in Chrome, select Preferences from the Chrome menu, navigate to the Privacy and Security widget, and then select Site settings from the Privacy and security section. Scroll to the bottom of the list and under the Content heading select Pop-ups and  redirects.  Navigate to Allowed to send pop-ups and use redirects, click on Add, and add 'https://afp.textpressolab.com'."}/></li>
            </ol>
            <h4>Data Types Submitted through the Author First Pass Form</h4>
            <ol>
                <li><FAQsingle question={"How are the different data types identified?"}
                               answer={"Wherever possible, we use machine learning to help automate identification of different data types, e.g. anatomical expression patterns, RNAi phenotypes, and genetic interactions.  Automatically identified data types are indicated on the form with the <img src=\"tpc_powered.svg\" width=\"80px\"/> tag.  More information about some of our approaches can be found in the <a href='#reference'>reference section</a>."}/></li>
                <li><FAQsingle question={"Can I submit other data types not listed in the Author First Pass Form?"}
                               answer={"If your paper includes data types not listed in the Author First Pass form, please let us know by adding a note in the Comments field in the Comments and submit widget."}/></li>
            </ol>
            <h4>Updating Author First Pass Submissions</h4>
            <ol>
                <li><FAQsingle question={"Can I make changes to my Author First Pass entries after submission of the form?"}
                               answer={"Yes, you can update your submission at any time. Just click on the link to the form in the original email message we sent and modify your entries, as needed.  You must still click on the ‘Save and Continue’ button at the bottom of each updated page, and also click on the ‘Finish and Submit’ button on the final Comments and submit widget to submit your updates.  If you no longer have the original Author First Pass email, please go to the <a target='_blank' href='http://textpressocentral.org/afp/my-papers'>MyPaper</a> page or <a target='_blank' href='mailto:help.afp@wormbase.org'>contact us</a>."}/></li>
            </ol>
            <h4>Submitting Additional Data to WormBase</h4>
            <ol>
                <li><FAQsingle question={"Can I submit additional experimental details to WormBase?"}
                               answer={"If you wish to contribute more detailed curation to WormBase, we also provide several data type-specific curation forms, notably:" +
                               "<ol type='a'><li><a target='_blank' href='https://wormbase.org//submissions/gene_name.cgi'>Gene-sequence data submission</a></li>" +
                               "<li><a target='_blank' href='https://wormbase.org/submissions/allele_sequence.cgi'>Allele-sequence data submission</a></li>" +
                               "<li><a target='_blank' href='https://wormbase.org/submissions/phenotype.cgi'>Phenotype data submission</a></li></ol>" +
                               "For other data types, please refer to our list of online submission forms.  If you do not find a relevant form, but would like to submit data to WormBase, please <a target='_blank' href='mailto:help.afp@wormbase.org'>contact us</a>."}/></li>
                <li><FAQsingle question={"Can I submit large-scale data sets?"}
                               answer={"WormBase curates some types of large-scale data, e.g. genome-wide RNAi screens.  If you would like to alert us to these types of experiments in your paper, please <a target='_blank' href='https://wormbase.org/tools/support'>contact the WormBase helpdesk</a> so we can be sure to incorporate your data as efficiently as possible."}/></li>
                <li><FAQsingle question={"What if we’d like to submit unpublished data?"}
                               answer={"If you have unpublished brief findings that you would like to publish, we encourage you to submit a <a target='_blank' href='https://www.micropublication.org/'>microPublication</a>."}/></li>
            </ol>
            <h4>Multi-organism Papers</h4>
            <ol>
                <li><FAQsingle question={"What happens to the non-<i>C. elegans</i> data in my paper?"}
                               answer={"Currently, WormBase prioritizes curation of <i>C. elegans</i> data, with curation of other <i>Caenorhabditis</i> species added wherever possible.  If you have questions about data curation for other nematode species, please <a target='_blank' href='mailto:help.afp@wormbase.org'>contact us</a>.<br/><br/>To alert other model organism databases to curatable data, please contact the <a target='_blank' href='https://www.alliancegenome.org/contact-us'>Alliance of Genome Resources</a> or one of the member databases listed on that page.  If your paper contains data on species not included in the Alliance, please <a target='_blank' href='mailto:help.afp@wormbase.org'>contact us</a> for assistance in directing you to the appropriate curation resource."}/></li>
            </ol>
            <br/><br/>
            <Panel>
                <Panel.Heading>
                    <Panel.Title componentClass="h3">
                        <p id='reference'>References</p>
                    </Panel.Title>
                </Panel.Heading>
                <Panel.Body>
                    <ol>
                        <li>
                            Valerio Arnaboldi, Daniela Raciti, Kimberly Van Auken, Juancarlos N Chan, Hans-Michael Müller,
                            Paul W Sternberg, <i>Text mining meets community curation: a newly designed curation platform to
                            improve author experience and participation at WormBase</i>, Database, Volume 2020, 2020, baaa006,
                            <a target='_blank' href="https://doi.org/10.1093/database/baaa006"> https://doi.org/10.1093/database/baaa006</a>
                        </li>
                        <li>
                            Ruihua Fang, Gary Schindelman, Kimberly Van Auken, Jolene Fernandes, Wen Chen, et al.,
                            <i>Automatic categorization of diverse experimental information in the bioscience literature</i>, BMC Bioinformatics, 2012, <a target='_blank' href="https://doi.org/10.1186/1471-2105-13-16">https://doi.org/10.1186/1471-2105-13-16</a>
                        </li>
                        <li>
                            Hans-Michael Müller, Kimberly Van Auken, Yuling Li, Paul W Sternberg,
                            <i>Textpresso Central: a customizable platform for searching, text mining, viewing, and curating biomedical literature</i>,
                            BMC Bioinformatics, 2018 9;19(1):94, <a target='_blank' href="https://doi.org/10.1186/s12859-018-2103-8">https://doi.org/10.1186/s12859-018-2103-8</a>
                        </li>
                    </ol>
                </Panel.Body>
            </Panel>
        </div>
    );
}

export default FAQ;
