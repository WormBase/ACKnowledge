import React from 'react';

class Title extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            title: props.title,
            journal: props.journal
        };
    }

    static removePdfTags(string) {
        let regex = /(<([^>]+)>)/ig;
        return string.replace(regex, "")
    }

    render() {

        let title = "";
        if (this.state.title !== "") {
            if (this.props["pmid"] !== "" && this.props["pmid"] !== undefined) {
                title = <h4 className="text-left"><a
                    href={"https://www.ncbi.nlm.nih.gov/pubmed/" + this.props["pmid"]} target="_blank">{Title.removePdfTags(this.state.title)}</a>; {this.state.journal}
                </h4>;
            } else if (this.props["doi"] !== "" && this.props["doi"] !== undefined){
                title = <h4 className="text-left"><a
                    href={"https://doi.org/" + this.props["doi"]} target="_blank">{Title.removePdfTags(this.state.title)}</a>; {this.state.journal}
                </h4>;
            } else {
                title = <h4 className="text-left">{Title.removePdfTags(this.state.title)}; {this.state.journal}</h4>;
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
}

export default Title;