import gql from 'graphql-tag'
import { Deployments } from '../../views'
import { connect } from 'react-redux'
import { graphql } from 'react-apollo'
import { bindActionCreators } from 'redux'
import * as viewsActions from '../../redux/modules/views'

/* -----------------------------------------
  GraphQL - Apollo client
 ------------------------------------------*/

const LandscapeQuery = gql `
    query getLandscapes {
        landscapes {
            _id,
            name,
            version,
            imageUri,
            infoLink,
            createdAt,
            description,
            cloudFormationTemplate
        }
    }
 `
 // infoLinkText,
 // img,
 // createdBy

// 1- add queries:
const LandscapesWithQuery = graphql(LandscapeQuery, {
    props: ({ data: { loading, landscapes } }) => ({
        landscapes,
        loading
    })
})(Deployments)


/* -----------------------------------------
  Redux
 ------------------------------------------*/

const mapStateToProps = state => {
    return { currentView: state.views.currentView }
}

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({
        enterLandscapes: viewsActions.enterLandscapes,
        leaveLandscapes: viewsActions.leaveLandscapes
    }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(LandscapesWithQuery)
