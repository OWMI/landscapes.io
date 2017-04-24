import cx from 'classnames'
import { Dialog, FlatButton } from 'material-ui'
import React, { Component, PropTypes } from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { IoEdit, IoAndroidClose, IoIosPlusEmpty } from 'react-icons/lib/io'
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn } from 'material-ui/Table'

import materialTheme from '../../style/custom-theme.js'
import { Loader } from '../../components'
import { Timer } from '../../views/'
import { auth } from '../../services/auth'

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
    componentWillMount(){
      this.setState({activeDocumentType: {}})
    }
    componentWillReceiveProps(){
      this.setState({activeDocumentType: {}})
    }

    render() {
        const { animated, viewEntersAnim } = this.state
        const { loading, documentTypes } = this.props

        const confirmActions = [
            <FlatButton label='Cancel' backgroundColor={materialTheme.palette.primary2Color}
            style={{ float: 'right', margin: '30px 5px' }}
            labelStyle={{ fontSize: '11px', color:'white' }} onTouchTap={this.handlesDialogToggle}/>,
            <FlatButton label='Delete' style={{ float: 'right', margin: '30px 5px' }}
            labelStyle={{ fontSize: '11px', color:'white' }} onTouchTap={this.handlesDeleteAccountClick}/>
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
                <Timer time={auth.getUserInfo().expires}/>

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
                                            <FlatButton onTouchTap={this.handlesDialogToggle.bind(this, type)}>
                                                <IoAndroidClose/> Delete
                                            </FlatButton>
                                            <Dialog title='Delete Document Type' modal={false} open={this.state.showDialog}
                                                onRequestClose={this.handlesDialogToggle}
                                                actions={[
                                                    <FlatButton label='Cancel' primary={true} onTouchTap={this.handlesDialogToggle}/>,
                                                    <FlatButton label='Delete' primary={true} onTouchTap={this.handlesDeleteAccountClick}/>
                                                ]}>
                                                Are you sure you want to delete {this.state.activeDocumentType.name}?
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

    handlesDialogToggle = (documentType, event) => {
      this.setState({
          showDialog: !this.state.showDialog,
          activeDocumentType: documentType
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

    handlesDeleteAccountClick = (event) => {
        event.preventDefault()
        console.log(this.state.activeDocumentType)
        const { mutate } = this.props
        const { router } = this.context

        this.handlesDialogToggle()
        delete this.state.activeDocumentType.__typename
        mutate({
            variables: { documentType: this.state.activeDocumentType }
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
