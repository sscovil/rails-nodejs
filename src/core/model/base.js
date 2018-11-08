module.exports = class ActiveRecord {
  getProperty(path) {
    var paths = path.split(".");
    var obj = this.json;
    var current = obj;

    for (var i = 0; i < paths.length; i++) {
      if (_isArraySyntax(paths[i])) {
        var prop = paths[i].split("[")[0];
        var idx = Number(paths[i].split("[")[1].split("]")[0]);

        current = current[prop][idx];
      } else if (current[paths[i]]) {
        current = current[paths[i]];
      } else {
        current = null;
        break;
      }
    }

    return current ? current : null;

    function _isArraySyntax(arg) {
      return arg.indexOf("[") !== -1 && arg.indexOf("]") !== -1;
    }
  }
};
