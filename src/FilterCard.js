import React from 'react';
import 'antd/dist/antd.css';
import { Card, Space } from 'antd';
import './FilterCard.css';

class FilterCard extends React.Component {
    constructor() {
        super();
    }


    render() {
        return (
            <div>
                <div>
                    <Space direction="vertical" size="small">
                        {this.props.cards}
                    </Space>
                </div>
            </div>
        )
    }

}

export default FilterCard;