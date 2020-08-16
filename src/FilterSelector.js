import React from 'react';
import 'antd/dist/antd.css';
import { Card, Button } from 'antd';
import { Row, Col } from 'antd';
import FilterCard from './FilterCard';

class FilterSelector extends React.Component {
    constructor(props){
        super(props);

        let filters = this.initFilters(this.props.items)
        let itemLists = this.initItemLists(filters)
        this.state = {
            activeFiltersCards: itemLists.active,
            inactiveFiltersCards: itemLists.inactive,
            filters: filters,
        };
    }

    initItemLists(filters){
        let itemLists = {
            active: [],
            inactive: []
        };
        for (let item of filters) {
            let callbackId = item.id;
            let btn = <Button className="cardBtn" size="small" key={callbackId} btnid={callbackId} onClick={() => this.btnCallback(callbackId)}>{item.name}</Button>;
            if (item.active)
                itemLists.active.push(btn)
            else
                itemLists.inactive.push(btn)
        }
        return itemLists
    }


    initFilters(items) {
        let filters = [];
        console.log(items);
        for (let i = 0; i < items.length; i++) {
            filters.push({
                    "id": i,
                    "name": items[i],
                    "active": false
            });
        }
        
        return filters

    }

    componentDidMount(){

    }

    btnCallback(id){
        //Get both lists
        let active = this.state.activeFiltersCards;
        let inactive = this.state.inactiveFiltersCards;
        let filters = this.state.filters;
        let itemIsActive = filters[id].active;

        //Get item/itemIndex of clickedItem
        let clickedItem;
        let clickedItemIndex = 0;

        //Get item in appropriate list
        let sourceList;
        if (itemIsActive){
            sourceList = active;
        } else {
            sourceList = inactive;
        }
        
        for (let item of sourceList) {
            if (item.props.btnid == id) {
                clickedItem = item;
                break
            }
            clickedItemIndex++;
        }
        
        //Put item in right list, removing from old list
        if (itemIsActive) {
            active.splice(clickedItemIndex, 1);
            inactive.push(clickedItem);
        } else {
            inactive.splice(clickedItemIndex, 1);
            active.push(clickedItem);
        }

        //toggle filter item active
        filters[id].active = !itemIsActive;

        this.setState({
            activeFiltersCards: active,
            inactiveFiltersCards: inactive,
            filters: filters
        });
    }

    render() {
        return (
            <div>
                <Row type="flex">
                    <Col span={12}>
                        <h2>Inactive</h2>
                        <FilterCard height={this.props.height} title="Inactive" cards={this.state.inactiveFiltersCards} />
                    </Col>
                    <Col span={12}>
                        <h2>Active</h2>
                        <FilterCard height={this.props.height} title="Active" cards={this.state.activeFiltersCards} />
                    </Col>
                </Row>


            </div>
        )
    }

}

export default FilterSelector;