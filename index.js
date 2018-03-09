
import React, { Component } from 'react'
import ReactDOM from 'react-dom'
import * as Cargo from './cargo.js'
import './index.less'

class CargoView extends Component {
  constructor(props) {
    super(props)
    this.takeEvent = this.takeEvent.bind(this)
  }

  componentDidMount() {
    var step = Cargo.disdatch(this.takeEvent)
    // 开始监控
    step()
  }

  *takeEvent() {
    // 先引入监控者Monitor
    var monitor = Cargo.getMonitor(ReactDOM.findDOMNode(this.node), 'click')
    // 盯着Monitor的一举一动啊
    while(true) {
      var e = yield monitor.take()
      console.log(e)
    }
  } 

  render() {
    return <div ref={node => this.node = node} className='cargo'>Demo演示</div>
  }
}

const app = document.body.querySelector('#app')

ReactDOM.render(<CargoView />, app)