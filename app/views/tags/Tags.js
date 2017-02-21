
import cx from 'classnames'
import { Dialog, FlatButton } from 'material-ui'
import React, { Component, PropTypes } from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { IoEdit, IoAndroidClose, IoIosPlusEmpty } from 'react-icons/lib/io'
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table'

import { Loader } from '../../components'
// const confirm = Modal.confirm

class Tags extends Component {

    state = {
        animated: true,
        viewEntersAnim: true,
        showDialog: false
    }

    componentDidMount() {
        const { enterLandscapes } = this.props
        enterLandscapes()
    }

    shouldComponentUpdate(nextProps, nextState) {
        return shallowCompare(this, nextProps, nextState)
    }

    componentWillUnmount() {
        const { leaveLandscapes } = this.props
        leaveLandscapes()
    }
    componentWillMount(){
      this.setState({activeTag: {}})
    }
    componentWillReceiveProps(){
      this.setState({activeTag: {}})
    }

    render() {
        const { animated, viewEntersAnim } = this.state
        const { loading, tags } = this.props

        const confirmActions = [
            <FlatButton label='Cancel' primary={true} onTouchTap={this.handlesDialogToggle}/>,
            <FlatButton label='Delete' primary={true} onTouchTap={this.handlesDeleteTagClick}/>
        ]

        console.log('tags', tags)
        if (loading || this.state.loading) {
            return (
                <div className={cx({ 'animatedViews': animated, 'view-enter': viewEntersAnim })}>
                    <Loader/>
                </div>
            )
        }

        return (
            <div className={cx({ 'animatedViews': animated, 'view-enter': viewEntersAnim })}>

                <a onClick={this.handlesCreateTagClick}>
                    <p style={{ fontSize: '20px', cursor: 'pointer' }}><IoIosPlusEmpty size={30}/> Add Tag </p>
                </a>

                <Table>
                    <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                        <TableRow>
                            <TableHeaderColumn>Tag Key</TableHeaderColumn>
                            <TableHeaderColumn>Default Value</TableHeaderColumn>
                            <TableHeaderColumn>Required?</TableHeaderColumn>
                            <TableHeaderColumn></TableHeaderColumn>
                        </TableRow>
                    </TableHeader>
                    <TableBody displayRowCheckbox={false}>
                        {
                            tags.map((tag, index) => {
                                return (
                                    <TableRow key={`${index}`}>
                                        <TableRowColumn>{tag.key}</TableRowColumn>
                                        <TableRowColumn>{tag.defaultValue}</TableRowColumn>
                                        {
                                          tag.isRequired
                                          ?
                                          <TableRowColumn>Required</TableRowColumn>
                                          :
                                          <TableRowColumn></TableRowColumn>
                                        }
                                        <TableRowColumn>
                                            <FlatButton onTouchTap={this.handlesEditTagClick.bind(this, tag)}>
                                                <IoEdit/>
                                            </FlatButton>
                                            <FlatButton onTouchTap={this.handlesDialogToggle.bind(this, tag)}>
                                                <IoAndroidClose/>
                                            </FlatButton>
                                            <Dialog title='Delete Tag' modal={false} open={this.state.showDialog}
                                                onRequestClose={this.handlesDialogToggle}
                                                actions={[
                                                    <FlatButton label='Cancel' primary={true} onTouchTap={this.handlesDialogToggle}/>,
                                                    <FlatButton label='Delete' primary={true} onTouchTap={this.handlesDeleteTagClick}/>
                                                ]}>
                                                Are you sure you want to delete {this.state.activeTag.key}?
                                            </Dialog>
                                        </TableRowColumn>
                                    </TableRow>
                                )
                            })
                        }
                    </TableBody>
                </Table>
            </div>
        )
    }

    handlesDialogToggle =  (tag, event) => {
        this.setState({
            showDialog: !this.state.showDialog,
            activeTag: tag
        })
    }

    handlesCreateTagClick = event => {
        const { router } = this.context
        router.push({ pathname: '/tags/create' })
    }

    handlesEditTagClick = (tag, event) => {
        const { router } = this.context
        router.push({ pathname: '/tags/update/' + tag._id })
    }

    handlesDeleteTagClick = (event) => {
        event.preventDefault()
        this.setState({
          loading: true
        })
        const { mutate } = this.props
        const { router } = this.context

        this.handlesDialogToggle()

        delete this.state.activeTag.__typename

        mutate({
            variables: { tag: this.state.activeTag }
         }).then(({ data }) => {
           this.props.refetchTags({}).then(({ data }) =>{
             this.setState({
               successOpen: true,
               loading: false
             })
             router.push({ pathname: '/tags' })
           })
           .catch((error) => {
             this.setState({loading: false})
           })
        }).catch((error) => {
        })
    }
}

Tags.propTypes = {
    currentView: PropTypes.string.isRequired,
    enterLandscapes: PropTypes.func.isRequired,
    leaveLandscapes: PropTypes.func.isRequired
}

Tags.contextTypes = {
    router: PropTypes.object
}

export default Tags
