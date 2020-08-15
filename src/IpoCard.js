import React from 'react';
import 'antd/dist/antd.css';
import { Card } from 'antd';

class IpoCard extends React.Component {
    constructor() {
        super();
    }

    render () {
        return (
            <div>
                <Card title={this.props.ipo.name} style={{ width:300 }}>
                    <p>{this.props.ipo.description}</p>
                    <p>{this.props.ipo.status}</p>
                    <p>{this.props.ipo.tags}</p>
                </Card>
            </div>
        )
    }
}

export default IpoCard;