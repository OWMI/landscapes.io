import gql from 'graphql-tag'
import { connect } from 'react-redux'
import { graphql, compose } from 'react-apollo'
import { bindActionCreators } from 'redux'
import { CreateDeployment } from '../../views'
import * as viewsActions from '../../redux/modules/views'

/* -----------------------------------------
  GraphQL - Apollo client
 ------------------------------------------*/

const LandscapeQuery = gql `
    query getLandscapes {
        landscapes {
            _id,
            description,
            cloudFormationTemplate
        }
    }
`

const LandscapeWithQuery = graphql(LandscapeQuery, {
    props: ({ data: { loading, landscapes, refetch } }) => ({
        landscapes,
        loading,
        refetch
    })
})

const TagsQuery = gql `
    query getTags {
        tags {
          _id,
          key,
          defaultValue,
          isGlobal,
          isRequired
        }
    }
 `
 const TagsWithQuery = graphql(TagsQuery, {
     props: ({ data: { loading, tags } }) => ({
         tags,
         loading
     })
 })

const AccountsQuery = gql `
    query getAccounts {
        accounts {
            _id,
            name,
            region,
            createdAt,
            endpoint,
            caBundlePath,
            rejectUnauthorizedSsl,
            signatureBlock,
            isOtherRegion,
            accessKeyId,
            secretAccessKey
        }
    }
 `

 const AccountsWithQuery = graphql(AccountsQuery, {
     props: ({ data: { loading, accounts } }) => ({
         accounts,
         loading
     })
 })
 const IntegrationQuery = gql `
     query getIntegrations {
         integrations {
             _id,
             username,
             name,
             imageUri,
             password,
             type,
             repoURL,
             githubEmail
         }
     }
  `
  const IntegrationWithQuery = graphql(IntegrationQuery, {
      props: ({ data: { loading, integrations } }) => ({
          integrations,
          loading
      })
  })
 const GroupsQuery = gql `
     query getGroups {
         groups {
             _id,
             name,
             users{
               isAdmin,
               userId
             },
             imageUri,
             description,
             landscapes,
             permissions,
             managedVPC
         }
     }
  `
  const GroupsWithQuery = graphql(GroupsQuery, {
      props: ({ data: { loading, groups } }) => ({
          groups,
          loading
      })
  })

const createDeploymentMutation = gql `
    mutation createDeployment($deployment: DeploymentInput!) {
        createDeployment(deployment: $deployment) {
            stackName
        }
    }
`

const composedRequest = compose(
    LandscapeWithQuery,
    AccountsWithQuery,
    TagsWithQuery,
    GroupsWithQuery,
    IntegrationWithQuery,
    graphql(createDeploymentMutation)
)(CreateDeployment)


/* -----------------------------------------
  Redux
 ------------------------------------------*/

const mapStateToProps = state => {
    return {
        currentView: state.views.currentView,
    }
}

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({
        enterLandscapes: viewsActions.enterLandscapes,
        leaveLandscapes: viewsActions.leaveLandscapes
    }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(composedRequest)
