// budget controller
var budgetController = (function (){
  var Expense = function(id, description, value){
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage= -1
  };

  Expense.prototype.calcPercentages = function(totalIncome){
    if (totalIncome > 0){
      this.percentage = Math.round((this.value / totalIncome)* 100);
    }else {
      percentage = -1;
    }
  };
  Expense.prototype.getPercentages = function(){
    return this.percentage;
  }

  var Income   = function(id, description, value){
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function (type){
    var sum = 0;
    data.allItems[type].forEach(function(curr){
      sum += curr.value;
    });
    data.totals[type] = sum;

  };

  var data= {
    allItems:{
      exp:[],
      inc:[]
    },
    totals:{
      exp:0,
      inc:0
    },
    budget: 0,
    percentage: -1
  };

  return {
    addItem: function(type, des, val){
      var newItem, ID;

      // creating a new id
      if (data.allItems[type].length > 0 ){
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      }
      else {
        ID = 0;
      }
     

      //creating a new item based on 'exp' and 'inc' type

      if (type === 'exp'){
        newItem = new Expense(ID, des, val);
      }
      else if (type === 'inc'){
        newItem = new Income(ID, des, val);
      } 
      //push it into our data structure

      data.allItems[type].push(newItem);

      //return new element
      return newItem; 
    },

    deleteItem: function(type, id){
      var ids, index;
      ids = data.allItems[type].map(function(current){
        return current.id;
      });
      index = ids.indexOf(id);
           
      if (index !== -1){
        data.allItems[type].splice(index, 1);
      }

    },

    calculateBudget: function (){
      // calculate income and 
      calculateTotal('exp');
      calculateTotal('inc');

      // calculate budget: income-expenses
      data.budget = data.totals.inc - data.totals.exp;

      //calculate the percentage of the income that we spent
      if (data.totals.inc > 0){
        data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
      }
      else{
        data.percentage = -1;
      }
    },

    calculatePercentages: function(){
      data.allItems.exp.forEach(function(cur){
        cur.calcPercentages(data.totals.inc);
      });
    },

    getPercentages: function(){
      var allPerc = data.allItems.exp.map(function(cur){
        return cur.percentage;
      });
      return allPerc; 

    },

    getBudget: function(){
      return{
        budget: data.budget,
        totalInc: data.totals.inc,
        totalExp: data.totals.exp,
        percentage: data.percentage
      }
    },
    testing: function(){
      console.log(data);
    }
  };
}) ();

//ui controller
var UIController = (function(){
  var DOMStrings = {
   inputType:'.add__type',
   inputDescription: '.add__description',
   inputValue: '.add__value',
   inputBtn: '.add__btn',
   incomeContainer: '.income__list',
   expenseContainer: '.expenses__list',
   budgetLabel: '.budget__value',
   incomeLabel:'.budget__income--value',
   expenseLabel: '.budget__expenses--value',
   percentageLabel: '.budget__expenses--percentage',
   container: '.container',
   expensesPercLabel: '.item__percentage',
   dateLabel:'.budget__title--month'
  };

  var formatNumber = function(num, type){
    var numSplit, int, dec, type;
    /*
    + or - before a number
    exactly to 2 decimal placement
    comma separating the thousands
    */
   num = Math.abs(num);
   num = num.toFixed(2);

   numSplit = num.split('.');

   int = numSplit[0];
   if (int.length > 3){
     int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
   }

   dec = numSplit[1];
  
   return  (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
  };
    var nodeListForEach = function(list, callback){
      for (i = 0; i < list.length; i++){
        callback(list[i], i);
      }
    };

  return {
    getInput: function() {
    return{
      type: document.querySelector(DOMStrings.inputType).value, // will either be inc or exp
      description: document.querySelector(DOMStrings.inputDescription).value,
      value: parseFloat(document.querySelector(DOMStrings.inputValue).value)  

    };
    
  },
  addListItem: function (obj, type){
    // creating html string with a placeholder text
    var html, newHtml, element;

    if (type === 'inc'){
      element = DOMStrings.incomeContainer;
      html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
    }
    else if(type === 'exp'){
      element = DOMStrings.expenseContainer;
      html =  '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete">    <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>  </div>    </div>  </div>';
    }

    //replace the placeholder text with some actual data
    newHtml = html.replace('%id%', obj.id);
    newHtml = newHtml.replace('%description%', obj.description);
    newHtml = newHtml.replace('%value%', formatNumber(obj.value));  

    // insert the html in DOM
    document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
  }, 

  deleteListItem: function(selectorID){
    var el = document.getElementById(selectorID);
    el.parentNode.removeChild(el);
  },

  clearFields: function(){
    var fields, fieldsArr;
    fields = document.querySelectorAll(DOMStrings.inputDescription + ', ' + DOMStrings.inputValue);

    fieldsArr = Array.prototype.slice.call(fields);

    fieldsArr.forEach(function (current, index, array) {
      current.value = "";
    });
    
    fieldsArr[0].focus();

  },

  displayBudget: function(obj){
    var type;
    obj.budget > 0 ? type = 'inc' : type = 'epx';
    document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget, type);
    document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
    document.querySelector(DOMStrings.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');
    
    if (obj.percentage > 0){
      document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage + '%';
    }else{
      document.querySelector(DOMStrings.percentageLabel).textContent = '---';
    }
  },

    displayPercentage: function(percentages){

      var fields = document.querySelectorAll(DOMStrings.expensesPercLabel);
       
      nodeListForEach(fields, function(current, index){
        
        if (percentages[index] > 0){
          current.textContent = percentages[index] + '%';
        }else{
          current.textContent = '---'; 
        }
      });
    },
    displayMonth: function(){
      var now, month,months, year;
      now = new Date();
      months = ['January','February','March', 'April', 'May', 'June','July', 'August', 'September', 'October', 'November', 'December'];
      month = now.getMonth();
      year = now.getFullYear();

      document.querySelector(DOMStrings.dateLabel).textContent = months[month] + ' ' + year ;
    },

    changedType: function(){
      var fields = document.querySelectorAll(
        DOMStrings.inputType + ',' +
        DOMStrings.inputDescription + ',' +
        DOMStrings.inputValue);

        nodeListForEach(fields, function(cur){
          cur.classList.toggle('red-focus');
        });
        document.querySelector(DOMStrings.inputBtn).classList.toggle('red');
    },
    

    getDOMStrings : function(){ 
      return DOMStrings;
    }
 };
}) ();

// global app controller
var controller = (function(budgetCtrl, UICtrl){
  var setupEventListeners = function(){
    var DOM = UICtrl.getDOMStrings();

    document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
     
    document.addEventListener('keypress', function(event){
  if (event.keyCode === 13 || event.which === 13){
   ctrlAddItem();
  }
 });
  document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
  document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
};

   var updateBudget = function(){
      //1. calculate the Budget
      budgetCtrl.calculateBudget();

      //2.  return the Budget
      var budget = budgetCtrl.getBudget();

      //3. Display the budget on the UI
      UICtrl.displayBudget(budget);
   };
    
    var updatePercentage = function(){
      // calculate the percentage
      budgetCtrl.calculatePercentages();
      //  read percentage from the budget controller
      var percentages = budgetCtrl.getPercentages();
      //  update the new percentage on the ui 
      UICtrl.displayPercentage(percentages);

    }
   
   var ctrlAddItem = function(){
    
    var input, newItem;
      // 1. get the field input data
      input = UICtrl.getInput();

      if (input.description !== "" && !isNaN(input.value) && input.value > 0){
        //2.  add the item to the budget controller
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);
      
      //3. add the item to the UI
          UICtrl.addListItem(newItem, input.type);
    
      //4. clear the field
          UICtrl.clearFields();
      //5.  calculate and update budget
          updateBudget();
      //6.  calculate and update the percentages
          updatePercentage();

      }
 };
  
  var ctrlDeleteItem = function(event){
    var itemID, splitID, type, ID;
     itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

     if (itemID){
       // inc-1
     splitID = itemID.split('-');
     type = splitID[0];
     ID = parseInt(splitID[1]);

     //1. delete the item from the data structure

     budgetCtrl.deleteItem(type, ID);
     //2. delete the item fom the UI
     UICtrl.deleteListItem(itemID);
     //3. update and show the new budget
     updateBudget();
     //4.  calculate and update the percentages
     updatePercentage();
     } 
  };

 return{
   init: function(){
     console.log('application has started');
     UICtrl.displayMonth();
     UICtrl.displayBudget({
      budget: 0,
      totalInc: 0,
      totalExp: 0,
      percentage: -1
     });
     setupEventListeners();
   }
 };
 
})(budgetController, UIController);

controller.init();