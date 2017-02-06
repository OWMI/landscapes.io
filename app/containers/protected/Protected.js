import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import { Protected } from '../../views'
import * as viewsActions from '../../redux/modules/views'

/* -----------------------------------------
  Redux
 ------------------------------------------*/
const mapStateToProps = state => {
    return { currentView: state.views.currentView }
}

const mapDispatchToProps = dispatch => {
    return bindActionCreators({
        enterProtected: viewsActions.enterProtected,
        leaveProtected: viewsActions.leaveProtected
    }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(Protected)
