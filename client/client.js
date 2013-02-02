
debug = true
function log() {
  debug && console.log.apply(console, [].slice.call(arguments))
}


Meteor.startup(function () {
  $(window).on('keydown',function (e) {
    if (e.which === 27) {
      Session.set('view', '')
      window.history.replaceState('','','/')
    }
  });
})

Template.hello.route = function () {
  return !Session.get('view');
};

Template.splash.book = function () {
  return Books.find().fetch();
};

Template.viewer.book = function () {
  var book = Books.findOne({title: Session.get('view')});
  var text = book.text;
  var result = [];
  (function iter(v,k,o) {
    if (k === 'text') result.push(v)
    if (k === 'em') result[result.length - 1] += v[0].text.trim();
    typeof v !== 'string' && _.each(v, iter)
  })(text);
  var note = Notes.find({title:book.title}).fetch()
  result = result.map(function (d) {
    var ugly = {
      text: d,
      title: book.title
    } 
    if (note.length) ugly.noted = true;
    return ugly;
  })
  return result;
}

Template.viewer.events({
  'mouseup p': function (e) {
    if (! window.getSelection().toString()) return ;
    var i = $('body').children().index($(e.target))
    var q = {i:i, book: this.title};
    if (e.target.className.match(/noted/)) log(Notes.findOne(q).text)
    else Notes.insert({
      book: this.title,
      i: i,
      text: prompt('lol')
    });
    e.target.classList.add('noted');
  }
})

Template.splash.events({
  'click li': function (e) {
    var x = e.target.textContent;
    Session.set('view', x)
    x=x.replace(/ /g, '_')
    window.history.pushState(x,x,x,x)
  }

});

window.addEventListener('popstate', function (e) {
  e.preventDefault();
  Session.set('view','')
})
