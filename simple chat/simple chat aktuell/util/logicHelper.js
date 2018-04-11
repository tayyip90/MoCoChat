module.exports = {
	//method to find name in array and return the boolean value
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
	//removes Object from Array and return new Array
    removeFromArray: function (array, object) { 
      var index = array.indexOf(object);
      if(index > -1){
          array.splice(index, 1);
      }
      return array;
    },
	//push received userlist into array and return new Array
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