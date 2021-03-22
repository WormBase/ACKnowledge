import {Component} from "react";
import React from "react";
import {Button, FormControl, Glyphicon, Table} from "react-bootstrap";

class OneColumnEditableTable extends Component {
    constructor(props) {
        super(props);

        this.handleProductTable = this.handleProductTable.bind(this);
        this.updateProducts = this.updateProducts.bind(this);
    }

    handleRowDel(product) {
        this.props.remProductFunction(product)
    };

    handleAddEvent(evt) {
        let id = Math.max(...this.props.products.map((product) => product.id)) + 1;
        this.props.addProductFunction({id: id, name: ''});
    }

    handleProductTable(evt) {
        var item = {
            id: evt.target.id,
            name: evt.target.name,
            value: evt.target.value
        };
        var newProducts = this.props.products.map(function(product) {
            for (var key in product) {
                if (key === item.name && product.id.toString() === item.id) {
                    product[key] = item.value;
                }
            }
            return product;
        });
        this.props.setProductsFunction(newProducts);
    };

    updateProducts(newProducts) {
        this.setState({products: newProducts});
    }
    render() {

        return (
            <div>
                <label>{this.props["title"]}</label>
                <ProductTable onProductTableUpdate={this.handleProductTable.bind(this)}
                              onRowAdd={this.handleAddEvent.bind(this)}
                              onRowDel={this.handleRowDel.bind(this)}
                              products={this.props.products}
                              sampleText={this.props.sampleText}
                />
            </div>
        );

    }

}
class ProductTable extends React.Component {

    render() {
        var onProductTableUpdate = this.props.onProductTableUpdate;
        var rowDel = this.props.onRowDel;
        let sampleText = this.props.sampleText;
        return (
            <div>
                <Table striped bordered condensed hover>
                    <thead>
                    <tr>
                        <th>Name</th>
                        <th>&nbsp;</th>
                    </tr>
                    </thead>

                    <tbody>
                    {this.props.products.map(function(product) {
                        return (<ProductRow onProductTableUpdate={onProductTableUpdate} product={product} onDelEvent={rowDel.bind(this)} key={product.id} sampleText={sampleText}/>)
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
                }} sampleText={this.props.sampleText}/>
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
                <FormControl type='text' name={this.props.cellData.type} placeholder={this.props.sampleText} id={this.props.cellData.id} value={this.props.cellData.value} onChange={this.props.onProductTableUpdate}/>
            </td>
        );

    }

}

export default OneColumnEditableTable;


