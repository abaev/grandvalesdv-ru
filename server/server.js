var http = require('http');
var fs = require('fs');
var nodeUrl = require('url');

// installed modules
var auth = require('basic-auth');
var shortId = require('shortid');
var jsonFormat = require('json-format');
var nodemailer = require('nodemailer');

var REVIEWS_NEW_FILE_NAME = __dirname + '/../data/reviews.new.json';
var REVIEWS_FILE_NAME = __dirname + '/../data/reviews.json';
var VACANCIES_FILE_NAME = __dirname + '/../data/vacancies.json';
var CANDIDATES_FILE_NAME =  __dirname + '/../data/candidates.json';
var EDITORS_FILE_NAME = __dirname + '/../data/editors.json';
var MAILER_CONFIG_FILE_NAME = __dirname + '/../data/mailer.config.json';
var ALLOW_ORIGIN_HEADER = 'https://grandvalesdv.ru/server'; // '*'
var DATA_PATH = __dirname + '/../data/';

var transporter, mailOptions;

var userData = '';

var editorsAuth = [];

// разрешенные для чтения всеми
var permittedToReadAll = ['vacancies.json', 'reviews.json', 'vacancies.list.json'];

var forEditorsOnly = ['candidates.json', 'reviews.new.json'];

var formatter = new Intl.DateTimeFormat('ru');

// Для настройки nodemailer
fs.readFile(MAILER_CONFIG_FILE_NAME, 'utf8', function(err, data) {
  var config = {};
  
  if(err) return console.error(err);
  
  try {
    config = JSON.parse(data);
    // create reusable transporter object using the default SMTP transport
    transporter = nodemailer.createTransport(config.transportConfig);
    // setup e-mail data with unicode symbols
    mailOptions = config.mailOptions;
  } catch(e) {
    return console.error(e);
  }
});


// Читаем имена / пароли в editorsAuth
fs.readFile(EDITORS_FILE_NAME, 'utf8', function(err, data) {
  if(err) {
    editorsAuth = [];
    console.error(err);
  } else {
    try {
      editorsAuth = JSON.parse(data);
    } catch(e) {
      editorsAuth = [];
      console.error(e);
    }
  }
});


http.createServer(function(request, response) {
  var headers = request.headers;
  var method = request.method;
  var url = request.url;
  var body = [];

  request.on('error', function(err) {
    console.error(err);
    send500(response);
  })
  
  .on('data', function(chunk) {
      body.push(chunk);
  })
  
  .on('end', function() {
    response.on('error', function(err) {
      console.error(err);
    });
    
    userData = Buffer.concat(body).toString();

    if(method === 'GET') {
      serveGet(request, response, url);
    } else {
      if(method === 'POST') {
        servePost(request, response, userData);
      }
    }
  });
}).listen(8080, function() {
  console.log('Server listening on port 8080');
  console.log('process.cwd() ' + process.cwd())
  console.log('__dirname ' + __dirname);
});


function sendError(response, err) {
  var headers = err.headers || {};
  var message = err.message || '';
  response.setHeader('Access-Control-Allow-Origin', ALLOW_ORIGIN_HEADER);
  response.setHeader('Content-Type', 'text/html');
  response.writeHead(err.number, err.headers);
  response.end(message);
}


function send500(response) {
  sendError(response, {
      number: 500,
      text: 'Internal Server Error'
    });
}


function send403(response) {
  sendError(response, {
      number: 403,
      text: 'Forbidden',
      headers: {
        'WWW-Authenticate': 'Basic realm="Server access denied"'
      }
    });
}


function sendData(response, data) {
  response.setHeader('Access-Control-Allow-Origin', ALLOW_ORIGIN_HEADER);
  response.setHeader('Content-Type', 'text/html');
  response.writeHead(200);
  response.end(data);
}


function readAndSend(response, path) {
  fs.readFile(path, 'utf8', function(err, data) {
    if(err) return send500(response);
    sendData(response, data);
  });
}


function serveGet(request, response, url) {
  var isAccessGranted = false;
  var urlObj = nodeUrl.parse(url, true);
  
  if( permittedToReadAll.indexOf(urlObj.query.getJSON) != -1) {
    // разрешенный всем контент, читаем и отдаем
    readAndSend(response, DATA_PATH + urlObj.query.getJSON);
  } else {
    // доступно редакторам, проверям имя и пароль
    
    if(!checkAuth(request)) return send403(response);

    // Отдаем данные или просто ответ, что аутентификация - OK
    if(forEditorsOnly.indexOf(urlObj.query.getJSON) != -1) {
        readAndSend(response, DATA_PATH + urlObj.query.getJSON);
      } else sendData(response, 'Server access granted');
  }
}

function servePost(request, response, userData) {
  // В полученный от пользователя или редактора объект
  // добавляем поле со временем и если ещё нет id - то id
  // и дописываем в соответствующий файл

  var fileName = '';
                
  try {
    userData = JSON.parse(userData);
    
    switch(userData.objType) {
      case 'shipowner':
        fileName = VACANCIES_FILE_NAME;
        mailOptions.subject = 'Новая заявка судовладельца';
        break;
      case 'reviewNew':
        fileName = REVIEWS_NEW_FILE_NAME;
        mailOptions.subject = 'Новый отзыв';
        break;
      case 'review':
        // Доступ ограничен
        if(!checkAuth(request)) return send403(response);
        fileName = REVIEWS_FILE_NAME;
        mailOptions.subject = 'Новый отзыв';
        break;
      case 'candidate':
        fileName = CANDIDATES_FILE_NAME;
        mailOptions.subject = 'Новая анкета соискателя';
        break;
    }

    // Больше нам не нужны
    delete userData.sendStatus;

    switch(userData.action) {
      case 'delete':
        if(!checkAuth(request)) return send403(response);
        deleteFromFile(response, userData, fileName);
        return;
    }
    
    // Добавление вакансии / анкеты / отзыва в соответствующий файл
    fs.readFile(fileName, function(err, data) {
      var arr = [];

      if (err) {
        console.error(err);
        return send500(response);
      }

      try {
        arr = JSON.parse(data);
        // добавление полей со временем и id
        if(!userData.date) {
          userData.date = new Date();
        } else userData.date = new Date(userData.date); // вот это место уточнить

        if(!userData.id) userData.id = shortId.generate();
        arr.push(userData);
                        
        fs.writeFile(fileName, jsonFormat(arr), function(err) {
          if(err) return send500(response);

          // Если успех
          // Отправить e-mail
          mailOptions.html = gvCreateHtmlBody(userData);
          transporter.sendMail(mailOptions, function(error, info){
            if(error) return console.error(error);
          });

          sendData(response, '');
        });
        
      }
      catch(e) {
        console.error(e);
        send500(response);
      }
    });

  } catch(err) {
    console.error(err);
    send500(response);
  }
}


function deleteFromFile(response, obj, fileName) {
  delete obj.action; // на всякий случай
  fs.readFile(fileName, function(err, data) {
    var arr = [];

    if (err) {
      console.error(err);
      return send500(response);
    }

    try {
      arr = JSON.parse(data);
      arr.forEach(function(item, i, arr) {
        if(item.id === obj.id) {
          arr.splice(i, 1);
        }
      });

      fs.writeFile(fileName, jsonFormat(arr), function(err) {
        if(err) return send500(response);
        sendData(response, ''); // если успех
      });
    }
    catch(e) {
      console.error(e);
      send500(response);
    }
  });
};

// Возвращет true если аутентификация OK,
// иначе false
function checkAuth(request) {
  var isAccessGranted = false;
  var user = auth(request);
  user = user || {};
      
  // Проверяем имя пользователя/пароль
  editorsAuth.forEach(function(el) {
    if(user.name === el.name && user.pass === el.pass) isAccessGranted = true;
  });
  return isAccessGranted;
}


// Возвращает HTML строку созданную из объекта
// для отправки по почте
function gvCreateHtmlBody(obj) {
  var htmlBody = '';
  switch(obj.objType) {
    case 'shipowner':
      htmlBody = 
        `<h2>Заявка судовладельца</h2> 
          <p><b>Название компании:</b> ${obj.companyName}</p>
          <p><b>Вакансия:</b> ${obj.vacancy}</p>
          <p><b>Флот:</b> ${obj.fleetType ? obj.fleetType : ''}</p>
          <p><b>Тип судна:</b> ${obj.vesselType}</p>
          <p><b>DW (т.):</b> ${obj.vesselDW}</p>
          <p><b>Дата постройки:</b> ${obj.vesselDateOfConstr}</p>
          <p><b>Зарплата:</b> ${obj.payment}</p>
          <p><b>Дополнительные данные:</b> ${obj.optional}</p>
          <p><b>Телефон отдела кадров:</b> ${obj.phone}</p>
          <p><b>E-mail:</b> ${obj.email}</p>
          <p><b>Дата:</b> ${formatter.format(obj.date)}</p>
          <p><b>ID:</b> ${obj.id}</p>`;
      break;
    
    case 'reviewNew':
      htmlBody = 
        `<h2>Отзыв</h2>
        <p><b>Текст отзыва:</b> ${obj.text}</p>
        <p><b>Имя:</b> ${obj.name}</p>
        <p><b>Дата:</b> ${formatter.format(obj.date)}</p>
        <p><b>ID:</b> ${obj.id}</p>`;
      break;
    
    case 'review':
      htmlBody = 
        `<h2>Отзыв</h2>
        <p><b>Текст отзыва:</b> ${obj.text}</p>
        <p><b>Имя:</b> ${obj.name}</p>
        <p><b>Дата:</b> ${formatter.format(obj.date)}</p>
        <p><b>ID:</b> ${obj.id}</p>`;
      break;
    
    case 'candidate':
      htmlBody = 
        `<h2>Анкета соискателя</h2>
          <p><b>ФИО:</b> ${obj.name}</p>
          <p><b>Год рождения:</b> ${obj.ageYear}</p>
          <p><b>Место проживания:</b> ${obj.place}</p>
          <p><b>Должность:</b> ${obj.vacancies.join(', ')}</p>
          <p><b>Опыт работы:</b> ${obj.experience}</p>
          <p><b>Последнее место работы:</b> ${obj.lastJob}</p>
          <p><b>Мобильный телефон:</b> ${obj.phone}</p>
          <p><b>E-mail:</b> ${obj.email}</p>
          <p><b>Дата:</b> ${formatter.format(obj.date)}</p>
          <p><b>ID:</b> ${obj.id}</p>`;
      break;
  }

  return htmlBody;
}