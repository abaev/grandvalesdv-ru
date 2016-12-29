angular.module('GVApp.controllers',
	['GVApp.services']);


angular.module('GVApp.controllers')
	.controller('GVAppController',
		['$scope', '$http', 'dependencies',
		'filterVacancies', 'sidebarFormsShowHide', 'gvError',
		
		function($scope, $http, dependencies,
			filterVacancies, sidebarFormsShowHide, gvError) {

			var self = this;
								
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
						
			self.vacanciesAvailable = [];
			
			// Впервые подгружаем вакансии
			$http.get(dependencies.SERVER_URL + '?getJSON='
				+ dependencies.VACANCIES_URL).then(function(response) {
					self.vacanciesAvailable = angular.copy(response.data);
					self.vacanciesFiltered = self.vacanciesAvailable.slice();
				}, function(response) { gvError(response); });
			
			self.filterVacancies = filterVacancies;
	
			self.fleetList = ['Все', 'Транспортный', 'Рыбодобывающий'];
			
			self.filterByFleet = 'Все';
			self.filterByVacancy = 'Все';

			self.candidateFormIsVisible = false;
			self.shipownerFormIsVisible = false;

			self.sidebarFormsShowHide = sidebarFormsShowHide;
	}]);

	
angular.module('GVApp.controllers')
	.controller('CandidateFormController',
		['send', 'afterSent',

		function( send, afterSent) {
			var self = this;
			
			self.send = send;
			self.afterSent = afterSent;

			self.candidateMaster = {};
			self.candidate = {};

			self.candidateMaster.ageYear = '1980 г.'; // Год рождения (по умолчанию 1980 г.)
			self.candidateMaster.objType = 'candidate';
			self.candidateMaster.sendStatus = ''; // 'OK', 'Fail'
			self.candidate = angular.copy(self.candidateMaster);
			
			self.candidateAgeRange = [];
			// Инициализация массива для выпадающего списка года рождения
			for(var y = 1940; y <= 2002; y++)
				self.candidateAgeRange.push(y + ' г.');
	}]);


angular.module('GVApp.controllers')
	.controller('ShipownerFormController',
		['send', 'afterSent',
		
		function(send, afterSent) {
			var self = this;
			
			self.send = send;
			self.afterSent = afterSent;

			self.shipownerMaster = {};
			self.shipowner = {};
			
			// self.shipownerMaster.vesselDateOfConstr = '2000 г.'; // Год постройки (по умолчанию 2000 г.)
			self.shipownerMaster.vacancy = 'Капитан';
			self.shipownerMaster.objType = 'shipowner';
			self.shipownerMaster.sendStatus = ''; // 'OK', 'Fail'
			self.shipowner = angular.copy(self.shipownerMaster);
			
			self.shipownerDateOfConstrRange = [];
			
			// Инициализация массива для выпадающего списка года постройки
			for(var y = 1940; y <= 2016; y++)
				self.shipownerDateOfConstrRange.push(y + ' г.');
	}]);


angular.module('GVApp.controllers')
	.controller('ReviewsController',
		['$http', 'send', 'afterSent', 'dependencies', 'gvError',

		function($http, send, afterSent, dependencies, gvError) {
			var self = this;
			
			self.send = send;
			self.afterSent = afterSent;

			self.reviews = [];
			
			// Впервые подгружаем отзывы
			$http.get(dependencies.SERVER_URL + '?getJSON='
				+ dependencies.REVIEWS_URL).then(function(response) {
					self.reviews = angular.copy(response.data);
				}, function(response) { gvError(response); });
			
			self.reviewFormIsVisible = false;
			
			self.reviewNewMaster = {};
			self.reviewNew = {};

			self.reviewNewMaster.objType = 'reviewNew';
			self.reviewNewMaster.sendStatus = ''; // 'OK', 'Fail'
			self.reviewNew = angular.copy(self.reviewNewMaster);
	}]);

