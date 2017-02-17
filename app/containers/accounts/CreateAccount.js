import gql from 'graphql-tag'
import { CreateAccount } from '../../views'
import { connect } from 'react-redux'
import { graphql } from 'react-apollo'
import { bindActionCreators } from 'redux'
import * as viewsActions from '../../redux/modules/views'
import { auth } from '../../services/auth'

/* -----------------------------------------
  GraphQL - Apollo client
 ------------------------------------------*/

const createAccountMutation = gql `
    mutation createAccount($account: AccountInput!) {
        createAccount(account: $account) {
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
 console.log('user', user)
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

const CreateAccountWithMutation = graphql(createAccountMutation)(graphql(AccountsQuery, {
    props: ({ data: { loading, accounts, refetch } }) => ({
        accounts,
        loading,
        refetchAccounts: refetch
    })
})(graphql(GroupQuery, {
     options: { variables: { userId: user._id || '', isGlobalAdmin: (user.role === 'admin') || false } },
    props: ({ data: { loading, groupsByUser, refetch } }) => ({
        groupsByUser,
        loading,
        refetchGroups: refetch
    })
}) (graphql(updateGroupMutation, {name: 'UpdateGroupWithMutation'})
(CreateAccount))))

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

export default connect(mapStateToProps, mapDispatchToProps)(CreateAccountWithMutation)
