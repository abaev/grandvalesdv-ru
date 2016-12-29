angular.module('GVApp.services', []);


angular.module('GVApp.services')
	.factory('dependencies', function() {
		return {
			SERVER_URL: 'https://grandvalesdv.ru/server', // 'http://localhost:8080'
			VACANCIES_URL: 'vacancies.json',
			REVIEWS_URL: 'reviews.json',
			VACANCIES_LIST_URL: 'vacancies.list.json'
		}
	});


// По нажатию на кнопку показывем/скрываем формы для соискателя и судовладельца
angular.module('GVApp.services')
	.factory('sidebarFormsShowHide', function() {
		return function(key) {
			var self = this;

			if(key == 'candidateFormIsVisible' && self.candidateFormIsVisible == false) {
				self.shipownerFormIsVisible = false;
			}

			if(key == 'shipownerFormIsVisible' && self.shipownerFormIsVisible == false) {
				self.candidateFormIsVisible = false;
			}
			
			self[key] = !self[key];
			}
	});


// Отфильтровываем вакансии согласно выбору в полях Вакансия и Флот
angular.module('GVApp.services')
	.factory('filterVacancies', ['$filter', '$http', 'dependencies', 'gvError',
		function($filter, $http, dependencies, gvError) { 
			return function() {
				var self = this;
	
				// Получаем с сервера доступные вакансии
				$http.get(dependencies.SERVER_URL + '?getJSON='
					+ dependencies.VACANCIES_URL).then(function(response) {
						self.vacanciesAvailable = angular.copy(response.data);
					}, function(response) { gvError(response) });
	
				if (self.filterByVacancy == 'Все') {
					self.vacanciesFiltered = self.vacanciesAvailable.slice();
				} else {
					self.vacanciesFiltered = $filter('filter')
						(self.vacanciesAvailable, self.filterByVacancy, true);
				}
	
				if(self.filterByFleet == 'Все') return;
	
				self.vacanciesFiltered = $filter('filter')
					(self.vacanciesFiltered, self.filterByFleet, true);
			}
		}]);


angular.module('GVApp.services')
	.factory('send', ['$http', 'dependencies', function($http, dependencies) {
			return function(obj, form) {
				var self = this;
				// Отправляет данные Анкеты соискателя,
				// Заявки судовладельца или Отзыв на сервер.
				// С какой формой имеем дело определяет
				// obj.objType
	
				if(form.$invalid) return;
				
				$http.post(dependencies.SERVER_URL, JSON.stringify( obj ))
					.then(function(response) {  // success
						obj.sendStatus = 'OK';
					},
	
					function(response) { // fail
						obj.sendStatus = 'Fail';
				});
			}
		}]);


// Поведение формы после попытки отправки,
// и нажатия пользователем кнопки OK
angular.module('GVApp.services')
	.factory('afterSent', function() {
		return function(obj, form) {
			var self = this;
			var objType = obj.objType;
		
			if(obj.sendStatus === 'OK') { 
				// В случае успешной отправки вернуть форму изначальное состояние
				// Почему не работает с obj - ХЗ
				self[objType] = angular.copy(self[objType + 'Master']);
				form.$setPristine();

			} else { 
				// Если отправить не удалось - не очищать форму,
				// просто сбросить состояние Submitted
				obj.sendStatus = '';
				form.$setPristine();
			}
		}
	});


// Обработка ошибок
angular.module('GVApp.services')
	.factory('gvError', function() {
		return function(message) {
			console.log(message);
		}
	});
	
		


