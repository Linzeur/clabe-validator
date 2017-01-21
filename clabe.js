// CLABE Validator v0.0.2
// https://github.com/center-key/clabe-validator
// MIT License

var clabe = clabe || {};

clabe.calcCheckSum = function(clabeNum) {
   var sum = 0;
   var weights = [3, 7, 1];
   function add(digit, index) { sum += (parseInt(digit) * weights[index % 3]) % 10; }
   clabeNum.split('').slice(0, 17).forEach(add);
   return (10 - (sum % 10)) % 10;
   };

clabe.validate = function(clabeNum) {
   if (typeof clabeNum !== 'string')
      throw 'clabe.validator.check(clabeNum) -- Parameter must be a string';
   var bankCode = clabeNum.substr(0, 3);
   var cityCode = clabeNum.substr(3, 3);
   var checksum = parseInt(clabeNum.substr(17, 1));
   function makeCityMap() {
      clabe.city = {};
      function prefix(code) { return clabe.city[code] ? clabe.city[code] + ', ' : ''; }
      function addCity(city) { clabe.city[city[0]] = prefix(city[0]) + city[1]; }  //0: code, 1: name
      clabe.cities.forEach(addCity);
      }
   if (!clabe.city)
      makeCityMap();
   var bank = clabe.bank[parseInt(bankCode)];
   var city = clabe.city[parseInt(cityCode)];
   function calcCheckSum() { return clabe.calcCheckSum(clabeNum); }
   function getErrorMessage() {
      return (
         clabeNum.length !== 18 ?      'Must be exactly 18 digits long' :
         !/[0-9]{18}/.test(clabeNum) ? 'Must be only numeric digits (no letters)' :
         calcCheckSum() !== checksum ? 'Invalid checksum, last digit should be: ' + calcCheckSum() :
         !bank ?                       'Invalid bank code' :
         !city ?                       'Invalid city code' :
         false
         );
      }
   var error = getErrorMessage();
   return {
      error:   !!error,
      message: error || 'Valid: ' + bank + ' (' + city + ')',
      bank:    bank,
      city:    city
      };
   };

clabe.app = {
   validateInput: function(elem) {
      var message = clabe.validate(elem.val()).message;
      elem.closest('form').find('.message').text(message).stop().hide().fadeIn();
      },
   updateCalculation: function(elem) {
      var form = elem.closest('form');
      var bankCode = form.find('select').first().val();
      var cityCode = form.find('select').last().val();
      var account = parseInt(form.find('input').val());
      var clabeNum = bankCode + cityCode + ('00000000000' + (account ? account : '')).slice(-11);
      var message = 'CLABE: ' + clabeNum + clabe.calcCheckSum(clabeNum);
      form.find('.message').text(message).stop().hide().fadeIn();
      },
   setupCalculator: function() {
      function pad(int) { return ('' + int).length < 3 ? pad('0' + int) : int; }
      function codeObj(code, name) {
         return { code: pad(code), name: name, label: pad(code) + ': ' + name };
         }
      function mapToArray(map) {
         var array = [];
         for (var property in map)
            array.push(codeObj(property, map[property]));
         return array;
         }
      function toCityObj(data) { return codeObj(data[0], data[1]); }
      function compare(a, b) { return a.name.localeCompare(b.name); }
      var codes = {
         banks:  mapToArray(clabe.bank).sort(compare),
         cities: clabe.cities.map(toCityObj).sort(compare)
         };
      dna.clone('calculator', codes);
      }
   };
