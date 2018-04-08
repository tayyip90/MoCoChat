module.exports = {
    isNameInArray: function (array, name) {
        var found = false;
        for(var i = 0; i < array.length; i++) {
            if (array[i].username == name) {
                found = true;
                break;
            }
        }
        return found;
    },
    removeFromArray: function (array, object) { 
      var index = array.indexOf(object);
      if(index > -1){
          array.splice(index, 1);
      }
      return array;
    },
    getUserList: function (array){
        var userList=[]
        for(var i = 0; i < array.length; i++) {
        userList.push(array[i].username)
        }
        return userList;
    }
  };