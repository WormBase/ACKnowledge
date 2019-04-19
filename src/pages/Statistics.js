import React from 'react';
import * as d3 from 'd3';
import LoadingOverlay from 'react-loading-overlay';


class Statistics extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            num_papers_new_afp_processed: 0,
            num_papers_old_afp_processed: 0,
            num_papers_new_afp_author_submitted: 0,
            num_papers_old_afp_author_submitted: 0,
            cx: 0,
            isLoading: false
        };
        this.loadDataFromAPI = this.loadDataFromAPI.bind(this);
    }

    componentDidMount() {
        this.loadDataFromAPI();
    }

    drawAFPPie(pieId, newCount, oldCount, title) {
        let svg = d3.select("#" + pieId ),
        width = svg.attr("width"),
        height = svg.attr("height"),
        radius = Math.min(width, height) / 2 - 30,
        g = svg.append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        let color = d3.scaleOrdinal(['#377eb8','#ff7f00','#984ea3','#e41a1c']);

        // Generate the pie
        let pie = d3.pie();

        let arc = d3.arc()
            .outerRadius(radius - 10)
            .innerRadius(0);

        //Generate groups
        let arcs = g.selectAll("arc")
                    .data(pie([oldCount, newCount]))
                    .enter()
                    .append("g")
                    .attr("class", "arc");

        //Draw arc paths
        arcs.append("path")
            .attr("fill", function(d, i) {
                return color(i);
            })
            .attr("d", arc);

        arcs.append("text")                                     //add a label to each slice
                .attr("transform", function(d) {                    //set the label's origin to the center of the arc
                //we have to make sure to set these before calling arc.centroid
                d.innerRadius = 0;
                d.outerRadius = radius;
                return "translate(" + arc.centroid(d) + ")";        //this gives us a pair of coordinates like [50, 50]
            })
            .attr("text-anchor", "middle")                          //center the text on it's origin
            .text(function(d, i) { return ["Old AFP", "New AFP"][i]; });

        svg.append("g")
            .attr("transform", "translate(" + (width / 2 - title.length * 4) + "," + 20 + ")")
            .append("text")
            .text(title)
            .attr("class", "title")



    }

    loadDataFromAPI() {
        this.setState({isLoading: true});
        fetch(process.env.REACT_APP_API_DB_READ_ADMIN_ENDPOINT + "/stats", {
            method: 'POST',
            headers: {
                'Accept': 'text/html',
                'Content-Type': 'application/json',
            },
        }).then(res => {
            if (res.status === 200) {
                return res.json();
            } else {
                alert("Error")
            }
        }).then(data => {
            if (data === undefined) {
                alert("Empty response")
            }
            this.setState({
                num_papers_new_afp_processed: data["num_papers_new_afp_processed"],
                num_papers_old_afp_processed: data["num_papers_old_afp_processed"],
                num_papers_new_afp_author_submitted: data["num_papers_new_afp_author_submitted"],
                num_papers_old_afp_author_submitted: data["num_papers_old_afp_author_submitted"],
                isLoading: false
            });
            this.drawAFPPie("processedPapersPie", this.state.num_papers_new_afp_processed,
                this.state.num_papers_old_afp_processed, "Papers Processed by AFP");
            this.drawAFPPie("submittedPapersPie", this.state.num_papers_new_afp_author_submitted,
                this.state.num_papers_old_afp_author_submitted, "Data Submitted through AFP");
        }).catch((err) => {
            alert(err);
        });
    }



    render() {
        return(
            <div className="container-fluid">
                <div className="row">
                    <div className="col-sm-12">
                        <LoadingOverlay
                            active={this.state.isLoading}
                            spinner
                            text='Loading paper data...'
                            styles={{
                                overlay: (base) => ({
                                    ...base,
                                    background: 'rgba(65,105,225,0.5)'
                                })
                            }}
                        >
                            Num papers processed by new AFP: {this.state.num_papers_new_afp_processed} <br/>
                            Num papers processed by AFP (new + old): {parseInt(this.state.num_papers_new_afp_processed) +
                        parseInt(this.state.num_papers_old_afp_processed)} <br/>
                            Num papers submitted by authors with new AFP: {this.state.num_papers_new_afp_author_submitted} <br/>
                            Num of papers submitted by authors through AFP (old + new):
                            {parseInt(this.state.num_papers_new_afp_author_submitted) + parseInt(this.state.num_papers_old_afp_author_submitted)}
                        </LoadingOverlay>
                        <svg width="500" height="400" id="processedPapersPie"/>
                        <svg width="500" height="400" id="submittedPapersPie"/>
                    </div>
                </div>
            </div>
        );
    }
}

export default Statistics;