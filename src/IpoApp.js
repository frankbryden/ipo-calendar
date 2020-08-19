import React from 'react';
import 'antd/dist/antd.css';
import { Layout, Card, Button, Input, Space } from 'antd';
import { MenuUnfoldOutlined, MenuFoldOutlined, SearchOutlined } from '@ant-design/icons';
import FilterSelector from './FilterSelector';
import IpoCard from './IpoCard';
import './card.css';
import './sider.css';

const { Footer, Sider, Content, Header } = Layout;

class IpoApp extends React.Component {
    constructor(props) {
        super(props);
        this.statusFilterChange = this.statusFilterChange.bind(this);
        this.tagFilterChange = this.tagFilterChange.bind(this);
        this.toggleSidebar = this.toggleSidebar.bind(this);
        this.sidebarLeftMargin = "22vw";
        this.sidebarNoMargin = "0vw";
        this.state = {
            loading: true,
            ipos: this.props.ipos.map((ipo, index) => {
                return {
                    ipoCard: <IpoCard key={index} ipo={ipo} onSave={() => this.saveIPOLocally(index)} />,
                    ipo: ipo,
                    cardId: index,
                    tags: ipo.tags.map(tag => tag.name),
                    status: ipo.status,
                    visible: true,
                    storedLocally: false,
                }
            }),
            collapsed: false,
            tagFilters: [],
            statusFilters: [],
            searchValue: "",
        }
    }

    toggleSidebar() {
        console.log("toggleee");
        this.setState({
            collapsed: !this.state.collapsed
        });
    }


    tagFilterChange(filter, toggle) {
        console.log(`tag filter change with ${filter} and toggle = ${toggle}`);
        //toggle = true means filter was added
        let tagFilters = this.state.tagFilters;
        if (toggle) {
            tagFilters.push(filter);
        } else {
            tagFilters.splice(tagFilters.indexOf(filter), 1);
        }
        this.setState({
            tagFilters: tagFilters
        });
        this.updateIPOVisibility();
    }

    statusFilterChange(filter, toggle) {
        //toggle = true means filter was added
        let statusFilters = this.state.statusFilters;
        if (toggle) {
            statusFilters.push(filter);
        } else {
            statusFilters.splice(statusFilters.indexOf(filter), 1);
        }
        this.setState({
            statusFilters: statusFilters
        });
        this.updateIPOVisibility();
    }

    updateIPOVisibility() {
        console.log(`Got to update with ${this.state.searchValue}`);
        let ipos = this.state.ipos;
        let includeStatusFilters = this.state.statusFilters.length > 0;
        let includeTagFilters = this.state.tagFilters.length > 0;
        let includeSearch = this.state.searchValue.length > 0;

        for (let ipo of ipos) {
            let visible = true;
            if (includeStatusFilters) {
                if (!this.state.statusFilters.includes(ipo.status)) {
                    visible = false;
                }
            }
            if (includeTagFilters) {
                if (!ipo.tags.map(tag => this.state.tagFilters.includes(tag)).includes(true)) {
                    visible = false;
                }
            }
            if (includeSearch) {
                let companyName = ipo.ipo.name.toLowerCase();
                console.log(`${this.searchValue} includes ${companyName}`);
                if (!companyName.includes(this.searchValue)) {
                    visible = false;
                } else {
                    console.log(`${companyName} does not contain ${this.searchValue}`);
                }
            }

            ipo.visible = visible;
        }
        this.setState({
            ipos: ipos,
        });
    }

    saveIPOLocally(id) {
        
        let savedItem;
        for (let item of this.state.ipos) {
            if (item.cardId == id) {
                savedItem = item;
            }
        }

        //As Max pointed out, to save we simply need to store the dealIds.
        //I do not have that information for now, so off to bed....
        if (savedItem.storedLocally) {
            //unsave
        } else {
            //save
        }
    }

    filterBySearch(input) {
        console.log(`Setting search value to ${input}`);
        this.setState({
            "searchValue": input
        });
        this.searchValue = input;
        this.updateIPOVisibility();
    }

    render() {
        return (
            <div>
                <Layout>
                    <Sider width='22vw'
                        bordered={false}
                        breakpoint='lg' 
                        trigger={null} 
                        collapsed={this.state.collapsed} 
                        collapsible collapsedWidth="0" 
                        style={{
                        position: 'fixed',
                        height: "100%",
                        left: 0,
                    }}>
                        <Space>
                        <SearchOutlined style={{color: 'white'}} />
                        <Input
                            placeholder="Search IPOs"
                            onInput={value => this.filterBySearch(value.target.value.toLowerCase())}
                            value={this.searchValue}
                            style={{ width: 300, margin: 30 }}>  
                        </Input>
                        </Space>
                        <Card title="Filters" className="filterContainer" bordered={false}>
                            <Card title="Tags" className="filter" bordered={false}>
                                <FilterSelector height={400} items={this.props.tags} filterChangeCallback={this.tagFilterChange} />
                            </Card>
                            <Card title="Status" className="filter" bordered={false}>
                                <FilterSelector height={400} items={this.props.statusOpts} filterChangeCallback={this.statusFilterChange} />
                            </Card>

                        </Card>
                        {/*<Button onClick={() => this.toggleSidebar()}>Toggle</Button> */
                        }
                    </Sider>
                    <Layout className="site-layout" style={{ marginLeft: this.state.collapsed ? this.sidebarNoMargin : this.sidebarLeftMargin }}>

                        <Content style={{ margin: '0px 0px 0', overflow: 'initial' }}>
                        {React.createElement(this.state.collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                            id: 'trigger',
                            style: {
                                position: "fixed",
                                left: this.state.collapsed ? this.sidebarNoMargin : this.sidebarLeftMargin, 
                            },
                            onClick: this.toggleSidebar,
                        })}
                        {this.state.ipos.filter(ipo => ipo.visible).length > 0 ?
                            <div className="content-wrapper">
                                {this.state.ipos.filter(ipo => ipo.visible == true).map(ipo => ipo.ipoCard)}
                            </div>:
                            <div className="noContent">
                                <span>Nothing matched your search!</span>
                            </div>
                        }

                        </Content>
                        <Footer>Footer</Footer>
                    </Layout>
                </Layout>

            </div>
        )
    }
}

export default IpoApp;