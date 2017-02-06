import gql from 'graphql-tag'
import { CreateUser } from '../../views'
import { connect } from 'react-redux'
import { graphql } from 'react-apollo'
import { bindActionCreators } from 'redux'
import * as viewsActions from '../../redux/modules/views'

/* -----------------------------------------
  GraphQL - Apollo client
 ------------------------------------------*/


 const createUserMutation = gql `
     mutation createUser($user: UserInput!) {
         createUser(user: $user) {
             username
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
           createdAt,
           description,
           cloudFormationTemplate
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
 (graphql(UserQuery, {
     props: ({ data: { loading, users, refetch } }) => ({
         users,
         loading,
         refetchUsers: refetch
     })
   }
 )
 (
   graphql(createUserMutation, {name: 'CreateUserMutation'})
 (CreateUser))))
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
