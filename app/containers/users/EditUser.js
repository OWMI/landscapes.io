import gql from 'graphql-tag'
import { EditUser } from '../../views'
import { connect } from 'react-redux'
import { graphql } from 'react-apollo'
import { bindActionCreators } from 'redux'
import * as viewsActions from '../../redux/modules/views'

/* -----------------------------------------
  GraphQL - Apollo client
 ------------------------------------------*/
 const editUserMutation = gql `
     mutation updateUser($user: UserInput!) {
         updateUser(user: $user) {
             username
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
 // const CreateUserWithMutation = graphql(editUserMutation)(CreateUser)
 const UserQuery = gql `
     query getUsers {
         users {
             _id,
             username,
             email,
             imageUri,
             firstName,
             lastName,
             password,
             role,
             publicKey,
             managedVPC
         }
     }
  `

 const GroupQuery = gql `
     query getUsers {
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
           createdAt,
           description,
           cloudFormationTemplate
       }
     }
  `
  const DeleteUserMutation = gql `
      mutation deleteUserMutation($user: UserInput!) {
          deleteUser(user: $user) {
              _id
          }
      }
  `
 // 1- add queries:
 const UsersWithQuery = graphql(GroupQuery, {
     props: ({ data: { loading, groups } }) => ({
         groups,
         loading
     })
 })
 (graphql(LandscapeQuery, {
     props: ({ data: { loading, landscapes } }) => ({
         landscapes,
         loading
     })
   }
 )
 (graphql(IntegrationQuery, {
     props: ({ data: { loading, integrations } }) => ({
         integrations,
         loading
     })
   }
 )
 (graphql(UserQuery, {
     props: ({ data: { loading, users, refetch } }) => ({
         users,
         loading,
         refetchUsers: refetch
     })
   }
 )
 (
   graphql(editUserMutation, {name: 'EditUserWithMutation'})
 (
   graphql(DeleteUserMutation, {name: 'DeleteUserMutation'})
 (EditUser))))))

/* -----------------------------------------
  Redux
 ------------------------------------------*/

const mapStateToProps = state => {
    return { currentView: state.views.currentView }
}

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({
        enterUsers: viewsActions.enterUsers,
        leaveUsers: viewsActions.leaveUsers
    }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(UsersWithQuery)
