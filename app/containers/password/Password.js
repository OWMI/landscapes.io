import gql from 'graphql-tag'
import { graphql } from 'react-apollo'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { Password } from '../../views'

import * as viewsActions from '../../redux/modules/views'

/* -----------------------------------------
  Redux
 ------------------------------------------*/
const mapStateToProps = state => {
    return { currentView: state.views.currentView }
}

const mapDispatchToProps = dispatch => {
    return bindActionCreators({
        enterPasswordChange: viewsActions.enterPasswordChange,
        leavePasswordChange: viewsActions.leavePasswordChange
    }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(Password)
