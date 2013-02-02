var url = "https://api.pearson.com/penguin/classics/v1/books?"
      + "apikey=d5df23ffde529d41f3418a80ec6eca25&limit=100"
  Meteor.startup(function () {
    Meteor.setTimeout(function () {
      //no text...
      Books.remove({
        title: "The Private Memoirs and Confessions of a Justified Sinner"
      })
    }, 1000 * 60 * 5)

    Books.find().fetch().length > 1 ||  Meteor.http.get(url, function (err, result) {
      result.data.books.forEach(function (book, i) { 
        book.text = [];
        var id = Books.insert(book)
        Meteor.setTimeout(function ()  {
          Meteor.http.get(book.url, function (err, result) {
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