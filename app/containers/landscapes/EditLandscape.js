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
             documents{
               type,
               name,
               url
             },
             createdAt,
             description,
             cloudFormationTemplate
         }
     }
  `

 // queries:
 const EditLandscapeWithQuery = graphql(LandscapeQuery, {
     props: ({ data: { loading, landscapes, refetch } }) => ({
         landscapes,
         loading,
         refetch
     })
 })

 const UpdateLandscapeMutation = gql `
     mutation updateLandscape($landscape: LandscapeInput!) {
         updateLandscape(landscape: $landscape) {
             name
         }
     }
 `

 const DeleteLandscapeMutation = gql `
     mutation deleteLandscapeMutation($landscape: LandscapeInput!) {
         deleteLandscape(landscape: $landscape) {
             _id
         }
     }
 `

 const composedRequest = compose(
     EditLandscapeWithQuery,
     graphql(UpdateLandscapeMutation, { name: 'updateLandscape' }),
     graphql(DeleteLandscapeMutation, { name: 'deleteLandscape' })
 )(EditLandscape)

/* -----------------------------------------
  Redux
 ------------------------------------------*/

const mapStateToProps = state => {
    return {
        currentUser: state.userAuth,
        currentView: state.views.currentView,
        activeLandscape: state.landscapes.activeLandscape
    }
}

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({
        enterLandscapes: viewsActions.enterLandscapes,
        leaveLandscapes: viewsActions.leaveLandscapes
    }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(composedRequest)
