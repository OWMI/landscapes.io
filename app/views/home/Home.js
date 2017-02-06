import cx from 'classnames'
// import { Button } from 'antd'
import { RaisedButton } from 'material-ui'
import { Link } from 'react-router'
import { Jumbotron } from '../../components'
import React, { Component, PropTypes } from 'react'
import shallowCompare from 'react-addons-shallow-compare'

class Home extends Component {

    state = {
        animated: true,
        viewEntersAnim: true
    }

    componentDidMount() {
        const { enterHome } = this.props
        enterHome()
    }

    shouldComponentUpdate(nextProps, nextState) {
        return shallowCompare(this, nextProps, nextState)
    }

    componentWillUnmount() {
        const { leaveHome } = this.props
        leaveHome()
    }

    render() {
        const { animated, viewEntersAnim } = this.state
        return (
            <div key='homeView' className={cx({'animatedViews': animated, 'view-enter': viewEntersAnim})}>
                <Jumbotron>
                    <h1>Landscapes.io</h1>

                    <Link to={'/login'}>
                        <RaisedButton primary={true}>Primary</RaisedButton>
                    </Link>
                </Jumbotron>
            </div>
        )
    }
}

Home.propTypes = {
    // view props:
    currentView: PropTypes.string.isRequired,
    // view actions:
    enterHome: PropTypes.func.isRequired,
    leaveHome: PropTypes.func.isRequired
}

export default Home
