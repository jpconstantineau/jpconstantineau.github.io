'use strict';
var jpcApp = angular.module('jpcApp', ['ngRoute','ngResource']);

jpcApp.config(['$routeProvider',
 function($routeProvider) {
    $routeProvider.
    when('/', {
        templateUrl: 'templates/main.html',
        controller: 'MainCtrl',
        reloadOnSearch: false        
      }).
	  when('/config', {
        templateUrl: 'templates/config.html',
        controller: 'MainCtrl',
        reloadOnSearch: false        
      }).
	  when('/links', {
        templateUrl: 'templates/links.html',
        controller: 'MainCtrl',
        reloadOnSearch: false        
      }).
      otherwise({
        redirectTo: '/'
      });
  }]);

jpcApp.factory('Objects', ['$resource',
  function($resource){
    var urlBase = 'objects/v1/:id';
    return $resource(urlBase, {id:'@_id'}, {
      query: {method:'GET', params:{}, isArray:true},
      update:{method:'PUT'}
    });
  }]);

jpcApp.service('menuObjects', ['$location',function ($location) {
   this.portfolio = '';
   this.brand={
   				icon:'fa fa-smile-o',
   				name:' JPC',
   				url:'/'
   				};
   
   this.changelocation = function(item){
		$location.path(item.url);   
   }  
   this.sublocation='';
   this.changesublocation = function(item){
		this.sublocation=item.template;   
   }
   this.homesublocation = '';
   this.changehomesublocation = function(item){
		this.homesublocation=item.template;   
   }
   this.menuitems=[
   		{
   				type:'menu',
   				location:'right',
   				url:'/config',   				
   				name:'Config',
   				icon:'glyphicon glyphicon-cog',
   				order:10,
   				items:[
   						{
							type:'menuitem',   				
   							name:'Categories',
   							template:'templates/configCategories.html',
   							icon:'glyphicon glyphicon-book',
   							order:2
   						},
   						{
							type:'menuitem',   				
   							name:'Links',
   							template:'templates/configLinks.html',
   							icon:'glyphicon glyphicon-th-list',
   							order:4
   						}

   						]
   		
   		},
   		{
					type:'menuitem',
					location:'left',   				
   				name:'Links',
   				url:'/links',
   				icon:'glyphicon glyphicon-link',
   				order:3
   		},
   		{
				type:'menuitem',
				location:'left',   				
   				name:'Home',
   				url:'/',
   				icon:'glyphicon glyphicon-home',
   				order:1,
				  		items:[
   						{
							type:'menuitem',   				
   							name:'About Me',
   							template:'templates/mainAbout.html',
   							icon:'glyphicon glyphicon-th-list',
   							order:1
   						},
						{
							type:'menuitem',   				
   							name:'My Resume',
   							template:'templates/mainResume.html',
   							icon:'glyphicon glyphicon-book',
   							order:2
   						}

   						]
   		}	
   ];
}]);

jpcApp.controller('MainCtrl',['$scope','$location','menuObjects','Objects',
function ($scope,$location,menuObjects,Objects) {
	$scope.path = $location.path();
	 
    $scope.model={};
    $scope.search={string:''};
	$scope.menuObjects = menuObjects;

	$scope.model.Categories = Objects.query({objecttype:'Category'});
	$scope.model.Links = Objects.query({objecttype:'Link'});
	
	$scope.objectactions={};
    $scope.objectactions.editingobject={};
	 $scope.objectactions.getTemplate = function(object) {
	 	//console.log(object)
			if ($scope.objectactions.editingobject._id === object._id)
			{
				return 'edit';
			}
			else 
			{
				return 'display';
			}	 
	 }
	 
	 $scope.objectactions.editObject = function(object){
	     $scope.objectactions.editingobject = angular.copy(object);
	 }
	 
	 $scope.objectactions.cancelObject = function(object){
	     $scope.objectactions.editingobject = {};
	     var objecttype = object.objecttype;
	     if (objecttype=='Category'){
	 				$scope.model.Categories = Objects.query({objecttype:'Category'});
	 			}
	 			if (objecttype=='Link'){
	 				$scope.model.Links = Objects.query({objecttype:'Link'});
	 			}
	 }
	 
	 $scope.objectactions.deleteObject = function (object) {
	 	   var objecttype = object.objecttype;   
	 	   console.log('deleteObject')
	 		object.$delete(function () {
	 			if (objecttype=='Category'){
	 				$scope.model.Categories = Objects.query({objecttype:'Category'});
	 			}
	 			if (objecttype=='Link'){
	 				$scope.model.Links = Objects.query({objecttype:'Link'});
	 			}
	 		
			});
    }
    
    
	 $scope.objectactions.saveObject = function (object) {
	 	   var objecttype = object.objecttype;   
	 	   console.log('saveObject')
	 	   //console.log(object)
	 		object.$update(function () {
	 			if (objecttype=='Category'){
	 				$scope.model.Categories = Objects.query({objecttype:'Category'});
	 			}
	 			if (objecttype=='Link'){
	 				$scope.model.Links = Objects.query({objecttype:'Link'});
	 			}
	 		
	 			$scope.objectactions.editingobject = {};	
			});
    }
    
	 $scope.objectactions.newCategory = function(){
	 	   console.log('newCategory')
	 		$scope.newobject = new Objects();
			$scope.newobject.objecttype = 'Category';
	 		$scope.newobject.name = 'New Category';
	 		Objects.save($scope.newobject, function(){
	 			$scope.model.Categories = Objects.query({objecttype:'Category'});
	 		})	 		
	 }
	 
	 $scope.objectactions.newLink = function(){
	 	   console.log('newLink')
	 		$scope.newobject = new Objects();
	 		$scope.newobject.objecttype = 'Link';
	 		$scope.newobject.name = 'New Link';
			$scope.newobject.category = '-NA-';
	 		Objects.save($scope.newobject, function(){
	 			$scope.model.Links = Objects.query({objecttype:'Link'});
	 		})	 		
	 }
}]);

jpcApp.filter('unique', function () {

  return function (items, filterOn) {

    if (filterOn === false) {
      return items;
    }

    if ((filterOn || angular.isUndefined(filterOn)) && angular.isArray(items)) {
      var hashCheck = {}, newItems = [];

      var extractValueToCompare = function (item) {
        if (angular.isObject(item) && angular.isString(filterOn)) {
          return item[filterOn];
        } else {
          return item;
        }
      };

      angular.forEach(items, function (item) {
        var valueToCheck, isDuplicate = false;

        for (var i = 0; i < newItems.length; i++) {
          if (angular.equals(extractValueToCompare(newItems[i]), extractValueToCompare(item))) {
            isDuplicate = true;
            break;
          }
        }
        if (!isDuplicate) {
          newItems.push(item);
        }

      });
      items = newItems;
    }
    return items;
  };
});