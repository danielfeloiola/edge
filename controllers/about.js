exports.main = function(req, res){
  res.sendFile('./about.html', { root: "./views" });
}
