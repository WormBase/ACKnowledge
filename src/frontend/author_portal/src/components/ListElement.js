import React from "react";

const ListElement = ({ item }) => {
    return (
        <a href={item.afp_link} target="_blank"><div dangerouslySetInnerHTML={{__html: item.title}}/></a>
    );
};

export default ListElement;