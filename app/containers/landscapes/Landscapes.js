import gql from 'graphql-tag'
import { Landscapes } from '../../views'
import { connect } from 'react-redux'
import { graphql, compose } from 'react-apollo'
import { bindActionCreators } from 'redux'
import * as viewsActions from '../../redux/modules/views'
import * as landscapesActions from '../../redux/modules/landscapes'

/* -----------------------------------------
  GraphQL - Apollo client
 ------------------------------------------*/
 const UserQuery = gql `
     query getUsers {
         users {
             _id,
             username,
             email,
             firstName,
             lastName,
             password,
             role
         }
     }
  `
  const GroupQuery = gql `
      query getGroups {
          groups {
              _id,
              name,
              users{
                isAdmin,
                userId
              },
              description,
              landscapes,
              permissions
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
 // img,
 // createdBy

const DeploymentByLandscapeIdMutation = gql `
    mutation getDeploymentsByLandscapeId($landscapeId: String!) {
        deploymentsByLandscapeId(landscapeId: $landscapeId) {
            _id,
            createdAt,
            stackName,
            accountName,
            landscapeId,
            isDeleted,
            description,
            location,
            billingCode,
            flavor,
            cloudFormationTemplate,
            cloudFormationParameters,
            tags,
            notes,
            stackId,
            stackStatus,
            stackLastUpdate,
            awsErrors
        }
    }
`

const LandscapesWithQuery = graphql(LandscapeQuery, {
    props: ({ data: { loading, landscapes } }) => ({
        loading,
        landscapes
    })
})

const UsersWithQuery = graphql(UserQuery, {
    props: ({ data: { loading, users } }) => ({
        users,
        loading
    })
})

const GroupsWithQuery = graphql(GroupQuery, {
    props: ({ data: { loading, groups, refetch } }) => ({
        groups,
        loading,
        refetchGroups: refetch
    })
})

const DeploymentsWithMutation = graphql(DeploymentByLandscapeIdMutation, { name: 'deploymentsByLandscapeId' })

const composedRequest = compose(
    LandscapesWithQuery,
    UsersWithQuery,
    GroupsWithQuery,
    DeploymentsWithMutation
)(Landscapes)


/* -----------------------------------------
  Redux
 ------------------------------------------*/

const mapStateToProps = state => {
    return { currentView: state.views.currentView }
}

const mapDispatchToProps = dispatch => {
    return bindActionCreators({
        enterLandscapes: viewsActions.enterLandscapes,
        leaveLandscapes: viewsActions.leaveLandscapes,
        setActiveLandscape: landscapesActions.setActiveLandscape
    }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(composedRequest)
