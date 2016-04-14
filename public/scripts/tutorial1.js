/* 
  cdm→  componentDidMount: fn() { ... }
    componentDidMount is a method called automatically by React after a component is rendered for the first time. 
    The key to dynamic updates is the call to this.setState(). We replace the old array of comments with the new one 
    from the server and the UI automatically updates itself. Because of this reactivity, it is only a minor change to 
    add live updates. We will use simple polling here but you could easily use WebSockets or other technologies.
  cdup→  componentDidUpdate: fn(pp, ps) { ... }
  cs→  var cx = React.addons.classSet;
  cwm→  componentWillMount: fn() { ... }
  cwr→  componentWillReceiveProps: fn(np) { ... }
  cwu→  componentWillUpdate: fn(np, ns) { ... }
  cwun→  componentWillUnmount: fn() { ... }
  cx→  cx({ ... })
  fdn→  React.findDOMNode(...)
  fup→  forceUpdate(...)
  gdp→  getDefaultProps: fn() { return {...} } 
  gis→  getInitialState: fn() { return {...} } 
  ism→  isMounted()
  props→  this.props.
  pt→  propTypes { ... }
  rcc→  component skeleton
  refs→  this.refs.
  ren→  render: fn() { return ... }
  scu→  shouldComponentUpdate: fn(np, ns) { ... }
  sst→  this.setState({ ... })
  state→  this.state.

  - CommentBox
    - CommentList
      - Comment
    - CommentForm
  */


var CommentBox = React.createClass({
  loadCommentsFromServer: function() {
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      cache: false,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
  getInitialState: function() {
    return {data: []};
  },
  componentDidMount: function() {
    this.loadCommentsFromServer();
    setInterval(this.loadCommentsFromServer, this.props.pollInterval);
  },
  handleCommentSubmit: function(comment) {
    var comments = this.state.data;
    comment.id = Date.now();
    var newComments = comments.concat([comment]);
    this.setState({data: newComments});
    $.ajax({
      url: this.props.url,
      dataType: 'json',
      type: 'POST',
      data: comment,
      success: function(data) {
        this.setState({data: data});
      }.bind(this),
      error: function(xhr, status, err) {
        this.setState({data: data});
        console.error(this.props.url, status, err.toString());
      }.bind(this)
    });
  },
	render: function() {
		return (
			<div className="commentBox">
      	<h1>Comments</h1>
        <CommentForm onCommentSubmit={this.handleCommentSubmit} />
        <CommentList data={this.state.data} />
      </div>
		);
	}
});

var CommentList	= React.createClass({
	render: function() {
    var commentNodes = this.props.data.map(function(comment) {
      return (
        <Comment author={comment.author} key={comment.id}>
          {comment.text}
        </Comment>
      );
    });
		return (
			<div className='commentList'>
				{commentNodes}
			</div>
		);
	}
});

var Comment	= React.createClass({
	rawMarkup: function() {
    var rawMarkup = marked(this.props.children.toString(), {sanitize: true});
    return { __html: rawMarkup };
  },
	render: function() {
		return (
			<div className="comment">
				<h2 className="commentAuthor">
					{this.props.author}
				</h2>
        <span dangerouslySetInnerHTML={this.rawMarkup()} />
			</div>
		);
	}
});

var CommentForm = React.createClass({
  getInitialState: function() {
    return {author: '', text: ''};
  },
  handleAuthorChange: function(e) {
    this.setState({author: e.target.value});
  },
  handleTextChange: function(e) {
    this.setState({text: e.target.value});
  },
  handleSubmit: function(e) {
    e.preventDefault();
    var author = this.state.author.trim();
    var text = this.state.text.trim();
    if (!text || !author) {
      return;
    }
    this.props.onCommentSubmit({author: author, text: text});
    this.setState({author: '', text: ''});
  },
  render: function() {
    return (
      <form className='commentForm' onSubmit={this.handleSubmit}>
        <h6>
          Put your Comments
        </h6>
        <input type="text" 
          placeholder="YourName" 
          value={this.state.author}
          onChange={this.handleAuthorChange}
        />
        <input type="text" 
          placeholder="Say Something..." 
          value={this.state.text}
          onChange={this.handleTextChange}
        />
        <input type="submit" value="Post" />
      </form>
    );
  }
});



ReactDOM.render(
	<CommentBox url="/api/comments" pollInterval={2000} />,
	document.getElementById('content')
);

