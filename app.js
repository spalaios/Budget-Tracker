

var budgetController = (function() {

	//constructor function for Expense and Income

	var Expense = function(id,description,value) {
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};

	Expense.prototype.calcPercentage = function(totalIncome) {
		if (totalIncome > 0) {
			this.percentage = Math.round((this.value / totalIncome) * 100);
		} else {
			this.percentage = -1;
		}
	}

	Expense.prototype.getPercentage = function() {
		return this.percentage;
	}

	var Income = function(id,description,value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};

	//creating a function for calculating the totals of income or expenses

	var  calculateTotal = function(type) {

		var sum = 0;
		data.allItems[type].forEach(function(curr) {
			sum = sum + curr.value;
		});
		data.totals[type] = sum;
	}

	//relearn the code from course
	var data = {
		allItems: {
			exp:[], //expense objects are stored in this array and so its prototype is accessed
			inc:[]  //income objects are stored in this array
		},
		totals: {
			exp:0,
			inc:0
		},
		budget: 0,
		percentage: -1
	};

	return {
		addItem : function(type,des,val) {

			var newItem, ID;

			//create new id
			if (data.allItems[type].length > 0) {
					ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
			} else {
					ID = 0;
			}

			//create a new item based on 'inc' or 'exp'
			if (type === 'exp') {

				newItem = new Expense(ID, des, val);
			}else if (type === 'inc') {
				newItem = new Income(ID, des, val);
			}

			//Push it into our data structure
			data.allItems[type].push(newItem);

			//return the new element
			return newItem;
		},

		deleteItem: function(type, id) {
			var ids, index;

			ids = data.allItems[type].map(function(current) {
				return current.id; //here the current element is a object
			}); //map function returns an array

			index = ids.indexOf(id);

			if (index !== -1) {
				data.allItems[type].splice(index, 1);
			}
		},

		calculateBudget: function() {
			//calculate the total income and expenses
				calculateTotal('exp');
				calculateTotal('inc');

			//calculate the budget: income - expenses

			data.budget = data.totals.inc - data.totals.exp;

			//calculate the percentage of income that we spent
			if (data.totals.inc > 0) {

				data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
			}	else {
				data.percentage = -1;
			}
		},

		calculatePercentage: function() {
				data.allItems.exp.forEach(function(current) {
					current.calcPercentage(data.totals.inc);
				});
		},

		getPercentages: function() {
			var allPerc;
			allPerc = data.allItems.exp.map(function(current) {
				return current.getPercentage();
			});
			return allPerc; //allPerc is an array here
		},
		getBudget: function() {
				return {
					budget:data.budget,
					totalInc:data.totals.inc,
					totalExp:data.totals.exp,
					percentage:data.percentage
				};
		},
		testing: function() {
			console.log(data);
		}
	};

})();


//module to handle UI part

var UIController = (function() {

	var DOMstrings = {
		inputType: '.add__type',
		inputDescription: '.add__description',
		inputValue: '.add__value',
		inputBtn: '.add__btn',
		incomeContainer: '.income__list',
		expensesContainer: '.expenses__list',
		budgetLabel: '.budget__value',
		incomeLabel:'.budget__income--value',
		expensesLabel:'.budget__expenses--value',
		percentageLabel: '.budget__expenses--percentage',
		container: '.container',
		expensesPercLabel: '.item__percentage',
		dateLabel: '.budget__title--month'
	};

	var formatNumber = function(num, type) {
		var numSplit, int, dec;
		//take care of decimal zeroes
		//take care of commas
		//+ or - infront of the number

		num = Math.abs(num);
		num = num.toFixed(2);
		numSplit = num.split('.');
		int = numSplit[0];
		dec = numSplit[1];

		if (int.length > 3) {
			int = int.substr(0, int.length -3) + ',' + int.substr(int.length - 3, 3);
		}

		return (type === 'exp' ? '-' : '+') + ' ' + int + '.' +  dec;


	};

	var forEachListNode = function(list, callback) {
		for(var i = 0; i < list.length; i++) {
			callback(list[i], i);
		}
	};

	return {
		getInput: function() {

			return {
			 type: document.querySelector(DOMstrings.inputType).value,
			 description:  document.querySelector(DOMstrings.inputDescription).value,
			value :parseFloat(document.querySelector(DOMstrings.inputValue).value)
		};
 },
		addListItem: function(obj, type) {
				var html, newHtml, element;
			//create the HTML string with placeholder text
			if (type === 'inc') {
				element = DOMstrings.incomeContainer;
			 html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			} else if(type === 'exp') {
				element = DOMstrings.expensesContainer;
			 html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}


			//Replace the placeholder with some actual data

			newHtml = html.replace('%id%', obj.id);
			newHtml = newHtml.replace('%description%', obj.description);
			newHtml = newHtml.replace('%value%',formatNumber(obj.value, type));
			// console.log(obj);
			//insert the html into the DOM

			document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

		},

		deleteListItem: function(selectorID) {
			var el = document.getElementById(selectorID);
			el.parentNode.removeChild(el);
		},

		clearFields: function() {
			var fields, fieldsArr;

			fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
			// console.log(fields);

			fieldsArr = Array.prototype.slice.call(fields);
			// console.log(fieldsArr);

			fieldsArr.forEach(function(current, index, array) {
				current.value = "";
			});

			fieldsArr[0].focus();
		},

		displayBudget: function(obj) {
			var type;
			obj.budget > 0 ? type = 'inc' : type = 'exp';
			document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
			document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
			document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');

			if (obj.percentage > 0) {
				document.querySelector(DOMstrings.percentageLabel).textContent = obj.percentage + '%';
			} else {
				document.querySelector(DOMstrings.percentageLabel).textContent = '---';
		}


		},

		displayPercentage: function(percentages) { //here percentages parameter is an array

			var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);



			forEachListNode(fields, function(current, index) {
				if (percentages[index] > 0) {
					current.textContent = percentages[index] + '%';
				} else {
					current.textContent = '---';
				}
			});


		},

		displayDate: function() {
			var now, months, month, year;

			now = new Date();
			months =['Jan', 'Feb', 'Mar', 'Apr', 'May', 'June', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
			month = now.getMonth();
			year = now.getFullYear();
			date = now.getDate();
			document.querySelector(DOMstrings.dateLabel).textContent = date + ' ' + months[month] + ' ' + year;

		},

		changedType: function() {
			var fields = document.querySelectorAll(
				DOMstrings.inputType + ',' +
				DOMstrings.inputDescription + ',' +
				DOMstrings.inputValue
			);

			forEachListNode(fields, function(current) {
				current.classList.toggle('red-focus');
			});
			document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
		},

		getDOMstring: function() {
			return DOMstrings;
		}
	}


})();


//module for app controller

var controller = (function(budgetCtrl,UICtrl) {


	var setupEventListeners = function() {
		var DOM = UICtrl.getDOMstring(); //called from UIController

		document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
		//event for keypress i.e enter button function to be added globally
		document.addEventListener('keypress', function(event) {

			if(event.keycode === 13 || event.which === 13) {
				ctrlAddItem();
			}
		});

		document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);

		document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);

	};

	var updateBudget = function() {
		//1. calculate the budget

			budgetCtrl.calculateBudget();
		//2. Return the budget
	var budget = budgetCtrl.getBudget();

	console.log(budget);

		//3. show the ui of budget
		UICtrl.displayBudget(budget);
	};

	var updatePercentage = function() {
		// 1.Calculate the percentages
			budgetCtrl.calculatePercentage();
		//2.Read percentages from the budget controller
		var percentages = budgetCtrl.getPercentages();
		//3.Update the UI with the new percentages
		// console.log(percentage);
		UICtrl.displayPercentage(percentages);
	};

	var ctrlAddItem = function() {

		/*some code */

		var input, newItem;
		//1. get the data from the input field

			 input = UICtrl.getInput();
			// console.log(input);

		if (input.description !== "" && !isNaN(input.value) && input.value > 0) {

			//2. send it to the budget controller

			newItem = budgetCtrl.addItem(input.type, input.description, input.value);
			// console.log(newItem);

			//3. show it in the ui i.e the into the expense or icome part

			UICtrl.addListItem(newItem, input.type);

			//4. clear the input fields
			UICtrl.clearFields();

			//calculate and update the budget
			updateBudget();

			//update the percentages
			updatePercentage();

		}

};

var ctrlDeleteItem = function(event) {
	var itemID, splitID, type, ID;
	itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
	if (itemID) {
		splitID = itemID.split('-');
		type = splitID[0];
		ID = parseInt(splitID[1]);

		//1.delete the item from the data structure
		budgetCtrl.deleteItem(type, ID);

		//2.delete the item from the UI
		UICtrl.deleteListItem(itemID);

		//2.calculate the budge show the new budget in UI
		updateBudget();

		//3.calculate and display percentages
		updatePercentage();
	}
};

	return {
		init: function() {
			console.log('Application has started');
			UICtrl.displayDate();
			UICtrl.displayBudget({
				budget:0,
				totalInc:0,
				totalExp:0,
				percentage:-1
			});
			setupEventListeners();
		}
	};




})(budgetController,UIController);

controller.init();
