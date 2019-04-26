import React from 'react';
import * as d3 from 'd3';
import LoadingOverlay from 'react-loading-overlay';
import PanelBody from "react-bootstrap/es/PanelBody";
import {Panel} from "react-bootstrap";
import PanelHeading from "react-bootstrap/es/PanelHeading";
import {withRouter} from "react-router-dom";


class Statistics extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            num_papers_new_afp_processed: 0,
            num_papers_old_afp_processed: 0,
            num_papers_new_afp_author_submitted: 0,
            num_papers_old_afp_author_submitted: 0,
            num_papers_new_afp_proc_no_sub: 0,
            num_papers_new_afp_partial_sub: 0,
            num_extracted_genes_per_paper: [],
            num_extracted_species_per_paper: [],
            num_extracted_alleles_per_paper: [],
            num_extracted_strains_per_paper: [],
            num_extracted_transgenes_per_paper: [],
            cx: 0,
            isLoading: false
        };
        this.loadDataFromAPI = this.loadDataFromAPI.bind(this);
        this.drawAFPPie = this.drawAFPPie.bind(this);
    }

    componentDidMount() {
        this.loadDataFromAPI();
    }

    drawAFPPie(pieId, counts, labels, linkedListsKeys, title, extraUrlArgs) {
        let svg = d3.select("#" + pieId ),
        width = svg.attr("width"),
        height = svg.attr("height"),
        radius = Math.min(width, height) / 2 - 30,
        g = svg.append("g")
            .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        let color = d3.scaleOrdinal(d3.schemeAccent);

        // Generate the pie
        let pie = d3.pie();
        let arc = d3.arc()
            .outerRadius(radius - 20)
            .innerRadius(0);
        //Generate groups
        let arcs = g.selectAll("arc")
                    .data(pie(counts))
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
            .html(function(d, i) { if (linkedListsKeys[i] !== undefined) { return '<a href="/lists#' +
                linkedListsKeys[i] + extraUrlArgs + '" onclick="location.reload()">' + labels[i] + '</a>' } else { return labels[i] }});

        svg.append("g")
            .attr("transform", "translate(" + (width / 2 - title.length * 3.5) + "," + 20 + ")")
            .append("text")
            .text(title)
            .attr("class", "title")
    }

    drawAFPChart(chartId, values) {
        let color = "steelblue";
        let formatCount = d3.format(",.0f");
        let margin = {top: 20, right: 30, bottom: 30, left: 40},
            width = window.innerWidth / 3 - margin.left - margin.right,
            height = 300 - margin.top - margin.bottom;

        let max = d3.max(values) + 1;
        let min = d3.min(values);
        let x = d3.scaleLinear()
            .domain([min, max])
            .range([0, width]);


        let data = d3.histogram()
            .thresholds(x.ticks(20))
            (values);
        let yMax = d3.max(data, function(d){return d.length});
        let yMin = d3.min(data, function(d){return d.length});
        let colorScale = d3.scaleLinear()
            .domain([yMin, yMax])
            .range([d3.rgb(color).brighter(), d3.rgb(color).darker()]);
        let y = d3.scaleLinear()
            .domain([0, yMax])
            .range([height, 0]);
        let xAxis = d3.axisBottom(x);
        let svg = d3.select("#" + chartId)
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        let bar = svg.selectAll(".bar")
            .data(data)
            .enter().append("g")
            .attr("class", "bar")
            .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")"; });
        bar.append("rect")
            .attr("x", 1)
            .attr("width", (x(data[0].x1 - data[0].x0) - x(0)) - 1)
            .attr("height", function(d) { return height - y(d.length); })
            .attr("fill", function(d) { return colorScale(d.length) });
        bar.append("text")
            .attr("dy", ".75em")
            .attr("y", -12)
            .attr("x", (x(data[0].x1 - data[0].x0) - x(0)) / 2)
            .attr("text-anchor", "middle")
            .text(function(d) { if (d.length > 0) { return formatCount(d.length) } else {return ""}});
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);
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
                num_papers_new_afp_proc_no_sub: data["num_papers_new_afp_proc_no_sub"],
                num_papers_new_afp_partial_sub: data["num_papers_new_afp_partial_sub"],
                num_extracted_genes_per_paper: data["num_extracted_genes_per_paper"],
                num_extracted_species_per_paper: data["num_extracted_species_per_paper"],
                num_extracted_alleles_per_paper: data["num_extracted_alleles_per_paper"],
                num_extracted_strains_per_paper: data["num_extracted_strains_per_paper"],
                num_extracted_transgenes_per_paper: data["num_extracted_transgenes_per_paper"],
                isLoading: false
            });
            this.drawAFPPie("processedPapersPie", [this.state.num_papers_old_afp_processed,
                this.state.num_papers_new_afp_processed,], ["Old AFP (" + this.state.num_papers_old_afp_processed + ")",
                "New AFP(" + this.state.num_papers_new_afp_processed + ")"], [undefined, "1"],
                "Papers Processed by AFP", this.props.location.search);
            this.drawAFPPie("submittedPapersPie", [this.state.num_papers_old_afp_author_submitted,
                this.state.num_papers_new_afp_author_submitted], ["Old AFP (" + this.state.num_papers_old_afp_author_submitted + ")",
                "New AFP(" + this.state.num_papers_new_afp_author_submitted + ")"], [undefined, "2"],
                "Data Submitted through AFP", this.props.location.search);
            this.drawAFPPie("subVSprocPie", [this.state.num_papers_new_afp_proc_no_sub,
                this.state.num_papers_new_afp_author_submitted, this.state.num_papers_new_afp_partial_sub],
                ["Proc no sub (" + this.state.num_papers_new_afp_proc_no_sub + ")",
                "Full sub (" + this.state.num_papers_new_afp_author_submitted + ")",
                "Part sub (" + this.state.num_papers_new_afp_partial_sub + ")"], [undefined, "2", "3"],
                "New AFP: Submitted and Processed Data", this.props.location.search);
            this.drawAFPChart("numGenesHist", this.state.num_extracted_genes_per_paper);
            this.drawAFPChart("numSpeciesHist", this.state.num_extracted_species_per_paper);
            this.drawAFPChart("numAllelesHist", this.state.num_extracted_alleles_per_paper);
            this.drawAFPChart("numStrainsHist", this.state.num_extracted_strains_per_paper);
            this.drawAFPChart("numTransgenesHist", this.state.num_extracted_transgenes_per_paper)
        }).catch((err) => {
            alert(err);
        });
    }



    render() {
        return(
            <div className="container-fluid">

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
                    <div className="row">
                        <div className="col-sm-12">
                            &nbsp;
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-sm-12">
                            <Panel>
                                <PanelHeading>
                                    Data processed by old and new AFP and submitted by authors
                                </PanelHeading>
                                <PanelBody>
                                    <svg width="350" height="350" id="processedPapersPie"/>
                                    <svg width="350" height="350" id="submittedPapersPie"/>
                                    <svg width="350" height="350" id="subVSprocPie"/>
                                </PanelBody>
                            </Panel>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-sm-6">
                            <Panel>
                                <PanelHeading>
                                    Number of genes per paper
                                </PanelHeading>
                                <PanelBody>
                                    <svg width="300" height="300" id="numGenesHist"/>
                                </PanelBody>
                            </Panel>
                        </div>
                        <div className="col-sm-6">
                            <Panel>
                                <PanelHeading>
                                    Number of species per paper
                                </PanelHeading>
                                <PanelBody>
                                    <svg width="300" height="300" id="numSpeciesHist"/>
                                </PanelBody>
                            </Panel>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-sm-6">
                            <Panel>
                                <PanelHeading>
                                    Number of alleles per paper
                                </PanelHeading>
                                <PanelBody>
                                    <svg width="300" height="300" id="numAllelesHist"/>
                                </PanelBody>
                            </Panel>
                        </div>
                        <div className="col-sm-6">
                            <Panel>
                                <PanelHeading>
                                    Number of strains per paper
                                </PanelHeading>
                                <PanelBody>
                                    <svg width="300" height="300" id="numStrainsHist"/>
                                </PanelBody>
                            </Panel>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-sm-6">
                            <Panel>
                                <PanelHeading>
                                    Number of transgenes per paper
                                </PanelHeading>
                                <PanelBody>
                                    <svg width="300" height="300" id="numTransgenesHist"/>
                                </PanelBody>
                            </Panel>
                        </div>
                    </div>
                </LoadingOverlay>
            </div>
        );
    }
}

export default withRouter(Statistics);