import gql from 'graphql-tag'
import { UpdateTag } from '../../views'
import { connect } from 'react-redux'
import { graphql, compose } from 'react-apollo'
import { bindActionCreators } from 'redux'
import * as viewsActions from '../../redux/modules/views'

/* -----------------------------------------
  GraphQL - Apollo client
 ------------------------------------------*/

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
 // createdBy

const TagsWithQuery = graphql(TagsQuery, {
    props: ({ data: { loading, tags, refetch } }) => ({
        tags,
        loading,
        refetchTags: refetch
    })
})

const updateTagMutation = gql `
    mutation updateTag($tag: TagInput!) {
        updateTag(tag: $tag) {
            key
        }
    }
`

const composedRequest = compose(
    TagsWithQuery,
    graphql(updateTagMutation)
)(UpdateTag)


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
