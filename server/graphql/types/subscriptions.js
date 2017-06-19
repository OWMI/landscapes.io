// subscriptions.js
import Landscape from './landscape'

const Subscription = `
    type Subscription {
        postUpvoted: Landscape
    }
`

export default() => [Subscription, Landscape]
