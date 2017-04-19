import cx from 'classnames'
import axios from 'axios'
import React, { Component, PropTypes } from 'react'
import shallowCompare from 'react-addons-shallow-compare'

import { auth } from '../../services/auth'
import { ErrorAlert } from '../../components'

class Timer extends Component {

    componentWillMount() {
        this.self  = {
            timeout:this.props.time
        }
        const self = this;

        setInterval(this.redirect, (1000*30),self)
    }

    redirect(self) {
        const time = Math.floor(Date.now() / 1000);
        console.log(time, self.self.timeout)
        if (time >= self.self.timeout)
            window.location.href = '/login';

    }

    render(){
       return (<div/>)
    }


}
export default Timer
