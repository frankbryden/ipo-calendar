import React from 'react';
import 'antd/dist/antd.css';
import { Card } from 'antd';
import './card.css'

import placeholderImg from './images/business.jpg'

class IpoCard extends React.Component {
    constructor() {
        super();
    }



    render() {
        return (
            <div>
                <Card
                    bordered={false}
                    className="card"
                    title={this.props.ipo.name}
                    style={{ width: 400, height: 800, margin: 20 }}
                    cover={<img alt="Bizniz" src={require('./images/business.jpg')}></img>}
                    >
                    <p className="marketCap"><strong>{this.props.ipo.marketCap}</strong></p>
                    <p className="description">{this.props.ipo.description}</p>
                    <p className="status">{this.props.ipo.status}</p>
                    <div className="tags">
                        {this.props.ipo.tags.map(tag => <div style={{ backgroundColor: tag.color }} className="tag">{tag.name}</div>)}
                    </div>
                </Card>
            </div>
        )
    }
}

export default IpoCard;