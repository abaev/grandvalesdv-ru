angular.module('GVEditApp.directives', []);


// Вход в интерфейс, аутентификация
angular.module('GVEditApp.directives')
	.directive('gvAuth', function() {
		return { // шаблон
			templateUrl: './templates/auth.tmpl.html',
		}
	});


// Собственно редактирование
angular.module('GVEditApp.directives')
	.directive('gvEdit', function() {
		return {
			templateUrl: './templates/editing.tmpl.html',
		}
	});


// Модальное окно подтверждения удаления
angular.module('GVEditApp.directives')
	.directive('gvConfirmDelModal', function() {
		return {
			scope: {
				ctrl: '=ctrl'
			},
			templateUrl: './templates/confirmDelModal.tmpl.html',
		}
	});


// Форма редактирования вакансии
angular.module('GVEditApp.directives')
	.directive('gvEditVacancy', function() {
		return {
			templateUrl: './templates/editVacancyInstance.tmpl.html',
		}
	});

// Модальное окно подтверждения редактирования
angular.module('GVEditApp.directives')
	.directive('gvConfirmEditModal', function() {
		return {
			scope: {
				formCtrl: '=formCtrl'
			},
			templateUrl: './templates/confirmEditModal.tmpl.html',
		}
	});


angular.module('GVEditApp.directives')
	.directive('gvEditReview', function() {
		return {
			templateUrl: './templates/editReviewInstance.tmpl.html',
		}
	});


// Модальное окно подтверждения публиковать / распубликовать
angular.module('GVEditApp.directives')
	.directive('gvConfirmPublishModal', function() {
		return {
			scope: {
				ctrl: '=ctrl'
			},
			templateUrl: './templates/confirmPublishModal.tmpl.html',
		}
	});