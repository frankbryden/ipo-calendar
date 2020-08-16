import React from 'react';
import 'antd/dist/antd.css';
import { Layout, Card, Button } from 'antd';
import FilterSelector from './FilterSelector';
import './card.css';
import './sider.css';

const { Footer, Sider, Content } = Layout;

class IpoApp extends React.Component {
    constructor(props) {
        super(props);
        this.statusFilterChange = this.statusFilterChange.bind(this);
        this.tagFilterChange = this.tagFilterChange.bind(this);
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
            statusFilters: []
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
            ipos: ipos
        });
    }


    render() {
        return (
            <div>
                <Layout trigger={null} collapsible collapsed={this.state.collapsed}>
                    <Sider 
                        width='22vw'
                        breakpoint='lg'
                        collapsedWidth="0">
                        <Card title="Filters" className="filterContainer">
                            <Card title="Tags" className="filter">
                                <FilterSelector height={400} items={this.props.tags} filterChangeCallback={this.tagFilterChange} />
                            </Card>
                            <Card title="Status" className="filter">
                                <FilterSelector height={400} items={this.props.statusOpts} filterChangeCallback={this.statusFilterChange} />
                            </Card>

                        </Card>
                        <Button onClick={() => this.toggleSidebar()}>Toggle</Button>
                    </Sider>
                    <Layout>
                        <Content>
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