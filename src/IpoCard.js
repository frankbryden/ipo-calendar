import React from 'react';
import 'antd/dist/antd.css';
import { Card, Popover, Button } from 'antd';
import { StarTwoTone, PlusOutlined, MinusOutlined } from '@ant-design/icons';
import TweenOne from 'rc-tween-one';
import './card.css'
import { motion, useMotionValue, MotionValue } from "framer-motion"

import placeholderImg from './images/business.jpg'

const starSavedColor = "#db5e56";//"#3990ed";
const starUnsavedColor = "#a4c7ed";

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
        }
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
        let targetHeight = window.innerHeight / 4;

        let deltaX = targetWidth - rect.x - rect.width / 2 - siderWidth;
        let deltaY = targetHeight - rect.y;

        this.setState({ variants: {
            open: { type: "spring", stiffness: 100, damping: 30, x: deltaX, y: deltaY},
            closed: { type: "spring", stiffness: 50, damping: 30, x: 0, y: 0},
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
            <div>
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
                    className={`card ${this.state.expanded && "expanded"}`}
                    style={{ width: 400, height: 600, margin: "auto"}}>

                    <Popover content={"Save this IPO"}>
                        <StarTwoTone className="star" twoToneColor={this.props.saved ? starSavedColor : starUnsavedColor} onClick={this.saveIpo} />
                    </Popover>

                    <div className="companyName">{this.props.ipo.name}</div>
                    <Popover content={"Expected market cap at proposed share price"}>
                        <div className="marketCap"><strong>{this.props.ipo.marketCap}</strong></div>
                    </Popover>
                    <div className="description">{this.props.ipo.description}</div>

                    <div className="tradingDayWrapper">{this.checkStatus()} <span className="date" style={{ color: this.checkDate(this.props.ipo.date) }}>{this.props.ipo.date}</span></div>
                    <div className="tags">
                        {this.props.ipo.tags.map((tag, index) => <div key={index} style={{ backgroundColor: tag.color }} className="tag">{tag.name}</div>)}
                    </div>
 
                    {this.state.expanded ? 
                    <div>
                        <div className="companyName">{this.props.ipo.name}</div>
                        <div className="companyName">{this.props.ipo.name}</div>
                        <div className="companyName">{this.props.ipo.name}</div>
                        <div className="companyName">{this.props.ipo.name}</div>
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
                </Card>
                </motion.div>  
            </div>    
            
        )
    }
}

export default IpoCard;