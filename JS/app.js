(function() {
  "use strict";

  angular.module("NarrowItDownApp", [])
    .controller("NarrowItDownController", NarrowItDownController)
    .service("MenuSearchService", MenuSearchService)
    .directive("foundItems", FoundItemsDirective)
    .constant("ApiBasePath", "https://coursera-jhu-default-rtdb.firebaseio.com");

  function FoundItemsDirective() {
    var ddo = {
      template: "<h2>{{ title }}</h2>"
        + "<ul><li ng-repeat='item in list'>"
        + "<button class='btn btn-danger pull-right' ng-click='onRemove({ index: $index });'>Don't want this one!</button>"
        +"<b>{{ item.name }} [{{ item.short_name }}]</b><br />"
        + "Content: {{ item.description }}</li></ul>"
        + "<p>{{ result }}</p>",
      templateUrl: "itemList.html",
      scope: {
        list: "<",
        title: "@title",
        result: "@result",
        onRemove: "&"
      },
      controller: FoundItemsDirective,
      controllerAs: "list",
      bindToController: true
    };

    return ddo;
  }
  
  NarrowItDownController.$inject = ["MenuSearchService"];
  function NarrowItDownController(MenuSearchService) {
    var ctrl = this;
    ctrl.searchFor = "";
    ctrl.searchResult = "";
    ctrl.found = [];

    ctrl.search = function () {
      
      if(ctrl.searchFor && ctrl.searchFor.length > 0) {
        ctrl.searchResult = "";
        var promise = MenuSearchService.getMatchedMenuItems(ctrl.searchFor);
        
        promise.then(function(result) {
          ctrl.found = result;
          if(ctrl.found.length === 0) {
            ctrl.searchResult = "Nothing found (matching \"" + ctrl.searchFor + "\")";
          }
        });
      }
      else
      {
        ctrl.searchResult = "Nothing found";
      }
    };

    ctrl.onRemove = function(index) {
      console.log("Index: ", index);
      ctrl.found.splice(index, 1);
    };
  }

  /*** SERVICES **************************************************************/
  MenuSearchService.$inject = ["$http", "ApiBasePath"];
  function MenuSearchService($http, ApiBasePath) {
    var service = this;

    service.getMenuItems = function() {
      return $http({
        method: "GET",
        url: (ApiBasePath + "/menu_items.json")
      });
    };

    service.getMatchedMenuItems = function(searchTerm) {
      return $http({
        method: "GET",
        url: (ApiBasePath + "/menu_items.json")
      })
        .then(function(response){
          var menuItems = response.data;
          var foundItems = filterOnDescription(menuItems.menu_items, searchTerm);

          return foundItems;
        });
    };

    function filterOnDescription(list, searchTerm) {
      var newList = [];
      
      for (var i = 0; i < list.length; i++) {
        if(list[i].description.indexOf(searchTerm) > 0) {
          newList.push(list[i]);
        }
      }

      return newList;
    }
  }

})();