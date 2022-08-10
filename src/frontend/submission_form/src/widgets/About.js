import React from 'react';
import Panel from "react-bootstrap/lib/Panel";

const About = () => {

    return (
        <div>
            <h4><strong>About</strong></h4>
            <p>The Author Curation to Knowledgebase project (ACKnowledge, previously known as “Author First Pass”) aims at facilitating author curation to biological  knowledgebases.</p>

            <p>Biological knowledgebases serve as a critical resource for researchers and accelerate scientific discoveries by providing manually curated, machine-readable data collections. At present, the aggregation and manual curation of biological data is a labor-intensive process that relies almost entirely on professional biocurators. Biocuration, however, is greatly aided when authors directly participate in the process.</p>

            <p>ACKnowledge employs a semi-automated curation pipeline that identifies biological entities and data types (for example, genes and anatomic expression) from newly published research articles and then automatically emails authors to review the extracted information through a dedicated web interface. During the curation process, authors may modify extracted data, an important quality control measure. Participating authors are publicly acknowledged for their contribution in the knowledgebase.</p>

            <p>The ACKnowledge system, currently implemented by WormBase for the <i>C. elegans</i> literature and soon to be implemented for other species, couples statistical methods and state-of-the-art text mining algorithms to identify entities and data types.</p>

            <p>Additional tools in the ACKnowledge system include software to send automated reminder emails to authors who have not completed their submissions, a notification system to inform knowledgebase curators about new author submissions, and a dashboard for curators to monitor submission status.</p>

            <p>The ACKnowledge project is supported by grant RO1 OD023041 from the National Library of Medicine at the US National Institutes of Health.</p>
            <p>If you have questions about the ACKnowledge project, please contact <a href="mailto:help.acknowledge@wormbase.org">help.acknowledge@wormbase.org</a>.</p>

            <a href="https://github.com/WormBase/ACKnowledge">ACKnowledge Github repository</a>

            <br/><br/>
            <h4><strong>References</strong></h4>
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
        </div>
    );
}

export default About;
