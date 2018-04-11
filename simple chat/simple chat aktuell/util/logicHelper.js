module.exports = {
    isNameInArray: function (array, name) {
        var found = false;
        for(var i = 0; i < array.length; i++) {
            if (array[i] === name) {
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
    }, 
    generateRandomInt: function(max) {
        return Math.floor(Math.random() * Math.floor(max));
    },  
    //hashCodeFunction
    hashCode: function (str){
        var hash = 0;
        if (str.length == 0) return hash;
        for (i = 0; i < str.length; i++) {
            char = str.charCodeAt(i);
            hash = ((hash<<5)-hash)+char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return hash;
    }
  };