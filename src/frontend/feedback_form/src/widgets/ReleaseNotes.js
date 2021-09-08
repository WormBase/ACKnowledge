import React from 'react';

const ReleaseNotes = () => {
    return (
        <div>
            <h3>Release 3.0</h3>
            Release date: 09-14-2021
            <h4>Introduction</h4>
            <p>Based on valuable user feedback, we continue to improve the Author First Pass experience.  In addition
                to providing more streamlined ways to enter entities, we’ve added further instructions for adding new
                entities, and a link to look up specific entities in WormBase.  We now flag papers for enzymatic
                activity and include a free-text field to describe other gene functions.  We updated the FAQs and
                provide a link to the Author First Pass webinar presented in February 2021.  Lastly, to thank authors
                for their valuable contributions, we now acknowledge authors on WormBase person and paper pages. </p>
            <p>We have implemented updates and improvements to our curator dashboard. The dashboard is a tool available
                to WormBase curators to  keep track of submissions and perform quality control of submitted data.</p>
            <h4>Main Features</h4>
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

            <h4>Main Features</h4>
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

            <h4>Main Features</h4>
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
