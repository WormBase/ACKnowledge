import React from 'react';

const ReleaseNotes = () => {
    return (
        <div>
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