angular.module('GVEditApp.services', []);


angular.module('GVEditApp.services')
	.factory('dependencies', function() {
		return {
			SERVER_URL: 'https://grandvalesdv.ru/server', // 'https://alex.enwony.net:443' 'http://localhost:8080' 'http://alex.enwony.net:8080'
			VACANCIES_URL: 'vacancies.json',
			CANDIDATES_URL: 'candidates.json',
			REVIEWS_URL: 'reviews.json',
			REVIEWS_NEW_URL: 'reviews.new.json',
			VACANCIES_LIST_URL: 'vacancies.list.json'
		}
	});


// Функция аутентификации
// Кодирует имя и пароль в Base64 и отсылает на сервер.
// Предоставляет доступ в зависимости от ответа сервера (self.authStatus)
// В случае успеха, все запросы редактора будут идти
// с заголовком Authorization = authStr
angular.module('GVEditApp.services')
	.factory('auth', ['$http', 'dependencies', function($http, dependencies) {
		return function(user) {
			var self = this;
			
			user = user || {};
			
			var authStr = 'Basic ' + btoa(user.name + ':' + user.password);
			
			// Настройка аутентификации для этого и всех последующих запросов 
			$http.defaults.headers.common.Authorization = authStr;
						
			$http.get(dependencies.SERVER_URL + '?getJSON=auth').then(
				function(response) {
					self.authStatus = 'Granted';
				},

				function(response) {
					self.authStatus = 'Denied';
				}
			);
		}
	}]);


// Отфильтровываем вакансии согласно выбору в полях Вакансия и Флот
angular.module('GVEditApp.services')
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


angular.module('GVEditApp.services')
	.factory('filterCandidates',
		['$filter', '$http', 'dependencies', 'gvError',
		
		function($filter, $http, dependencies, gvError) { 
			return function() {
				var self = this;
	
				// Получаем с сервера кандидатов
				$http.get(dependencies.SERVER_URL + '?getJSON='
					+ dependencies.CANDIDATES_URL).then(function(response) {
						self.candidatesAvailable = angular.copy(response.data);
					}, function(response) { gvError(response) });
	
				if (self.filterByVacancy == 'Все') {
					self.candidatesFiltered = self.candidatesAvailable.slice();
				} else {
					self.candidatesFiltered = $filter('filter')
						(self.candidatesAvailable, self.filterByVacancy, true);
				}
			}
	}]);


// Поправляем добавление .active к li, которое иногда не срабатывает
// (например, если пользоваться кнопками браузера "Вперед" / "Назад")
angular.module('GVEditApp.services')
	.factory('setActiveNav', function() {
		return function(hrefVal) {
			$('li.active').removeClass('active');
			$('a[href="' + hrefVal + '"]').parent().addClass('active');
		}
	});


// Обработка ошибок
angular.module('GVEditApp.services')
	.factory('gvError', function() {
		return function(message) {
			console.log(message);
		}
	});

// Удаление
angular.module('GVEditApp.services')
	.factory('gvDelete',
		['$http', 'dependencies', 'gvError', '$route', 'closeModal',

		function($http, dependencies, gvError, $route, closeModal) {
			return function(obj) {
				obj.action = 'delete';
				$http.post(dependencies.SERVER_URL, JSON.stringify( obj ))
					.then(function(response) {
						closeModal('#confDelModal');
						$route.reload(); // гениально обновляем вид!!
					},
	
					function(response) { // fail
						gvError('Delete failed');
					});
			}
		}]);


angular.module('GVEditApp.services')
	.factory('gvReplace',
		['$http', 'dependencies', 'gvError', '$route', 'closeModal',
		
		function($http, dependencies, gvError, $route, closeModal) {
			return function(objOld, objNew) {
				var tmp = [];
				
				// Сохраним отредактированный,
				// новый объект со старым id,
				// необоходим также тип объекта
				objNew.id = objOld.id;
				objNew.objType = objOld.objType;
				
				// Это на всякий случай
				delete objOld.isEditing;

				// Проверка корректности даты
				// и преобразование ее в объект Date
				if(objNew.date.match(/\b\d\d\.\d\d\.\d\d\d\d\b/)) {
					tmp = objNew.date.split('.');
					if(tmp.length = 3) {
						objNew.date = tmp[2] + '-' + tmp[1] + '-' + tmp[0];
					}
				}				
				if( !(new Date(objNew.date)) ) objNew.date = objOld.date;
				objNew.date = new Date(objNew.date);
				
				objOld.action = 'delete';
				
				$http.post(dependencies.SERVER_URL, JSON.stringify( objOld ))
					.then(function(response) {
						
						// Теперь отправляем новый объект
						$http.post(dependencies.SERVER_URL, JSON.stringify( objNew ))
							.then(function(response) {  // success
								closeModal('#confEditModal');
								$route.reload(); // гениально обновляем вид!!
							},
			
							function(response) { // fail
								gvError('Replace failed');
						});

					},
	
					function(response) { // fail
						gvError('Replace failed');
					});
			}
		}]);


// Убирает Bootstrap's modal
angular.module('GVEditApp.services')
	.factory('closeModal', function() {
		return function(id) {
			$(id).modal('hide');
			$('body').removeClass('modal-open');
			$('.modal-backdrop').remove();
		}
	});


// Datepicker
angular.module('GVEditApp.services')
	.directive('gvDatePicker', function() {
		return {
			link: function(scope, element, attrs) {
				element.datepicker(
					{
						dayNamesMin: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
						firstDay: 1, // Понедельник - первый день недели
						monthNames: ['Январь', 'Февраль', 'Март', 'Апрель',
							'Май', 'Июнь', 'Июль', 'Август',
							'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
						dateFormat: 'dd.mm.yy',
						nextText: 'Следующий',
						prevText: 'Предыдущий'
					});
			}
		}
	});


// Поместить / убрать отзыв на сайт
angular.module('GVEditApp.services')
	.factory('gvPublish',
		['$http', 'dependencies', 'gvError', '$route', 'closeModal',
		
		function($http, dependencies, gvError, $route, closeModal) {
			return function(obj) {
				
				delete obj.isEditing;
				obj.action = 'delete';
				
				$http.post(dependencies.SERVER_URL, JSON.stringify( obj ))
					.then(function(response) {
						
						// Теперь отправляем новый объект
						delete obj.action; // важно - чтоб сервер не удалил 
						if(obj.objType === 'review') {
							obj.objType = 'reviewNew'
						} else obj.objType = 'review';

						$http.post(dependencies.SERVER_URL, JSON.stringify( obj ))
							.then(function(response) {  // success
								closeModal('#confPublishModal');
								$route.reload(); // гениально обновляем вид!!
							},
			
							function(response) { // fail
								gvError('Publish failed');
						});

					},
	
					function(response) { // fail
						gvError('Publish failed');
					});

			}
		}]);