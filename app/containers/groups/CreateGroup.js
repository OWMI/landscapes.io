import gql from 'graphql-tag'
import { CreateGroup } from '../../views'
import { connect } from 'react-redux'
import { graphql } from 'react-apollo'
import { bindActionCreators } from 'redux'
import * as viewsActions from '../../redux/modules/views'
import { auth } from '../../services/auth'

/* -----------------------------------------
  GraphQL - Apollo client
 ------------------------------------------*/
 // infoLinkText,
 // img,
 // createdBy
 const createGroupMutation = gql `
     mutation createGroup($group: GroupInput!) {
         createGroup(group: $group) {
             _id
         }
     }
 `

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
             managedVPC,
             publicKey
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
              repoURL,
              githubEmail
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
 const CreateGroupWithMutation = graphql(createGroupMutation)(CreateGroup)

//
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
             imageUri,
             description,
             landscapes,
             permissions
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
 // infoLinkText,
 // img,
 // createdBy

// 1- add queries:
const GroupsWithQuery = graphql(UserQuery, {
    props: ({ data: { loading, users } }) => ({
        users,
        loading
    })
})
(graphql(AccountsQuery, {
    props: ({ data: { loading, accounts } }) => ({
        accounts,
        loading
    })
  }
)
(graphql(LandscapeQuery, {
    props: ({ data: { loading, landscapes } }) => ({
        landscapes,
        loading
    })
  }
)
(graphql(GetGroupsQuery, {
    props: ({ data: { loading, groups, refetch } }) => ({
        groups,
        loading,
        refetchGroups: refetch
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
(graphql(GroupQuery, {
     options: { variables: { userId: user._id || '', isGlobalAdmin: (user.role === 'admin') || false } },
    props: ({ data: { loading, groupsByUser, refetch } }) => ({
        groupsByUser,
        loading
    })
})
(
  graphql(createGroupMutation, {name: 'CreateGroupWithMutation'})
(CreateGroup)))))))
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
