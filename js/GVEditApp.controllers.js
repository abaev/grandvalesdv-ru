angular.module('GVEditApp.controllers',
	['GVEditApp.services']);


angular.module('GVEditApp.controllers')
	.controller('GVEditAppController', ['$scope', 'auth', '$http', function($scope, auth, $http) {
		var self = this;

		self.auth = auth;
		self.authStatus = ''; // Вернуть '' // 'Granted'
		
		// Для отладки, удалить, и $http из зависимостей этого контроллера - тоже
		// $http.defaults.headers.common.Authorization = 'Basic c2FzaGE6d293';
	}]);



angular.module('GVEditApp.controllers')
	.controller('CandidatesEditController',
		['$scope', '$http', 'dependencies',	'filterCandidates',
		'gvError', 'gvDelete', 
				
		function($scope, $http, dependencies,	filterCandidates,
			gvError, gvDelete) {

			var self = this;
			
			self.gvDelete = gvDelete;

			self.vacanciesList = []; // список названий вакансий
			
			// Получить список названий вакансий
			// и добавить к нему 'Все' для отображения
			// в выпадающем списке поиска по вакансиям
			$http.get(dependencies.SERVER_URL + '?getJSON='
				+	dependencies.VACANCIES_LIST_URL).then(function(response) {
					self.vacanciesList = angular.copy(response.data);
					self.vacanciesListAll = self.vacanciesList.slice();
					self.vacanciesListAll.unshift('Все');
				}, function(response) { gvError(response); });

			// Впервые подгружаем кандидатов
			self.candidatesAvailable = [];
			$http.get(dependencies.SERVER_URL + '?getJSON='
				+ dependencies.CANDIDATES_URL).then(function(response) {
					self.candidatesAvailable = angular.copy(response.data);
					self.candidatesFiltered = self.candidatesAvailable.slice();
				}, function(response) { gvError(response); });
			
			self.filterCandidates = filterCandidates;
	
			self.fleetList = ['Все', 'Транспортный', 'Рыбодобывающий'];
			
			self.filterByFleet = 'Все';
			self.filterByVacancy = 'Все';
	}]);


angular.module('GVEditApp.controllers')
	.controller('VacanciesEditController',
		['$scope', '$http', 'dependencies',	'filterVacancies',
		'gvError', 'gvDelete',
				
		function($scope, $http, dependencies,	filterVacancies,
			gvError, gvDelete) {

			var self = this;
			
			self.filterVacancies = filterVacancies;
			self.gvDelete = gvDelete;

			self.vacanciesList = []; // список названий вакансий
			
			// Получить список названий вакансий
			// и добавить к нему 'Все' для отображения
			// в выпадающем списке поиска по вакансиям
			$http.get(dependencies.SERVER_URL + '?getJSON='
				+	dependencies.VACANCIES_LIST_URL).then(function(response) {
					self.vacanciesList = angular.copy(response.data);
					self.vacanciesListAll = self.vacanciesList.slice();
					self.vacanciesListAll.unshift('Все');
				}, function(response) { gvError(response); });

			// Впервые подгружаем вакансии
			self.vacanciesAvailable = [];
			$http.get(dependencies.SERVER_URL + '?getJSON='
				+ dependencies.VACANCIES_URL).then(function(response) {
					self.vacanciesAvailable = angular.copy(response.data);
					self.vacanciesFiltered = self.vacanciesAvailable.slice();
				}, function(response) { gvError(response); });
				
			self.fleetList = ['Все', 'Транспортный', 'Рыбодобывающий'];
			
			self.filterByFleet = 'Все';
			self.filterByVacancy = 'Все';

	}]);


angular.module('GVEditApp.controllers')
	.controller('VacancyInstanceEditingCtrl', ['gvReplace', function(gvReplace) {
		var self = this;

		self.gvReplace = gvReplace;

		self.shipownerDateOfConstrRange = [];
		// Инициализация массива для выпадающего списка года постройки
		for(var y = 1940; y <= 2016; y++)
			self.shipownerDateOfConstrRange.push(y + ' г.');
	}]);


angular.module('GVEditApp.controllers')
	.controller('ReviewsEditController',
		['$scope', '$http', 'dependencies',	'gvError', 'gvDelete',
		'gvPublish',
				
		function($scope, $http, dependencies,	gvError, gvDelete,
			gvPublish) {

			var self = this;
			
			self.gvDelete = gvDelete;
			self.gvPublish = gvPublish;

			self.reviewsOnSite = [];
			self.reviewsNew = [];
			
			// Впервые подгружаем отзывы
			$http.get(dependencies.SERVER_URL + '?getJSON='
				+ dependencies.REVIEWS_URL).then(function(response) {
					self.reviewsOnSite = angular.copy(response.data);
				}, function(response) { gvError(response); });

			// Впервые подгружаем неопубликованные (новые) отзывы
			$http.get(dependencies.SERVER_URL + '?getJSON='
				+ dependencies.REVIEWS_NEW_URL).then(function(response) {
					self.reviewsNew = angular.copy(response.data);
				}, function(response) { gvError(response); });

	}]);


angular.module('GVEditApp.controllers')
	.controller('ReviewInstanceEditingCtrl', ['gvReplace', function(gvReplace) {
		var self = this;

		self.gvReplace = gvReplace;
	}]);
