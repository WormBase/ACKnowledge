import React from 'react';
import Panel from "react-bootstrap/lib/Panel";

const About = () => {

    return (
        <div>
            <h4><strong>About</strong></h4>
            <p>The ACKnowledge project (Author Curation to Knowledgebase) aims at facilitating author curation to biological  knowledgebases.</p>

            <p>Biological knowledgebases serve as a critical resource for researchers and accelerate scientific discoveries by providing manually curated, machine-readable data collections. At present, the aggregation and manual curation of biological data is a labor-intensive process that relies almost entirely on professional biocurators. Biocuration, however, is greatly aided when authors directly participate in the process.</p>

            <p>ACKnowledge employs a semi-automated curation pipeline that identifies biological entities and data types (for example, genes and anatomic expression) from newly published research articles and then automatically emails authors to review the extracted information through a dedicated web interface. During the curation process, authors may modify extracted data, an important quality control measure. Participating authors are publicly acknowledged for their contribution in the knowledgebase.</p>

            <p>The ACKnowledge system, currently implemented by WormBase for the <i>C. elegans</i> literature and soon to be implemented for other species, couples statistical methods and state-of-the-art text mining algorithms to identify entities and data types.</p>

            <p>Additional tools in the ACKnowledge system include software to send automated reminder emails to authors who have not completed their submissions, a notification system to inform knowledgebase curators about new author submissions, and a dashboard for curators to monitor submission status.</p>

            <p>The ACKnowledge project was supported (2021-2025) by grant RO1 OD023041 from the National Library of Medicine at the US National Institutes of Health.</p>
            <p>If you have questions about the ACKnowledge project, please contact <a href="mailto:help.acknowledge@wormbase.org">help.acknowledge@wormbase.org</a>.</p>

            <a href="https://github.com/WormBase/ACKnowledge">ACKnowledge Github repository</a>

            <br/><br/>
            <h4><strong>References</strong></h4>
            <ol>
                <li>
                    Raciti D, Van Auken KM, Arnaboldi V, Tabone CJ, Muller HM, Sternberg PW. <i>Characterization and
                    automated classification of sentences in the biomedical literature: a case study for biocuration of
                    gene expression and protein kinase activity</i>. Database (Oxford). 2025 Jan 18;2025:baaf063.
                    doi: <a target='_blank' href="https://doi.org/10.1093/database/baaf063">10.1093/database/baaf063</a>.
                    PMID: 41026497; PMCID: PMC12482909.
                </li>
                <li>
                    Arnaboldi V, Raciti D, Van Auken K, Chan JN, Müller HM, Sternberg PW. <i>Text mining meets community
                    curation: a newly designed curation platform to improve author experience and participation at
                    WormBase</i>. Database (Oxford). 2020 Jan 1;2020:baaa006.
                    doi: <a target='_blank' href="https://doi.org/10.1093/database/baaa006">10.1093/database/baaa006</a>.
                    PMID: 32185395; PMCID: PMC7078066.
                </li>
                <li>
                    Müller HM, Van Auken KM, Li Y, Sternberg PW. <i>Textpresso Central: a customizable platform for
                    searching, text mining, viewing, and curating biomedical literature</i>. BMC Bioinformatics. 2018
                    Mar 9;19(1):94.
                    doi: <a target='_blank' href="https://doi.org/10.1186/s12859-018-2103-8">10.1186/s12859-018-2103-8</a>.
                    PMID: 29523070; PMCID: PMC5845379.
                </li>
                <li>
                    Fang R, Schindelman G, Van Auken K, Fernandes J, Chen W, Wang X, Davis P, Tuli MA, Marygold SJ,
                    Millburn G, Matthews B, Zhang H, Brown N, Gelbart WM, Sternberg PW. <i>Automatic categorization of
                    diverse experimental information in the bioscience literature</i>. BMC Bioinformatics. 2012 Jan
                    26;13:16.
                    doi: <a target='_blank' href="https://doi.org/10.1186/1471-2105-13-16">10.1186/1471-2105-13-16</a>.
                    PMID: 22280404; PMCID: PMC3305665.
                </li>
            </ol>
        </div>
    );
}

export default About;
