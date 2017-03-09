import gql from 'graphql-tag'
import { IntegrationConfigure } from '../../views'
import { connect } from 'react-redux'
import { graphql, compose } from 'react-apollo'
import { bindActionCreators } from 'redux'
import * as viewsActions from '../../redux/modules/views'

/* -----------------------------------------
  GraphQL - Apollo client
 ------------------------------------------*/
 const createIntegrationMutation = gql `
     mutation createIntegration($integration: IntegrationInput!) {
         createIntegration(integration: $integration) {
             name
         }
     }
 `
 const updateIntegrationMutation = gql `
      mutation updateIntegration($integration: IntegrationInput!) {
          updateIntegration(integration: $integration) {
              name
          }
      }
  `
 const IntegrationQuery = gql `
     query getIntegrations {
         integrations {
             _id,
             username,
             name,
             imageUri,
             password,
             type,
             repoURL
         }
     }
  `
 const integrationMutation = graphql(createIntegrationMutation, {name: 'CreateIntegrationWithMutation'})
 const integrationUpdateMutation = graphql(updateIntegrationMutation, {name: 'UpdateIntegrationWithMutation'})
 const integrationQuery = graphql(IntegrationQuery, { props: ({ data: { loading, integrations, refetch } }) => ({
     integrations,
     loading,
     refetchIntegrations: refetch
 })
})

 // createdBy

const composedRequest = compose(integrationMutation, integrationUpdateMutation, integrationQuery)(IntegrationConfigure)


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
