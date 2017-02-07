
import cx from 'classnames'
import { IoIosPlusEmpty } from 'react-icons/lib/io'
import {Tabs, Tab} from 'material-ui/Tabs';
import { Loader } from '../../components'
import React, { Component, PropTypes } from 'react'
import shallowCompare from 'react-addons-shallow-compare'

class Deployments extends Component {

    state = {
        animated: true,
        viewEntersAnim: true
    }

    componentDidMount() {
        const { enterLandscapes } = this.props
        enterLandscapes()
    }

    shouldComponentUpdate(nextProps, nextState) {
        return shallowCompare(this, nextProps, nextState)
    }

    componentWillUnmount() {
        const { leaveLandscapes } = this.props
        leaveLandscapes()
    }

    render() {
        const { animated, viewEntersAnim } = this.state
        const { loading, landscapes } = this.props

        // if (this.props.landscapes) {
        //     console.log('%c landscapes ', 'background: #1c1c1c; color: deeppink', landscapes)
        // }

        if (loading) {
            return (
                <div className={cx({ 'animatedViews': animated, 'view-enter': viewEntersAnim })}>
                    <Loader/>
                </div>
            )
        }

        return (
            <div className={cx({ 'animatedViews': animated, 'view-enter': viewEntersAnim })}>

                <a onClick={this.handlesCreateLandscapeClick}>
                    <IoIosPlusEmpty size={20}/>
                </a>
                <h2>Deployments</h2>
                <Tabs defaultActiveKey="1">
                    <Tab label="Template" key="1">Content of Tab Pane 1</Tab>
                    <Tab label="Resources" key="2">Content of Tab Pane 2</Tab>
                    <Tab label="Parameters" key="3">Content of Tab Pane 3</Tab>
                    <Tab label="Mappings" key="4">Content of Tab Pane 3</Tab>
                    <Tab label="Deployments" key="5">Content of Tab Pane 3</Tab>
                </Tabs>
            </div>
        )
    }

    handlesCreateLandscapeClick = event => {
        const { router } = this.context
        router.push({ pathname: '/landscapes/create' })
    }

    handlesLandscapeClick = event => {
        const { router } = this.context
        router.push({ pathname: '/protected' })
    }
}

Deployments.propTypes = {
    currentView: PropTypes.string.isRequired,
    enterLandscapes: PropTypes.func.isRequired,
    leaveLandscapes: PropTypes.func.isRequired
}

Deployments.contextTypes = {
    router: PropTypes.object
}

export default Deployments
