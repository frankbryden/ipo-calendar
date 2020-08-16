import React from 'react';
import 'antd/dist/antd.css';
import { Card } from 'antd';
import './card.css'

class IpoCard extends React.Component {
    constructor() {
        super();
    }

    

    render () {
        return (
            <div>
                <Card 
                className="card"
                title={this.props.ipo.name} 
                style={{ width:400, height: 700, margin: 20}} 
                cover={<img alt="Example" src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"></img>}
                hoverable>
                    <p className="marketCap"><strong>{this.props.ipo.marketCap}</strong></p>
                    <p className="description">{this.props.ipo.description}</p>
                    <p className="status">{this.props.ipo.status}</p>
                    <div className="tags">{this.props.ipo.tags.map(tag => <div className="tag">{tag.name}</div>)}</div>
                </Card>      
            </div>
        )
    }
}

export default IpoCard;