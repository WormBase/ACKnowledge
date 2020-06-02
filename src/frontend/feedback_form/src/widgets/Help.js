import React from 'react';
import Panel from "react-bootstrap/lib/Panel";

class Help extends React.Component {

    render() {
        return (
            <div>
                <Panel>
                    <Panel.Heading>
                        <Panel.Title componentClass="h3">
                            Contacts
                        </Panel.Title>
                    </Panel.Heading>
                    <Panel.Body>
                        <a href="mailto:help.afp@wormbase.org">help.afp@wormbase.org</a>
                    </Panel.Body>
                </Panel>
                <Panel>
                    <Panel.Heading>
                        <Panel.Title componentClass="h3">
                            Video Tutorials
                        </Panel.Title>
                    </Panel.Heading>
                    <Panel.Body>

                    </Panel.Body>
                </Panel>
                <Panel>
                    <Panel.Heading>
                        <Panel.Title componentClass="h3">
                            FAQ
                        </Panel.Title>
                    </Panel.Heading>
                    <Panel.Body>

                    </Panel.Body>
                </Panel>
                <Panel>
                    <Panel.Heading>
                        <Panel.Title componentClass="h3">
                            References
                        </Panel.Title>
                    </Panel.Heading>
                    <Panel.Body>
                        [1] Valerio Arnaboldi, Daniela Raciti, Kimberly Van Auken, Juancarlos N Chan, Hans-Michael Müller,
                        Paul W Sternberg, <i>Text mining meets community curation: a newly designed curation platform to
                        improve author experience and participation at WormBase</i>, Database, Volume 2020, 2020, baaa006,
                        <a href="https://doi.org/10.1093/database/baaa006"> https://doi.org/10.1093/database/baaa006</a>
                    </Panel.Body>
                </Panel>
            </div>
        );
    }
}

export default Help;