import React from 'react';
import 'antd/dist/antd.css';
import { Card, Popover, Button } from 'antd';
import { StarTwoTone, PlusOutlined } from '@ant-design/icons';
import TweenOne from 'rc-tween-one';
import './card.css'

import placeholderImg from './images/business.jpg'

const starSavedColor = "#db5e56";//"#3990ed";
const starUnsavedColor = "#a4c7ed";

class IpoCard extends React.Component {
    constructor(props) {
        super(props);
        this.saveIpo = this.saveIpo.bind(this);
        this.state = {
            locallyStoredIPOs: JSON.parse(localStorage.getItem('ipos')),
            expanded: false,
            showExpand: false,
            cardWidth: 400,
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

    expandCard() {
        if (!this.state.expanded) {
            this.setState({ expanded: true });
            this.cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
            this.setState({ expanded: false });
        }
    }

    saveIpo() {
        this.props.onSave(this.props.cardId)
    }

    mouseEntered() {
        this.setState({showExpand: true});
    }

    mouseLeft(){
        this.setState({showExpand: false});
    }

    render() {
        return (
            <div ref={this.cardRef}>
                <Card
                    onClick={() => this.expandCard()}
                    onMouseEnter={() => this.mouseEntered()}
                    onMouseLeave={() => this.mouseLeft()}
                    className="card small"
                    // title={this.props.ipo.name}
                    style={{ width: 400, height: 550, margin: 15 }} // <div style={{window.innerWidth > 768 ? '800px' : '400px'}}/> USE THIS MAX FOR THE MOBILE VERSION!
                >

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
                    {this.state.showExpand && 
                    <TweenOne
                        className="bottomRight"
                        animation={[{ x:1, y: 50, type: 'from', opacity: 0, duration:150, ease: 'easeOutQuad' },
                        {  x: 1, y: 1, duration:20 }]}
                    >
                        <Button onClick={() => this.expandCard()} className="expandBtn"><PlusOutlined /></Button>
                    </TweenOne>
                    }
                </Card>



            </div>
        )
    }
}

export default IpoCard;