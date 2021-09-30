import {Component} from "react";
import React from "react";
import {Button, FormControl, Glyphicon, Table} from "react-bootstrap";

class EditableTable extends Component {
    constructor(props) {
        super(props);

        this.handleProductTable = this.handleProductTable.bind(this);
    }
    handleRowDel(product) {
        this.props.remProductFunction(product);
    };

    handleAddEvent() {
        let id = (+ new Date() + Math.floor(Math.random() * 999999)).toString(36);
        let product = {
            id: id,
            name: "",
            publicationId: "",
        };
        this.props.addProductFunction(product);
    }

    handleProductTable(evt) {
        var item = {
            id: evt.target.id,
            name: evt.target.name,
            value: evt.target.value
        };
        var products = this.props.products.slice();
        var newProducts = products.map(function(product) {
            for (var key in product) {
                if (key === item.name && product.id.toString() === item.id) {
                    product[key] = item.value;
                }
            }
            return product;
        });
        this.props.setProductsFunction(newProducts);
    };

    render() {

        return (
            <div>
                <label>{this.props["title"]}</label>
                <ProductTable onProductTableUpdate={this.handleProductTable.bind(this)}
                              onRowAdd={this.handleAddEvent.bind(this)}
                              onRowDel={this.handleRowDel.bind(this)}
                              products={this.props.products}/>
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
                        <th>Name</th>
                        <th>Publication ID - PMID</th>
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
                    type: "name",
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


