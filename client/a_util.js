var rand_n = function (n) {
  return ~~ (n * Math.random())
}

var hex = '0123456789abcdef'.split('')

var rand_color = function () {
  return '#' + [16,16,16]
    .map(rand_n).map(function (d) { return hex[d] })
    .join('');
}

