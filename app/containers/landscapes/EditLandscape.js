import gql from 'graphql-tag'
import { EditLandscape } from '../../views'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { compose, graphql } from 'react-apollo'
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
             infoLinkText,
             createdAt,
             description,
             cloudFormationTemplate
         }
     }
  `

 // 1- add queries:
 const EditLandscapeWithQuery = graphql(LandscapeQuery, {
     props: ({ data: { loading, landscapes, refetch } }) => ({
         landscapes,
         loading,
         refetchLandscapes: refetch
     })
 })

 const updateLandscapeMutation = gql `
     mutation updateLandscape($landscape: LandscapeInput!) {
         updateLandscape(landscape: $landscape) {
             name
         }
     }
 `
 const composedRequest = compose(
     EditLandscapeWithQuery,
     graphql(updateLandscapeMutation)
 )(EditLandscape)

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

export default connect(mapStateToProps, mapDispatchToProps)(composedRequest)
