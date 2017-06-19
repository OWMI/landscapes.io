import gql from 'graphql-tag'
import { CreateTag } from '../../views'
import { connect } from 'react-redux'
import { graphql } from 'react-apollo'
import { bindActionCreators } from 'redux'
import * as viewsActions from '../../redux/modules/views'
import { auth } from '../../services/auth'

/* -----------------------------------------
  GraphQL - Apollo client
 ------------------------------------------*/

const createTagMutation = gql `
    mutation createTag($tag: TagInput!) {
        createTag(tag: $tag) {
            _id
        }
    }
`
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

const CreateTagWithMutation = graphql(createTagMutation)(graphql(TagsQuery, {
    props: ({ data: { loading, tags, refetch } }) => ({
        tags,
        loading,
        refetchTags: refetch
    })
})(CreateTag))

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

export default connect(mapStateToProps, mapDispatchToProps)(CreateTagWithMutation)
