import React, { PropTypes } from 'react'
import { Link } from 'react-router'
import Humburger from './humburger/Humburger'
import LeftNav from './leftNav/LeftNav'
import RightNav from './rightNav/RightNav'

const NavigationBar = ({ brand, navModel, handleLeftNavItemClick, handleRightNavItemClick, user, userIsAuthenticated }) => {
    return (
        <nav className='navbar navbar-default'>
            <div className='containersCustom'>
                <div className='navbar-header'>
                    {< Humburger />}
                    <div className='navbar-brand'>
                        <Link to={'/landscapes'}>
                            { brand }
                        </Link>
                    </div>
                </div>
                <div className='collapse navbar-collapse' id='bs-example-navbar-collapse-1'>
                    <ul className='nav navbar-nav'>
                        {
                            <LeftNav
                                leftLinks = { navModel.leftLinks }
                                onLeftNavButtonClick = { handleLeftNavItemClick }
                                userIsAuthenticated = { userIsAuthenticated }
                            />
                        }
                    </ul>
                    <ul className='nav navbar-nav navbar-right'>
                        {
                            <RightNav
                                rightLinks = { navModel.rightLinks }
                                onRightNavButtonClick = { handleRightNavItemClick }
                                user = { user }
                                userIsAuthenticated = { userIsAuthenticated }
                            />
                        }
                    </ul>
                </div>
            </div>
        </nav>
    )
}

NavigationBar.propTypes = {
    brand: PropTypes.string,
    user: PropTypes.object,
    userIsAuthenticated: PropTypes.bool.isRequired,
    handleLeftNavItemClick: PropTypes.func,
    handleRightNavItemClick: PropTypes.func,
    navModel: PropTypes.shape({
        leftLinks: PropTypes.arrayOf(PropTypes.shape({label: PropTypes.string.isRequired, link: PropTypes.string.isRequired})).isRequired,
        rightLinks: PropTypes.arrayOf(PropTypes.shape({label: PropTypes.string.isRequired, link: PropTypes.string.isRequired})).isRequired
    })
}

NavigationBar.defaultProps = {
    brand: 'brand'
}

export default NavigationBar
