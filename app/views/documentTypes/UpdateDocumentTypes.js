import cx from 'classnames'
import React, { Component, PropTypes } from 'react'
import shallowCompare from 'react-addons-shallow-compare'
import { Row, Col } from 'react-flexbox-grid'
import { Card, CardHeader, CardText, MenuItem, RaisedButton, SelectField, TextField, Toggle } from 'material-ui'

import { Loader } from '../../components'

class UpdateDocumentTypes extends Component {

    state = {
        animated: true,
        viewEntersAnim: true,
        loading: false
    }

    componentDidMount() {
        const { enterLandscapes } = this.props
        enterLandscapes()
    }
    componentWillMount(){
      const { loading, documentTypes, params } = this.props
      let _documentTypes = documentTypes || []

      const currentDocumentType = _documentTypes.find(dt => { return dt._id === params.id })
      this.setState({ currentDocumentType: currentDocumentType || {}})
    }
    componentWillReceiveProps(nextProps){
      const { loading, documentTypes, params } = nextProps

      let _documentTypes = documentTypes || []

      const currentDocumentType = _documentTypes.find(dt => { return dt._id === params.id })
      this.setState({ currentDocumentType: currentDocumentType || {}})
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
        const { loading, documentTypes, params } = this.props



        if (loading || this.state.loading) {
            return (
                <div className={cx({ 'animatedViews': animated, 'view-enter': viewEntersAnim })}>
                    <Loader/>
                </div>
            )
        }

        return (
            <div className={cx({ 'animatedViews': animated, 'view-enter': viewEntersAnim })}>
                <Row center='xs' middle='xs'>
                    <Col xs={6} lg={9} className={cx( { 'create-account': true } )}>
                        <Row middle='xs'>
                            <Col xs={5} style={{ textAlign: 'left' }}>
                                <h4>Edit Document Type</h4>
                            </Col>
                            <Col xs={7}>
                                <RaisedButton label='Save' onClick={this.handlesCreateClick}
                                    style={{ float: 'right', margin: '30px 0px' }}
                                    labelStyle={{ fontSize: '11px' }}/>
                            </Col>
                        </Row>
                        <Card>
                            <TextField id='name' ref='name' defaultValue={this.state.currentDocumentType.name} floatingLabelText='Name' style={{width:'95%'}}
                              onChange={this.handlesNameChange}/>

                            <Row style={{marginLeft: 10, marginRight: 10 }}>
                              <TextField id='Description' ref='Description'defaultValue={this.state.currentDocumentType.description} multiLine={true} rows={4} floatingLabelText='Description' fullWidth={true}
                                floatingLabelStyle={{ left: '0px'}} onChange={this.handlesDescriptionChange}/>
                            </Row>
                        </Card>
                    </Col>
                </Row>
            </div>
        )
    }

    handlesRegionChange = (event, index, value) => {
        this.setState({
            region: value
        })
    }

    handlesDescriptionChange = (event) => {
        this.setState({description: event.target.value })
    }

    handlesNameChange = (event) => {
        this.setState({name: event.target.value })
    }

    handlesCreateClick = event => {
        this.setState({loading: true})

        event.preventDefault()
        const { mutate } = this.props
        const { router } = this.context

        let documentTypeToCreate = {
          description: this.state.description || this.state.currentDocumentType.description,
          name: this.state.name || this.state.currentDocumentType.name,
          _id: this.state.currentDocumentType._id
        }
        mutate({
            variables: { documentType: documentTypeToCreate }
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
        }).catch(error => {
        })
    }
}

UpdateDocumentTypes.propTypes = {
    currentView: PropTypes.string.isRequired,
    enterLandscapes: PropTypes.func.isRequired,
    leaveLandscapes: PropTypes.func.isRequired,
    refetchDocumentTypes: PropTypes.func
}

UpdateDocumentTypes.contextTypes = {
    router: PropTypes.object
}

export default UpdateDocumentTypes
