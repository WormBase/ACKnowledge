import React from 'react';
import * as d3 from 'd3';
import LoadingOverlay from 'react-loading-overlay';
import {withRouter} from "react-router-dom";
import {Card, Col, Container, Row} from "react-bootstrap";


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
            width = window.innerWidth / 3,
            height =  window.innerHeight / 2,
            radius = Math.min(width, height) / 2.7,
            g = svg.append("g")
                .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

        svg.attr("width", width)
            .attr("height", height);

        let color = d3.scaleOrdinal(d3.schemeAccent);

        // Generate the pie
        let pie = d3.pie();
        let arc = d3.arc()
            .outerRadius(radius - 20)
            .innerRadius(width / 7);
        //Generate groups
        let arcs = g.selectAll("arc")
                    .data(pie(counts))
                    .enter()
                    .append("g")
                    .attr("class", "arc");
        //Draw arc paths
        arcs.append("path")
            .attr("stroke", "gray")
            .attr("fill", function(d, i) {
                return color(i);
            })
            .attr("d", arc);

        arcs.append("text")
            .attr("transform", d => "translate(" + arc.centroid(d) + ")")
            .attr("dy", "0.35em")
            .attr("text-anchor", "middle")
            .text(function(d, i) { return labels[i] });

        svg.append("g")
            .attr("transform", "translate(" + (width / 2 - title.length * 3.5) + "," + 20 + ")")
            .append("text")
            .text(title)
            .attr("class", "title")
    }

    drawAFPChart(chartId, values) {
        let color = "steelblue";
        let formatCount = d3.format(",.0f");
        let margin = {top: 20, right: 30, bottom: 50, left: 40},
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
        svg.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 0 - margin.left)
            .attr("x",0 - (height / 2))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text("# of papers");
        svg.append("text")
            .attr("transform",
                "translate(" + (width/2) + " ," +
                (height + margin.top + 20) + ")")
            .style("text-anchor", "middle")
            .text("# of entities");
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
            this.drawAFPPie("oldAFPPie", [this.state.num_papers_old_afp_processed,
                this.state.num_papers_old_afp_author_submitted,], [
                    parseInt(this.state.num_papers_old_afp_processed) - parseInt(
                        this.state.num_papers_old_afp_author_submitted),
                this.state.num_papers_old_afp_author_submitted], [undefined, undefined],
                "Old AFP", this.props.location.search);
            this.drawAFPPie("newAFPPie", [this.state.num_papers_new_afp_proc_no_sub,
                this.state.num_papers_new_afp_author_submitted, this.state.num_papers_new_afp_partial_sub],
                [this.state.num_papers_new_afp_proc_no_sub, this.state.num_papers_new_afp_author_submitted,
                this.state.num_papers_new_afp_partial_sub], [undefined, undefined, undefined],
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
            <Container fluid>
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
                    <Row>
                        <Col sm="12">
                            &nbsp;
                        </Col>
                    </Row>
                    <Row>
                        <Col sm="12">
                            <Card>
                                <Card.Header>
                                    Data processed by old and new AFP and submitted by authors
                                </Card.Header>
                                <Card.Body>
                                    <Container>
                                        <Row>
                                            <Col sm="6">
                                                <svg id="oldAFPPie"/>
                                            </Col>
                                            <Col sm="6">
                                                <svg id="newAFPPie"/>
                                            </Col>
                                        </Row>
                                        <Row>
                                            <Col sm="12">
                                                <Container fluid>
                                                    <Row>
                                                        <Col sm="2">
                                                            &nbsp;
                                                        </Col>
                                                        <Col sm="1">
                                                            <div className="box colorAccent1"/>
                                                        </Col>
                                                        <Col sm="9">
                                                            Processed by AFP but no data submitted by author
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col sm="2">
                                                            &nbsp;
                                                        </Col>
                                                        <Col sm="1">
                                                            <div className="box colorAccent2"/>
                                                        </Col>
                                                        <Col sm="9">
                                                            Submission completed by author
                                                        </Col>
                                                    </Row>
                                                    <Row>
                                                        <Col sm="2">
                                                            &nbsp;
                                                        </Col>
                                                        <Col sm="1">
                                                            <div className="box colorAccent3"/>
                                                        </Col>
                                                        <Col sm="9">
                                                            Partial submission by author
                                                        </Col>
                                                    </Row>
                                                </Container>
                                            </Col>
                                        </Row>
                                    </Container>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Col sm="12">
                            &nbsp;
                        </Col>
                    </Row>
                    <Row>
                        <Col sm="6">
                            <Card>
                                <Card.Header>
                                    Number of genes per paper
                                </Card.Header>
                                <Card.Body>
                                    <svg width="300" height="300" id="numGenesHist"/>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col sm="6">
                            <Card>
                                <Card.Header>
                                    Number of species per paper
                                </Card.Header>
                                <Card.Body>
                                    <svg width="300" height="300" id="numSpeciesHist"/>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Col sm="12">
                            &nbsp;
                        </Col>
                    </Row>
                    <Row>
                        <Col sm="6">
                            <Card>
                                <Card.Header>
                                    Number of alleles per paper
                                </Card.Header>
                                <Card.Body>
                                    <svg width="300" height="300" id="numAllelesHist"/>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col sm="6">
                            <Card>
                                <Card.Header>
                                    Number of strains per paper
                                </Card.Header>
                                <Card.Body>
                                    <svg width="300" height="300" id="numStrainsHist"/>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                    <Row>
                        <Col sm="12">
                            &nbsp;
                        </Col>
                    </Row>
                    <Row>
                        <Col sm="6">
                            <Card>
                                <Card.Header>
                                    Number of transgenes per paper
                                </Card.Header>
                                <Card.Body>
                                    <svg width="300" height="300" id="numTransgenesHist"/>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </LoadingOverlay>
            </Container>
        );
    }
}

export default withRouter(Statistics);