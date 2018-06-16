import {Component} from "react";
import React from "react";
import {Button, FormControl, Glyphicon, Label, Table} from "react-bootstrap";

class EditableTable extends Component {
    constructor(props) {
        super(props);

        //  this.state.products = [];
        this.state = {};
        this.state.products = [
            {
                id: 1,
                antobody: "",
                publicationId: ""
            }
        ];

    }
    handleRowDel(product) {
        var index = this.state.products.indexOf(product);
        this.state.products.splice(index, 1);
        this.setState(this.state.products);
    };

    handleAddEvent(evt) {
        var id = (+ new Date() + Math.floor(Math.random() * 999999)).toString(36);
        var product = {
            id: id,
            antibody: "",
            publicationId: "",
        };
        this.state.products.push(product);
        this.setState(this.state.products);

    }

    handleProductTable(evt) {
        var item = {
            id: evt.target.id,
            name: evt.target.name,
            value: evt.target.value
        };
        var products = this.state.products.slice();
        var newProducts = products.map(function(product) {

            for (var key in product) {
                if (key == item.name && product.id == item.id) {
                    product[key] = item.value;

                }
            }
            return product;
        });
        this.setState({products:newProducts});
        //  console.log(this.state.products);
    };
    render() {

        return (
            <div>
                <label>Other Antibodies</label>
                <ProductTable onProductTableUpdate={this.handleProductTable.bind(this)} onRowAdd={this.handleAddEvent.bind(this)} onRowDel={this.handleRowDel.bind(this)} products={this.state.products} filterText={this.state.filterText}/>
            </div>
        );

    }

}
class ProductTable extends React.Component {

    render() {
        var onProductTableUpdate = this.props.onProductTableUpdate;
        var rowDel = this.props.onRowDel;
        return (
            <div>
                <Table striped bordered condensed hover>
                    <thead>
                    <tr>
                        <th>Antibody</th>
                        <th>Publication ID</th>
                        <th>&nbsp;</th>
                    </tr>
                    </thead>

                    <tbody>
                    {this.props.products.map(function(product) {
                        return (<ProductRow onProductTableUpdate={onProductTableUpdate} product={product} onDelEvent={rowDel.bind(this)} key={product.id}/>)
                    })}

                    </tbody>
                </Table>
                <Button onClick={this.props.onRowAdd}><Glyphicon glyph={"plus-sign"}/></Button>
            </div>
        );

    }

}

class ProductRow extends React.Component {
    onDelEvent() {
        this.props.onDelEvent(this.props.product);

    }
    render() {

        return (
            <tr>
                <EditableCell onProductTableUpdate={this.props.onProductTableUpdate} cellData={{
                    type: "antibody",
                    value: this.props.product.name,
                    id: this.props.product.id
                }}/>
                <EditableCell onProductTableUpdate={this.props.onProductTableUpdate} cellData={{
                    type: "publicationId",
                    value: this.props.product.publicationId,
                    id: this.props.product.id
                }}/>
                <td>
                    <Button onClick={this.onDelEvent.bind(this)}><Glyphicon glyph={"minus-sign"}/></Button>
                </td>
            </tr>
        );

    }

}
class EditableCell extends React.Component {

    render() {
        return (
            <td>
                <FormControl type='text' name={this.props.cellData.type} id={this.props.cellData.id} value={this.props.cellData.value} onChange={this.props.onProductTableUpdate}/>
            </td>
        );

    }

}

export default EditableTable;


