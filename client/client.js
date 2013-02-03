debug = true
function log() {
  debug && console.log.apply(console, [].slice.call(arguments))
}

Meteor.startup(function () {
  window.history.replaceState('','','/')
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
  if (!book) return;
  var text = book.text;
  var result = [];
  (function iter(v,k,o) {
    if (k === 'text') result.push(v)
    if (k === 'em') result[result.length - 1] += v[0].text.trim();
    typeof v !== 'string' && _.each(v, iter)
  })(text);

  result = result.map(function (d) {
      var notes = [];
        for (var i = 0; i<book.notes.length; i++){
          if (book.notes[i].pid === result.indexOf(d)){
            notes.push(book.notes[i].text)
          }
        }
    return {
      text: d,
      title: book.title,
      pid: result.indexOf(d),
      notes: notes
    }; 
  })
  return result;
}

Template.viewer.events({
  'click a': function (e) {
    e.preventDefault();
    Session.set('view','');
  },

  'mouseup p': function (e) {
    if (! window.getSelection().toString()) return ;
    var i = $('body').children('p').index($(e.target));
    var pid = $(e.target).data('pid');
    var q = { i:i, title: this.title };
    if (e.target.className.match(/noted/)) log(Notes.findOne(q).text)
    else Books.update({title: Session.get('view')}, {
      $push: {
        notes: {
          text: prompt('please enter a note'),
          title: this.title,
          top: e.target.offsetTop,
          pid: pid
        }
      }
    })
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
