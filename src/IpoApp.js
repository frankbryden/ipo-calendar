import React from 'react';
import 'antd/dist/antd.css';
import { Layout, Card, Button, Input, Space, Affix, Switch } from 'antd';
import { MenuUnfoldOutlined, MenuFoldOutlined, SearchOutlined, CalculatorFilled } from '@ant-design/icons';
import FilterSelector from './FilterSelector';
import IpoCard from './IpoCard';
import './card.css';
import './sider.css';
import { motion, AnimateSharedLayout } from 'framer-motion';

const { Footer, Sider, Content, Header } = Layout;

class IpoApp extends React.Component {
    constructor(props) {
        super(props);
        this.statusFilterChange = this.statusFilterChange.bind(this);
        this.tagFilterChange = this.tagFilterChange.bind(this);
        this.toggleSidebar = this.toggleSidebar.bind(this);
        this.saveIPOLocally = this.saveIPOLocally.bind(this);
        this.toggleVisibilitySavedIPOs = this.toggleVisibilitySavedIPOs.bind(this);
        this.toggleMinimizedCards = this.toggleMinimizedCards.bind(this);
        this.trackScrolling = this.trackScrolling.bind(this);
        this.sidebarNoMargin = "0vw";
        this.state = {
            loading: true,
            ipos: this.getImportedIPOs(this.props.ipos),
            sidebarLeftMargin: "22vw",
            collapsed: false,
            tagFilters: [],
            statusFilters: [],
            showOnlySaved: false,
            searchValue: "",
            showCardsMinimized: true,
        }
    }

    addIpos(ipos) {
        this.setState({
            ipos: this.state.ipos.push(...this.getImportedIPOs(ipos))
        });
    }

    getImportedIPOs(ipos) {
        ipos.map((ipo, index) => {
            return {
                ipo: ipo,
                cardId: index,
                tags: ipo.tags.map(tag => tag.name),
                status: ipo.status,
                visible: true,
                saved: false,
            }
        });
    }

    toggleSidebar() {
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
    }

    toggleVisibilitySavedIPOs() {
        this.setState({
            showOnlySaved: !this.state.showOnlySaved
        });
    }

    toggleMinimizedCards() {
        this.setState({
            showCardsMinimized: !this.state.showCardsMinimized
        })
    }

    determineIPOVisibility(ipo) {
        let includeStatusFilters = this.state.statusFilters.length > 0;
        let includeTagFilters = this.state.tagFilters.length > 0;
        let includeSearch = this.state.searchValue.length > 0;

        let visible = true;

        if (this.state.showOnlySaved) {
            if (!ipo.saved) {
                visible = false;
            }
        }

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

        return visible;
    }

    saveIPOLocally(id) {
        console.log(`Save ipo with id ${id}`);
        let ipos = this.state.ipos;
        let savedItem;
        for (let item of ipos) {
            if (item.cardId == id) {
                savedItem = item
            }
        }
        savedItem.saved = !savedItem.saved


        //As Max pointed out, to save we simply need to store the dealIds.
        //I do not have that information for now, so off to bed....
        if (savedItem.saved) {
            //save
            localStorage.setItem(savedItem.ipo.id, "")
        } else {
            //unsave
            localStorage.removeItem(savedItem.ipo.id, "")
        }
        this.setState({ ipos: ipos });
    }

    filterBySearch(input) {
        console.log(`Setting search value to ${input}`);
        this.setState({
            "searchValue": input
        });
        this.searchValue = input;
    }

    componentDidMount() {
        this.handleResize();
        window.addEventListener("resize", () => this.handleResize());
        document.addEventListener('scroll', this.trackScrolling);

        //Handle saved IPOs
        let ipos = this.state.ipos;
        for (let ipo of ipos) {
            if (localStorage.getItem(ipo.ipo.id) != null) {
                ipo.saved = true
            }
        }
        this.setState({ ipos: ipos });
    }

    isBottom(el) {
        return el.getBoundingClientRect().bottom <= window.innerHeight;
    }


    componentWillUnmount() {
        document.removeEventListener('scroll', this.trackScrolling);
    }

    trackScrolling() {
        const wrappedElement = document.getElementById('ipoBody');
        if (this.isBottom(wrappedElement)) {
            console.log('header bottom reached');
            let self = this;
            this.props.dataFetcher.fetchIpos(10).then(ipos => self.addIpos(ipos));
            //document.removeEventListener('scroll', this.trackScrolling);
        }
    }

    handleResize() {
        if (window.innerWidth < 1200) {
            this.setState({ sidebarLeftMargin: "32vw" })
            this.handleMobile()
        } if (window.innerWidth >= 1200) {
            this.setState({ sidebarLeftMargin: "22vw" })
        }
    }

    handleMobile() {
        if (window.innerWidth <= 768) {
            this.setState({ collapsed: true, sidebarLeftMargin: "90vw" });
        } else {
            this.setState({ collapsed: false });
        }
    }

    render() {
        return (
            <div>
                <Layout>
                    <Sider
                        width={this.state.sidebarLeftMargin}
                        bordered={false}
                        breakpoint='sm'
                        onBreakpoint={() => this.handleMobile()}
                        trigger={null}
                        collapsed={this.state.collapsed}
                        collapsible collapsedWidth="0vw"
                        style={{
                            position: 'fixed',
                            overflow: 'scroll',
                            height: "100%",
                            left: 0,
                        }}>
                        <MenuFoldOutlined
                            style={{
                                color: "white", position: "fixed", fontSize: "2rem",
                                left: this.state.collapsed ? -50 : `calc(${this.state.sidebarLeftMargin} - 50px)`,
                                top: 10, zIndex: 2
                            }}
                            onClick={() => this.toggleSidebar()} />

                        <div onClick={this.props.swapOverviewCallback} className="logo">IPO
                            <span>c</span></div>

                        <Space>
                            <Input
                                placeholder="Search IPOs"
                                onInput={value => this.filterBySearch(value.target.value.toLowerCase())}
                                value={this.searchValue}
                                style={{ width: "80%", margin: 10 }}>
                            </Input>
                        </Space>
                        <Card title="Filters" className="filterContainer" bordered={false}>

                            <div className="sliderWrapper">
                                <span>Show Saved</span>
                                <Switch onChange={this.toggleVisibilitySavedIPOs}></Switch>
                                <span>Expand Cards</span>
                                <Switch onChange={this.toggleMinimizedCards}></Switch>
                            </div>

                            <Card title="Tags" className="filter" bordered={false}>
                                <FilterSelector items={this.props.tags} needColor={true} filterChangeCallback={this.tagFilterChange} />
                            </Card>
                            <Card title="Status" className="filter" bordered={false}>
                                <FilterSelector items={this.props.statusOpts} needColor={false} filterChangeCallback={this.statusFilterChange} />
                            </Card>

                        </Card>

                    </Sider>
                    <Layout className="site-layout" style={{ marginLeft: this.state.collapsed ? this.sidebarNoMargin : this.state.sidebarLeftMargin }}>
                        {this.state.collapsed ?
                            <Affix>
                                <Header style={{ backgroundColor: "black" }}>
                                    <MenuUnfoldOutlined style={{ color: "white", fontSize: "2rem", position: "fixed", left: 10, top: 15 }}
                                        onClick={() => this.toggleSidebar()} />
                                    <div className="logo">IPO<span>c</span></div>
                                </Header></Affix> : <></>}

                        <Content id="ipoBody" style={{ margin: '0px 0px 0', overflow: 'initial' }}>
                            {this.state.ipos.filter(ipo => ipo.visible).length > 0 ?
                                <div className="content-wrapper">
                                    {this.state.ipos.filter(ipo => this.determineIPOVisibility(ipo)).map((ipo, index) => <IpoCard key={index} cardId={ipo.cardId} minimized={this.state.showCardsMinimized} saved={ipo.saved} ipo={ipo.ipo} onSave={this.saveIPOLocally} />)}
                                </div> :
                                <div className="noContent">
                                    <span>Nothing matched your search!</span>
                                </div>
                            }

                        </Content>
                        {/*
                        <Footer style={{ minHeight: "5vh" }}>Footer</Footer>
                        */}
                    </Layout>
                </Layout>

            </div>
        )
    }
}

export default IpoApp;