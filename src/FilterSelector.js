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
            let btn = <Button key={callbackId} btnid={callbackId} onClick={() => this.btnCallback(callbackId)}>{item.name}</Button>;
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
        console.log(`Callback with id ${id}`);
        console.log(this.state);
        //Get both lists
        let active = this.state.activeFiltersCards;
        let inactive = this.state.inactiveFiltersCards;
        let itemIsActive = this.state.filters[id].active;

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
            } else {
                console.log(`${item.props.btnid} == ${id} -> ${item.props.btnid == id}`)
            }
            clickedItemIndex++;
        }

        console.log("Moving item ");
        console.log(clickedItem);

        //Put item in right list, removing from old list
        if (itemIsActive) {
            active.splice(clickedItemIndex, 1);
            inactive.push(clickedItem);
        } else {
            inactive.splice(clickedItemIndex, 1);
            active.push(clickedItem);
        }

        this.setState({
            activeFiltersCards: active,
            inactiveFiltersCards: inactive
        });
    }

    render() {
        return (
            <div>
                <Row>
                    <Col span={12}>
                        <FilterCard title="Active" cards={this.state.activeFiltersCards} />
                    </Col>
                    <Col span={12}>
                        <FilterCard title="Inactive" cards={this.state.inactiveFiltersCards} />
                    </Col>
                </Row>


            </div>
        )
    }

}

export default FilterSelector;