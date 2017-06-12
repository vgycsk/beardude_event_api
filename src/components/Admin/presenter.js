import React from 'react'
import 'url-search-params-polyfill'

const Admin = ({match, location}) =>
  <div>
    <span>Hello Admin</span>
    <p>{`match.url --> ${match.url}`}</p>
    <p>{`location.search --> ${new URLSearchParams(location.search)}`}</p>
  </div>

export default Admin
