import React                from 'react'
import ReactDOM             from 'react-dom'
import injectTpEventPlugin  from 'react-tap-event-plugin'
import { Routes }           from './routes/Route'

import getMuiTheme from 'material-ui/styles/getMuiTheme'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'

import 'babel-polyfill'
import 'animate.css'
import 'jquery'
import 'whatwg-fetch'
import 'font-awesome/css/font-awesome.min.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.min.js'
import './style/index.style.scss'
import Theme from './style/custom-theme.js'

// import {red600} from 'material-ui/styles/colors';
import AppBar from 'material-ui/AppBar';

// This replaces the textColor value on the palette
// and then update the keys for each component that depends on it.
// More on Colors: http://www.material-ui.com/#/customization/colors

const ELEMENT_TO_BOOTSTRAP  = 'root'
const BootstrapedElement    = document.getElementById(ELEMENT_TO_BOOTSTRAP)


injectTpEventPlugin()

ReactDOM.render(
    <MuiThemeProvider muiTheme={getMuiTheme(Theme)}>
        <Routes/>
    </MuiThemeProvider>
, BootstrapedElement)
