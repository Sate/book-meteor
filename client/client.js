debug = true
function log() {
  debug && console.log.apply(console, [].slice.call(arguments))
}

Meteor.startup(function () {
  Session.set('color', rand_color())
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

Template.viewer.THENOTES = function(){
  var choice = Session.get('p');
  var notes = Books.find({}).fetch()[0].notes;
  var result = notes.filter(function(d){
    // console.log(d);
    // console.log(choice);
    return d.pid == choice;
  })
  return result;

};

Template.viewer.book = function () {
  var book = Books.find().fetch()[0];
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
            console.log(notes);
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

Template.splashPage.username = function () {
  return Session.get('name');
}

Template.splashPage.events({
  'click .name': function (e) {
    Session.set('name','');
  },
  'keydown input': function (e) {
    if (e.which === 13) {
      e.preventDefault()
      Session.set('name', e.target.value.trim());
    }
  },
  'click .button': function(e){
    Session.set("view", "Moby-Dick");
  }
})

Template.viewer.events({
  'click a': function (e) {
    e.preventDefault();
    Session.set('view','');
  },

  'mouseenter div.singlenote': function(e){
    var textnode = $(".noted").contents().filter(function() {
      return this.nodeType == 3;
    })[0];
    var t = window.getSelection();
    var range = document.createRange();
    range.setStart(textnode, this.from);
    range.setEnd(textnode, this.to);
    t.removeAllRanges();
    t.addRange(range);
    var css = document.createElement("style");
    css.type = "text/css";
    css.innerHTML = "p::selection { background:"+this.color+" }";
    document.body.appendChild(css);
  },

  'mouseenter p': function(e){
    Session.set('p', ''+$(e.target).data('pid'));
    $('.noted').removeClass('noted');
    Meteor.setTimeout(function(){
      $(e.target).addClass('noted');
    }, 0);
  },

  'mouseup p': function (e) {
    var s = window.getSelection().toString();
    if (! s) return;
    var from = window.getSelection().getRangeAt(0).startOffset;
    var to = window.getSelection().getRangeAt(0).endOffset;
    var i = $('body').children('p').index($(e.target));
    var pid = $(e.target).data('pid');
    var q = { i:i, title: this.title };
    var userText = prompt('Leave a note');
    if (!userText){return}
    Books.update({title: Session.get('view')}, {
      $push: {
        notes: {
          text: userText,
          title: this.title,
          top: e.target.offsetTop,
          from: from,
          to: to,
          color: Session.get('color'),
          user: Session.get('name') || 'student',
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
