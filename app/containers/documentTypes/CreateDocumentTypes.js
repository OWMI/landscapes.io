import gql from 'graphql-tag'
import { CreateDocumentTypes } from '../../views'
import { connect } from 'react-redux'
import { graphql, compose } from 'react-apollo'
import { bindActionCreators } from 'redux'
import * as viewsActions from '../../redux/modules/views'

/* -----------------------------------------
  GraphQL - Apollo client
 ------------------------------------------*/

const AccountsQuery = gql `
    query getDocumentTypes {
        documentTypes {
            _id,
            name,
            description
        }
    }
 `
 // createdBy

const AccountsWithQuery = graphql(AccountsQuery, {
    props: ({ data: { loading, documentTypes, refetch } }) => ({
        documentTypes,
        loading,
        refetchDocumentTypes: refetch
    })
})

const createAccountMutation = gql `
    mutation createDocumentType($documentType: DocumentTypeInput!) {
        createDocumentType(documentType: $documentType) {
            name
        }
    }
`

const composedRequest = compose(
    AccountsWithQuery,
    graphql(createAccountMutation)
)(CreateDocumentTypes)


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

export default connect(mapStateToProps, mapDispatchToProps)(composedRequest)
