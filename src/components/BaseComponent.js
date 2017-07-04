import { PureComponent } from 'react'

class BaseComponent extends PureComponent {
  _bind (...methods) {
    methods.forEach((method) => {
      if (this[method]) {
        this[method] = this[method].bind(this)
      }
    })
  }
}

export default BaseComponent
