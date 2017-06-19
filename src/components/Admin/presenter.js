import React from 'react'

const Admin = ({match, location, history}) => {
  console.log(history)
  return (
    <div>
      <span>Hello Admin</span>
      <p>{`match.url --> ${match.url}`}</p>
      <p>{`location.search --> ${new URLSearchParams(location.search)}`}</p>
    </div>
  )
}

export default Admin
