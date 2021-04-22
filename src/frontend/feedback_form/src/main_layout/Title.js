import React from 'react';

const Title = (props) => {

    const removePdfTags = (string) => {
        let regex = /(<([^>]+)>)/ig;
        return string.replace(regex, "")
    }

    let title = "";
    if (props.title !== "") {
        if (props["pmid"] !== "" && props["pmid"] !== undefined) {
            title = <h4 className="text-left"><a
                href={"https://www.ncbi.nlm.nih.gov/pubmed/" + props["pmid"]} target="_blank">{removePdfTags(props.title)}</a>; {props.journal}
            </h4>;
        } else if (props["doi"] !== "" && props["doi"] !== undefined){
            title = <h4 className="text-left"><a
                href={"https://doi.org/" + props["doi"]} target="_blank">{removePdfTags(props.title)}</a>; {props.journal}
            </h4>;
        } else {
            title = <h4 className="text-left">{removePdfTags(props.title)}; {props.journal}</h4>;
        }
    }

    return (
        <div className="container">
            <div className="row">
                <div className="col-sm-12">
                    <h3 className="text-left">Congratulations on the publication of your paper!</h3>
                </div>
            </div>
            <div className="row">
                <div className="col-sm-12">
                    {title}
                </div>
            </div>
        </div>
    );
}

export default Title;