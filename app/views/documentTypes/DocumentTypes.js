
import cx from 'classnames'
import { Dialog, FlatButton } from 'material-ui'
import React, { Component, PropTypes } from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { IoEdit, IoAndroidClose, IoIosPlusEmpty } from 'react-icons/lib/io'
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table'

import { Loader } from '../../components'
// const confirm = Modal.confirm

class DocumentTypes extends Component {

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

    render() {
        const { animated, viewEntersAnim } = this.state
        const { loading, documentTypes } = this.props

        const confirmActions = [
            <FlatButton label='Cancel' primary={true} onTouchTap={this.handlesDialogToggle}/>,
            <FlatButton label='Delete' primary={true} onTouchTap={this.handlesDeleteAccountClick}/>
        ]

        if (loading) {
            return (
                <div className={cx({ 'animatedViews': animated, 'view-enter': viewEntersAnim })}>
                    <Loader/>
                </div>
            )
        }

        return (
            <div className={cx({ 'animatedViews': animated, 'view-enter': viewEntersAnim })}>

                <a onClick={this.handlesCreateAccountClick}>
                    <p style={{ fontSize: '20px', cursor: 'pointer' }}><IoIosPlusEmpty size={30}/> Add Document Type </p>
                </a>

                <Table>
                    <TableHeader displaySelectAll={false} adjustForCheckbox={false}>
                        <TableRow>
                            <TableHeaderColumn>Name</TableHeaderColumn>
                            <TableHeaderColumn>Description</TableHeaderColumn>
                            <TableHeaderColumn></TableHeaderColumn>
                        </TableRow>
                    </TableHeader>
                    <TableBody displayRowCheckbox={false}>
                        {
                            documentTypes.map((type, index) => {
                                return (
                                    <TableRow key={`${index}`}>
                                        <TableRowColumn>{type.name}</TableRowColumn>
                                        <TableRowColumn>{type.description}</TableRowColumn>
                                        <TableRowColumn>
                                            <FlatButton onTouchTap={this.handlesEditAccountClick.bind(this, type)}>
                                                <IoEdit/> Edit
                                            </FlatButton>
                                            <FlatButton onTouchTap={this.handlesDialogToggle}>
                                                <IoAndroidClose/> Delete
                                            </FlatButton>
                                            <Dialog title='Delete Document Type' modal={false} open={this.state.showDialog}
                                                onRequestClose={this.handlesDialogToggle}
                                                actions={[
                                                    <FlatButton label='Cancel' primary={true} onTouchTap={this.handlesDialogToggle}/>,
                                                    <FlatButton label='Delete' primary={true} onTouchTap={this.handlesDeleteAccountClick.bind(this, type)}/>
                                                ]}>
                                                Are you sure you want to delete {type.name}?
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

    handlesDialogToggle = event => {
        this.setState({
            showDialog: !this.state.showDialog
        })
    }

    handlesCreateAccountClick = event => {
        const { router } = this.context
        router.push({ pathname: '/documentTypes/create' })
    }

    handlesEditAccountClick = (documentType, event) => {
        const { router } = this.context
        router.push({ pathname: '/documentTypes/update/' + documentType._id })
    }

    handlesDeleteAccountClick = (documentTypeToDelete, event) => {
        event.preventDefault()

        const { mutate } = this.props
        const { router } = this.context

        this.handlesDialogToggle()
        delete documentTypeToDelete.__typename
        mutate({
            variables: { documentType: documentTypeToDelete }
         }).then(({ data }) => {
           this.props.refetchDocumentTypes({}).then(({ data }) =>{
             this.setState({
               successOpen: true,
               loading: false
             })
             router.push({ pathname: '/documentTypes' })
           })
           .catch((error) => {
             this.setState({loading: false})
           })
        }).catch((error) => {
        })
    }
}

DocumentTypes.propTypes = {
    currentView: PropTypes.string.isRequired,
    enterLandscapes: PropTypes.func.isRequired,
    leaveLandscapes: PropTypes.func.isRequired
}

DocumentTypes.contextTypes = {
    router: PropTypes.object
}

export default DocumentTypes
