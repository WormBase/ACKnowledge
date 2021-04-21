import React, {useState} from "react";
import Collapse from "react-bootstrap/lib/Collapse";
import Well from "react-bootstrap/lib/Well";

const FAQsingle = (props) => {

    const [open, setOpen] = useState(false);

    return (
        <div>
            <a onClick={() => setOpen(!open)}><p dangerouslySetInnerHTML={{__html: props.question}}/></a>
            <Collapse in={open}>
                <div>
                    <Well>
                        <p dangerouslySetInnerHTML={{__html: props.answer}}/>
                    </Well>
                </div>
            </Collapse>
        </div>
    );
}

export default FAQsingle;
