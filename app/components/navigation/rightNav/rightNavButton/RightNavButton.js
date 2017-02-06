import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import shallowCompare from 'react-addons-shallow-compare'
import { FlatButton } from 'material-ui'

class RightNavButton extends Component {

    shouldComponentUpdate(nextProps, nextState) {
        return shallowCompare(this, nextProps, nextState)
    }

    render() {
        const { link, label } = this.props
        return (
            <Link to={link} onClick={this.handleRightNavItemClick}>
                <FlatButton label={label} hoverColor={'none'} labelStyle={{ fontSize: '12px', fontWeight: 'bold' }}/>
            </Link>
        )
    }

    handleRightNavItemClick = (event) => {
        const { onClick, viewName } = this.props
        onClick(event, viewName)
    }
}

RightNavButton.propTypes = {
    link: PropTypes.string,
    label: PropTypes.string,
    viewName: PropTypes.string,
    onClick: PropTypes.func
}

export default RightNavButton
