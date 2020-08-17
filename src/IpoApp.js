import React from 'react';
import 'antd/dist/antd.css';
import { Layout, Card, Button, Input } from 'antd';
import { MenuUnfoldOutlined, MenuFoldOutlined } from '@ant-design/icons';
import FilterSelector from './FilterSelector';
import './card.css';
import './sider.css';

const { Footer, Sider, Content, Header } = Layout;

class IpoApp extends React.Component {
    constructor(props) {
        super(props);
        this.statusFilterChange = this.statusFilterChange.bind(this);
        this.tagFilterChange = this.tagFilterChange.bind(this);
        this.toggleSidebar = this.toggleSidebar.bind(this);
        this.onSearch = this.onSearch.bind(this);
        this.sidebarLeftMargin = "22vw";
        this.sidebarNoMargin = "0vw";
        this.state = {
            loading: true,
            ipos: this.props.ipos.map(ipo => {
                return {
                    "ipo": ipo,
                    "tags": ipo.props.ipo.tags.map(tag => tag.name),
                    "status": ipo.props.ipo.status,
                    "visible": true
                }
            }),
            collapsed: false,
            tagFilters: [],
            statusFilters: [],
        }
    }

    onSearch() {
        this.setState({
            searchValue: ""
        });
        console.log("hye")
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
        this.updateIPOVisibility();
        this.setState({
            tagFilters: tagFilters
        });
    }

    statusFilterChange(filter, toggle) {
        //toggle = true means filter was added
        let statusFilters = this.state.statusFilters;
        if (toggle) {
            statusFilters.push(filter);
        } else {
            statusFilters.splice(statusFilters.indexOf(filter), 1);
        }
        this.updateIPOVisibility();
        this.setState({
            statusFilters: statusFilters
        });
    }

    updateIPOVisibility() {
        let ipos = this.state.ipos;
        let includeStatusFilters = this.state.statusFilters.length > 0;
        let includeTagFilters = this.state.tagFilters.length > 0;

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
            ipo.visible = visible;
        }
        this.setState({
            ipos: ipos,
        });
    }

    filterBySearch(input) {
        let ipos = this.state.ipos;
        for (let ipo of ipos) {
            let companyName = ipo.ipo.props.ipo.name.toLowerCase();
            if(!companyName.includes(input)) {
                ipo.visible = false;
            } else {
                ipo.visible = true;
            } 
        }
        this.setState({
            ipos: ipos,
        });
    }

    render() {
        return (
            <div>
                <Layout>
                    <Sider width='22vw' breakpoint='lg' trigger={null} collapsed={this.state.collapsed} collapsible collapsedWidth="0" style={{
                        position: 'fixed',
                        height: "100%",
                        left: 0,
                    }}>
                        <Input
                            placeholder="Search for specific company"
                            onInput={value => this.filterBySearch(value.target.value.toLowerCase())}
                            style={{ width: 200, margin: 30 }}>    
                        </Input>
                        <Card title="Filters" className="filterContainer">
                            <Card title="Tags" className="filter">
                                <FilterSelector height={400} items={this.props.tags} filterChangeCallback={this.tagFilterChange} />
                            </Card>
                            <Card title="Status" className="filter">
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
                            <div className="content-wrapper">
                                {this.state.ipos.filter(ipo => ipo.visible == true).map(ipo => ipo.ipo)}
                            </div>
                        </Content>
                        <Footer>Footer</Footer>
                    </Layout>
                </Layout>

            </div>
        )
    }
}

export default IpoApp;