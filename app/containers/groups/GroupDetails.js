import gql from 'graphql-tag'
import { GroupDetails } from '../../views'
import { connect } from 'react-redux'
import { graphql } from 'react-apollo'
import { bindActionCreators } from 'redux'
import * as viewsActions from '../../redux/modules/views'
import { auth } from '../../services/auth'

/* -----------------------------------------
  GraphQL - Apollo client
 ------------------------------------------*/

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
             role
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
 // 1- add queries:
 const GroupById = graphql(GroupByIdQuery, {
    options: ({ params }) => ({ variables: { id: params.id } }),
    props: ({ data: { loading, groupById } }) => ({
        groupById,
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
         loading,
         refetchGroups: refetch
     })
 })
 (graphql(UserQuery, {
     props: ({ data: { loading, users } }) => ({
         users,
         loading
     })
   }
 )
 (GroupDetails)))))



/* -----------------------------------------
  Redux
 ------------------------------------------*/

const mapStateToProps = state => {
    return { currentView: state.views.currentView }
}

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({
        enterGroupDetails: viewsActions.enterGroupDetails,
        leaveGroupDetails: viewsActions.leaveGroupDetails
    }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(GroupById)
