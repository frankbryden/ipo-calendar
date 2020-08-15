import React from 'react';
import 'antd/dist/antd.css';
import { Card } from 'antd';

class FilterCard extends React.Component {
    constructor(){
        super();
    }


    render() {
        return (
            <div>
                <Card title={this.props.title}>
                    <div>
                        {this.props.cards}
                    </div>
                </Card>
            </div>
        )
    }

}

export default FilterCard;