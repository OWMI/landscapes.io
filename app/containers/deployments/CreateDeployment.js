import gql from 'graphql-tag'
import { connect } from 'react-redux'
import { graphql, compose } from 'react-apollo'
import { bindActionCreators } from 'redux'
import { CreateDeployment } from '../../views'
import * as viewsActions from '../../redux/modules/views'

/* -----------------------------------------
  GraphQL - Apollo client
 ------------------------------------------*/

const LandscapeQuery = gql `
    query getLandscapes {
        landscapes {
            _id,
            description,
            cloudFormationTemplate
        }
    }
`

const LandscapeWithQuery = graphql(LandscapeQuery, {
    props: ({ data: { loading, landscapes, refetch } }) => ({
        landscapes,
        loading,
        refetch
    })
})

const TagsQuery = gql `
    query getTags {
        tags {
          _id,
          key,
          defaultValue,
          isGlobal,
          isRequired
        }
    }
 `

 const TagsWithQuery = graphql(TagsQuery, {
     props: ({ data: { loading, tags } }) => ({
         tags,
         loading
     })
 })

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

 const AccountsWithQuery = graphql(AccountsQuery, {
     props: ({ data: { loading, accounts } }) => ({
         accounts,
         loading
     })
 })
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
  const IntegrationWithQuery = graphql(IntegrationQuery, {
      props: ({ data: { loading, integrations } }) => ({
          integrations,
          loading
      })
  })
 const GroupsQuery = gql `
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
             permissions,
             managedVPC
         }
     }
  `
  const GroupsWithQuery = graphql(GroupsQuery, {
      props: ({ data: { loading, groups } }) => ({
          groups,
          loading
      })
  })

 const fetchKeyPairsMutation = gql `
     mutation fetchKeyPairs($region: String) {
         fetchKeyPairs(region: $region) {
            KeyName
         }
     }
 `

 const fetchVpcsMutation = gql `
     mutation fetchVpcs($region: String) {
         fetchVpcs(region: $region) {
             VpcId
         }
     }
 `

 const fetchAvailabilityZonesMutation = gql `
     mutation fetchAvailabilityZones($region: String) {
         fetchAvailabilityZones(region: $region) {
             ZoneName,
             State,
             RegionName
         }
     }
 `

 const fetchImagesMutation = gql `
     mutation fetchImages($region: String) {
         fetchImages(region: $region) {
             ImageId
         }
     }
 `

 const fetchInstancesMutation = gql `
     mutation fetchInstances($region: String) {
         fetchInstances(region: $region) {
             InstanceId,
             Tags {
                 Key,
                 Value
             }
         }
     }
 `

 const fetchSecurityGroupsMutation = gql `
     mutation fetchSecurityGroups($region: String) {
         fetchSecurityGroups(region: $region) {
             GroupId,
             GroupName,
             Tags {
                 Key,
                 Value
             }
         }
     }
 `

 const fetchSubnetsMutation = gql `
     mutation fetchSubnets($region: String) {
         fetchSubnets(region: $region) {
             SubnetId,
             CidrBlock,
             Tags {
                 Key,
                 Value
             }
         }
     }
 `

 const fetchVolumesMutation = gql `
     mutation fetchVolumes($region: String) {
         fetchVolumes(region: $region) {
             VolumeId,
             VolumeType
         }
     }
 `

 const fetchHostedZonesMutation = gql `
     mutation fetchHostedZones($region: String) {
         fetchHostedZones(region: $region) {
             Id,
             Name
         }
     }
 `

 const createDeploymentMutation = gql `
     mutation createDeployment($deployment: DeploymentInput!) {
         createDeployment(deployment: $deployment) {
             stackName
         }
     }
 `

const composedRequest = compose(
    LandscapeWithQuery,
    AccountsWithQuery,
    TagsWithQuery,
    GroupsWithQuery,
    IntegrationWithQuery,
    graphql(fetchAvailabilityZonesMutation, { name: 'fetchAvailabilityZones' }),
    graphql(fetchHostedZonesMutation, { name: 'fetchHostedZones' }),
    graphql(fetchImagesMutation, { name: 'fetchImages' }),
    graphql(fetchInstancesMutation, { name: 'fetchInstances' }),
    graphql(fetchKeyPairsMutation, { name: 'fetchKeyPairs' }),
    graphql(fetchSecurityGroupsMutation, { name: 'fetchSecurityGroups' }),
    graphql(fetchSubnetsMutation, { name: 'fetchSubnets' }),
    graphql(fetchVpcsMutation, { name: 'fetchVpcs' }),
    graphql(fetchVolumesMutation, { name: 'fetchVolumes' }),
    graphql(createDeploymentMutation)
)(CreateDeployment)


/* -----------------------------------------
  Redux
 ------------------------------------------*/

const mapStateToProps = state => {
    return {
        currentView: state.views.currentView,
    }
}

const mapDispatchToProps = (dispatch) => {
    return bindActionCreators({
        enterLandscapes: viewsActions.enterLandscapes,
        leaveLandscapes: viewsActions.leaveLandscapes
    }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(composedRequest)
