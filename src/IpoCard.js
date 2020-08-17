import React from 'react';
import 'antd/dist/antd.css';
import { Card, Popover } from 'antd';
import './card.css'

import placeholderImg from './images/business.jpg'

class IpoCard extends React.Component {
    constructor() {
        super();
    }

    checkDate(date) {
        if (date === "No date set") {
            return "#F7A5A5";
        };
    }

    checkStatus(status) {
        if (status === "Priced") {
            return "#82A88D";
        }
        if (status === "Filed") {
            return "#89A7D9";
        }
    }

    getCoverImage(tag) {
        if (tag.length == 0) {
            return require('./images/business.jpg');
        } if (tag[0].name === "SPAC") {
            return require('./images/businessforsale.jpg');
        } if (tag[0].name === "Biotech") {
            return require('./images/biotech.jpg')
        }
    }

    render() {
        return (
            <div>
                <Card
                    bordered={false}
                    className="card"
                    title={this.props.ipo.name}
                    style={{ width: 400, margin: 20 }}
                    cover={<img alt="Bizniz" src={ this.getCoverImage(this.props.ipo.tags) }></img>}>
                    <Popover content={"Expected market cap at proposed share price"}>
                        <p className="marketCap"><strong>{this.props.ipo.marketCap}</strong></p>
                    </Popover>
                    <p className="description">{this.props.ipo.description}</p>
                    <div class="statusAndDate">
                        <div className="status" style={{ color: this.checkStatus(this.props.ipo.status)}}>{this.props.ipo.status}</div>
                        <Popover content={"Date of first trading day"}>
                            <div className="date" style={{ color: this.checkDate(this.props.ipo.date)}}>{this.props.ipo.date}</div>
                        </Popover>
                    </div>
                    <div className="tags">
                        {this.props.ipo.tags.map(tag => <div style={{ backgroundColor: tag.color }} className="tag">{tag.name}</div>)}
                    </div>
                </Card>
            </div>
        )
    }
}

export default IpoCard;