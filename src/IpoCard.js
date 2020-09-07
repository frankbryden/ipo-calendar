import React from 'react';
import 'antd/dist/antd.css';
import { Card, Popover, Button } from 'antd';
import { StarTwoTone, PlusOutlined, MinusOutlined } from '@ant-design/icons';
import TweenOne from 'rc-tween-one';
import './card.css'
import { motion, useMotionValue, MotionValue } from "framer-motion"

import placeholderImg from './images/business.jpg'

const starSavedColor = "orange";//"#3990ed";
const starUnsavedColor = "#3990ed";

class IpoCard extends React.Component {
    constructor(props) {
        super(props);
        this.cardRef = React.createRef();
        this.saveIpo = this.saveIpo.bind(this);
        this.state = {
            locallyStoredIPOs: JSON.parse(localStorage.getItem('ipos')),
            expanded: false,
            showExpand: false,
            variants: {},
            dateColor: this.checkDate(),
            statusText: this.checkStatus(),
        }
    }

    checkDate() {
        if (this.props.ipo.date.isDateSet == false) {
           return "grey";
        };
    }

    checkStatus() {
        if (this.props.ipo.status === "Priced") {
            return "Priced: ";
        }
        if (this.props.ipo.status === "Filed") {
            return "First Trading Day: ";
        }
    }

    expandCard() {
        if (window.innerWidth > 1200) {
            this.calculateCardPosition()
        }
        if (!this.state.expanded) {
            this.setState({ expanded: true });
            
        } else {
            this.setState({ expanded: false });
        }
    }

    calculateCardPosition() {
        let rect = this.cardRef.current.getBoundingClientRect();
        console.log(rect);
        let siderWidth = document.querySelector(".ant-layout-sider").clientWidth;
        let targetWidth = window.innerWidth / 2 + siderWidth;
        let targetHeight = window.innerHeight / 12;

        let deltaX = targetWidth - rect.x - rect.width / 2 - siderWidth;
        let deltaY = targetHeight - rect.y;

        this.setState({ variants: {
            open: {  stiffness: 100, damping: 30, x: deltaX, y: deltaY},
            closed: { stiffness: 100, damping: 30, x: 0, y: 0},
          }});
    }

    saveIpo() {
        this.props.onSave(this.props.cardId)
    }

    mouseEntered() {
        this.setState({showExpand: true});
    }

    mouseLeft() {
        this.setState({showExpand: false});
    }

    render() {
        return (
            <>
                <div className="overlay" style={{visibility: this.state.expanded && window.innerWidth > 1200? "visible": "hidden", 
                zIndex: this.state.expanded? "1": "-1"}}
                onClick={() => this.setState({expanded: false})}></div>
                
                <motion.div
                    ref={this.cardRef}
                    animate={ this.state.expanded ? "open" : "closed" }
                    variants={this.state.variants}
                    transition={{ duration: 0.3 }}
                    style={{zIndex: this.state.expanded ? 2 : 0}}>

                    <Card
                        onMouseEnter={() => this.mouseEntered()}
                        onMouseLeave={() => this.mouseLeft()}
                        className={`card ${this.state.expanded && "expanded"} ${this.props.minimized && !this.state.expanded && "minimized"}`}
                        style={{ width: 400, height: 600, margin: "auto"}}>

                        <Popover content={"Save this IPO"}>
                            <StarTwoTone className="star" twoToneColor={this.props.saved ? starSavedColor : starUnsavedColor} onClick={this.saveIpo} />
                        </Popover>

                        <div onClick={() => this.expandCard()} className="companyName">{this.state.expanded ? this.props.ipo.name + " (" + this.props.ipo.ticker + ")": this.props.ipo.name}</div>
                        <Popover content={"Expected market cap at proposed share price"}>
                            <div className="marketCap"><strong>{this.props.ipo.marketcap === "$ NaNM" ? "Market Cap not set": this.props.ipo.marketcap}</strong></div>
                        </Popover>

                        {this.props.minimized && !this.state.expanded ? <><div className="date dateMinimized" style={{color: this.state.dateColor}}>{this.props.ipo.date.value}</div></>: 
                            <>
                                <div className="description">{this.state.expanded ? this.props.ipo.description: this.props.ipo.description.slice(0, 350) + "..."}</div>
                                <div className="tradingDayWrapper">{this.state.statusText} 
                                    <span className="date" style={{ color: this.state.dateColor }}>{this.props.ipo.date.value}</span>
                                    <span className="exchange">{this.props.ipo.exchange}</span>
                                </div>
                            </>
                        }

                        {this.state.expanded ? 
                        
                        <div>
                            <div className="expandedInfoWrapper">
                                <div className="financialInfo"> <h2>Financial information:</h2>
                                    <div>Revenue: <span className="financialData">{this.props.ipo.revenue}</span></div>
                                    <div>Net income: <span className="financialData">{this.props.ipo.income}</span></div>
                                    <div>Stockholders Equity: <span className="financialData" style={{color: this.props.ipo.stockholdersEquity.includes("(") ? '#AD2403': '#04ad72'}}>{this.props.ipo.stockholdersEquity}</span></div>
                                    <div>CEO: <span className="financialData">{this.props.ipo.ceo}</span></div>
                                </div>
                                <div className="furtherReading"> <h2>Further Reading:</h2>
                                {
                                    this.props.ipo.url.length > 0 &&
                                    <div className="website"><a href={"http://" + this.props.ipo.url} target="_blank">Company Website</a></div>
                                }
                                    
                                    <div className="latestfilings">{this.props.ipo.filings.map(filing => <a href={filing.link} target="_blank">{filing.formType}<br></br></a>)}</div>
                                </div>
                                
                            </div>

                            <TweenOne
                            className="bottomRight"
                            animation={[{ x:1, y: 50, type: 'from', opacity: 0, duration:150, ease: 'easeOutQuad' },
                            {  x: 1, y: 1, duration:20 }]}>
                            
                            <Button onClick={() => this.expandCard()} className="expandBtn"><MinusOutlined /></Button>
                            
                        </TweenOne>
                        </div>: <TweenOne
                            className="bottomRight"
                            animation={[{ x:1, y: 50, type: 'from', opacity: 0, duration:150, ease: 'easeOutQuad' },
                            {  x: 1, y: 1, duration:20 }]}>
                            
                            <Button onClick={() => this.expandCard()} className="expandBtn"><PlusOutlined /></Button>
                            
                        </TweenOne>}

                        <div className="tags">
                            {this.props.ipo.tags.map((tag, index) => <div key={index} style={{ backgroundColor: tag.color }} className="tag">{tag.name}</div>)}
                        </div>
                    </Card>
                </motion.div>  
            </>   
            
        )
    }
}

export default IpoCard;