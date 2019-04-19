import React from 'react';
import * as d3 from 'd3';
import LoadingOverlay from 'react-loading-overlay';
import PanelTitle from "react-bootstrap/es/PanelTitle";
import PanelBody from "react-bootstrap/es/PanelBody";
import {Panel} from "react-bootstrap";
import PanelHeading from "react-bootstrap/es/PanelHeading";


class Statistics extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            num_papers_new_afp_processed: 0,
            num_papers_old_afp_processed: 0,
            num_papers_new_afp_author_submitted: 0,
            num_papers_old_afp_author_submitted: 0,
            num_extracted_genes_per_paper: [],
            num_extracted_species_per_paper: [],
            num_extracted_alleles_per_paper: [],
            num_extracted_strains_per_paper: [],
            num_extracted_transgenes_per_paper: [],
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

        let color = d3.scaleOrdinal(d3.schemeCategory10);

        // Generate the pie
        let pie = d3.pie();
        let arc = d3.arc()
            .outerRadius(radius - 20)
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
            .text(function(d, i) { return ["Old AFP (" + oldCount + ")", "New AFP(" + newCount + ")"][i]; });

        svg.append("g")
            .attr("transform", "translate(" + (width / 2 - title.length * 3.5) + "," + 20 + ")")
            .append("text")
            .text(title)
            .attr("class", "title")
    }

    drawAFPChart(chartId, values) {
        let color = "steelblue";
        let formatCount = d3.format(",.0f");
        let margin = {top: 10, right: 30, bottom: 30, left: 40},
            width = 960 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;

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
            .text(function(d) { return formatCount(d.length); });
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
                num_extracted_genes_per_paper: data["num_extracted_genes_per_paper"],
                num_extracted_species_per_paper: data["num_extracted_species_per_paper"],
                num_extracted_alleles_per_paper: data["num_extracted_alleles_per_paper"],
                num_extracted_strains_per_paper: data["num_extracted_strains_per_paper"],
                num_extracted_transgenes_per_paper: data["num_extracted_transgenes_per_paper"],
                isLoading: false
            });
            this.drawAFPPie("processedPapersPie", this.state.num_papers_new_afp_processed,
                this.state.num_papers_old_afp_processed, "Papers Processed by AFP");
            this.drawAFPPie("submittedPapersPie", this.state.num_papers_new_afp_author_submitted,
                this.state.num_papers_old_afp_author_submitted, "Data Submitted through AFP");
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
                                    <svg width="300" height="300" id="processedPapersPie"/>
                                    <svg width="300" height="300" id="submittedPapersPie"/>
                                </PanelBody>
                            </Panel>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-sm-12">
                            <Panel>
                                <PanelHeading>
                                    Number of genes per paper
                                </PanelHeading>
                                <PanelBody>
                                    <svg width="300" height="300" id="numGenesHist"/>
                                </PanelBody>
                            </Panel>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-sm-12">
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
                        <div className="col-sm-12">
                            <Panel>
                                <PanelHeading>
                                    Number of alleles per paper
                                </PanelHeading>
                                <PanelBody>
                                    <svg width="300" height="300" id="numAllelesHist"/>
                                </PanelBody>
                            </Panel>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-sm-12">
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
                        <div className="col-sm-12">
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

export default Statistics;