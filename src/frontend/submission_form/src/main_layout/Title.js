import React from 'react';

const Title = (props) => {

    const removePdfTags = (string) => {
        let regex = /(<([^>]+)>)/ig;
        return string.replace(regex, "")
    }

    let title = "";
    if (props.title !== "") {
        if (props["pmid"] !== "" && props["pmid"] !== undefined) {
            title = <h5 className="text-left" style={{marginBottom: '5px'}}><a
                href={"https://www.ncbi.nlm.nih.gov/pubmed/" + props["pmid"]} target="_blank">{removePdfTags(props.title)}</a>; {props.journal}
            </h5>;
        } else if (props["doi"] !== "" && props["doi"] !== undefined){
            title = <h5 className="text-left" style={{marginBottom: '5px'}}><a
                href={"https://doi.org/" + props["doi"]} target="_blank">{removePdfTags(props.title)}</a>; {props.journal}
            </h5>;
        } else {
            title = <h5 className="text-left" style={{marginBottom: '5px'}}>{removePdfTags(props.title)}; {props.journal}</h5>;
        }
    }

    return (
        <div className="container" style={{marginBottom: '15px'}}>
            <div className="row">
                <div className="col-sm-12">
                    <h4 className="text-left" style={{marginBottom: '8px', marginTop: '0'}}>Congratulations on the publication of your paper!</h4>
                    {title}
                </div>
            </div>
        </div>
    );
}

export default Title;