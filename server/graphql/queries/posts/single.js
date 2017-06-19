export default {
    type : blogPostType,
    args : {
        id: {
            name: 'id',
            type: new GraphQLNonNull(GraphQLID)
        }
    },
    resolve(root, params, options) {
        const projection = getProjection(options.fieldASTs[0])

        return BlogPostModel.findById(params.id).select(projection).exec()
    }
}
