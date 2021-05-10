exports.main = function(req, res){
  res.sendFile('./index.html', { root: "./views" });
}