import React from 'react'
import { actionCreators } from '../../ducks/posts'
import 'url-search-params-polyfill'
import styles from './style.css'

class Stream extends React.Component {
  constructor (props) {
    super(props)
    this.renderPost = this.renderPost.bind(this)
  }

  componentDidMount () {
    this.props.dispatch(actionCreators.fetchPosts())
  }

  renderPost ({id, title, body}, i) {
    return (
      <li key={id} className={styles.post}>
        <div className={styles.postNumber}>
          {i + 1}
        </div>
        <div className={styles.postContent}>
          <span>
            {title}
          </span>
          <span className={styles.postBody}>
            {body}
          </span>
        </div>
      </li>
    )
  }

  render () {
    const {posts, loading, error, match, location} = this.props

    if (loading) {
      return (
        <div className={styles.center}>
          <p>loading...</p>
        </div>
      )
    }

    if (error) {
      return (
        <div className={styles.center}>
          <p>
            Failed to load posts!
          </p>
        </div>
      )
    }

    return (
      <div className={styles.container}>
        <div>
          <span>Hello Admin</span>
          <p>{`match.url --> ${match.url}`}</p>
          <p>{`location.search --> ${new URLSearchParams(location.search)}`}</p>
        </div>
        <ul className={styles.container}>
          {posts.map(this.renderPost)}
        </ul>
      </div>
    )
  }
}

export default Stream
