Meteor.absoluteUrl('home', {rootUrl: 'http://bookcrumb-marx.dotcloud.com'});

var url = "https://api.pearson.com/penguin/classics/v1/books/cadk020qnEqNcx?"
      + "apikey=d5df23ffde529d41f3418a80ec6eca25&limit=100"
  Meteor.startup(function () {

    if (! Books.find().fetch().length)
      Meteor.http.get(url, function (err, result) {
      var temp = [];
      temp.push(result);
      temp.forEach(function (book, i) { 
        book.title="Moby-Dick";
        book.text = [];
        book.notes = [];
        var id = Books.insert(book)
        Meteor.setTimeout(function ()  {
          Meteor.http.get(url, function (err, result) {
            result.data.book.articles.forEach(function (article, i) {
              Meteor.setTimeout(function ()  {
                Meteor.http.get(article.url, function (err, result) {
                  book.text.push(result.data.article)
                  Books.update({_id:id}, book)
                })
              }, i * 10);
            })
          })
        }, i * 10);
      });
    });
  });