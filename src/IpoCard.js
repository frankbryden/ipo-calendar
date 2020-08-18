import React from 'react';
import 'antd/dist/antd.css';
import { Card, Popover } from 'antd';
import { StarTwoTone } from '@ant-design/icons';
import './card.css'

import placeholderImg from './images/business.jpg'

class IpoCard extends React.Component {
    constructor() {
        super();
        this.state = {
            locallyStoredIPOs: JSON.parse(localStorage.getItem('ipos')),
            expanded: false,
            cardWidth: 400,
            starColor: 'orange'
        }
        this.cardRef = React.createRef();
    }

    // Maybe make all of these states instead?
    checkDate(date) {
        if (date === "No date set") {
            return "grey";
        };
    }

    checkStatus() {
        if (this.props.ipo.status === "Priced") {
            return "Priced: ";
        }
        if (this.props.ipo.status === "Filed") {
            return "First trading day: ";
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

    expandCard() {
        if (!this.state.expanded) {
            this.setState({ expanded: true})
            this.cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
            } else {
                this.setState({ expanded: false})
            }   
    }

    saveIPOlocally() { // this needs to only store DealID or something also I didn't have time to troubleshoot why it didn't work.
        for (let item of this.state.locallyStoredIPOs) {
            if (item === this.props.ipo) {
                this.state.locallyStoredIPOs.pop(item);
            } else {
                this.state.locallyStoredIPOs.push(this.props.ipo);
            }
        }
        localStorage.setItem('ipos', JSON.stringify(this.state.locallyStoredIPOs));
        console.log(localStorage.getItem('ipos'));
    }

    render() {
        return (
            <div ref={this.cardRef}>
                {!this.state.expanded ?
                <Card
                    onClick={() => this.expandCard()}
                    className="card"
                    // title={this.props.ipo.name}
                    style={{ width: 400, margin: 20}}
                    cover={<img alt="Bizniz" src={ this.getCoverImage(this.props.ipo.tags) }></img>}>

                    <Popover content={"Save this IPO"}>
                        <StarTwoTone className="star" twoToneColor='#1E90FF' onClick={() => this.saveIPOlocally()}/>
                    </Popover>   

                    <div className="companyName">{this.props.ipo.name}</div>
                    <Popover content={"Expected market cap at proposed share price"}>
                        <div className="marketCap"><strong>{this.props.ipo.marketCap}</strong></div>
                        {/* <div className="status" style={{ color: this.checkStatus(this.props.ipo.status)}}>{this.props.ipo.status}</div> */}
                    </Popover>
                    <div className="description">{this.props.ipo.description}</div>
                    
                    {/* <div class="tradingDayWrapper"> */}
                        <div class="tradingDayWrapper">{this.checkStatus()} <span className="date" style={{ color: this.checkDate(this.props.ipo.date)}}>{this.props.ipo.date}</span></div>
                    {/* </div> */}
                    <div className="tags">
                        {this.props.ipo.tags.map((tag, index) => <div key={index} style={{ backgroundColor: tag.color }} className="tag">{tag.name}</div>)}
                    </div>
                </Card>:

                <Card
                    onClick={() => this.expandCard()}
                    className="card expandedCard"
                    title={this.props.ipo.name}
                    style={{ width: 800, margin: 20}}>
                    
                    <div className="marketCap"><strong>{this.props.ipo.marketCap}</strong></div>
                    <div className="status" style={{ color: this.checkStatus(this.props.ipo.status)}}>{this.props.ipo.status}</div>
                    
                    <div className="description">{this.props.ipo.description}</div>
                    
                    <div class="tradingDayWrapper">
                        <div>First trading day:</div>
                        <div className="date" style={{ color: this.checkDate(this.props.ipo.date)}}>{this.props.ipo.date}</div>
                    </div>
                    <div className="tags">
                        {this.props.ipo.tags.map((tag, index) => <div key={index} style={{ backgroundColor: tag.color }} className="tag">{tag.name}</div>)}
                    </div>
                </Card>
                }
            </div>
        )
    }
}

export default IpoCard;