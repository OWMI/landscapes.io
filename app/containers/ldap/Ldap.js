import gql from 'graphql-tag'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { graphql, compose } from 'react-apollo'

import { Ldap } from '../../views'
import * as viewsActions from '../../redux/modules/views'

const GroupQuery = gql `
    query getGroups {
        groups {
            _id,
            name,
            users {
              isAdmin,
              userId
            },
            accounts,
            imageUri,
            landscapes,
            permissions
        }
    }
`

const GroupsWithQuery = graphql(GroupQuery, {
    props: ({ data: { loading, groups } }) => ({
        groups,
        loading
    })
})

const LdapGroupQuery = gql `
    query getLdapGroups {
        ldapGroups {
            cn,
            roleOccupant
        }
    }
`

const LdapGroupsWithQuery = graphql(LdapGroupQuery, {
    props: ({ data: { loading, ldapGroups } }) => ({
        ldapGroups,
        loading
    })
})

const MappingsQuery = gql `
    query getMappings {
        mappings {
            _id,
            mappedGroups,
            landscapeGroup
        }
    }
`

const MappingsWithQuery = graphql(MappingsQuery, {
    props: ({ data: { loading, mappings, refetch } }) => ({
        mappings,
        loading,
        refetchMappings: refetch
    })
})

const UpdateMappingsMutation = gql `
    mutation updateMappings($mapping: MappingsInput!) {
        updateMappings(mapping: $mapping) {
            _id,
            mappedGroups,
            landscapeGroup
        }
    }
`

const composedRequest = compose(
    GroupsWithQuery,
    MappingsWithQuery,
    LdapGroupsWithQuery,
    graphql(UpdateMappingsMutation, { name: 'updateMappings' })
)(Ldap)

const mapStateToProps = state => {
    return {
        currentView: state.views.currentView
    }
}

const mapDispatchToProps = dispatch => {
    return bindActionCreators({
        enterProtected: viewsActions.enterProtected,
        leaveProtected: viewsActions.leaveProtected
    }, dispatch)
}

export default connect(mapStateToProps, mapDispatchToProps)(composedRequest)
