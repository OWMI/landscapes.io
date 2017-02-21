import gql from 'graphql-tag'
import { Groups } from '../../views'
import { connect } from 'react-redux'
import { graphql } from 'react-apollo'
import { bindActionCreators } from 'redux'
import * as viewsActions from '../../redux/modules/views'
import { auth } from '../../services/auth'

/* -----------------------------------------
  GraphQL - Apollo client
 ------------------------------------------*/

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
 // 1- add queries:
 const GroupsWithQuery = graphql(GroupQuery, {
      options: { variables: { userId: user._id || '', isGlobalAdmin: (user.role === 'admin') || false } },
     props: ({ data: { loading, groupsByUser, refetch } }) => ({
         groupsByUser,
         loading,
         refetchGroups: refetch
     })
 })(Groups)


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
