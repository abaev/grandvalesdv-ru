angular.module('GVApp.directives', []);


// Добавляет Bootstrap Tooltip
angular.module('GVApp.directives')
	.directive('gvTooltip', function() {
		return {
			link: function(scope, element, attrs) {
				element.tooltip();
			}
		}
	});


// Анкета соискателя
angular.module('GVApp.directives')
	.directive('gvCandidateForm', function() {
		return {
			templateUrl: './templates/candidateForm.tmpl.html'
		}
	});


// Заявка судовладельца
angular.module('GVApp.directives')
	.directive('gvShipownerForm', function() {
		return {
			templateUrl: './templates/shipownerForm.tmpl.html'
		}
	});


// Отзывы
angular.module('GVApp.directives')
	.directive('gvReviews', function() {
		return {
			templateUrl: './templates/reviews.tmpl.html'
		}
	});


// Основной контент - результыты поиска
angular.module('GVApp.directives')
	.directive('gvMainContent', function() {
		return {
			templateUrl: './templates/mainContent.tmpl.html'
		}
	});


// Инпуты с фильтрами в сайдбаре
// Основной контент - результыты поиска
angular.module('GVApp.directives')
	.directive('gvFiltersSelect', function() {
		return {
			templateUrl: './templates/filtersSelect.tmpl.html'
		}
	});