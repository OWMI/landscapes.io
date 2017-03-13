import gql from 'graphql-tag'
import { EditGroup } from '../../views'
import { connect } from 'react-redux'
import { graphql } from 'react-apollo'
import { bindActionCreators } from 'redux'
import * as viewsActions from '../../redux/modules/views'
import { auth } from '../../services/auth'

/* -----------------------------------------
  GraphQL - Apollo client
 ------------------------------------------*/
 const editGroupMutation = gql `
     mutation updateGroup($group: GroupInput!) {
         updateGroup(group: $group) {
             name
         }
     }
 `

 // const CreateGroupWithMutation = graphql(editGroupMutation)(CreateGroup)
 const UserQuery = gql `
     query getUsers {
         users {
             _id,
             username,
             email,
             imageUri,
             firstName,
             lastName,
             role,
             managedVPC
         }
     }
  `

  const GroupByIdQuery = gql `
      query getGroup($id: String) {
          groupById(id: $id) {
              _id,
              name,
              users{
                isAdmin,
                userId
              },
              managedVPC,
              accounts,
              imageUri,
              description,
              landscapes,
              permissions
          }
      }
   `
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
   var user = auth.getUserInfo() || {}
   const GroupQuery = gql `
       query getGroupsByUser($userId: String, $isGlobalAdmin: Boolean) {
           groupsByUser(id: $userId, isGlobalAdmin: $isGlobalAdmin ) {
               _id,
               name,
               users{
                 isAdmin,
                 userId
               },
               managedVPC,
               accounts,
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
  const deleteGroupMutation = gql `
      mutation deleteGroup($group: GroupInput!) {
          deleteGroup(group: $group) {
              name
          }
      }
  `
  const GetGroupsQuery = gql `
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
              permissions
          }
      }

   `
 // 1- add queries:
 const GroupsWithQuery = graphql(GroupByIdQuery, {
    options: ({ params }) => ({ variables: { id: params.id } }),
    props: ({ data: { loading, groupById, refetch } }) => ({
        groupById,
        loading,
        refetchGroup: refetch
    })
 })
 (graphql(LandscapeQuery, {
     props: ({ data: { loading, landscapes, refetch } }) => ({
         landscapes,
         refetchLandscapes: refetch,
         loading
     })
   }
 )
 (graphql(AccountsQuery, {
     props: ({ data: { loading, accounts } }) => ({
         accounts,
         loading
     })
   }
 )
 (graphql(GroupQuery, {
      options: { variables: { userId: user._id || '', isGlobalAdmin: (user.role === 'admin') || false } },
     props: ({ data: { loading, groupsByUser, refetch } }) => ({
         groupsByUser,
         loading
     })
 })
 (graphql(GetGroupsQuery, {
     props: ({ data: { loading, groups, refetch } }) => ({
         groups,
         loading,
         refetchGroups: refetch
     })
   }
 )
 (graphql(UserQuery, {
     props: ({ data: { loading, users } }) => ({
         users,
         loading
     })
   }
 )
 (graphql(deleteGroupMutation, {name: 'DeleteGroupMutation'})
 (graphql(editGroupMutation, {name: 'EditGroupWithMutation'})
 (EditGroup))))))))

/* -----------------------------------------
  Redux
 ------------------------------------------*/

const mapStateToProps = state => {
    return { currentView: state.views.currentView }
}

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({
        enterGroups: viewsActions.enterGroups,
        leaveGroups: viewsActions.leaveGroups
    }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(GroupsWithQuery)
