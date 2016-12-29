angular.module('GVEditApp', [
	'GVEditApp.controllers',
	'GVEditApp.directives',
	'GVEditApp.services',
	
	'ngRoute'
]);


angular.module('GVEditApp')
	.config(['$routeProvider', function($routeProvider) {
		$routeProvider
			.when('/candidates', {
				templateUrl: './templates/candidates.editing.tmpl.html',
				resolve: {
					fixSetActive: ['setActiveNav', function(setActiveNav) {
						setActiveNav('#candidates');
					}]
				}
			})
			.when('/vacancies', {
				templateUrl: './templates/vacancies.editing.tmpl.html',
				resolve: {
					fixSetActive: ['setActiveNav', function(setActiveNav) {
						setActiveNav('#vacancies');
					}]
				}
			})
			.when('/reviews', {
				templateUrl: './templates/reviews.editing.tmpl.html',
				resolve: {
					fixSetActive: ['setActiveNav', function(setActiveNav) {
						setActiveNav('#reviews');
					}]
				}
			})
			.otherwise({redirectTo: '/candidates'});
	}]);

