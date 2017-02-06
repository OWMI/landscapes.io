import gql from 'graphql-tag'
import { CreateLandscape } from '../../views'
import { connect } from 'react-redux'
import { graphql } from 'react-apollo'
import { bindActionCreators } from 'redux'
import * as viewsActions from '../../redux/modules/views'

/* -----------------------------------------
  GraphQL - Apollo client
 ------------------------------------------*/

const createLandscapeMutation = gql `
    mutation createLandscape($landscape: LandscapeInput!) {
        createLandscape(landscape: $landscape) {
            name
        }
    }
`
const LandscapeQuery = gql `
    query getLandscapes {
        landscapes {
            _id,
            name,
            version,
            imageUri,
            infoLink,
            infoLinkText,
            createdAt,
            description,
            cloudFormationTemplate
        }
    }
 `

const CreateLandscapeWithMutation = graphql(createLandscapeMutation)(
  graphql(LandscapeQuery, {
    props: ({ data: { loading, landscapes, refetch } }) => ({
        landscapes,
        loading,
        refetchLandscapes: refetch
    })
})(CreateLandscape))

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

export default connect(mapStateToProps, mapDispatchToProps)(CreateLandscapeWithMutation)
