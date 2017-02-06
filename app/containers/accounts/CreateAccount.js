import gql from 'graphql-tag'
import { CreateAccount } from '../../views'
import { connect } from 'react-redux'
import { graphql } from 'react-apollo'
import { bindActionCreators } from 'redux'
import * as viewsActions from '../../redux/modules/views'

/* -----------------------------------------
  GraphQL - Apollo client
 ------------------------------------------*/

const createAccountMutation = gql `
    mutation createAccount($account: AccountInput!) {
        createAccount(account: $account) {
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

const CreateAccountWithMutation = graphql(createAccountMutation)(graphql(AccountsQuery, {
    props: ({ data: { loading, accounts, refetch } }) => ({
        accounts,
        loading,
        refetchAccounts: refetch
    })
})(CreateAccount))

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
