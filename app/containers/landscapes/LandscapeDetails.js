import gql from 'graphql-tag'
import { connect } from 'react-redux'
import { compose, graphql } from 'react-apollo'
import { bindActionCreators } from 'redux'
import { LandscapeDetails } from '../../views'
import * as viewsActions from '../../redux/modules/views'

/* -----------------------------------------
  GraphQL - Apollo client
 ------------------------------------------*/

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

const LandscapesWithQuery = graphql(LandscapeQuery, {
    props: ({ data: { loading, refetch, landscapes } }) => ({
        loading,
        refetch,
        landscapes
    })
})

const DeleteDeploymentMutation = gql `
    mutation deleteDeployment($deployment: DeploymentInput!) {
        deleteDeployment(deployment: $deployment) {
            stackName
        }
    }
`

const DeploymentStatusMutation = gql `
    mutation getDeploymentStatus($deployment: DeploymentInput!) {
        deploymentStatus(deployment: $deployment) {
            _id,
            stackStatus,
            stackName,
            location,
            createdAt,
            isDeleted,
            awsErrors
        }
    }
`

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

const composedRequest = compose(
    LandscapesWithQuery,
    graphql(DeleteDeploymentMutation),
    graphql(DeploymentStatusMutation, { name: 'deploymentStatus' }),
    graphql(DeploymentByLandscapeIdMutation, { name: 'deploymentsByLandscapeId' })
)(LandscapeDetails)


/* -----------------------------------------
  Redux
 ------------------------------------------*/
const mapStateToProps = state => {
    return {
        currentView: state.views.currentView,
        activeLandscape: state.landscapes.activeLandscape
    }
}

const mapDispatchToProps = dispatch => {
    return bindActionCreators({
        enterLandscapes: viewsActions.enterLandscapes,
        leaveLandscapes: viewsActions.leaveLandscapes
    }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(composedRequest)
