import React from 'react';

const ReleaseNotes = () => {
    return (
        <div>
            <h3>Version 4.0</h3>
            Release date 10-27-2022
            <h4>Introduction</h4>
            <p>Release 4.0 marks an exciting transition for our project.  With support from the National Library of
                Medicine, the Author First Pass (AFP) project is now officially known as ACKnowledge (Author Curation to Knowledgebase).
                This change reflects our commitment to expanding artificial intelligence (AI)-enhanced community curation
                to capture more detailed experimental findings and to introduce our curation pipeline to additional model
                organism communities and their respective knowledgebases. While busy transitioning our project and enhancing
                our AI methods, we also implemented further improvements to the current pipeline based on continuing
                valuable feedback from authors. These improvements, listed below, will help authors add more information
                about their papers and readily find previously published papers processed by our pipeline for curation using
                our Author Curation Portal.</p>

            <h4>Main Updates</h4>
            <ul>
                <li>Renamed project to ACKnowledge (Author Curation to Knowledgebase)</li>
                <li>Updated user facing communications and forms</li>
                <li>Updated internal documentation</li>
                <li>Created an ACKnowledge logo</li>
                <li>Created an ‘About’ widget on the author curation form</li>
                <li>Provided project description</li>
                <li>Added NLM funding information</li>
                <li>Listed published references</li>
                <li>Created a project landing page: https://wormbase.github.io/ACKnowledge</li>
                <li>Fully transitioned from Support Vector Machines (SVM) to Neural Networks (NN) for datatype flagging</li>
            </ul>
            <h5><strong>User Updates</strong></h5>
            <ul>
                <li>Enabled access to author’s additional publications via the author curation portal (https://acp.acknowledge.textpressolab.com) from the author submission form and from all user-facing communications (emails)</li>
                <li>Added free text box for chemical- and environmental-induced phenotypes</li>
                <li>Added a free text box for adding new species not in the current auto-complete list</li>
                <li>Improved the comments section</li>
            </ul>
            <h5><strong>Bug Fixes</strong></h5>
            <ul>
                <li>Form now saves incremental updates to genes and species lists to database without requiring a full resubmission</li>
                <li>Proof papers are now excluded by the processing pipeline</li>
                <li>Improved authors’ email extraction</li>
                <li>Additional minor bug fixes</li>
            </ul>
            <h5><strong>Curator Dashboard Updates</strong></h5>
            <ul>
                <li>Improved statistics page to keep track of response rate on a yearly and monthly basis</li>
                <li>Standardized representation of empty values in curator dashboard</li>
            </ul>

            <h3>Release 3.0</h3>
            Release date: 09-16-2021
            <h4>Introduction</h4>
            <p>Based on valuable user feedback, we continue to improve the Author First Pass experience.  In addition
                to providing more streamlined ways to enter entities, we’ve added further instructions for adding new
                entities, and a link to look up specific entities in WormBase.  We now flag papers for enzymatic
                activity and include a free-text field to describe other gene functions.  We updated the FAQs and
                provide a link to the Author First Pass webinar presented in February 2021.  Lastly, to thank authors
                for their valuable contributions, we now acknowledge authors on WormBase person and paper pages. </p>
            <p>We have implemented updates and improvements to our curator dashboard. The dashboard is a tool available
                to WormBase curators to  keep track of submissions and perform quality control of submitted data.</p>
            <h4>Main Updates</h4>
            <h5><strong>User Updates</strong></h5>
            <ul>
                <li>Acknowledge author contributions on WormBase <a href="https://wormbase.org/resources/paper/WBPaper00059759#0--10" target="_blank">Paper</a> and <a href="https://wormbase.org/resources/person/WBPerson625#014--10" target="_blank">Person</a> pages</li>
                <li>Email all authors of a publication whenever possible</li>
                <li>Added linkout to WB pages for entities in select components</li>
                <li>Simplified add entities lists</li>
                <li>Improved instructions for Allele, Strain, and Transgene sections</li>
                <li>Added WormBase strain IDs</li>
                <li>Expanded exclusion lists (e.g. M9 buffer not recognized as strain)</li>
                <li>Included enzymatic activity neural network</li>
                <li>Added other gene function checkbox</li>
                <li>Created link to 'WormBase AFP Webinar' video</li>
                <li>Updated the FAQ section</li>
            </ul>
            <h5><strong>Curator Dashboard Updates</strong></h5>
            <ul>
                <li>Created summary page with sortable lists of entities removed and added by authors</li>
                <li>Generated a pre-populated spreadsheet of all flagged data for each processed paper to allow authors
                    an alternative data submission pipeline</li>
                <li>Updated dashboard thresholds with new <a href="https://en.wikipedia.org/wiki/Tf%E2%80%93idf#:~:text=In%20information%20retrieval%2C%20tf%E2%80%93idf,in%20a%20collection%20or%20corpus." target="_blank">TFIDF</a> values</li>
                <li>Sorted contributors by number of submissions</li>
                <li>Added download button for lists of papers</li>
            </ul>
            <h3>Release 2.0</h3>
            Release date: 09-14-2020
            <h4>Introduction</h4>
            <p>We improved the AFP system based on feedback received from authors and statistics
                collected during one year of AFP v1.0 author submissions. We improved the definition of
                data types in the form and we refined our text mining algorithms to obtain better results.</p>

            <h4>Main Updates</h4>
            <ul>
                <li>Implemented <a href="https://en.wikipedia.org/wiki/Tf%E2%80%93idf#:~:text=In%20information%20retrieval%2C%20tf%E2%80%93idf,in%20a%20collection%20or%20corpus." target="_blank">TFIDF</a> in place of simple thresholds to improve precision of gene and allele recognition</li>
                <li>Improved datatype descriptions in <span className="glyphicon glyphicon-question-sign"/> mouse-overs</li>
                <li>Added FAQs and Release Notes</li>
            </ul>
            <h3>Release 1.0</h3>
            Release date: 06-03-2019
            <h4>Introduction</h4>
            <p>We are proud to introduce our new AFP system, which leverages text mining to help authors curate
                their papers and send data to WormBase! The system replaces the previous form which required authors
                to submit data manually through free-text forms.</p>

            <h4>Main Updates</h4>
            <ul>
                <li>Automated extraction of biological entities from articles based on text mining</li>
                <li>Extracted entities presented to author for validation through a newly designed web form</li>
                <li>Additional data types can be manually entered by authors</li>
                <li>Dashboard for curators to monitor submissions</li>
                <li>Monthly notifications to curators with newly submitted data</li>
                <li>Periodic email reminders to authors</li>
                <li>More details in <a href="https://academic.oup.com/database/article/doi/10.1093/database/baaa006/5809234" target="_blank">our paper</a> published on Database</li>
            </ul>
        </div>
    );
}

export default ReleaseNotes;
