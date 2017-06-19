import gql from 'graphql-tag'
import { CreateLandscape } from '../../views'
import { connect } from 'react-redux'
import { graphql } from 'react-apollo'
import { bindActionCreators } from 'redux'
import * as viewsActions from '../../redux/modules/views'
import { auth } from '../../services/auth'

/* -----------------------------------------
  GraphQL - Apollo client
 ------------------------------------------*/

const createLandscapeMutation = gql `
    mutation createLandscape($landscape: LandscapeInput!) {
        createLandscape(landscape: $landscape) {
            _id
        }
    }
`
const updateGroupMutation = gql `
    mutation updateGroup($group: GroupInput!) {
        updateGroup(group: $group) {
            name
        }
    }
`
const DocumentTypesQuery = gql `
    query getDocumentTypes {
        documentTypes {
            _id,
            name,
            description
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
             accounts,
             imageUri,
             description,
             landscapes,
             permissions
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
const CreateLandscapeWithMutation = graphql(createLandscapeMutation)(
  graphql(LandscapeQuery, {
    props: ({ data: { loading, landscapes, refetch } }) => ({
        landscapes,
        loading,
        refetchLandscapes: refetch
    })
})(graphql(IntegrationQuery, {
    props: ({ data: { loading, integrations } }) => ({
        integrations,
        loading
    })
})(graphql(GroupQuery, {
     options: { variables: { userId: user._id || '', isGlobalAdmin: (user.role === 'admin') || false } },
    props: ({ data: { loading, groupsByUser, refetch } }) => ({
        groupsByUser,
        loading,
        refetchGroups: refetch
    })
})(graphql(DocumentTypesQuery, {
    props: ({ data: { loading, documentTypes } }) => ({
        documentTypes,
        loading
    })})
    (graphql(AccountsQuery, {
        props: ({ data: { loading, accounts, refetch } }) => ({
            accounts,
            loading,
            refetchAccounts:refetch
        })
    })(graphql(updateGroupMutation, {name: 'UpdateGroupWithMutation'})
  (CreateLandscape)))))))

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

export default connect(mapStateToProps, mapDispatchToProps)(CreateLandscapeWithMutation)
